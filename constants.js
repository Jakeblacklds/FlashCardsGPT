export const COLOR_PAIRS= {
  pair1: { background: '#f72585', text: '#FFE8FF' },
  pair2: { background: '#b5179e', text: '#FFF3E0' },
  pair3: { background: '#7209b7', text: '#E0FFF4' },
  pair4: { background: '#560bad', text: '#B7FFD2' },
  pair5: { background: '#480ca8', text: '#c7f9cc' },
  pair6: { background: '#3a0ca3', text: '#FAF9F6' },
pair7: { background: '#3f37c9', text: '#FFF0F0' },
pair8: { background: '#4361ee', text: '#E5FFE5' },
pair9: { background: '#4895ef', text: '#F0F4FF' },
pair10: { background: '#4cc9f0', text: '#001219' },

  


};

export const getRandomColorPair = (() => {
  let currentIndex = -1; // Inicializa en -1 para que en la primera llamada comience en 0
  const colorKeys = Object.keys(COLOR_PAIRS);

  return () => {
    // Incrementa el índice y lo ajusta si es necesario
    currentIndex = (currentIndex + 1) % colorKeys.length;

    // Selecciona el par de colores basado en el índice actual
    return COLOR_PAIRS[colorKeys[currentIndex]];
  };

})();