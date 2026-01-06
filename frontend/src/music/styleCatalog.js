export const STYLE_CATALOG = [
  {
    id: 'modern_pop',
    label: 'Modern Pop',
    progressions: ['pop_i_v_vi_iv', 'pop_vi_iv_i_v', 'fifties_i_vi_iv_v'],
    variantsByProgression: {
      pop_i_v_vi_iv: ['triads', '7ths'],
      pop_vi_iv_i_v: ['triads', '7ths'],
      fifties_i_vi_iv_v: ['triads', '7ths'],
    },
    patterns: ['arp_up_3', 'arp_down_3', 'arp_skip_3'],
    patternTypeByPatternId: {
      arp_up_3: 'arp-3-up',
      arp_down_3: 'arp-3-down',
      arp_skip_3: 'arp-3-skip',
    },
    feelCandidates: {
      rhythmGrid: ['1/8', '1/12', '1/16'],
      syncopation: ['none', 'offbeat'],
      timingWarp: ['none', 'swing'],
      timingIntensity: [0, 0.1, 0.2],
    },
    instrumentPresets: ['gm:0:0', 'gm:0:40'],
    registerRanges: [
      { id: 'default', min: 48, max: 84 },
      { id: 'wide', min: 45, max: 96 },
    ],
  },
  {
    id: 'cinematic_minor',
    label: 'Cinematic Minor',
    progressions: ['cinematic_minor_i_vi_iii_vii', 'minor_loop_i_vii_vi_vii'],
    variantsByProgression: {
      cinematic_minor_i_vi_iii_vii: ['triads', '7ths'],
      minor_loop_i_vii_vi_vii: ['triads', '7ths'],
    },
    patterns: ['arp_down_3', 'arp_skip_3'],
    patternTypeByPatternId: {
      arp_down_3: 'arp-3-down',
      arp_skip_3: 'arp-3-skip',
    },
    feelCandidates: {
      rhythmGrid: ['1/12', '1/16'],
      syncopation: ['none', 'anticipation'],
      timingWarp: ['none', 'shuffle'],
      timingIntensity: [0, 0.15, 0.3],
    },
    instrumentPresets: ['gm:0:40', 'gm:0:48'],
    registerRanges: [
      { id: 'default', min: 48, max: 88 },
      { id: 'low', min: 36, max: 76 },
    ],
  },
  {
    id: 'jazz_standard',
    label: 'Jazz Standard',
    progressions: ['jazz_ii_v_i', 'fifties_i_vi_iv_v'],
    variantsByProgression: {
      jazz_ii_v_i: ['7ths'],
      fifties_i_vi_iv_v: ['7ths', 'triads'],
    },
    patterns: ['arp_up_3', 'arp_down_3'],
    patternTypeByPatternId: {
      arp_up_3: 'arp-3-up',
      arp_down_3: 'arp-3-down',
    },
    feelCandidates: {
      rhythmGrid: ['1/12', '1/8'],
      syncopation: ['offbeat', 'anticipation'],
      timingWarp: ['swing'],
      timingIntensity: [0.1, 0.25],
    },
    instrumentPresets: ['gm:0:0', 'gm:0:32'],
    registerRanges: [
      { id: 'default', min: 50, max: 90 },
    ],
  },
];

export const STYLE_BY_ID = STYLE_CATALOG.reduce((acc, style) => {
  acc[style.id] = style;
  return acc;
}, {});

export function getStyleById(styleId) {
  return STYLE_BY_ID[styleId] || null;
}
