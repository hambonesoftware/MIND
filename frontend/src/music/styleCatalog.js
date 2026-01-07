import { getDefaultMoodId } from './moodCatalog.js';

export const STYLE_CATALOG = [
  {
    id: 'classical_film',
    label: 'Classical / Film',
    tags: ['orchestral', 'wide_register', 'romantic'],
    moods: ['calm', 'romantic', 'ominous', 'triumphant'],
  },
  {
    id: 'jazz_blues_funk',
    label: 'Jazz / Blues / Funk',
    tags: ['swing', 'groove', 'improv'],
    moods: ['cool', 'smoky', 'energetic', 'noir'],
  },
  {
    id: 'pop_rock',
    label: 'Pop / Rock',
    tags: ['driving', 'anthemic', 'hooky'],
    moods: ['bright', 'anthemic', 'bittersweet', 'driving'],
  },
  {
    id: 'edm_electronic',
    label: 'EDM / Electronic',
    tags: ['on_grid', 'synth', 'club'],
    moods: ['uplifting', 'dark', 'hypnotic', 'playful'],
  },
  {
    id: 'latin_afro_cuban',
    label: 'Latin / Afro-Cuban',
    tags: ['syncopated', 'percussive', 'dance'],
    moods: ['sunny', 'fiery', 'suave', 'ceremonial'],
  },
  {
    id: 'folk_country_bluegrass',
    label: 'Folk / Country / Bluegrass',
    tags: ['acoustic', 'rootsy', 'earthy'],
    moods: ['warm', 'lonesome', 'lively', 'nostalgic'],
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

export const STYLE_ALIASES = {
  rock_pop_metal: 'pop_rock',
  latin_afrocuban: 'latin_afro_cuban',
};

export function normalizeStyleId(styleId) {
  if (!styleId) {
    return styleId;
  }
  return STYLE_ALIASES[styleId] || styleId;
}

export function getStyleById(styleId) {
  return STYLE_BY_ID[styleId] || null;
}
