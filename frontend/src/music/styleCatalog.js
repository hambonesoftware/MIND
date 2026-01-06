import { getDefaultMoodId } from './moodCatalog.js';

export const STYLE_CATALOG = [
  {
    id: 'classical_film',
    label: 'Classical / Film',
    tags: ['orchestral', 'wide_register', 'romantic'],
    moods: ['tender', 'mysterious', 'heroic', 'dread'],
  },
  {
    id: 'jazz_blues_funk',
    label: 'Jazz / Blues / Funk',
    tags: ['swing', 'groove', 'improv'],
    moods: ['cool', 'hot', 'blue', 'late_night'],
  },
  {
    id: 'rock_pop_metal',
    label: 'Rock / Pop / Metal',
    tags: ['driving', 'anthemic', 'hooky'],
    moods: ['anthemic', 'melancholic', 'gritty', 'aggressive'],
  },
  {
    id: 'edm_electronic',
    label: 'EDM / Electronic',
    tags: ['on_grid', 'synth', 'club'],
    moods: ['euphoric', 'dark', 'chill', 'hypnotic'],
  },
  {
    id: 'latin_afrocuban',
    label: 'Latin / Afro-Cuban',
    tags: ['syncopated', 'percussive', 'dance'],
    moods: ['sunny', 'sultry_minor', 'driving', 'ceremonial'],
  },
  {
    id: 'folk_country_bluegrass',
    label: 'Folk / Country / Bluegrass',
    tags: ['acoustic', 'rootsy', 'earthy'],
    moods: ['campfire', 'dusty', 'bluegrass_drive', 'heartbreak'],
  },
  {
    id: 'legacy',
    label: 'Legacy (V9.5)',
    tags: ['neutral'],
    moods: ['none'],
  },
];

export const STYLE_BY_ID = STYLE_CATALOG.reduce((acc, style) => {
  acc[style.id] = {
    defaultMoodId: getDefaultMoodId(style.id),
    ...style,
  };
  return acc;
}, {});

export function getStyleById(styleId) {
  return STYLE_BY_ID[styleId] || null;
}
