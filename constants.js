export const COLOR_PAIRS = {
  pair1: { background: '#f72585', text: '#FFE8FF' },
  pair2: { background: '#b5179e', text: '#FFF3E0' },
  pair3: { background: '#7209b7', text: '#E0FFF4' },
  pair4: { background: '#560bad', text: '#B7FFD2' },
  pair5: { background: '#480ca8', text: '#c7f9cc' },
  


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