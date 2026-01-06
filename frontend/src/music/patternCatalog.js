export const NOTE_PATTERNS = [
  { id: 'arp_up_3', label: 'Arpeggio 3 Up', patternType: 'arp-3-up' },
  { id: 'arp_down_3', label: 'Arpeggio 3 Down', patternType: 'arp-3-down' },
  { id: 'arp_skip_3', label: 'Arpeggio 3 Skip', patternType: 'arp-3-skip' },
];

export const NOTE_PATTERN_BY_ID = NOTE_PATTERNS.reduce((acc, pattern) => {
  acc[pattern.id] = pattern;
  return acc;
}, {});
