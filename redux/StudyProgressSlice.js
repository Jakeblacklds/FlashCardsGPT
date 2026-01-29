import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * StudyProgressSlice - Sistema de Repetición Espaciada SM-2 Completo
 * 
 * El algoritmo SM-2 (SuperMemo 2) calcula intervalos óptimos de repaso
 * basándose en la calidad de cada respuesta y un factor de facilidad por palabra.
 * 
 * Niveles de dominio (0-5):
 * 0 - Nuevo: Nunca practicado
 * 1 - Iniciando: Primera respuesta correcta
 * 2 - Aprendiendo: Empezando a recordar
 * 3 - Familiar: Recordando con esfuerzo
 * 4 - Conocido: Recordando bien
 * 5 - Dominado: Recordatorio automático
 * 
 * Calidad de respuesta (0-5 en SM-2):
 * 0 - Blackout completo
 * 1 - Respuesta incorrecta, pero reconoce al ver
 * 2 - Respuesta incorrecta, fácil de recordar después
 * 3 - Respuesta correcta con dificultad
 * 4 - Respuesta correcta con algo de hesitación
 * 5 - Respuesta correcta perfecta
 */

const STORAGE_KEY = '@study_progress_v2';
const LEGACY_STORAGE_KEY = '@study_progress';

// Constantes del algoritmo SM-2
const SM2_CONFIG = {
    MIN_EASE_FACTOR: 1.3,
    DEFAULT_EASE_FACTOR: 2.5,
    MAX_EASE_FACTOR: 2.5,
    QUALITY_THRESHOLD: 3, // Respuestas con calidad < 3 resetean el progreso
};

const initialState = {
    // Progreso por categoría y palabra con SM-2 completo
    wordProgress: {},

    // Estadísticas de sesión actual
    currentSession: {
        wordsStudied: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        streak: 0,           // Racha actual en la sesión
        bestStreak: 0,       // Mejor racha de la sesión
        xpEarned: 0,         // XP ganado en la sesión
        startTime: null,
        levelUps: [],        // Palabras que subieron de nivel
    },

    // Estadísticas globales
    stats: {
        totalWordsLearned: 0,
        totalStudySessions: 0,
        bestStreak: 0,
        totalXP: 0,
        currentDayStreak: 0,   // Días consecutivos estudiando
        lastStudyDate: null,
    },

    // Estado de carga
    isLoaded: false,
};

/**
 * Calcular nuevo EaseFactor según SM-2
 * @param {number} ef - Factor de facilidad actual (1.3 - 2.5)
 * @param {number} quality - Calidad de respuesta (0-5)
 * @returns {number} - Nuevo factor de facilidad
 */
const calculateNewEaseFactor = (ef, quality) => {
    // Fórmula SM-2: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const adjustment = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    const newEF = ef + adjustment;
    return Math.max(SM2_CONFIG.MIN_EASE_FACTOR, Math.min(SM2_CONFIG.MAX_EASE_FACTOR, newEF));
};

/**
 * Calcular intervalo de repaso en días según SM-2
 * @param {number} repetitions - Número de repasos exitosos consecutivos
 * @param {number} ef - Factor de facilidad
 * @param {number} previousInterval - Intervalo anterior en días
 * @returns {number} - Nuevo intervalo en días
 */
const calculateInterval = (repetitions, ef, previousInterval) => {
    if (repetitions <= 0) return 0;
    if (repetitions === 1) return 1;      // Primer repaso exitoso: 1 día
    if (repetitions === 2) return 6;      // Segundo repaso: 6 días
    // Intervalos siguientes: intervalo anterior * EF
    return Math.round(previousInterval * ef);
};

/**
 * Calcular calidad de respuesta basada en el resultado y contexto
 * @param {boolean} isCorrect - Si la respuesta fue correcta
 * @param {number} responseTimeMs - Tiempo de respuesta en ms (opcional)
 * @param {boolean} usedHint - Si usó pista (opcional)
 * @param {number} attempts - Número de intentos (para ejercicios con múltiples intentos)
 * @returns {number} - Calidad 0-5
 */
const calculateQuality = (isCorrect, responseTimeMs = null, usedHint = false, attempts = 1) => {
    if (!isCorrect) {
        // Respuestas incorrectas: 0-2 según contexto
        if (attempts > 2) return 0;  // Múltiples intentos fallidos
        if (attempts > 1) return 1;  // Segundo intento fallido
        return 2;                     // Primer intento fallido
    }

    // Respuestas correctas: 3-5 según rapidez y uso de pistas
    if (usedHint) return 3;  // Correcto pero con ayuda

    // Si tenemos tiempo de respuesta, ajustar calidad
    if (responseTimeMs !== null) {
        if (responseTimeMs < 2000) return 5;   // Muy rápido = perfecto
        if (responseTimeMs < 5000) return 4;   // Normal
        return 3;                               // Lento pero correcto
    }

    // Sin información de tiempo, asumir calidad 4
    return 4;
};

/**
 * Calcular XP ganado por una respuesta
 * @param {boolean} isCorrect
 * @param {number} quality - Calidad 0-5
 * @param {number} streak - Racha actual
 * @param {number} masteryLevel - Nivel de dominio de la palabra
 * @returns {number}
 */
const calculateXP = (isCorrect, quality, streak, masteryLevel) => {
    if (!isCorrect) return 0;

    let baseXP = 10;

    // Bonus por calidad
    baseXP += (quality - 3) * 5;  // +5 por cada punto sobre 3

    // Bonus por racha (máx 50% extra)
    const streakMultiplier = Math.min(1.5, 1 + (streak * 0.05));

    // Palabras más difíciles dan más XP
    const difficultyBonus = masteryLevel < 3 ? 5 : 0;

    return Math.round((baseXP + difficultyBonus) * streakMultiplier);
};

/**
 * Determinar nivel de dominio basado en repeticiones y EF
 */
const calculateMasteryLevel = (repetitions, ef) => {
    if (repetitions <= 0) return 0;
    if (repetitions === 1) return 1;
    if (repetitions === 2) return 2;
    if (repetitions <= 4) return 3;
    if (repetitions <= 6 || ef < 2.0) return 4;
    return 5;
};

const studyProgressSlice = createSlice({
    name: 'studyProgress',
    initialState,
    reducers: {
        // Cargar progreso desde AsyncStorage
        loadProgress: (state, action) => {
            let { wordProgress, stats } = action.payload;

            // Migración: detectar formato legado
            if (wordProgress) {
                const firstKey = Object.keys(wordProgress)[0];
                if (firstKey && wordProgress[firstKey] &&
                    wordProgress[firstKey].masteryLevel !== undefined &&
                    wordProgress[firstKey].easeFactor === undefined) {
                    // Migrar al nuevo formato SM-2
                    console.log('Migrating study progress to SM-2 format...');
                    const migrated = {};
                    Object.entries(wordProgress).forEach(([catId, catData]) => {
                        if (typeof catData === 'object' && catData.masteryLevel === undefined) {
                            // Ya es formato por categoría
                            migrated[catId] = {};
                            Object.entries(catData).forEach(([wordId, wordData]) => {
                                migrated[catId][wordId] = {
                                    ...wordData,
                                    easeFactor: SM2_CONFIG.DEFAULT_EASE_FACTOR,
                                    interval: wordData.masteryLevel || 0,
                                    repetitions: wordData.correctStreak || 0,
                                    lastQuality: 4,
                                };
                            });
                        }
                    });
                    if (Object.keys(migrated).length > 0) {
                        wordProgress = migrated;
                    }
                }
            }

            state.wordProgress = wordProgress || {};
            state.stats = { ...initialState.stats, ...stats };
            state.isLoaded = true;
        },

        // Iniciar una nueva sesión de estudio
        startSession: (state) => {
            state.currentSession = {
                wordsStudied: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                streak: 0,
                bestStreak: 0,
                xpEarned: 0,
                startTime: Date.now(),
                levelUps: [],
            };
        },

        // Registrar resultado de un ejercicio con SM-2 completo
        recordAnswer: (state, action) => {
            const {
                categoryId,
                wordId,
                isCorrect,
                responseTimeMs = null,
                usedHint = false,
                attempts = 1
            } = action.payload;
            const now = Date.now();

            // Calcular calidad de respuesta
            const quality = calculateQuality(isCorrect, responseTimeMs, usedHint, attempts);

            // Asegurar que existe la estructura para la categoría
            if (!state.wordProgress[categoryId] ||
                state.wordProgress[categoryId].masteryLevel !== undefined) {
                state.wordProgress[categoryId] = {};
            }

            // Obtener o crear progreso de la palabra
            if (!state.wordProgress[categoryId][wordId]) {
                state.wordProgress[categoryId][wordId] = {
                    masteryLevel: 0,
                    correctStreak: 0,
                    easeFactor: SM2_CONFIG.DEFAULT_EASE_FACTOR,
                    interval: 0,
                    repetitions: 0,
                    lastQuality: 0,
                    totalAttempts: 0,
                    correctAttempts: 0,
                    lastReviewed: null,
                    nextReview: null,
                };
            }

            const progress = state.wordProgress[categoryId][wordId];
            const previousMastery = progress.masteryLevel;

            progress.totalAttempts += 1;
            progress.lastReviewed = now;
            progress.lastQuality = quality;

            if (quality >= SM2_CONFIG.QUALITY_THRESHOLD) {
                // Respuesta exitosa (calidad >= 3)
                progress.correctAttempts += 1;
                progress.correctStreak += 1;
                progress.repetitions += 1;

                // Actualizar EaseFactor
                progress.easeFactor = calculateNewEaseFactor(progress.easeFactor, quality);

                // Calcular nuevo intervalo
                progress.interval = calculateInterval(
                    progress.repetitions,
                    progress.easeFactor,
                    progress.interval
                );

                // Próximo repaso
                progress.nextReview = now + (progress.interval * 24 * 60 * 60 * 1000);

                // Actualizar nivel de dominio
                progress.masteryLevel = calculateMasteryLevel(progress.repetitions, progress.easeFactor);

                // Estadísticas de sesión
                state.currentSession.correctAnswers += 1;
                state.currentSession.streak += 1;

                if (state.currentSession.streak > state.currentSession.bestStreak) {
                    state.currentSession.bestStreak = state.currentSession.streak;
                }

                // Calcular y agregar XP
                const xp = calculateXP(true, quality, state.currentSession.streak, previousMastery);
                state.currentSession.xpEarned += xp;

                // Detectar level up
                if (progress.masteryLevel > previousMastery) {
                    state.currentSession.levelUps.push({
                        wordId,
                        categoryId,
                        newLevel: progress.masteryLevel,
                        previousLevel: previousMastery,
                    });
                }

            } else {
                // Respuesta fallida o de baja calidad (calidad < 3)
                progress.correctStreak = 0;
                progress.repetitions = 0;  // SM-2: resetear repeticiones
                progress.interval = 0;
                progress.nextReview = now; // Repasar inmediatamente

                // No bajar el EF demasiado por fallos, pero ajustar según calidad
                if (quality > 0) {
                    progress.easeFactor = calculateNewEaseFactor(progress.easeFactor, quality);
                }

                // Bajar nivel si es muy bajo el rendimiento
                if (quality <= 1 && progress.masteryLevel > 0) {
                    progress.masteryLevel = Math.max(0, progress.masteryLevel - 1);
                }

                state.currentSession.incorrectAnswers += 1;
                state.currentSession.streak = 0; // Resetear racha
            }

            state.currentSession.wordsStudied += 1;

            // Actualizar mejor racha global
            if (state.currentSession.streak > state.stats.bestStreak) {
                state.stats.bestStreak = state.currentSession.streak;
            }
        },

        // Finalizar sesión y calcular estadísticas
        endSession: (state) => {
            state.stats.totalStudySessions += 1;
            state.stats.totalXP = (state.stats.totalXP || 0) + state.currentSession.xpEarned;

            // Actualizar día de estudio para streak
            const today = new Date().toDateString();
            const lastStudy = state.stats.lastStudyDate;

            if (lastStudy) {
                const lastDate = new Date(lastStudy).toDateString();
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

                if (lastDate === yesterday) {
                    state.stats.currentDayStreak += 1;
                } else if (lastDate !== today) {
                    state.stats.currentDayStreak = 1;
                }
            } else {
                state.stats.currentDayStreak = 1;
            }
            state.stats.lastStudyDate = today;

            // Contar palabras dominadas (nivel 4+)
            let learnedCount = 0;
            Object.values(state.wordProgress).forEach(categoryWords => {
                if (typeof categoryWords === 'object') {
                    Object.values(categoryWords).forEach(p => {
                        if (p && p.masteryLevel >= 4) learnedCount++;
                    });
                }
            });
            state.stats.totalWordsLearned = learnedCount;
        },

        // Resetear progreso de una categoría
        resetCategoryProgress: (state, action) => {
            const { categoryId } = action.payload;
            if (state.wordProgress[categoryId]) {
                delete state.wordProgress[categoryId];
            }
        },

        // Agregar XP manualmente (para bonuses)
        addBonusXP: (state, action) => {
            const { amount } = action.payload;
            state.currentSession.xpEarned += amount;
        },
    },
});

// ========== THUNKS ==========

// Cargar progreso (intenta v2, luego legacy)
export const loadStudyProgress = () => async (dispatch) => {
    try {
        let data = await AsyncStorage.getItem(STORAGE_KEY);

        // Si no hay data en v2, intentar migrar de legacy
        if (!data) {
            const legacyData = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
            if (legacyData) {
                data = legacyData;
                console.log('Migrating from legacy storage...');
            }
        }

        if (data) {
            const parsed = JSON.parse(data);
            dispatch(loadProgress(parsed));
        } else {
            dispatch(loadProgress({ wordProgress: {}, stats: initialState.stats }));
        }
    } catch (error) {
        console.error('Error loading study progress:', error);
        dispatch(loadProgress({ wordProgress: {}, stats: initialState.stats }));
    }
};

// Guardar progreso en AsyncStorage
export const saveStudyProgress = () => async (_, getState) => {
    try {
        const { wordProgress, stats } = getState().studyProgress;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ wordProgress, stats }));
    } catch (error) {
        console.error('Error saving study progress:', error);
    }
};

// Registrar respuesta y guardar automáticamente
export const submitAnswer = (categoryId, wordId, isCorrect, options = {}) => async (dispatch) => {
    dispatch(recordAnswer({
        categoryId,
        wordId,
        isCorrect,
        responseTimeMs: options.responseTimeMs,
        usedHint: options.usedHint,
        attempts: options.attempts,
    }));
    dispatch(saveStudyProgress());
};

// ========== SELECTORS ==========

// Obtener progreso de una palabra en una categoría
export const selectWordProgress = (state, categoryId, wordId) => {
    const categoryProgress = state.studyProgress.wordProgress[categoryId];
    if (!categoryProgress || categoryProgress.masteryLevel !== undefined) return null;
    return categoryProgress[wordId] || null;
};

// Obtener nivel de dominio de una palabra
export const selectMasteryLevel = (state, categoryId, wordId) => {
    const categoryProgress = state.studyProgress.wordProgress[categoryId];
    if (!categoryProgress || categoryProgress.masteryLevel !== undefined) return 0;
    return categoryProgress[wordId]?.masteryLevel || 0;
};

// Obtener palabras que necesitan repaso
export const selectWordsNeedingReview = (state, categoryId, wordIds) => {
    const now = Date.now();
    const categoryProgress = state.studyProgress.wordProgress[categoryId];
    if (!categoryProgress || categoryProgress.masteryLevel !== undefined) return wordIds;

    return wordIds.filter(id => {
        const progress = categoryProgress[id];
        if (!progress) return true;
        if (!progress.nextReview) return true;
        return progress.nextReview <= now;
    });
};

// Obtener estadísticas de una categoría
export const selectCategoryStats = (state, categoryId, wordIds) => {
    const categoryProgress = state.studyProgress.wordProgress[categoryId];
    const isLegacy = categoryProgress && categoryProgress.masteryLevel !== undefined;

    let newCount = 0, learningCount = 0, masteredCount = 0;
    let totalEF = 0, efCount = 0;

    wordIds.forEach(id => {
        const p = (!categoryProgress || isLegacy) ? null : categoryProgress[id];
        if (!p || p.masteryLevel === 0) newCount++;
        else if (p.masteryLevel < 4) learningCount++;
        else masteredCount++;

        if (p && p.easeFactor) {
            totalEF += p.easeFactor;
            efCount++;
        }
    });

    return {
        newCount,
        learningCount,
        masteredCount,
        total: wordIds.length,
        averageEaseFactor: efCount > 0 ? (totalEF / efCount).toFixed(2) : '2.50',
    };
};

// Sesión actual
export const selectCurrentSession = (state) => state.studyProgress.currentSession;

// Estadísticas globales
export const selectGlobalStats = (state) => state.studyProgress.stats;

// ========== UTILITY EXPORTS ==========

export { calculateQuality, calculateXP, calculateNewEaseFactor };

// ========== EXPORTS ==========

export const {
    loadProgress,
    startSession,
    recordAnswer,
    endSession,
    resetCategoryProgress,
    addBonusXP,
} = studyProgressSlice.actions;

export default studyProgressSlice;
