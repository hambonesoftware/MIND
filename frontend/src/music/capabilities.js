export const CAPABILITIES = {
  gen_arpeggio_basic: true,
  gen_sustain_basic: true,
  gen_broken_chords: true,
  gen_offbeat_plucks: true,
  gen_call_response: true,
  gen_alberti_bass: true,
  gen_ostinato_pulse: true,
  gen_walking_bass_simple: true,
  gen_comping_stabs: true,
  gen_gate_mask: true,
  gen_step_arp_octave: true,
  gen_walking_bass: true,
  gen_montuno: false,
  gen_travis_picking: false,
  gen_poly_rhythms: false,
};

export function capabilityEnabled(key) {
  if (key == null) return true;
  if (Object.prototype.hasOwnProperty.call(CAPABILITIES, key)) {
    return Boolean(CAPABILITIES[key]);
  }
  return true;
}
