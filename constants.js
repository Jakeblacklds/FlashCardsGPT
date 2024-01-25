export const COLOR_PAIRS = {
  pair1: { background: '#f72585', text: '#FFE8FF' },
  pair2: { background: '#b5179e', text: '#FFF3E0' },
  pair3: { background: '#7209b7', text: '#E0FFF4' },
  pair4: { background: '#560bad', text: '#B7FFD2' },
  pair5: { background: '#480ca8', text: '#c7f9cc' },
  
  pair6: { background: '#3a0ca3', text: '#f4f1de' },
  pair7: { background: '#3f37c9', text: '#e07a5f' },
  pair8: { background: '#4361ee', text: '#E3FCB1' },
  pair9: { background: '#4895ef', text: '#3D004F' },
  pair10: { background: '#4cc9f0', text: '#FFF7D7' },

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