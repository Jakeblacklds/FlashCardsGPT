export const COLOR_PAIRS = {
  pair1: { background: '#f4f1de', text: '#43291f' },
  pair2: { background: '#e07a5f', text: '#FFF3E0' },
  pair3: { background: '#3d405b', text: '#E0FFF4' },
  pair4: { background: '#81b29a', text: '#003112' },
  pair5: { background: '#f2cc8f', text: '#143100' },
  
  pair6: { background: '#43291f', text: '#f4f1de' },
  pair7: { background: '#FFF3E0', text: '#e07a5f' },
  pair8: { background: '#E0FFF4', text: '#3d405b' },
  pair9: { background: '#003112', text: '#81b29a' },
  pair10: { background: '#143100', text: '#f2cc8f' },

};

export const getRandomColorPair = () => {
  const colorKeys = Object.keys(COLOR_PAIRS);
  const randomKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  return COLOR_PAIRS[randomKey];
};
