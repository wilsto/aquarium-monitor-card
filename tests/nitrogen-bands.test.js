import { describe, it, expect } from 'vitest';
import { AquariumMonitorCard } from '../src/aquarium-monitor-card.js';
import { AQUARIUM_SENSORS } from '../src/sensors.js';

// Ammonia and nitrite were declared on a centred scale with a setpoint of 0.
// A centred scale says "the further from the setpoint, the worse", which is
// true of pH and false of a poison: 0 ppm of ammonia and 2 ppm of ammonia are
// not two equivalent deviations, the first is a healthy tank and the second
// kills fish. The three lowest classes all collapsed onto 0, so the card spent
// most of its vocabulary on readings that cannot exist and announced 0.25 ppm,
// a tank whose biofilter has stopped, as "Acceptable High".
//
// The thresholds are the steps of a hobby test kit, read against published
// toxicity figures rather than invented (see the comment in src/sensors.ts for
// the sources: UF/IFAS FA16 for ammonia, Boyd for nitrite).
const build = (type, ppm) => {
  const card = new AquariumMonitorCard();
  const entity = `sensor.${type}`;
  card.hass = {
    states: {
      [entity]: { state: String(ppm), attributes: {}, last_updated: '2026-08-22T10:00:00Z' },
    },
    entities: {},
  };
  card.setConfig({ sensors: { [type]: { entity } } });
  return card.processData()[`${type}_1`];
};

describe.each(['ammonia', 'nitrite'])('%s reads as a poison, not as a deviation', type => {
  it('drives its scale from published thresholds, not from a setpoint of zero', () => {
    expect(AQUARIUM_SENSORS[type].limits).toEqual([0.25, 0.5, 1, 2]);
    expect(AQUARIUM_SENSORS[type].direction).toBe('lower_is_better');
    // A band sensor must not also carry a setpoint: the card would not know
    // which of the two scale models to trust.
    expect(AQUARIUM_SENSORS[type].setpoint).toBeUndefined();
    expect(AQUARIUM_SENSORS[type].mode).toBeUndefined();
  });

  it('spreads its five classes over the real range instead of collapsing on zero', () => {
    expect(build(type, 0).setpoint_class.map(Number)).toEqual([0, 0.25, 0.5, 1, 2]);
  });

  it('calls a clean tank good and never announces it as a deviation', () => {
    expect(build(type, 0).state).toBe('Good');
  });

  // The regression that motivated the change: the first step a colour kit can
  // resolve used to be reported as merely "Acceptable High".
  it('calls the first detectable reading fair, not acceptable-high', () => {
    expect(build(type, 0.25).state).toBe('Fair');
  });

  it('worsens monotonically, one class per band', () => {
    expect(build(type, 0.5).state).toBe('Moderate');
    expect(build(type, 1).state).toBe('Poor');
    expect(build(type, 5).state).toBe('Very Poor');
  });

  it('paints a clean tank and a lethal one differently', () => {
    expect(build(type, 0).color).not.toBe(build(type, 5).color);
  });

  // Concentrations cannot go below zero, and the floor must survive the switch:
  // without it the bar would open on a negative value.
  it('keeps its floor at zero', () => {
    expect(AQUARIUM_SENSORS[type].min_limit).toBe(0);
  });
});

// Nitrate looks like the same kind of quantity and is not. A reef tank starves
// its corals below roughly 3 ppm and a planted tank is dosed nitrate on
// purpose, so "too low" is a real fault, which is what a centred scale says.
// This test exists so the next audit does not switch it by symmetry.
describe('nitrate deliberately stays centred', () => {
  it('keeps a setpoint, because zero is not its ideal', () => {
    expect(AQUARIUM_SENSORS.nitrate.mode).toBe('centric');
    expect(AQUARIUM_SENSORS.nitrate.setpoint).toBeGreaterThan(0);
    expect(AQUARIUM_SENSORS.nitrate.limits).toBeUndefined();
  });
});
