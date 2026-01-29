/**
 * CategoryImageBank - Maps category names to bundled images
 * 
 * Utiliza el banco de imágenes auto-generado desde generatedImageBank.js
 * Para agregar más imágenes:
 *   1. Pon el PNG/JPG en assets/bank/
 *   2. Ejecuta: node scripts/compressImages.js
 *   3. Ejecuta: node scripts/generateImageBank.js
 */

import { IMAGE_BANK } from './generatedImageBank';

// Fallback colors for categories without images
const CATEGORY_FALLBACK_COLORS = {
    animals: '#4CAF50',
    food: '#FF9800',
    travel: '#2196F3',
    business: '#607D8B',
    music: '#9C27B0',
    sports: '#F44336',
    nature: '#8BC34A',
    technology: '#00BCD4',
    art: '#E91E63',
    science: '#3F51B5',
    health: '#4CAF50',
    education: '#FF5722',
    languages: '#673AB7',
    home: '#795548',
    fashion: '#E91E63',
    cars: '#37474F',
    carparts: '#455A64',
    dogs: '#8D6E63',
    cats: '#FF7043',
    tv: '#5C6BC0',
    default: '#6366F1',
};

// Keywords to match category names to images
const CATEGORY_KEYWORDS = {
    animals: ['animal', 'animals', 'pet', 'pets', 'zoo', 'wildlife', 'mammal', 'bird', 'fish'],
    cats: ['cat', 'cats', 'kitten', 'feline', 'gato', 'gatos'],
    dogs: ['dog', 'dogs', 'puppy', 'canine', 'perro', 'perros'],
    food: ['food', 'cooking', 'kitchen', 'recipe', 'meal', 'restaurant', 'cuisine', 'eat', 'drink', 'comida'],
    travel: ['travel', 'trip', 'vacation', 'tourism', 'country', 'countries', 'city', 'cities', 'viaje'],
    business: ['business', 'work', 'office', 'job', 'career', 'professional', 'corporate', 'money', 'finance', 'negocio'],
    music: ['music', 'song', 'instrument', 'band', 'concert', 'sing', 'melody', 'musica'],
    sports: ['sport', 'sports', 'game', 'exercise', 'fitness', 'gym', 'athletic', 'football', 'soccer', 'basketball', 'deporte'],
    nature: ['nature', 'plant', 'plants', 'tree', 'flower', 'garden', 'forest', 'environment', 'eco', 'naturaleza'],
    technology: ['tech', 'technology', 'computer', 'software', 'hardware', 'digital', 'internet', 'app', 'device', 'tecnologia'],
    art: ['art', 'paint', 'draw', 'design', 'creative', 'museum', 'gallery', 'artistic', 'arte'],
    science: ['science', 'scientific', 'chemistry', 'physics', 'biology', 'lab', 'experiment', 'research', 'ciencia'],
    health: ['health', 'medical', 'medicine', 'doctor', 'hospital', 'body', 'wellness', 'salud'],
    education: ['education', 'school', 'study', 'learn', 'academic', 'university', 'college', 'class', 'educacion'],
    languages: ['language', 'languages', 'idiom', 'vocabulary', 'grammar', 'speak', 'idioma', 'english', 'spanish'],
    home: ['home', 'house', 'room', 'furniture', 'daily', 'routine', 'family', 'hogar', 'casa'],
    fashion: ['fashion', 'clothes', 'clothing', 'style', 'outfit', 'wear', 'dress', 'ropa', 'moda'],
    cars: ['car', 'cars', 'auto', 'automobile', 'vehicle', 'carro', 'coche'],
    carparts: ['carpart', 'carparts', 'part', 'parts', 'mechanic', 'engine', 'pieza', 'mecanico'],
    tv: ['tv', 'television', 'series', 'show', 'movie', 'film', 'streaming', 'netflix', 'pelicula'],
};

// Category emoji mapping (uses emojis from IMAGE_BANK when available)
const CATEGORY_EMOJIS = {
    animals: '🦁',
    cats: '🐱',
    dogs: '🐕',
    food: '🍕',
    travel: '✈️',
    business: '💼',
    music: '🎵',
    sports: '⚽',
    nature: '🌿',
    technology: '💻',
    art: '🎨',
    science: '🔬',
    health: '💊',
    education: '📚',
    languages: '🗣️',
    home: '🏠',
    fashion: '👗',
    cars: '🚗',
    carparts: '🔧',
    tv: '📺',
    default: '📦',
};

/**
 * Find the best matching category key for a given category name
 */
export const matchCategoryToKey = (categoryName) => {
    if (!categoryName) return 'default';

    const lowerName = categoryName.toLowerCase().trim();

    // First, try exact match with IMAGE_BANK keys
    if (IMAGE_BANK[lowerName]) {
        return lowerName;
    }

    // Then, try exact match with keywords
    if (CATEGORY_KEYWORDS[lowerName]) {
        return lowerName;
    }

    // Then, try to find by keywords
    for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerName.includes(keyword) || keyword.includes(lowerName)) {
                return key;
            }
        }
    }

    return 'default';
};

/**
 * Check if we have an image for a category
 */
export const hasCategoryImage = (categoryName) => {
    const key = matchCategoryToKey(categoryName);
    return IMAGE_BANK.hasOwnProperty(key);
};

/**
 * Get the image source for a category (returns null if no image available)
 * @param {string} categoryName - The name of the category
 * @returns {number|null} - The require() result for the image, or null
 */
export const getCategoryImage = (categoryName) => {
    const key = matchCategoryToKey(categoryName);
    return IMAGE_BANK[key]?.image || null;
};

/**
 * Get the fallback color for a category
 * @param {string} categoryName - The name of the category
 * @returns {string} - Hex color
 */
export const getCategoryFallbackColor = (categoryName) => {
    const key = matchCategoryToKey(categoryName);
    return CATEGORY_FALLBACK_COLORS[key] || CATEGORY_FALLBACK_COLORS.default;
};

/**
 * Get the emoji for a category
 * @param {string} categoryName - The name of the category
 * @returns {string} - The emoji character
 */
export const getCategoryEmoji = (categoryName) => {
    const key = matchCategoryToKey(categoryName);
    // First try IMAGE_BANK emoji, then fallback to local emoji map
    return IMAGE_BANK[key]?.emoji || CATEGORY_EMOJIS[key] || CATEGORY_EMOJIS.default;
};

/**
 * Get all available category keys that have images
 */
export const getAvailableCategoryKeys = () => {
    return Object.keys(IMAGE_BANK);
};

export default {
    getCategoryImage,
    getCategoryEmoji,
    getCategoryFallbackColor,
    matchCategoryToKey,
    getAvailableCategoryKeys,
    hasCategoryImage,
    IMAGE_BANK,
    CATEGORY_EMOJIS,
    CATEGORY_FALLBACK_COLORS,
};
