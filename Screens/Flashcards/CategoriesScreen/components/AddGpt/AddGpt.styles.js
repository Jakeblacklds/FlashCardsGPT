import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// --- NUEVO SISTEMA DE DISEÑO (CLEAN & MODERN) ---
const SPACING = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 24,
  xl: 40
};

const COLORS = {
  primary: '#4F46E5', // Indigo
  primaryDark: '#3730A3',
  accent: '#06B6D4',  // Cyan Eléctrico
  success: '#10B981',

  // Fondos
  lightBackground: '#F8FAFC',
  darkBackground: '#0F172A',

  // Cristal
  glass: {
    borderLight: 'rgba(0, 0, 0, 0.05)',
    borderDark: 'rgba(255, 255, 255, 0.1)',
  },

  text: {
    primaryLight: '#1E293B',
    secondaryLight: '#64748B',
    primaryDark: '#F1F5F9',
    secondaryDark: '#94A3B8',
  },

  white: '#FFFFFF',
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
    paddingBottom: Platform.OS === 'ios' ? 80 : 60,
    minHeight: Platform.OS === 'ios' ? height - 60 : height,
    alignItems: 'center',
    marginTop: 60,
  },

  // ---- Botón de Regreso ----
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  // ---- Header (Tipografía Limpia) ----
  robotContainer: {
    marginTop: Platform.OS === 'ios' ? 40 : 40,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  additionalText: {
    color: COLORS.text.primaryLight,
    fontFamily: 'Pagebash',
    fontSize: 36,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  additionalTextSmall: {
    fontSize: 28,
  },
  subText: {
    fontSize: 16,
    color: COLORS.text.secondaryLight,
    marginBottom: SPACING.xl,
    fontFamily: 'WorsSansSemiBold',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 24,
  },
  textDark: {
    color: COLORS.text.primaryDark,
  },
  subTextDark: {
    color: COLORS.text.secondaryDark,
  },

  // ---- INPUT (Clean Glass) ----
  floatingLabelContainer: {
    position: 'relative',
    width: width * 0.9,
    maxWidth: 380,
    marginVertical: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.borderLight,
    backgroundColor: 'transparent',

    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary, // Sombra Indigo
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 0,
      }
    }),
  },
  floatingLabelContainerDark: {
    borderColor: COLORS.glass.borderDark,
  },
  floatingLabelInput: {
    height: 64,
    fontSize: 18,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 8,
    color: COLORS.text.primaryLight,
    fontFamily: 'WorsSansSemiBold',
    letterSpacing: 0.3,
  },
  floatingLabelInputDark: {
    color: COLORS.white,
  },
  floatingLabel: {
    position: 'absolute',
    left: 20,
    top: 22,
    fontSize: 18,
    color: COLORS.text.secondaryLight,
    fontFamily: 'WorsSansSemiBold',
    zIndex: 2,
  },
  inputIconContainer: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{ translateY: -12 }],
  },

  // ---- Contenedores Generales ----
  bentoBoxWrapper: {
    width: width * 0.9,
    maxWidth: 380,
    marginVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'WorsSansSemiBold',
    marginBottom: SPACING.sm,
    color: COLORS.text.secondaryLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: SPACING.xs,
  },
  sectionTitleDark: {
    color: COLORS.text.secondaryDark,
  },

  bentoBoxContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.borderLight,
  },
  bentoBoxContainerDark: {
    borderColor: COLORS.glass.borderDark,
  },
  bentoBoxPadding: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },

  // ---- Tags ----
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    margin: 4,
    borderWidth: 1,
    borderColor: COLORS.glass.borderLight,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tagDark: {
    borderColor: COLORS.glass.borderDark,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tagSelected: {
    borderColor: 'transparent',
  },
  tagText: {
    fontSize: 14,
    fontFamily: 'WorsSansSemiBold',
    color: COLORS.text.secondaryLight,
  },
  tagTextDark: {
    color: COLORS.text.secondaryDark,
  },
  tagTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  tagIcon: {
    marginRight: 6,
  },

  // ---- Slider Textos ----
  sliderContent: {
    alignItems: 'center',
  },
  sliderText: {
    color: COLORS.primary, // Indigo
    fontSize: 60,
    fontFamily: 'Pagebash',
    marginBottom: SPACING.sm,
  },
  sliderTextDark: {
    color: COLORS.white,
  },
  slider: {
    width: '100%',
    height: 40,
  },

  // ---- Botón Generar ----
  buttonWrapper: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  button: {
    width: width * 0.9,
    maxWidth: 380,
    borderRadius: 20,
    overflow: 'hidden',
    height: 64,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: 'WorsSansSemiBold',
    letterSpacing: 1,
    marginLeft: 10,
  },

  // ---- Debug & Utils ----
  debugContainer: {
    width: width * 0.9,
    marginVertical: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.1)',
  },
  debugText: {
    fontSize: 12,
    color: COLORS.text.secondaryLight,
    fontFamily: 'Menlo',
  },

  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: SPACING.lg,
    color: COLORS.white,
    fontSize: 20,
    fontFamily: 'WorsSansSemiBold',
    letterSpacing: 1,
  },
  successModal: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  successModalText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },

  inputContainerSmall: { width: width * 0.95 },
  buttonSmall: { height: 56 },
  buttonTextSmall: { fontSize: 16 },
  tagSmall: { paddingVertical: 6, paddingHorizontal: 12 },
});

export default styles;