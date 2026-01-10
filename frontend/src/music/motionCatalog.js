export const MOTION_CATALOG = [
  {
    id: 'flowing',
    label: 'Flowing',
    tags: ['legato', 'smooth'],
    allowArps: false,
  },
  {
    id: 'punchy',
    label: 'Punchy',
    tags: ['accented', 'tight'],
    allowArps: false,
  },
  {
    id: 'walking',
    label: 'Walking',
    tags: ['stepwise', 'steady'],
    allowArps: false,
  },
  {
    id: 'choppy',
    label: 'Choppy',
    tags: ['staccato', 'gated'],
    allowArps: false,
  },
  {
    id: 'swell',
    label: 'Swell',
    tags: ['rising', 'ambient'],
    allowArps: false,
  },
  {
    id: 'groove',
    label: 'Groove',
    tags: ['rhythmic', 'syncopated'],
    allowArps: false,
  },
  {
    id: 'fill',
    label: 'Fill',
    tags: ['transition', 'burst'],
    allowArps: false,
  },
  {
    id: 'arpeggiate',
    label: 'Arpeggiate',
    tags: ['arp'],
    allowArps: true,
  },
];

export const MOTION_BY_ID = MOTION_CATALOG.reduce((acc, motion) => {
  acc[motion.id] = motion;
  return acc;
}, {});
