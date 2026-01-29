import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Dimensions, 
  Platform,
  Animated,
  Easing,
  InteractionManager,
} from 'react-native';
import { useSelector } from 'react-redux';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { selectDarkMode } from '../../../../redux/darkModeSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width * 0.9 - 36) / 2; // Ajustado para mejor espaciado
const CARD_HEIGHT = CARD_WIDTH * 1.1; // Más cuadrado

/**
 * PowerDot - LED simple más pequeño
 */
const PowerDot = ({ active = true, darkMode }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const color = active ? (darkMode ? '#4ADE80' : '#10B981') : 'rgba(255,255,255,0.2)';

  useEffect(() => {
    let animationHandle;
    let animation;
    
    if (active) {
      // Diferir animación hasta después de la navegación
      animationHandle = InteractionManager.runAfterInteractions(() => {
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        animation.start();
      });
    } else {
      pulseAnim.setValue(1);
    }
    
    return () => {
      if (animation) animation.stop();
      if (animationHandle) animationHandle.cancel();
    };
  }, [active, pulseAnim]);

  return (
    <Animated.View 
      style={[
        styles.powerDot, 
        { 
          backgroundColor: color,
          transform: active ? [{ scale: pulseAnim }] : [],
        }
      ]} 
    />
  );
};

/**
 * SlotCard - Tarjeta simplificada y moderna
 */
const SlotCard = ({ 
  category, 
  colorPair, 
  imageUri, 
  slotNumber,
  darkModeEnabled,
  onPress,
}) => {
  const accentColor = colorPair?.background || colorPair?.primary || '#6366F1';
  const bgColor = darkModeEnabled ? '#1E1E1E' : '#FFFFFF';
  const borderColor = darkModeEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <TouchableOpacity
      style={[styles.slotCard, { 
        backgroundColor: bgColor,
        borderColor: borderColor,
      }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Image area */}
      <View style={styles.imageArea}>
        {imageUri ? (
          <>
            <Image
              source={{ uri: imageUri }}
              style={styles.slotImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}
              locations={[0.4, 1]}
            />
          </>
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: accentColor + '20' }]}>
            <FontAwesome5 
              name="gamepad" 
              size={24} 
              color={accentColor} 
              style={{ opacity: 0.4 }}
            />
          </View>
        )}

        {/* Slot badge */}
        <View style={[styles.slotBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.slotBadgeText}>#{slotNumber}</Text>
        </View>

        {/* Category name overlay */}
        <View style={styles.nameOverlay}>
          <Text style={styles.categoryName} numberOfLines={2}>
            {category?.name || 'Unnamed'}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.slotFooter, { borderTopColor: borderColor }]}>
        <View style={styles.footerContent}>
          <View style={styles.statusIndicator}>
            <PowerDot active={true} darkMode={darkModeEnabled} />
            <Text style={[styles.statusText, { 
              color: darkModeEnabled ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' 
            }]}>
              SAVED
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={14} 
            color={darkModeEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * SectionHeader - Header limpio y moderno
 */
const SectionHeader = ({ darkModeEnabled }) => {
  const textColor = darkModeEnabled ? '#FFFFFF' : '#1A1A2E';
  const subtitleColor = darkModeEnabled ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  const accentColor = darkModeEnabled ? '#4ADE80' : '#10B981';

  return (
    <View style={styles.headerContainer}>
      {/* Top decoration */}
      <View style={styles.headerTopRow}>
        <View style={styles.headerIcon}>
          <FontAwesome5 name="save" size={14} color={accentColor} />
        </View>
        <View style={styles.headerTextSection}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            QUICK RESUME
          </Text>
          <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>
            Recently played games
          </Text>
        </View>
        <View style={styles.headerDecor}>
          <View style={[styles.decorDot, { backgroundColor: accentColor }]} />
          <View style={[styles.decorDot, { backgroundColor: accentColor, opacity: 0.6 }]} />
          <View style={[styles.decorDot, { backgroundColor: accentColor, opacity: 0.3 }]} />
        </View>
      </View>
    </View>
  );
};

/**
 * EmptyState - Estado vacío minimalista
 */
const EmptyState = ({ darkModeEnabled }) => {
  const blinkAnim = useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    let animationHandle;
    let animation;
    
    // Diferir animación hasta después de la navegación
    animationHandle = InteractionManager.runAfterInteractions(() => {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    });
    
    return () => {
      if (animation) animation.stop();
      if (animationHandle) animationHandle.cancel();
    };
  }, [blinkAnim]);

  return (
    <View style={styles.emptyContainer}>
      <Animated.View style={{ opacity: blinkAnim }}>
        <FontAwesome5 
          name="clock" 
          size={32} 
          color={darkModeEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} 
        />
      </Animated.View>
      <Text style={[styles.emptyText, { 
        color: darkModeEnabled ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' 
      }]}>
        NO RECENT GAMES
      </Text>
      <Text style={[styles.emptySubtext, { 
        color: darkModeEnabled ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' 
      }]}>
        Start playing to see your progress
      </Text>
    </View>
  );
};

/**
 * RecentFlashcards - Componente principal rediseñado
 */
const RecentFlashcards = ({ recentCategories = [], onNavigateToFlashcardList }) => {
  const darkModeEnabled = useSelector(selectDarkMode);

  const renderItem = ({ item, index }) => {
    const { category, colorPair, imageUri } = item;
    return (
      <SlotCard
        key={`${category.id}-${index}`}
        category={category}
        colorPair={colorPair}
        imageUri={imageUri}
        slotNumber={index + 1}
        darkModeEnabled={darkModeEnabled}
        onPress={() => onNavigateToFlashcardList(category, colorPair, imageUri)}
      />
    );
  };

  const listKey = recentCategories.map(c => c.category?.id).join(',');

  return (
    <View style={[styles.container, { 
      backgroundColor: darkModeEnabled ? '#0F0F0F' : '#F8F9FA',
      borderColor: darkModeEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    }]}>
      <SectionHeader darkModeEnabled={darkModeEnabled} />

      {recentCategories.length === 0 ? (
        <EmptyState darkModeEnabled={darkModeEnabled} />
      ) : (
        <FlatList
          data={recentCategories}
          renderItem={renderItem}
          keyExtractor={(item, index) => `recent-${item.category?.id || index}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          extraData={[darkModeEnabled, listKey]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderRadius: 16,
    marginBottom: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Header
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(74,222,128,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  headerDecor: {
    flexDirection: 'row',
    gap: 4,
  },
  decorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Slot Card
  slotCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageArea: {
    flex: 1,
    position: 'relative',
  },
  slotImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Footer
  slotFooter: {
    borderTopWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  powerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },

  // List
  row: {
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 6,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1.5,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default RecentFlashcards;
