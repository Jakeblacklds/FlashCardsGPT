import { useState, useRef } from 'react';
import { Keyboard, Alert } from 'react-native';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

// External functions
import { fetchFlashcardsFromGPT } from '../FetchFlashcards';
import {
  fetchCategories,
  updatePendingProgress,
  resolvePendingCategory,
  setPendingError
} from '../../../../../../redux/FlashcardSlice';

/**
 * Hook for handling flashcard generation
 * Supports background generation with simulated progress for better UX
 */
export const useFlashcardGeneration = (navigation, dispatch) => {
  const [debugMessage, setDebugMessage] = useState('');

  // Store interval refs for cleanup
  const progressIntervalRef = useRef(null);

  /**
   * Start simulated progress animation
   * Progress moves gradually to give user feedback while waiting for API
   */
  const startSimulatedProgress = (tempId, targetProgress = 80, durationMs = 25000) => {
    let currentProgress = 5;
    const startTime = Date.now();

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / durationMs, 1);

      // Easing function for more natural feel (slow at start/end, faster in middle)
      const easedProgress = easeInOutCubic(progressRatio);
      currentProgress = 5 + (targetProgress - 5) * easedProgress;

      dispatch(updatePendingProgress({
        tempId,
        progress: Math.round(currentProgress),
        status: 'generating',
      }));

      // Stop when we reach target or timeout
      if (progressRatio >= 1) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, 200); // Update every 200ms for smooth animation

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  };

  /**
   * Easing function for natural progress animation
   */
  const easeInOutCubic = (t) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  /**
   * Stop simulated progress and jump to real value
   */
  const stopSimulatedProgress = (tempId, realProgress, status, createdCards) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    dispatch(updatePendingProgress({
      tempId,
      progress: realProgress,
      status,
      createdCards
    }));
  };

  /**
   * Background generation - creates flashcards while user navigates away
   * Uses simulated progress for better UX since API returns all at once
   */
  const handleBackgroundGeneration = async (
    tempId,
    categoryName,
    numFlashcards,
    currentUserUID,
    selectedTags
  ) => {
    console.log('[useFlashcardGeneration] Starting background generation for:', categoryName);

    // Start simulated progress (will animate from 5% to 80% over ~25 seconds)
    const cleanupProgress = startSimulatedProgress(tempId, 80, 25000);

    try {
      // Step 1: Fetch flashcards from GPT (this is the slow part)
      let generatedFlashcards;
      try {
        generatedFlashcards = await fetchFlashcardsFromGPT(numFlashcards, categoryName, selectedTags);
      } catch (fetchError) {
        console.error('[useFlashcardGeneration] GPT fetch error:', fetchError);
        cleanupProgress();
        dispatch(setPendingError({ tempId, error: fetchError.message || 'AI generation failed' }));
        return;
      }

      if (!generatedFlashcards || generatedFlashcards.length === 0) {
        cleanupProgress();
        dispatch(setPendingError({ tempId, error: 'No flashcards generated' }));
        return;
      }

      // GPT responded! Stop simulated progress and jump to 85%
      stopSimulatedProgress(tempId, 85, 'saving', generatedFlashcards.length);

      // Step 2: Parse flashcards (fast operation)
      const formattedFlashcards = parseFlashcards(generatedFlashcards);

      dispatch(updatePendingProgress({
        tempId,
        progress: 90,
        status: 'saving',
        createdCards: formattedFlashcards.length
      }));

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 3: Save to Firebase
      const flashcardsObject = formattedFlashcards.reduce((obj, item, index) => {
        obj[`flashcard${index + 1}`] = item;
        return obj;
      }, {});

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        dispatch(setPendingError({ tempId, error: 'User not authenticated' }));
        return;
      }

      const token = await user.getIdToken(true);
      const categoryKey = encodeURIComponent(categoryName);
      const categoryUrl = `https://flashcardgpt-default-rtdb.firebaseio.com/users/${currentUserUID}/categories/${categoryKey}.json?auth=${token}`;

      dispatch(updatePendingProgress({
        tempId,
        progress: 95,
        status: 'saving',
        createdCards: formattedFlashcards.length
      }));

      await axios.put(categoryUrl, {
        name: categoryName,
        flashcards: flashcardsObject,
      });

      // Step 4: Complete!
      dispatch(updatePendingProgress({
        tempId,
        progress: 100,
        status: 'complete',
        createdCards: formattedFlashcards.length
      }));

      // Refresh categories list
      dispatch(fetchCategories());

      // Remove from pending after a short delay so user sees completion
      setTimeout(() => {
        dispatch(resolvePendingCategory({ tempId }));
      }, 1200);

      console.log('[useFlashcardGeneration] Background generation completed successfully!');

    } catch (error) {
      console.error('[useFlashcardGeneration] Background generation error:', error);
      cleanupProgress();
      dispatch(setPendingError({ tempId, error: error.message || 'Unknown error' }));
    }
  };

  /**
   * Parse raw GPT flashcard strings into structured objects
   */
  const parseFlashcards = (generatedFlashcards) => {
    return generatedFlashcards.map((flashcardText, index) => {
      const parts = flashcardText.split(', ');

      const getValue = (part, englishLabel, spanishLabel) => {
        if (!part) return null;
        const lowerPart = part.toLowerCase();
        if (lowerPart.includes(englishLabel.toLowerCase() + ':') ||
          lowerPart.includes(spanishLabel.toLowerCase() + ':')) {
          const colonIndex = part.indexOf(':');
          return part.substring(colonIndex + 1).trim();
        }
        return null;
      };

      const englishPart = getValue(parts[0], 'English', 'Inglés') || parts[0]?.split(': ')[1] || `Error-Eng-${index}`;
      const spanishPart = getValue(parts[1], 'Spanish', 'Español') || parts[1]?.split(': ')[1] || `Error-Esp-${index}`;
      const typePart = (getValue(parts[2], 'Type', 'Tipo') || parts[2]?.split(': ')[1] || 'vocab').toLowerCase();
      const rarityPart = parseInt(getValue(parts[3], 'Rarity', 'Rareza') || parts[3]?.split(': ')[1]) || 1;
      const emojiPart = getValue(parts[4], 'Emoji', 'Emoji') || parts[4]?.split(': ')[1] || '📚';

      let variants = [];
      const alternativesPartRaw = getValue(parts[5], 'Alternatives', 'Variantes') ||
        parts[5]?.split('Variantes: ')[1] ||
        parts[5]?.split('Alternatives: ')[1];

      if (alternativesPartRaw) {
        try {
          const parsed = JSON.parse(alternativesPartRaw);
          if (Array.isArray(parsed)) {
            const UNLOCK_LEVELS = { common: 2, uncommon: 5, rare: 8 };
            variants = parsed.map((variant, vIndex) => ({
              text: variant.text || '',
              rarity: variant.rarity || 'common',
              level: vIndex + 1,
              unlockAtWordLevel: UNLOCK_LEVELS[variant.rarity] || 2
            }));
          }
        } catch (e) {
          console.warn(`Error parsing variants for index ${index}:`, e);
          variants = [];
        }
      }

      const validTypes = ['vocab', 'phrase', 'idiom', 'verb', 'adjective', 'noun'];
      const type = validTypes.includes(typePart) ? typePart : 'vocab';
      const rarity = Math.min(5, Math.max(1, rarityPart));

      return {
        english: englishPart,
        spanish: spanishPart,
        type,
        rarity,
        icon: emojiPart,
        variants,
        variant1: variants[0]?.text || null,
        variant2: variants[1]?.text || null,
        variant3: variants[2]?.text || null,
        userProgress: {
          currentLevel: 0,
          xp: 0,
          timesCorrect: 0,
          timesIncorrect: 0,
          lastPracticed: null
        }
      };
    });
  };

  /**
   * Validate inputs before starting generation
   */
  const validateInputs = (categoryName, currentUserUID) => {
    Keyboard.dismiss();

    if (!categoryName.trim()) {
      Alert.alert('Name Required', 'Please enter a category name.');
      return false;
    }
    if (!currentUserUID) {
      Alert.alert('User Error', 'Could not identify user.');
      return false;
    }
    return true;
  };

  return {
    debugMessage,
    handleBackgroundGeneration,
    validateInputs,
    setDebugMessage,
  };
};
