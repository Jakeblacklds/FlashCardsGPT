import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { selectDarkMode } from '../../../../redux/darkModeSlice';

const { width } = Dimensions.get('window');
const cardWidth = (width * 0.9 - 40) / 2;

const RecentFlashcards = ({ recentCategories = [], onNavigateToFlashcardList }) => {
  const darkModeEnabled = useSelector(selectDarkMode);

  const renderItem = ({ item }) => {
    const { category, colorPair, imageUri } = item;

    // Paleta de colores refinada para Modo Oscuro
    const baseDarkCardBgStart = '#30343D'; // Inicio del gradiente del fondo de la tarjeta
    const baseDarkCardBgEnd = '#282C34';   // Fin del gradiente del fondo de la tarjeta
    const defaultDarkTextColor = '#F0F0F0'; // Texto principal casi blanco, alta legibilidad
    const placeholderIconDarkColor = '#A0A0A0'; // Color del icono del placeholder
    const darkBorderColor = 'rgba(255, 255, 255, 0.15)'; // Borde sutil pero definitorio

    // Colores para Modo Claro (manteniendo simplicidad)
    const defaultLightBackgroundColor = '#FFFFFF';
    const defaultLightTextColor = '#1C1C1E';
    const lightBorderColor = 'rgba(0, 0, 0, 0.09)';

    // Determinar colores finales basados en colorPair y modo
    const finalCardBgStart = darkModeEnabled ? (colorPair?.darkBgStart || baseDarkCardBgStart) : (colorPair?.background || defaultLightBackgroundColor);
    const finalCardBgEnd = darkModeEnabled ? (colorPair?.darkBgEnd || baseDarkCardBgEnd) : (colorPair?.background || defaultLightBackgroundColor);
    const finalTextColor = darkModeEnabled ? (colorPair?.darkText || defaultDarkTextColor) : (colorPair?.text || defaultLightTextColor);
    const finalBorderColor = darkModeEnabled ? darkBorderColor : lightBorderColor;

    // Gradiente para el texto sobre la imagen/fondo
    const textOverlayGradient = darkModeEnabled
      ? ['rgba(10, 10, 15, 0.0)', 'rgba(10, 10, 15, 0.7)', 'rgba(10, 10, 15, 0.95)'] // Gradiente de texto más progresivo y oscuro
      : ['transparent', `${colorPair?.background || defaultLightBackgroundColor}E9`];

    // Estilos de sombra condicionales
    const cardShadowStyle = Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: darkModeEnabled ? 3 : 2 },
        shadowOpacity: darkModeEnabled ? 0.22 : 0.12,
        shadowRadius: darkModeEnabled ? 5 : 4,
      },
      android: {
        elevation: darkModeEnabled ? 4 : 3,
      },
    });

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          // El backgroundColor aquí es un fallback, el gradiente lo cubrirá si está presente
          { backgroundColor: darkModeEnabled ? finalCardBgEnd : finalCardBgStart },
          { borderColor: finalBorderColor },
          cardShadowStyle,
        ]}
        activeOpacity={0.85} // Un poco más de feedback
        onPress={() => onNavigateToFlashcardList(category, colorPair, imageUri)}
      >
        {/* Gradiente de fondo para la tarjeta en Modo Oscuro (o color sólido en Modo Claro) */}
        {darkModeEnabled ? (
          <LinearGradient
            colors={[finalCardBgStart, finalCardBgEnd]}
            style={StyleSheet.absoluteFillObject} // Cubre toda la tarjeta
          />
        ) : null}

        {/* Contenido de la tarjeta (Imagen o Placeholder) */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.cardImageBackground}
            resizeMode="cover"
          />
        ) : (
          <View style={[
            styles.placeholderView,
            // El fondo del placeholder ya no es necesario si el gradiente de tarjeta lo cubre
            // Solo para modo claro, podríamos mantener un fondo sutil
            { backgroundColor: darkModeEnabled ? 'transparent' : `${finalTextColor}10` }
          ]}>
            <FontAwesome name="image" size={cardWidth * 0.3} color={darkModeEnabled ? placeholderIconDarkColor : `${finalTextColor}99`} />
          </View>
        )}

        {/* Gradiente para el texto */}
        <LinearGradient
          colors={textOverlayGradient}
          style={styles.textGradient}
        >
          <Text
            style={[styles.categoryName, { color: finalTextColor }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {category.name}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // El contenedor principal y el estado vacío se mantienen sin cambios significativos
  // Asegúrate de que styles.container tenga un fondo oscuro para el modo oscuro (ej. #1A1D21)
  if (recentCategories.length === 0) {
    return (
      <View style={[
        styles.container,
        // Fondo del componente "RecentFlashcards"
        { backgroundColor: darkModeEnabled ? '#1A1D21' : '#F9F9F9' }
      ]}>
        <Text style={[
          styles.title,
          { color: darkModeEnabled ? '#EFEFEF' : '#333' }
        ]}>
          Opened Recently
        </Text>
        <View style={styles.emptyStateContainer}>
          <FontAwesome
            name="clock-o"
            size={38}
            color={darkModeEnabled ? '#484C56' : '#D0D0D0'}
          />
          <Text style={[
            styles.emptyStateText,
            { color: darkModeEnabled ? '#707888' : '#888' }
          ]}>
            No recent flashcards available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: darkModeEnabled ? '#1A1D21' : '#F9F9F9' } // Un fondo ligeramente diferente para el contenedor
    ]}>
      <View style={styles.headerContainer}>
        <Text style={[
          styles.title,
          { color: darkModeEnabled ? '#EFEFEF' : '#333' }
        ]}>
          Opened Recently
        </Text>
        {recentCategories.length > 0 && (
          <Text style={[
            styles.subtitle,
            { color: darkModeEnabled ? '#A0A8B8' : '#777' }
          ]}>
            Tap to continue learning
          </Text>
        )}
      </View>

      <FlatList
        data={recentCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.category.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        extraData={darkModeEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { // Contenedor principal de "RecentFlashcards"
    width: '90%',
    maxWidth: 600,
    alignSelf: 'center',
    borderRadius: 28,
    marginBottom: 24,
    overflow: 'visible', // Permitir que las sombras se vean bien, especialmente en iOS
    paddingVertical: 8, // Pequeño padding vertical para el contenido dentro del contenedor
    // backgroundColor se define inline
    // Las sombras se aplican al contenedor mismo
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1, // Sombra sutil para el contenedor
        shadowRadius: 12,
      },
      android: {
        elevation: 5, // Elevación sutil para el contenedor
      },
    }),
  },
  headerContainer: {
    paddingTop: 18, // Ligeramente ajustado
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 26, // Ligeramente más pequeño si es necesario
    fontFamily: 'Pagebash',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 10, // Más espacio después del subtítulo
    opacity: 0.9,
  },
  categoryCard: {
    width: cardWidth,
    aspectRatio: 1, // Cuadradas
    margin: 7,
    borderRadius: 20, // Un radio un poco mayor para suavizar
    borderWidth: 1,
    overflow: 'hidden', // Importante para que el contenido respete el borde
    position: 'relative',
    // backgroundColor y borderColor se aplican dinámicamente
    // Las sombras también se aplican dinámicamente (cardShadowStyle)
  },
  cardImageBackground: {
    ...StyleSheet.absoluteFillObject, // La imagen ocupa toda la tarjeta
    opacity: 0.9, // Sutil opacidad a la imagen en dark mode para mezclarla mejor si es muy brillante
    // Podrías hacer esta opacidad condicional: darkModeEnabled ? 0.85 : 1
  },
  placeholderView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%', // Un poco más de altura para el gradiente del texto
    justifyContent: 'flex-end',
    paddingVertical: 10, // Ajustar padding
    paddingHorizontal: 12,
    zIndex: 2,
  },
  categoryName: {
    fontSize: 15, // Fuente un poco más grande para el nombre en la tarjeta
    fontWeight: 'bold',
    fontFamily: 'Pagebash',
    // color se aplica inline
  },
  row: {
    justifyContent: 'space-around',
    paddingHorizontal: 5,
  },
  listContent: {
    paddingBottom: 16, // Espacio al final
    paddingHorizontal: 7,
  },
  emptyStateContainer: {
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150, // Para darle un tamaño mínimo al estado vacío
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 15,
    textAlign: 'center',
  }
});

export default RecentFlashcards;