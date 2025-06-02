import { COLOR_PAIRS } from '../../../../../../constants';

export const tags = [
  { label: 'easy', colorPair: COLOR_PAIRS.pair1, icon: 'child' },
  { label: 'hard', colorPair: COLOR_PAIRS.pair2, icon: 'brain' },
  { label: 'verbs', colorPair: COLOR_PAIRS.pair3, icon: 'running' },
  { label: 'nouns', colorPair: COLOR_PAIRS.pair4, icon: 'apple-alt' },
  { label: 'common', colorPair: COLOR_PAIRS.pair5, icon: 'star' },
];

export const getBackgroundGradient = (darkModeEnabled) => {
  return darkModeEnabled 
    ? ['#121212', '#1a1a1a', '#222222']
    : ['#E6D3F9', '#D3C2F0', '#C0B1E8'];
};