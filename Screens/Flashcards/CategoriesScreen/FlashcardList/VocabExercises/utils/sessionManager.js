/**
 * sessionManager.js - Sistema de gestión de sesiones de estudio
 * Implementa repetición inteligente dentro de la sesión
 */

/**
 * Tipos de ejercicio disponibles ordenados por dificultad
 * 1 = más fácil, 5 = más difícil
 */
export const EXERCISE_TYPES = {
    'listen-choose': { name: 'Escuchar y Elegir', difficulty: 1, icon: 'headphones', color: '#3B82F6' },
    'fill-blank': { name: 'Completar', difficulty: 2, icon: 'fill-drip', color: '#8B5CF6' },
    'spelling': { name: 'Deletrear', difficulty: 3, icon: 'spell-check', color: '#EC4899' },
    'write': { name: 'Escribir', difficulty: 4, icon: 'pen', color: '#10B981' },
    'match-pairs': { name: 'Emparejar', difficulty: 2, icon: 'random', color: '#F59E0B' },
};

/**
 * Obtener tipo de ejercicio según nivel de maestría
 * Palabras nuevas = ejercicios fáciles
 * Palabras avanzadas = ejercicios difíciles
 */
export const getExerciseForMasteryLevel = (masteryLevel) => {
    if (masteryLevel <= 1) {
        // Nivel bajo: Añadimos emparejar y deletrear temprano
        const options = ['listen-choose', 'fill-blank', 'match-pairs', 'spelling'];
        return options[Math.floor(Math.random() * options.length)];
    } else if (masteryLevel <= 3) {
        // Nivel medio: mix completo
        const options = ['fill-blank', 'spelling', 'match-pairs', 'write'];
        return options[Math.floor(Math.random() * options.length)];
    } else {
        // Nivel alto: predominancia de escritura y deletreo
        const options = ['spelling', 'write', 'fill-blank'];
        return options[Math.floor(Math.random() * options.length)];
    }
};

/**
 * Clase para manejar la cola de ejercicios durante una sesión
 */
export class SessionQueue {
    constructor(words, progressMap = {}) {
        this.originalWords = [...words];
        this.progressMap = progressMap;
        this.queue = [];
        this.completedWords = new Set();
        this.wordAttempts = new Map(); // Rastrear intentos por palabra
        this.wordResults = []; // Resultados de cada intento
        this.currentRound = 1;
        this.maxRounds = 3; // Máximo de veces que una palabra puede aparecer

        this._initializeQueue();
    }

    /**
     * Inicializar la cola con la primera ronda
     */
    _initializeQueue() {
        // Primera ronda: todas las palabras en orden de prioridad
        const sorted = this._sortByPriority(this.originalWords);

        sorted.forEach((word, index) => {
            const mastery = this.progressMap[word.id]?.masteryLevel || 0;
            const exerciseType = getExerciseForMasteryLevel(mastery);

            this.queue.push({
                word,
                exerciseType,
                round: 1,
                queuePosition: index,
            });

            this.wordAttempts.set(word.id, { attempts: 0, correct: 0, incorrect: 0 });
        });
    }

    /**
     * Ordenar palabras por prioridad de estudio
     */
    _sortByPriority(words) {
        return [...words].sort((a, b) => {
            const progressA = this.progressMap[a.id];
            const progressB = this.progressMap[b.id];

            // Palabras con más errores tienen prioridad
            const errorRatioA = progressA ?
                (progressA.totalAttempts > 0 ? (progressA.totalAttempts - progressA.correctAttempts) / progressA.totalAttempts : 0) : 0;
            const errorRatioB = progressB ?
                (progressB.totalAttempts > 0 ? (progressB.totalAttempts - progressB.correctAttempts) / progressB.totalAttempts : 0) : 0;

            // Menor nivel de maestría = mayor prioridad
            const levelA = progressA?.masteryLevel || 0;
            const levelB = progressB?.masteryLevel || 0;

            // Combinar factores: más errores y menor nivel = mayor prioridad
            const priorityA = (errorRatioA * 2) + (1 - levelA / 5);
            const priorityB = (errorRatioB * 2) + (1 - levelB / 5);

            return priorityB - priorityA; // Mayor prioridad primero
        });
    }

    /**
     * Obtener el siguiente item de la cola
     */
    getNext() {
        if (this.queue.length === 0) {
            return null;
        }

        return this.queue[0];
    }

    /**
     * Reportar resultado y avanzar
     */
    reportResult(wordId, wasCorrect) {
        const current = this.queue.shift();
        if (!current) return null;

        // Actualizar estadísticas
        const attempts = this.wordAttempts.get(wordId);
        if (attempts) {
            attempts.attempts += 1;
            if (wasCorrect) {
                attempts.correct += 1;
            } else {
                attempts.incorrect += 1;
            }
        }

        // Guardar resultado
        this.wordResults.push({
            wordId,
            word: current.word,
            wasCorrect,
            exerciseType: current.exerciseType,
            round: current.round,
        });

        // Lógica de "Enfoque de Aprendizaje" (Learning Focus)
        if (!wasCorrect) {
            // Si falla, reseteamos su racha interna de la sesión y la mandamos a los pocos turnos
            attempts.sessionStreak = 0;

            const nextRound = current.round + 1;
            // Insertar pronto (en 2-3 turnos) para reforzar mientras está fresco el error
            const insertPosition = Math.min(2, this.queue.length);

            this.queue.splice(insertPosition, 0, {
                word: current.word,
                exerciseType: this._getDifferentExercise(current.exerciseType),
                round: nextRound,
                isRetry: true,
            });
        } else {
            // Si acierta, aumentamos racha de sesión
            attempts.sessionStreak = (attempts.sessionStreak || 0) + 1;

            // Si la palabra fue fallada previamente en esta sesión, necesita 2 aciertos SEGUIDOS para completarse
            const needsConfirmation = attempts.incorrect > 0 && attempts.sessionStreak < 2;

            if (needsConfirmation) {
                // Re-añadir una vez más para confirmar (usando el nivel más difícil: 'write')
                const insertPosition = Math.min(4, this.queue.length);
                this.queue.splice(insertPosition, 0, {
                    word: current.word,
                    exerciseType: 'write', // Desafío final de confirmación
                    round: current.round,
                    isRetry: true,
                    isConfirmation: true, // Nueva bandera para UI si quieres usarla
                });
            } else {
                this.completedWords.add(wordId);
            }
        }

        return {
            current,
            remaining: this.queue.length,
            totalCompleted: this.completedWords.size,
            wordAttempts: attempts,
        };
    }

    /**
     * Obtener un tipo de ejercicio diferente al actual
     */
    _getDifferentExercise(currentType) {
        const types = Object.keys(EXERCISE_TYPES).filter(t => t !== currentType);
        return types[Math.floor(Math.random() * types.length)] || currentType;
    }

    /**
     * Obtener estadísticas de la sesión
     */
    getSessionStats() {
        const totalAttempts = this.wordResults.length;
        const correctAttempts = this.wordResults.filter(r => r.wasCorrect).length;
        const uniqueWordsCompleted = this.completedWords.size;
        const totalWords = this.originalWords.length;

        return {
            totalAttempts,
            correctAttempts,
            incorrectAttempts: totalAttempts - correctAttempts,
            accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
            uniqueWordsCompleted,
            totalWords,
            completion: Math.round((uniqueWordsCompleted / totalWords) * 100),
            wordDetails: this._getWordDetails(),
        };
    }

    /**
     * Obtener detalles por palabra
     */
    _getWordDetails() {
        const details = [];

        this.originalWords.forEach(word => {
            const attempts = this.wordAttempts.get(word.id);
            const results = this.wordResults.filter(r => r.wordId === word.id);

            details.push({
                word,
                totalAttempts: attempts?.attempts || 0,
                correctCount: attempts?.correct || 0,
                incorrectCount: attempts?.incorrect || 0,
                wasCompleted: this.completedWords.has(word.id),
                exerciseTypes: results.map(r => r.exerciseType),
            });
        });

        return details;
    }

    /**
     * Obtener progreso actual
     */
    getProgress() {
        const total = this.originalWords.length + this.queue.filter(q => q.isRetry).length;
        const completed = this.wordResults.length;

        return {
            current: completed,
            total,
            remaining: this.queue.length,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }

    /**
     * Verificar si la sesión está completa
     */
    isComplete() {
        return this.queue.length === 0;
    }
}

/**
 * Crear una nueva sesión de estudio
 */
export const createStudySession = (words, progressMap, options = {}) => {
    const {
        maxWords = words.length,
        mode = 'all',
    } = options;

    // Filtrar palabras según el modo
    let filteredWords = words;

    switch (mode) {
        case 'review':
            filteredWords = words.filter(w => {
                const p = progressMap[w.id];
                if (!p) return true;
                return Date.now() >= (p.nextReview || 0);
            });
            break;
        case 'new':
            filteredWords = words.filter(w => {
                const p = progressMap[w.id];
                return !p || p.masteryLevel === 0;
            });
            break;
        case 'difficult':
            filteredWords = words.filter(w => {
                const p = progressMap[w.id];
                if (!p || p.totalAttempts < 2) return false;
                const ratio = p.correctAttempts / p.totalAttempts;
                return ratio < 0.6;
            });
            break;
    }

    // Limitar cantidad
    const selectedWords = filteredWords.slice(0, maxWords);

    return new SessionQueue(selectedWords, progressMap);
};

/**
 * Calcular ejercicios necesarios para la sesión
 * Palabras difíciles necesitan más repeticiones
 */
export const calculateSessionLength = (words, progressMap) => {
    let totalExercises = 0;

    words.forEach(word => {
        const progress = progressMap[word.id];
        if (!progress) {
            // Palabra nueva: necesita más refuerzo (3 ejercicios base)
            totalExercises += 3;
        } else if (progress.masteryLevel <= 1) {
            // Nivel bajo: todavía en aprendizaje (2.5 ejercicios)
            totalExercises += 2.5;
        } else if (progress.masteryLevel <= 3) {
            // Nivel medio: mantenimiento (2 ejercicios)
            totalExercises += 2;
        } else {
            // Nivel alto: revisión (1.5 ejercicios)
            totalExercises += 1.5;
        }
    });

    return Math.ceil(totalExercises);
};
