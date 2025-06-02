import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  ios: {
    ...(config.ios || {}),
    bundleIdentifier: 'com.Flashcardex.miapp', // <- AGREGA ESTO con tu identificador
  },
  extra: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    eas: {
      projectId: '56aa71c5-769a-4366-a5af-255a9c3b42c0'
    }
  },
});
