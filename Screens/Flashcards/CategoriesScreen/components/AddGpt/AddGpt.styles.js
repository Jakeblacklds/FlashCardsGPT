import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Design system constants
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32
};

const COLORS = {
  primary: '#7209b7',
  primaryDark: '#5a189a',
  primaryLight: '#9d4edd',
  accent: '#ff8800',
  accentDark: '#ff5400',
  success: '#4caf50',
  dark: '#121212',
  darkSurface: 'rgba(25, 25, 38, 0.93)',
  lightBackground: '#E6D3F9',
  white: '#FFFFFF',
  text: {
    primary: '#43291f',
    secondary: '#666666',
    light: '#eeeeee',
    dark: '#222222'
  }
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    gradientContainer: {
        flex: 1,
    },
    scrollViewContent: {
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        minHeight: Platform.OS === 'ios' ? height - 60 : height,
        alignItems: 'center',
        marginTop: 60,
    },
    // DARK MODE CONTAINER
    containerDark: {
        backgroundColor: COLORS.dark,
    },
    // INPUT FIELD DARK
    inputDark: {
        color: COLORS.white,
        backgroundColor: 'rgba(25,25,32,0.97)',
        borderColor: COLORS.primaryLight,
    },
    // TEXT DARK - Universal text
    textDark: {
        color: COLORS.text.light,
    },
    // Placeholder and subtext
    placeholderDark: {
        color: '#888',
    },
    // ----
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight,
        left: 15,
        zIndex: 10,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            }
        }),
    },
    robotContainer: {
        marginTop: Platform.OS === 'ios' ? 20 : 20,
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    robotImageWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    robotImageWrapperDark: {
        // Dark mode specific wrapper styling
    },
    robotFlashImage: {
        width: isSmallDevice ? 130 : 160,
        height: isSmallDevice ? 130 : 160,
        resizeMode: 'contain',
    },
    robotFlashImageDark: {
        tintColor: COLORS.white,
        opacity: 0.95,
    },
    robotFlashImageSmall: {
        width: 120,
        height: 120,
    },
    robotGlowEffect: {
        position: 'absolute',
        width: isSmallDevice ? 160 : 180,
        height: isSmallDevice ? 160 : 180,
        borderRadius: 90,
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        borderColor: 'rgba(181, 23, 158, 0.6)',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 18,
        elevation: 12,
    },
    additionalText: {
        color: COLORS.text.primary,
        fontFamily: 'Pagebash',
        fontSize: 28,
        textAlign: 'center',
        marginBottom: SPACING.xs,
        paddingHorizontal: SPACING.lg,
        letterSpacing: 0.5,
    },
    additionalTextSmall: {
        fontSize: 24,
    },
    subText: {
        fontSize: 16,
        color: COLORS.text.secondary,
        marginBottom: SPACING.lg,
        fontFamily: 'WorsSansSemiBold',
        textAlign: 'center',
        paddingHorizontal: SPACING.lg,
        lineHeight: 22,
        letterSpacing: 0.2,
    },
    subTextSmall: {
        fontSize: 14,
        marginBottom: SPACING.md,
        lineHeight: 20,
    },
    // INPUT CONTAINER GENERAL + DARK
    inputContainer: {
        width: width * 0.85,
        maxWidth: 350,
        borderWidth: 2,
        borderRadius: 18,
        overflow: 'hidden',
        marginVertical: isSmallDevice ? SPACING.md : SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.92)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            }
        }),
    },
    inputContainerDark: {
        backgroundColor: 'rgba(20,20,25,0.98)',
        borderColor: COLORS.primaryLight,
    },
    inputContainerSmall: {
        width: width * 0.85,
    },
    input: {
        padding: SPACING.md,
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'Pagebash',
        width: '100%',
        color: COLORS.text.dark,
        letterSpacing: 0.3,
    },
    inputSmall: {
        padding: 14,
        fontSize: 16,
    },
    inputIconContainer: {
        position: 'absolute',
        right: SPACING.md,
        top: '50%',
        transform: [{ translateY: -12 }],
        padding: SPACING.xs,
    },
    // TAGS STYLES
    tagsContainerWrapper: {
        width: width * 0.85,
        maxWidth: 350,
        marginVertical: isSmallDevice ? SPACING.sm : SPACING.md,
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'WorsSansSemiBold',
        marginBottom: SPACING.sm,
        color: COLORS.primaryDark,
        paddingLeft: SPACING.xs,
        letterSpacing: 0.3,
    },
    sectionTitleSmall: {
        fontSize: 16,
        marginBottom: SPACING.xs,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: SPACING.xs,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 24,
        margin: 6,
        borderWidth: 1.5,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderColor: '#d8d8d8',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            }
        }),
        transition: 'all 0.3s ease',
    },
    tagDark: {
        backgroundColor: 'rgba(36,36,48,0.98)',
        borderColor: COLORS.primary,
    },
    tagSelected: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primaryLight,
        transform: [{ scale: 1.05 }],
    },
    tagSmall: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        margin: 5,
        borderRadius: 20,
    },
    tagIcon: {
        marginRight: 8,
    },
    tagText: {
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'WorsSansSemiBold',
        color: COLORS.primary,
        letterSpacing: 0.2,
    },
    tagTextDark: {
        color: COLORS.white,
    },
    tagTextSelected: {
        color: COLORS.white,
    },
    tagTextSmall: {
        fontSize: 13,
    },
    // SLIDER & COUNTER
    sliderContainerWrapper: {
        width: width * 0.85,
        maxWidth: 350,
        marginTop: SPACING.md,
        marginBottom: isSmallDevice ? SPACING.md : SPACING.lg,
    },
    sliderContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
        paddingVertical: isSmallDevice ? SPACING.md : SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderRadius: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            }
        }),
    },
    sliderContainerDark: {
        backgroundColor: COLORS.darkSurface,
    },
    sliderText: {
        color: COLORS.primary,
        fontSize: 32,
        fontFamily: 'Pagebash',
        marginBottom: SPACING.md,
        letterSpacing: 0.5,
    },
    sliderTextDark: {
        color: COLORS.white,
    },
    sliderTextSmall: {
        fontSize: 28,
        marginBottom: SPACING.sm,
    },
    slider: {
        width: '92%',
        height: 40,
    },
    sliderSmall: {
        height: 36,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '92%',
        paddingHorizontal: SPACING.md,
        marginTop: SPACING.xs,
    },
    sliderLabelText: {
        fontSize: 13,
        fontFamily: 'WorsSansSemiBold',
        color: '#555',
    },
    sliderLabelTextDark: {
        color: '#b5b5b5',
    },
    // BUTTONS
    buttonWrapper: {
        marginBottom: Platform.OS === 'ios' ? SPACING.md : SPACING.sm,
        marginTop: SPACING.sm,
    },
    button: {
        width: width * 0.85,
        maxWidth: 350,
        borderRadius: 28,
        margin: isSmallDevice ? SPACING.md : SPACING.lg,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            }
        }),
        transform: [{ scale: 1 }], // For animation purposes
    },
    buttonSmall: {
        borderRadius: 24,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: isSmallDevice ? 14 : 18,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'Pagebash',
        letterSpacing: 0.6,
    },
    buttonTextSmall: {
        fontSize: 16,
    },
    buttonIcon: {
        marginRight: SPACING.sm,
    },
    debugContainer: {
        width: width * 0.85,
        maxWidth: 350,
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
        padding: SPACING.md,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(114, 9, 183, 0.2)',
    },
    debugText: {
        fontSize: 13,
        fontFamily: 'WorsSansSemiBold',
        color: '#555',
        lineHeight: 18,
    },
    // En AddGpt.styles.js
fullScreenOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(72, 12, 168, 0.92)', // Tu color de fondo
    // zIndex: 999, // <--- QUITA ESTO de aquí
  },
    modalContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 24,
        width: width * 0.8,
        maxWidth: 320,
    },
    loadingText: {
        marginTop: SPACING.md,
        color: '#d2fbd0',
        fontSize: isSmallDevice ? 22 : 26,
        fontFamily: 'Pagebash',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    successModal: {
        position: 'absolute',
        backgroundColor: COLORS.success,
        padding: SPACING.md,
        borderRadius: 24,
        top: 90,
        zIndex: 1000,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            }
        }),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    successModalText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: 'WorsSansSemiBold',
        marginLeft: SPACING.md,
        letterSpacing: 0.3,
    },
    // Floating Label modern input
floatingLabelContainer: {
    position: 'relative',
    width: width * 0.85,
    maxWidth: 350,
    marginVertical: isSmallDevice ? SPACING.md : SPACING.lg,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    ...Platform.select({
      ios: {
        shadowColor: '#7209b7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      }
    }),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7209b7',
  },
  floatingLabelContainerDark: {
    backgroundColor: 'rgba(28,20,38,0.96)',
    borderColor: '#b5179e',
  },
  floatingLabelInput: {
    height: 54,
    fontSize: 18,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 10,
    color: COLORS.text.dark,
    fontFamily: 'Pagebash',
    letterSpacing: 0.2,
  },
  floatingLabelInputDark: {
    color: COLORS.white,
  },
  floatingLabel: {
    position: 'absolute',
    left: 18,
    top: 18,
    fontSize: 18,
    color: '#888',
    fontFamily: 'WorsSansSemiBold',
    letterSpacing: 0.2,
    zIndex: 2,
  },
  floatingLabelDark: {
    color: '#b5b5b5',
  },
  
});

export default styles;
