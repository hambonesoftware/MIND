export const ROLE_CATALOG = [
  {
    id: 'lead',
    label: 'Lead',
    tags: ['melodic', 'front'],
  },
  {
    id: 'harmony',
    label: 'Harmony',
    tags: ['support', 'chords'],
  },
  {
    id: 'bass',
    label: 'Bass',
    tags: ['low_end', 'foundation'],
  },
  {
    id: 'drums',
    label: 'Drums',
    tags: ['percussive', 'rhythm'],
  },
  {
    id: 'fx',
    label: 'FX',
    tags: ['texture', 'movement'],
  },
];

export const ROLE_BY_ID = ROLE_CATALOG.reduce((acc, role) => {
  acc[role.id] = role;
  return acc;
}, {});
