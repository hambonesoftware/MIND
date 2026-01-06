export const INSTRUMENT_SUGGESTIONS = [
  { id: 'cine_strings', label: 'Cinematic Strings', styles: ['classical_film'], tags: ['dreamy', 'wide_register', 'bright'], instrumentPreset: 'gm:0:48' },
  { id: 'cine_piano', label: 'Concert Piano', styles: ['classical_film'], tags: ['stable', 'bright'], instrumentPreset: 'gm:0:0' },
  { id: 'cine_brass', label: 'Heroic Brass', styles: ['classical_film'], tags: ['heroic', 'high_energy'], instrumentPreset: 'gm:0:61' },

  { id: 'jazz_piano', label: 'Jazz Piano', styles: ['jazz_blues_funk'], tags: ['swing', 'bright'], instrumentPreset: 'gm:0:2' },
  { id: 'jazz_guitar', label: 'Hollowbody Guitar', styles: ['jazz_blues_funk'], tags: ['warm', 'dreamy'], instrumentPreset: 'gm:0:26' },
  { id: 'funk_ep', label: 'Funk EP', styles: ['jazz_blues_funk'], tags: ['high_energy', 'syncopated'], instrumentPreset: 'gm:0:4' },

  { id: 'rock_stack', label: 'Stacked Guitar', styles: ['rock_pop_metal'], tags: ['high_energy', 'heroic'], instrumentPreset: 'gm:0:29' },
  { id: 'rock_clean', label: 'Clean Guitar', styles: ['rock_pop_metal'], tags: ['bright', 'stable'], instrumentPreset: 'gm:0:27' },
  { id: 'rock_synth', label: 'Pad Synth', styles: ['rock_pop_metal'], tags: ['dreamy', 'wide_register'], instrumentPreset: 'gm:0:88' },

  { id: 'edm_pluck', label: 'EDM Pluck', styles: ['edm_electronic'], tags: ['bright', 'on_grid'], instrumentPreset: 'gm:0:82' },
  { id: 'edm_pad', label: 'Wide Pad', styles: ['edm_electronic'], tags: ['dreamy', 'wide_register'], instrumentPreset: 'gm:0:89' },
  { id: 'edm_bass', label: 'Sub Bass', styles: ['edm_electronic'], tags: ['dark', 'tension'], instrumentPreset: 'gm:0:38' },

  { id: 'latin_piano', label: 'Rhythm Piano', styles: ['latin_afrocuban'], tags: ['syncopated', 'bright'], instrumentPreset: 'gm:0:0' },
  { id: 'latin_steel', label: 'Steel Drums', styles: ['latin_afrocuban'], tags: ['bright', 'percussive'], instrumentPreset: 'gm:0:114' },
  { id: 'latin_brass', label: 'Brass Section', styles: ['latin_afrocuban'], tags: ['high_energy', 'wide_register'], instrumentPreset: 'gm:0:61' },

  { id: 'folk_acoustic', label: 'Acoustic Guitar', styles: ['folk_country_bluegrass'], tags: ['bright', 'stable'], instrumentPreset: 'gm:0:25' },
  { id: 'folk_banjo', label: 'Banjo', styles: ['folk_country_bluegrass'], tags: ['tight_register', 'swing'], instrumentPreset: 'gm:0:105' },
  { id: 'folk_dulcimer', label: 'Dulcimer', styles: ['folk_country_bluegrass'], tags: ['dreamy', 'low_energy'], instrumentPreset: 'gm:0:15' },

  { id: 'legacy_piano', label: 'Legacy Piano', styles: ['legacy'], tags: ['neutral'], instrumentPreset: 'gm:0:0' },
];

export const REGISTER_SUGGESTIONS = [
  { id: 'wide_score', label: 'Wide Score', styles: ['classical_film', 'edm_electronic'], tags: ['wide_register', 'heroic'], min: 40, max: 92 },
  { id: 'mid_ensemble', label: 'Mid Ensemble', styles: ['classical_film', 'jazz_blues_funk'], tags: ['stable', 'bright'], min: 50, max: 86 },
  { id: 'tight_combo', label: 'Tight Combo', styles: ['jazz_blues_funk', 'latin_afrocuban'], tags: ['tight_register', 'swing'], min: 52, max: 80 },
  { id: 'rock_stack_register', label: 'Rock Stack', styles: ['rock_pop_metal'], tags: ['heroic', 'high_energy'], min: 48, max: 84 },
  { id: 'rock_low', label: 'Rock Low Crunch', styles: ['rock_pop_metal'], tags: ['dark', 'tight_register'], min: 43, max: 76 },
  { id: 'edm_mid', label: 'EDM Mid', styles: ['edm_electronic'], tags: ['on_grid', 'bright'], min: 52, max: 88 },
  { id: 'edm_bass_range', label: 'EDM Bass Focus', styles: ['edm_electronic'], tags: ['dark', 'tension'], min: 36, max: 70 },
  { id: 'latin_mid', label: 'Clave Mid', styles: ['latin_afrocuban'], tags: ['syncopated', 'bright'], min: 55, max: 86 },
  { id: 'latin_wide', label: 'Latin Wide', styles: ['latin_afrocuban'], tags: ['wide_register', 'ceremonial'], min: 48, max: 90 },
  { id: 'folk_mid', label: 'Folk Mid', styles: ['folk_country_bluegrass'], tags: ['bright', 'stable'], min: 50, max: 84 },
  { id: 'folk_low', label: 'Folk Low', styles: ['folk_country_bluegrass'], tags: ['dark', 'low_energy'], min: 45, max: 76 },
  { id: 'legacy_default_register', label: 'Legacy Default', styles: ['legacy'], tags: ['neutral'], min: 48, max: 84 },
];

export const INSTRUMENT_BY_ID = INSTRUMENT_SUGGESTIONS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const REGISTER_BY_ID = REGISTER_SUGGESTIONS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});
