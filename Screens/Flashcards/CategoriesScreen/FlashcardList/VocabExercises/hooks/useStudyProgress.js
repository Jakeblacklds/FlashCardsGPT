import { useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    loadStudyProgress,
    saveStudyProgress,
    startSession,
    recordAnswer,
    endSession,
    addBonusXP,
    selectCurrentSession,
    selectGlobalStats,
} from '../../../../../../redux/StudyProgressSlice';
import {
    selectWordsForSession,
    calculateCategoryStats,
    getMasteryInfo,
    getStreakMilestone,
    needsReview,
    calculateQuality,
    MASTERY_LEVELS,
    STREAK_MILESTONES,
} from '../utils/spacedRepetition';

/**
 * useStudyProgress - Hook para el sistema SM-2 de repetición espaciada
 * 
 * Proporciona acceso al sistema de progreso de palabras con:
 * - Tracking de mastery level por palabra
 * - Sistema de XP y streaks
 * - Selección inteligente de palabras para sesiones
 * 
 * @param {Array} flashcards - Lista de flashcards de la categoría
 * @param {string} categoryId - Identificador único de la categoría
 * @returns {Object} - Funciones y datos de progreso
 */
const useStudyProgress = (flashcards = [], categoryId = null) => {
    const dispatch = useDispatch();

    // Selectores de Redux
    const allProgressMap = useSelector(state => state.studyProgress.wordProgress);
    const isLoaded = useSelector(state => state.studyProgress.isLoaded);
    const currentSession = useSelector(selectCurrentSession);
    const globalStats = useSelector(selectGlobalStats);

    // Mapa de progreso específico para esta categoría
    const progressMap = useMemo(() => {
        if (!categoryId) return {};
        const catProgress = allProgressMap[categoryId];
        // Verificar que no es formato legacy
        if (catProgress && catProgress.masteryLevel !== undefined) return {};
        return catProgress || {};
    }, [allProgressMap, categoryId]);

    // Cargar progreso al montar
    useEffect(() => {
        if (!isLoaded) {
            dispatch(loadStudyProgress());
        }
    }, [dispatch, isLoaded]);

    // Calcular estadísticas de la categoría
    const categoryStats = useMemo(() => {
        if (!flashcards.length) return null;
        return calculateCategoryStats(flashcards, progressMap);
    }, [flashcards, progressMap]);

    // ============ FUNCIONES DE CONSULTA ============

    /**
     * Obtener progreso de una palabra específica
     */
    const getWordProgress = useCallback((wordId) => {
        return progressMap[wordId] || null;
    }, [progressMap]);

    /**
     * Obtener información de mastery de una palabra
     * Incluye nivel, colores, emoji, etc.
     */
    const getWordMastery = useCallback((wordId) => {
        const progress = progressMap[wordId];
        const level = progress?.masteryLevel || 0;
        const info = getMasteryInfo(level);

        return {
            ...info,
            masteryLevel: level,
            correctStreak: progress?.correctStreak || 0,
            easeFactor: progress?.easeFactor || 2.5,
            nextReview: progress?.nextReview,
            totalAttempts: progress?.totalAttempts || 0,
            accuracy: progress?.totalAttempts > 0
                ? Math.round((progress.correctAttempts / progress.totalAttempts) * 100)
                : 0,
        };
    }, [progressMap]);

    /**
     * Comprobar si una palabra necesita repaso
     */
    const checkNeedsReview = useCallback((wordId) => {
        return needsReview(progressMap[wordId]);
    }, [progressMap]);

    /**
     * Obtener información de streak actual
     */
    const getStreakInfo = useCallback(() => {
        const streak = currentSession.streak || 0;
        const milestone = getStreakMilestone(streak);
        return {
            current: streak,
            best: currentSession.bestStreak || 0,
            milestone,
            isOnFire: streak >= 3,
        };
    }, [currentSession]);

    /**
     * Seleccionar palabras para una sesión
     */
    const selectWords = useCallback((count, mode = 'all') => {
        return selectWordsForSession(flashcards, progressMap, count, mode);
    }, [flashcards, progressMap]);

    /**
     * Contar palabras por modo
     */
    const getModeCounts = useCallback(() => {
        const counts = {
            all: flashcards.length,
            review: 0,
            new: 0,
            difficult: 0,
            mastered: 0,
        };

        flashcards.forEach(word => {
            const p = progressMap[word.id];

            // Nuevas: sin progreso o masteryLevel 0
            if (!p || p.masteryLevel === 0) {
                counts.new++;
            } else {
                // Ya practicadas: verificar si necesitan repaso
                if (needsReview(p)) {
                    counts.review++;
                }
            }

            // Dominadas: nivel 4+
            if (p && p.masteryLevel >= 4) {
                counts.mastered++;
            }

            if (p && p.totalAttempts >= 2) {
                const ratio = p.correctAttempts / p.totalAttempts;
                const isLowEF = (p.easeFactor || 2.5) < 2.0;
                if (ratio < 0.6 || isLowEF) {
                    counts.difficult++;
                }
            }
        });

        return counts;
    }, [flashcards, progressMap]);

    // ============ FUNCIONES DE ACCIÓN ============

    /**
     * Iniciar sesión de estudio
     */
    const beginSession = useCallback(() => {
        dispatch(startSession());
    }, [dispatch]);

    /**
     * Registrar respuesta con datos extendidos para SM-2
     * @param {string} wordId - ID de la palabra
     * @param {boolean} isCorrect - Si la respuesta fue correcta
     * @param {Object} options - Opciones adicionales
     * @param {number} options.responseTimeMs - Tiempo de respuesta en ms
     * @param {boolean} options.usedHint - Si usó pista
     * @param {number} options.attempts - Número de intentos
     */
    const submitAnswer = useCallback((wordId, isCorrect, options = {}) => {
        if (!categoryId) {
            console.error("submitAnswer: categoryId is missing");
            return;
        }

        dispatch(recordAnswer({
            categoryId,
            wordId,
            isCorrect,
            responseTimeMs: options.responseTimeMs,
            usedHint: options.usedHint,
            attempts: options.attempts,
        }));

        // Guardar automáticamente después de cada respuesta
        dispatch(saveStudyProgress());
    }, [dispatch, categoryId]);

    /**
     * Agregar XP bonus (para logros, streaks, etc.)
     */
    const grantBonusXP = useCallback((amount) => {
        dispatch(addBonusXP({ amount }));
    }, [dispatch]);

    /**
     * Finalizar sesión
     */
    const finishSession = useCallback(() => {
        dispatch(endSession());
        dispatch(saveStudyProgress());
        return {
            ...currentSession,
            duration: currentSession.startTime
                ? Date.now() - currentSession.startTime
                : 0,
        };
    }, [dispatch, currentSession]);

    // ============ MÉTRICAS CALCULADAS ============

    /**
     * Precisión de la sesión actual (%)
     */
    const sessionAccuracy = useMemo(() => {
        const total = currentSession.correctAnswers + currentSession.incorrectAnswers;
        if (total === 0) return 0;
        return Math.round((currentSession.correctAnswers / total) * 100);
    }, [currentSession]);

    /**
     * Obtener mapa de progreso completo
     */
    const getProgressMap = useCallback(() => {
        return progressMap;
    }, [progressMap]);

    /**
     * Verificar si hubo level ups en la sesión
     */
    const getLevelUps = useCallback(() => {
        return currentSession.levelUps || [];
    }, [currentSession]);

    return {
        // Estado
        isLoaded,
        progressMap,
        categoryStats,
        currentSession,
        globalStats,
        sessionAccuracy,

        // Constantes exportadas
        MASTERY_LEVELS,
        STREAK_MILESTONES,

        // Funciones de consulta
        getWordProgress,
        getWordMastery,
        checkNeedsReview,
        getStreakInfo,
        selectWords,
        getModeCounts,
        getProgressMap,
        getLevelUps,

        // Funciones de acción
        beginSession,
        submitAnswer,
        grantBonusXP,
        finishSession,
    };
};

export default useStudyProgress;
