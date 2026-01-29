/**
 * Tests unitarios para el algoritmo SM-2 de repetición espaciada
 * 
 * Para ejecutar: node __tests__/spacedRepetition.test.js
 * (o integrar con Jest si lo configuras)
 */

// Importar funciones (ajustar path si es necesario)
const {
    calculateNewEaseFactor,
    calculateInterval,
    calculateQuality,
    needsReview,
    getMasteryInfo,
    getStreakMilestone,
    calculateReviewUrgency,
    SM2_CONFIG,
} = require('../utils/spacedRepetition');

// ============ TEST RUNNER SIMPLE ============
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        failed++;
    }
}

function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected} but got ${actual}`);
            }
        },
        toBeCloseTo: (expected, precision = 2) => {
            const diff = Math.abs(actual - expected);
            if (diff > Math.pow(10, -precision)) {
                throw new Error(`Expected ${expected} (±${Math.pow(10, -precision)}) but got ${actual}`);
            }
        },
        toBeGreaterThan: (expected) => {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },
        toBeLessThan: (expected) => {
            if (actual >= expected) {
                throw new Error(`Expected ${actual} to be less than ${expected}`);
            }
        },
        toBeTruthy: () => {
            if (!actual) {
                throw new Error(`Expected truthy value but got ${actual}`);
            }
        },
        toBeFalsy: () => {
            if (actual) {
                throw new Error(`Expected falsy value but got ${actual}`);
            }
        },
        toBeNull: () => {
            if (actual !== null) {
                throw new Error(`Expected null but got ${actual}`);
            }
        },
    };
}

// ============ TESTS ============

console.log('\n🧪 Testing SM-2 Algorithm\n');

// --- EaseFactor Tests ---
console.log('--- calculateNewEaseFactor ---');

test('EF should increase with quality 5', () => {
    const newEF = calculateNewEaseFactor(2.5, 5);
    expect(newEF).toBe(2.5); // Ya está al máximo
});

test('EF should decrease with quality 0', () => {
    const newEF = calculateNewEaseFactor(2.5, 0);
    expect(newEF).toBeLessThan(2.5);
});

test('EF should not go below MIN_EASE_FACTOR', () => {
    let ef = 1.5;
    for (let i = 0; i < 10; i++) {
        ef = calculateNewEaseFactor(ef, 0);
    }
    expect(ef).toBe(SM2_CONFIG.MIN_EASE_FACTOR);
});

test('EF should stay stable with quality 4', () => {
    const newEF = calculateNewEaseFactor(2.5, 4);
    expect(newEF).toBe(2.5); // Calidad 4 no cambia EF=2.5
});

test('EF should decrease slightly with quality 3', () => {
    const newEF = calculateNewEaseFactor(2.5, 3);
    expect(newEF).toBeLessThan(2.5);
    expect(newEF).toBeGreaterThan(2.3);
});

// --- Interval Tests ---
console.log('\n--- calculateInterval ---');

test('First successful review should be 1 day', () => {
    const interval = calculateInterval(1, 2.5, 0);
    expect(interval).toBe(1);
});

test('Second successful review should be 6 days', () => {
    const interval = calculateInterval(2, 2.5, 1);
    expect(interval).toBe(6);
});

test('Third review should use EF multiplier', () => {
    const interval = calculateInterval(3, 2.5, 6);
    expect(interval).toBe(15); // 6 * 2.5 = 15
});

test('Interval with low EF should be shorter', () => {
    const intervalHigh = calculateInterval(3, 2.5, 6);
    const intervalLow = calculateInterval(3, 1.5, 6);
    expect(intervalLow).toBeLessThan(intervalHigh);
});

test('Zero repetitions should return 0', () => {
    const interval = calculateInterval(0, 2.5, 5);
    expect(interval).toBe(0);
});

// --- Quality Calculation Tests ---
console.log('\n--- calculateQuality ---');

test('Incorrect answer should return quality <= 2', () => {
    const quality = calculateQuality({ isCorrect: false });
    expect(quality).toBeLessThan(3);
});

test('Correct with hint should return quality 3', () => {
    const quality = calculateQuality({ isCorrect: true, usedHint: true });
    expect(quality).toBe(3);
});

test('Fast correct answer should return quality 5', () => {
    const quality = calculateQuality({ isCorrect: true, responseTimeMs: 1000 });
    expect(quality).toBe(5);
});

test('Slow correct answer should return quality 3', () => {
    const quality = calculateQuality({ isCorrect: true, responseTimeMs: 10000 });
    expect(quality).toBe(3);
});

test('Multiple failed attempts should return quality 0', () => {
    const quality = calculateQuality({ isCorrect: false, attempts: 3 });
    expect(quality).toBe(0);
});

// --- needsReview Tests ---
console.log('\n--- needsReview ---');

test('Null progress should need review', () => {
    expect(needsReview(null)).toBe(true);
});

test('No nextReview should need review', () => {
    expect(needsReview({ masteryLevel: 1 })).toBe(true);
});

test('Past nextReview should need review', () => {
    const pastReview = { nextReview: Date.now() - 1000 };
    expect(needsReview(pastReview)).toBe(true);
});

test('Future nextReview should not need review', () => {
    const futureReview = { nextReview: Date.now() + 100000 };
    expect(needsReview(futureReview)).toBe(false);
});

// --- getMasteryInfo Tests ---
console.log('\n--- getMasteryInfo ---');

test('Level 0 should return Nuevo', () => {
    const info = getMasteryInfo(0);
    expect(info.name).toBe('Nuevo');
});

test('Level 5 should return Dominado', () => {
    const info = getMasteryInfo(5);
    expect(info.name).toBe('Dominado');
});

test('Invalid level should default to level 0', () => {
    const info = getMasteryInfo(-1);
    expect(info.name).toBe('Nuevo');
});

test('Level above 5 should cap at 5', () => {
    const info = getMasteryInfo(10);
    expect(info.name).toBe('Dominado');
});

// --- getStreakMilestone Tests ---
console.log('\n--- getStreakMilestone ---');

test('Streak < 3 should return null', () => {
    expect(getStreakMilestone(2)).toBeNull();
});

test('Streak 3 should return On Fire', () => {
    const milestone = getStreakMilestone(3);
    expect(milestone.name).toBe('On Fire!');
});

test('Streak 5 should return Hot Streak', () => {
    const milestone = getStreakMilestone(5);
    expect(milestone.name).toBe('Hot Streak!');
});

test('Streak 15 should still return Unstoppable (highest below)', () => {
    const milestone = getStreakMilestone(15);
    expect(milestone.name).toBe('Unstoppable!');
});

test('Streak 20+ should return LEGENDARY', () => {
    const milestone = getStreakMilestone(25);
    expect(milestone.name).toBe('LEGENDARY!');
});

// --- Urgency Tests ---
console.log('\n--- calculateReviewUrgency ---');

test('Null progress should have highest urgency', () => {
    const urgency = calculateReviewUrgency(null);
    expect(urgency).toBe(1000);
});

test('Overdue words should have high urgency', () => {
    const progress = { nextReview: Date.now() - (24 * 60 * 60 * 1000) }; // 1 day overdue
    const urgency = calculateReviewUrgency(progress);
    expect(urgency).toBeGreaterThan(500);
});

test('Low EF words should have higher urgency than high EF', () => {
    const lowEF = { nextReview: Date.now() + 100000, easeFactor: 1.5 };
    const highEF = { nextReview: Date.now() + 100000, easeFactor: 2.5 };
    expect(calculateReviewUrgency(lowEF)).toBeGreaterThan(calculateReviewUrgency(highEF));
});

// ============ SUMMARY ============
console.log('\n========================================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('========================================\n');

if (failed > 0) {
    process.exit(1);
}
