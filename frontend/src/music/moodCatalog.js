const DEFAULT_MOOD = { id: 'none', label: 'No Mood', tags: ['neutral'] };

export const MOODS_BY_STYLE = {
  classical_film: [
    { id: 'calm', label: 'Calm', tags: ['bright', 'stable', 'low_energy', 'wide_register'] },
    { id: 'romantic', label: 'Romantic', tags: ['dreamy', 'warm', 'lush', 'wide_register'] },
    { id: 'ominous', label: 'Ominous', tags: ['dark', 'tension', 'low_energy', 'tight_register'] },
    { id: 'triumphant', label: 'Triumphant', tags: ['heroic', 'bright', 'high_energy', 'wide_register'] },
    { id: 'tender', label: 'Tender', tags: ['bright', 'dreamy', 'stable', 'low_energy', 'wide_register'] },
    { id: 'mysterious', label: 'Mysterious', tags: ['dark', 'tension', 'dreamy', 'low_energy', 'tight_register'] },
    { id: 'heroic', label: 'Heroic', tags: ['heroic', 'bright', 'high_energy', 'wide_register'] },
    { id: 'dread', label: 'Dread', tags: ['dark', 'tension', 'high_energy', 'tight_register'] },
  ],
  jazz_blues_funk: [
    { id: 'cool', label: 'Cool', tags: ['swing', 'low_energy', 'dreamy', 'offbeat', 'wide_register'] },
    { id: 'smoky', label: 'Smoky', tags: ['dark', 'low_energy', 'swing', 'tight_register'] },
    { id: 'energetic', label: 'Energetic', tags: ['high_energy', 'syncopated', 'swing', 'bright'] },
    { id: 'noir', label: 'Noir', tags: ['dark', 'tension', 'swing', 'tight_register'] },
    { id: 'hot', label: 'Hot', tags: ['high_energy', 'syncopated', 'swing', 'bright'] },
    { id: 'blue', label: 'Blue', tags: ['dark', 'low_energy', 'swing', 'tight_register'] },
    { id: 'late_night', label: 'Late Night', tags: ['dreamy', 'low_energy', 'swing', 'tight_register'] },
  ],
  pop_rock: [
    { id: 'bright', label: 'Bright', tags: ['bright', 'high_energy', 'wide_register'] },
    { id: 'anthemic', label: 'Anthemic', tags: ['heroic', 'bright', 'high_energy', 'wide_register'] },
    { id: 'bittersweet', label: 'Bittersweet', tags: ['dreamy', 'low_energy', 'wide_register'] },
    { id: 'driving', label: 'Driving', tags: ['high_energy', 'on_grid', 'tight_register'] },
    { id: 'melancholic', label: 'Melancholic', tags: ['dreamy', 'low_energy', 'dark'] },
    { id: 'gritty', label: 'Gritty', tags: ['syncopated', 'on_grid', 'high_energy', 'dark'] },
    { id: 'aggressive', label: 'Aggressive', tags: ['high_energy', 'dark', 'tight_register'] },
  ],
  edm_electronic: [
    { id: 'uplifting', label: 'Uplifting', tags: ['bright', 'high_energy', 'on_grid', 'wide_register'] },
    { id: 'euphoric', label: 'Euphoric', tags: ['bright', 'high_energy', 'on_grid', 'wide_register'] },
    { id: 'dark', label: 'Dark', tags: ['dark', 'tension', 'high_energy', 'on_grid'] },
    { id: 'chill', label: 'Chill', tags: ['dreamy', 'low_energy', 'on_grid'] },
    { id: 'hypnotic', label: 'Hypnotic', tags: ['on_grid', 'syncopated', 'tension', 'wide_register'] },
    { id: 'playful', label: 'Playful', tags: ['bright', 'syncopated', 'on_grid', 'high_energy'] },
  ],
  latin_afro_cuban: [
    { id: 'sunny', label: 'Sunny', tags: ['bright', 'syncopated', 'high_energy', 'swing'] },
    { id: 'fiery', label: 'Fiery', tags: ['high_energy', 'syncopated', 'percussive'] },
    { id: 'suave', label: 'Suave', tags: ['low_energy', 'syncopated', 'wide_register'] },
    { id: 'sultry_minor', label: 'Sultry (Minor)', tags: ['dark', 'syncopated', 'low_energy', 'wide_register'] },
    { id: 'driving', label: 'Driving', tags: ['high_energy', 'on_grid', 'percussive', 'syncopated'] },
    { id: 'ceremonial', label: 'Ceremonial', tags: ['tension', 'wide_register', 'syncopated', 'high_energy'] },
  ],
  folk_country_bluegrass: [
    { id: 'warm', label: 'Warm', tags: ['bright', 'stable', 'low_energy', 'tight_register'] },
    { id: 'lonesome', label: 'Lonesome', tags: ['dark', 'low_energy', 'wide_register'] },
    { id: 'lively', label: 'Lively', tags: ['high_energy', 'syncopated', 'tight_register'] },
    { id: 'nostalgic', label: 'Nostalgic', tags: ['dreamy', 'low_energy', 'wide_register'] },
    { id: 'campfire', label: 'Campfire', tags: ['bright', 'stable', 'low_energy', 'tight_register'] },
    { id: 'dusty', label: 'Dusty', tags: ['dark', 'low_energy', 'swing', 'on_grid'] },
    { id: 'bluegrass_drive', label: 'Bluegrass Drive', tags: ['high_energy', 'syncopated', 'swing', 'tight_register'] },
    { id: 'heartbreak', label: 'Heartbreak', tags: ['dreamy', 'low_energy', 'wide_register'] },
  ],
  legacy: [
    { id: 'none', label: 'Legacy / No Mood', tags: ['neutral'] },
  ],
};

export function getMoodsForStyle(styleId) {
  const list = MOODS_BY_STYLE[styleId] || [];
  if (!list.some(mood => mood.id === DEFAULT_MOOD.id)) {
    return [...list, DEFAULT_MOOD];
  }
  return list.slice();
}

export function getMoodById(styleId, moodId) {
  const moods = getMoodsForStyle(styleId);
  return moods.find(mood => mood.id === moodId) || DEFAULT_MOOD;
}

export function getDefaultMoodId(styleId) {
  const moods = getMoodsForStyle(styleId);
  return moods[0]?.id || DEFAULT_MOOD.id;
}
