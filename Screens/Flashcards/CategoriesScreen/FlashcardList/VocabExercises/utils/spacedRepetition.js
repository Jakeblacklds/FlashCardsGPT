/**
 * spacedRepetition.js - Utilidades para el Sistema SM-2 de Repetición Espaciada
 * 
 * Implementación completa del algoritmo SuperMemo 2 con extensiones modernas
 * para gamificación y experiencia de usuario mejorada.
 */

// ============ CONSTANTES SM-2 ============

export const SM2_CONFIG = {
    MIN_EASE_FACTOR: 1.3,
    DEFAULT_EASE_FACTOR: 2.5,
    MAX_EASE_FACTOR: 2.5,
    QUALITY_THRESHOLD: 3,
};

/**
 * Niveles de dominio con sus propiedades visuales
 */
export const MASTERY_LEVELS = {
    0: {
        name: 'Nuevo',
        shortName: 'NEW',
        color: '#9CA3AF',
        bgColor: 'rgba(156, 163, 175, 0.15)',
        icon: 'circle-o',
        emoji: '🥚',
        pokemonLevel: 'Egg',
        xpRequired: 0,
        description: 'Nunca practicado',
    },
    1: {
        name: 'Iniciando',
        shortName: 'LV.1',
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        icon: 'star-o',
        emoji: '🌱',
        pokemonLevel: 'Lv.1',
        xpRequired: 10,
        description: 'Primera respuesta correcta',
    },
    2: {
        name: 'Aprendiendo',
        shortName: 'LV.5',
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        icon: 'star-half-o',
        emoji: '📖',
        pokemonLevel: 'Lv.5',
        xpRequired: 30,
        description: 'Empezando a recordar',
    },
    3: {
        name: 'Familiar',
        shortName: 'LV.15',
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        icon: 'star',
        emoji: '💪',
        pokemonLevel: 'Lv.15',
        xpRequired: 60,
        description: 'Recordando con esfuerzo',
    },
    4: {
        name: 'Conocido',
        shortName: 'LV.30',
        color: '#8B5CF6',
        bgColor: 'rgba(139, 92, 246, 0.15)',
        icon: 'star',
        emoji: '⭐',
        pokemonLevel: 'Lv.30',
        xpRequired: 100,
        description: 'Recordando bien',
    },
    5: {
        name: 'Dominado',
        shortName: 'MAX',
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.2)',
        icon: 'trophy',
        emoji: '🏆',
        pokemonLevel: 'MAX',
        xpRequired: 150,
        description: 'Maestría completa',
    },
};

/**
 * Configuración de streaks con rewards visuales
 */
export const STREAK_MILESTONES = {
    3: { name: 'On Fire!', emoji: '🔥', bonus: 1.1 },
    5: { name: 'Hot Streak!', emoji: '🔥🔥', bonus: 1.25 },
    10: { name: 'Unstoppable!', emoji: '🔥🔥🔥', bonus: 1.5 },
    20: { name: 'LEGENDARY!', emoji: '⚡🔥⚡', bonus: 2.0 },
};

// ============ FUNCIONES SM-2 CORE ============

/**
 * Obtener información del nivel de dominio
 * @param {number} level - Nivel 0-5
 * @returns {Object} - Información del nivel
 */
export const getMasteryInfo = (level) => {
    return MASTERY_LEVELS[Math.min(5, Math.max(0, level))] || MASTERY_LEVELS[0];
};

/**
 * Obtener información de milestone de streak
 * @param {number} streak - Racha actual
 * @returns {Object|null} - Milestone alcanzado o null
 */
export const getStreakMilestone = (streak) => {
    const milestones = Object.keys(STREAK_MILESTONES)
        .map(Number)
        .sort((a, b) => b - a);

    for (const milestone of milestones) {
        if (streak >= milestone) {
            return { streak: milestone, ...STREAK_MILESTONES[milestone] };
        }
    }
    return null;
};

/**
 * Calcular nuevo EaseFactor según SM-2
 * @param {number} ef - Factor de facilidad actual (1.3 - 2.5)
 * @param {number} quality - Calidad de respuesta (0-5)
 * @returns {number} - Nuevo factor de facilidad
 */
export const calculateNewEaseFactor = (ef, quality) => {
    const adjustment = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    const newEF = ef + adjustment;
    return Math.max(SM2_CONFIG.MIN_EASE_FACTOR, Math.min(SM2_CONFIG.MAX_EASE_FACTOR, newEF));
};

/**
 * Calcular próximo intervalo de repaso en días
 * @param {number} repetitions - Repasos exitosos consecutivos
 * @param {number} ef - Factor de facilidad
 * @param {number} previousInterval - Intervalo anterior en días
 * @returns {number} - Nuevo intervalo en días
 */
export const calculateInterval = (repetitions, ef, previousInterval) => {
    if (repetitions <= 0) return 0;
    if (repetitions === 1) return 1;
    if (repetitions === 2) return 6;
    return Math.round(previousInterval * ef);
};

/**
 * Calcular intervalo en milisegundos para próximo repaso
 * @param {number} level - Nivel de dominio actual (0-5)
 * @param {number} ef - EaseFactor (opcional, default 2.5)
 * @returns {number} - Milisegundos hasta el próximo repaso
 */
export const calculateNextReviewInterval = (level, ef = 2.5) => {
    const baseIntervals = {
        0: 0,                           // Inmediato
        1: 1 * 60 * 60 * 1000,          // 1 hora
        2: 4 * 60 * 60 * 1000,          // 4 horas
        3: 12 * 60 * 60 * 1000,         // 12 horas
        4: 1 * 24 * 60 * 60 * 1000,     // 1 día
        5: 3 * 24 * 60 * 60 * 1000,     // 3 días
    };

    const base = baseIntervals[Math.min(5, level)] || 0;
    // Ajustar por EaseFactor para niveles altos
    if (level >= 4) {
        return Math.round(base * (ef / SM2_CONFIG.DEFAULT_EASE_FACTOR));
    }
    return base;
};

/**
 * Calcular calidad de respuesta (0-5) basada en contexto
 * @param {Object} params - Parámetros de la respuesta
 * @returns {number} - Calidad 0-5
 */
export const calculateQuality = ({
    isCorrect,
    responseTimeMs = null,
    usedHint = false,
    attempts = 1,
    wordDifficulty = 'normal' // 'easy' | 'normal' | 'hard'
}) => {
    if (!isCorrect) {
        if (attempts > 2) return 0;
        if (attempts > 1) return 1;
        return 2;
    }

    if (usedHint) return 3;

    let quality = 4; // Base para respuesta correcta

    // Ajustar por tiempo de respuesta
    if (responseTimeMs !== null) {
        if (responseTimeMs < 1500) quality = 5;
        else if (responseTimeMs < 3000) quality = 5;
        else if (responseTimeMs > 8000) quality = 3;
    }

    // Primer intento perfecto = calidad máxima
    if (attempts === 1 && responseTimeMs && responseTimeMs < 2000) {
        quality = 5;
    }

    return quality;
};

/**
 * Determinar si una palabra necesita repaso
 * @param {Object} progress - Objeto de progreso de la palabra
 * @returns {boolean}
 */
export const needsReview = (progress) => {
    if (!progress) return true;
    if (!progress.nextReview) return true;
    return Date.now() >= progress.nextReview;
};

/**
 * Calcular urgencia de repaso (para ordenar)
 * @param {Object} progress - Progreso de la palabra
 * @returns {number} - Score de urgencia (mayor = más urgente)
 */
export const calculateReviewUrgency = (progress) => {
    if (!progress) return 1000; // Nuevas palabras = máxima prioridad
    if (!progress.nextReview) return 999;

    const now = Date.now();
    const overdue = now - progress.nextReview;

    if (overdue > 0) {
        // Cuanto más atrasada, más urgente
        return 500 + Math.min(500, overdue / (24 * 60 * 60 * 1000) * 100);
    }

    // Palabras con bajo EF son más difíciles, revisar más
    const efPenalty = (SM2_CONFIG.DEFAULT_EASE_FACTOR - (progress.easeFactor || SM2_CONFIG.DEFAULT_EASE_FACTOR)) * 50;

    return efPenalty;
};

// ============ SELECCIÓN DE PALABRAS ============

/**
 * Ordenar palabras por prioridad de repaso
 * @param {Array} words - Array de flashcards
 * @param {Object} progressMap - Mapa de progreso por ID
 * @returns {Array} - Palabras ordenadas por prioridad
 */
export const sortByReviewPriority = (words, progressMap) => {
    return [...words].sort((a, b) => {
        const urgencyA = calculateReviewUrgency(progressMap[a.id]);
        const urgencyB = calculateReviewUrgency(progressMap[b.id]);
        return urgencyB - urgencyA;
    });
};

/**
 * Seleccionar palabras para una sesión de estudio
 * @param {Array} words - Todas las palabras de la categoría
 * @param {Object} progressMap - Mapa de progreso
 * @param {number} count - Cantidad de palabras a seleccionar
 * @param {string} mode - 'review' | 'new' | 'difficult' | 'all'
 * @returns {Array}
 */
export const selectWordsForSession = (words, progressMap, count, mode = 'all') => {
    let filtered = words;

    switch (mode) {
        case 'review':
            // Solo palabras YA practicadas que necesitan repaso
            filtered = words.filter(w => {
                const p = progressMap[w.id];
                // Debe tener progreso Y masteryLevel > 0 (no nuevas)
                return p && p.masteryLevel > 0 && needsReview(p);
            });
            break;

        case 'new':
            filtered = words.filter(w => {
                const p = progressMap[w.id];
                return !p || p.masteryLevel === 0;
            });
            break;

        case 'difficult':
            filtered = words.filter(w => {
                const p = progressMap[w.id];
                if (!p || p.totalAttempts < 2) return false;
                // Bajo accuracy O bajo easeFactor = difícil
                const accuracy = p.correctAttempts / p.totalAttempts;
                const isLowAccuracy = accuracy < 0.6;
                const isLowEF = (p.easeFactor || SM2_CONFIG.DEFAULT_EASE_FACTOR) < 2.0;
                return isLowAccuracy || isLowEF;
            });
            break;

        case 'mastered':
            filtered = words.filter(w => {
                const p = progressMap[w.id];
                return p && p.masteryLevel >= 4;
            });
            break;

        default:
            break;
    }

    const sorted = sortByReviewPriority(filtered, progressMap);
    return sorted.slice(0, count);
};

// ============ ESTADÍSTICAS ============

/**
 * Calcular estadísticas de una categoría
 * @param {Array} words - Palabras de la categoría
 * @param {Object} progressMap - Mapa de progreso
 * @returns {Object}
 */
export const calculateCategoryStats = (words, progressMap) => {
    const stats = {
        total: words.length,
        new: 0,
        learning: 0,
        familiar: 0,
        mastered: 0,
        needsReview: 0,
        averageAccuracy: 0,
        averageEaseFactor: SM2_CONFIG.DEFAULT_EASE_FACTOR,
        totalXP: 0,
    };

    let totalAttempts = 0;
    let totalCorrect = 0;
    let efSum = 0;
    let efCount = 0;

    words.forEach(word => {
        const p = progressMap[word.id];

        if (!p || p.masteryLevel === 0) {
            stats.new++;
        } else if (p.masteryLevel <= 2) {
            stats.learning++;
        } else if (p.masteryLevel <= 3) {
            stats.familiar++;
        } else {
            stats.mastered++;
        }

        if (needsReview(p)) {
            stats.needsReview++;
        }

        if (p) {
            totalAttempts += p.totalAttempts || 0;
            totalCorrect += p.correctAttempts || 0;

            if (p.easeFactor) {
                efSum += p.easeFactor;
                efCount++;
            }
        }
    });

    stats.averageAccuracy = totalAttempts > 0
        ? Math.round((totalCorrect / totalAttempts) * 100)
        : 0;

    stats.averageEaseFactor = efCount > 0
        ? parseFloat((efSum / efCount).toFixed(2))
        : SM2_CONFIG.DEFAULT_EASE_FACTOR;

    stats.progressPercent = stats.total > 0
        ? Math.round((stats.mastered / stats.total) * 100)
        : 0;

    // Porcentaje de dominio (ponderado)
    if (stats.total > 0) {
        const weightedSum = (stats.new * 0) + (stats.learning * 0.25) +
            (stats.familiar * 0.5) + (stats.mastered * 1);
        stats.masteryPercent = Math.round((weightedSum / stats.total) * 100);
    } else {
        stats.masteryPercent = 0;
    }

    return stats;
};

// ============ FORMATEO ============

/**
 * Formatear tiempo restante para repaso
 * @param {number} nextReview - Timestamp de próximo repaso
 * @returns {string}
 */
export const formatTimeUntilReview = (nextReview) => {
    if (!nextReview) return 'Ahora';

    const now = Date.now();
    const diff = nextReview - now;

    if (diff <= 0) return 'Ahora';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'Ahora';
};

/**
 * Formatear EaseFactor para display
 * @param {number} ef - EaseFactor
 * @returns {string}
 */
export const formatEaseFactor = (ef) => {
    if (!ef) return '---';

    if (ef >= 2.4) return '😊 Easy';
    if (ef >= 2.0) return '😐 Normal';
    if (ef >= 1.7) return '😓 Hard';
    return '😰 Very Hard';
};

/**
 * Calcular XP para mostrar en UI
 * @param {Object} progress - Progreso de palabra
 * @returns {number}
 */
export const calculateDisplayXP = (progress) => {
    if (!progress) return 0;
    const level = MASTERY_LEVELS[progress.masteryLevel || 0];
    const baseXP = level.xpRequired;
    const bonusXP = (progress.correctStreak || 0) * 5;
    return baseXP + bonusXP;
};
