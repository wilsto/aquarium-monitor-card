import { describe, it, test, expect } from 'vitest';
import { AquariumMonitorCard } from '../src/aquarium-monitor-card.js';
import { AQUARIUM_SENSORS } from '../src/sensors.js';
import {
  TANK_TYPES,
  TANK_TYPE_PRESETS,
  DEFAULT_TANK_TYPE,
  resolveTankType,
} from '../src/tank-types.js';

// Salinity was centred on a setpoint of 0 with a step of 1 and a floor at 0, so
// its five classes were [0, 0, 0, 1, 2] and everything above 2 ppt landed in the
// worst one. A reef tank sits at 35 ppt, so the card called every healthy marine
// tank maximally bad, permanently, with no way to tell a good one from a
// drifting one (#73).
//
// The fix is not a compromise threshold. Freshwater and reef do not share
// targets for salinity, pH or phosphate, and a value halfway between them is
// wrong for both. The user says which tank this is, and that picks the numbers.
const build = (sensor, value, extra = {}) => {
  const card = new AquariumMonitorCard();
  const entity = `sensor.${sensor}`;
  card.hass = {
    states: {
      [entity]: { state: String(value), attributes: {}, last_updated: '2026-08-22T10:00:00Z' },
    },
    entities: {},
  };
  card.setConfig({ ...extra, sensors: { [sensor]: { entity } } });
  return card.processData()[`${sensor}_1`];
};

const reef = (sensor, value) => build(sensor, value, { tank_type: 'reef' });

describe('the reading that motivated the option: salinity', () => {
  // The regression itself.
  it('no longer calls a healthy marine tank the worst thing it can measure', () => {
    expect(reef('salinity', 35).state).toBe('Ideal');
  });

  it('spreads a reef scale around seawater instead of around zero', () => {
    expect(reef('salinity', 35).setpoint_class).toEqual(['33', '34', '35', '36', '37']);
  });

  it('can now tell a correct reef from a drifting one', () => {
    expect(reef('salinity', 34).state).toBe('Ideal');
    expect(reef('salinity', 33.5).state).toBe('Acceptable Low');
    expect(reef('salinity', 36.5).state).toBe('Acceptable High');
    expect(reef('salinity', 30).state).toBe('Too Low');
    expect(reef('salinity', 40).state).toBe('Too High');
  });

  // The freshwater side had the same defect in a quieter form: three of its
  // five classes sat on the same point, so most of the vocabulary described
  // readings that cannot exist.
  it('stops stacking three freshwater classes on zero', () => {
    const classes = build('salinity', 0.2).setpoint_class;
    expect(classes).toEqual(['0', '1', '3', '10', '35']);
    expect(new Set(classes).size).toBe(5);
  });

  it('reads a freshwater tank as fresh, and seawater in one as an emergency', () => {
    expect(build('salinity', 0.2).state).toBe('Good');
    expect(build('salinity', 2).state).toBe('Fair');
    expect(build('salinity', 35).state).toBe('Very Poor');
  });

  // A preset must commit to one scale model. Freshwater grades salinity as
  // bands where less is better; a reef grades it as a deviation from a target
  // in either direction. Carrying both would leave the card to guess.
  it('commits to one scale model per tank type', () => {
    expect(AQUARIUM_SENSORS.salinity.limits).toEqual([1, 3, 10, 35]);
    expect(AQUARIUM_SENSORS.salinity.setpoint).toBeUndefined();

    const card = new AquariumMonitorCard();
    card.setConfig({ tank_type: 'reef', sensors: { salinity: { entity: 'sensor.salinity' } } });
    const [salinity] = card.getConfig().sensors.salinity;
    expect(salinity.setpoint).toBe(35);
    expect(salinity.limits).toBeUndefined();
  });

  it('keeps its floor at zero in both tank types', () => {
    expect(AQUARIUM_SENSORS.salinity.min_limit).toBe(0);
    expect(reef('salinity', -5).value).toBe(0);
  });
});

describe('pH is a full unit apart between the two tanks', () => {
  it('centres a reef on 8.2, where the published recommendation is 8.1 to 8.4', () => {
    expect(reef('ph', 8.2).setpoint_class).toEqual(['8.0', '8.1', '8.2', '8.3', '8.4']);
    expect(reef('ph', 8.2).state).toBe('Ideal');
  });

  it('still calls that same reading catastrophic in a freshwater tank', () => {
    expect(build('ph', 8.2).state).toBe('Too High');
    expect(build('ph', 7.0).state).toBe('Ideal');
  });
});

describe('phosphate is an order of magnitude apart between the two tanks', () => {
  it('measures a reef in hundredths of a ppm', () => {
    expect(reef('phosphate', 0.06).setpoint_class).toEqual([
      '0.02',
      '0.04',
      '0.06',
      '0.08',
      '0.10',
    ]);
    expect(reef('phosphate', 0.06).state).toBe('Ideal');
  });

  // The reading the freshwater scale could not distinguish: a reef at 0.5 ppm
  // is deep in algae territory, and the old scale called it ideal.
  it('no longer calls a reef at 0.5 ppm ideal', () => {
    expect(build('phosphate', 0.5).state).toBe('Ideal');
    expect(reef('phosphate', 0.5).state).toBe('Too High');
  });

  // Zero is not the target: phosphate is a nutrient corals need, which is why
  // this stays a centred scale rather than becoming bands like ammonia.
  it('treats a stripped reef as a fault, not as perfection', () => {
    expect(reef('phosphate', 0).state).toBe('Too Low');
  });
});

// Nitrate is the obvious fourth candidate and is deliberately untouched: the
// published reef targets disagree by a factor of five, and the registry default
// sits inside the wider of them. Changing it would mean picking a winner
// between two credible sources on a reading that decides whether corals are fed
// or starved. This test exists so the next audit does not move it by symmetry.
describe('nitrate is the same in both tank types, on purpose', () => {
  it('keeps the registry scale whichever tank is declared', () => {
    expect(TANK_TYPE_PRESETS.reef.nitrate).toBeUndefined();
    expect(reef('nitrate', 20).setpoint_class).toEqual(build('nitrate', 20).setpoint_class);
  });
});

describe('choosing a tank type', () => {
  it('defaults to freshwater, so an installation that says nothing does not move', () => {
    expect(DEFAULT_TANK_TYPE).toBe('freshwater');
    expect(resolveTankType(undefined)).toBe('freshwater');
    expect(TANK_TYPE_PRESETS.freshwater).toEqual({});
    expect(build('ph', 7.0).setpoint_class).toEqual(
      build('ph', 7.0, { tank_type: 'freshwater' }).setpoint_class,
    );
  });

  // Falling back on a typo would show a reef the freshwater scale, which is
  // exactly the failure this option exists to remove.
  it('refuses a value it does not recognise rather than guessing', () => {
    const card = new AquariumMonitorCard();
    expect(() =>
      card.setConfig({ tank_type: 'marine', sensors: { ph: { entity: 'sensor.ph' } } }),
    ).toThrow('tank_type');
  });

  it('lets an explicit value in the user configuration win over the tank type', () => {
    const card = new AquariumMonitorCard();
    card.setConfig({
      tank_type: 'reef',
      sensors: { ph: { entity: 'sensor.ph', setpoint: 7.8, step: 0.2 } },
    });
    const [ph] = card.getConfig().sensors.ph;
    expect(ph.setpoint).toBe(7.8);
    expect(ph.step).toBe(0.2);
  });

  it('applies to every entry when one measurement is declared several times', () => {
    const card = new AquariumMonitorCard();
    card.setConfig({
      tank_type: 'reef',
      sensors: { salinity: [{ entity: 'sensor.display' }, { entity: 'sensor.sump' }] },
    });
    card.getConfig().sensors.salinity.forEach(sensor => expect(sensor.setpoint).toBe(35));
  });

  // The registry is a static, one per card class. Two aquarium cards on the
  // same dashboard may be watching two different tanks, so declaring one as a
  // reef must not reach the other.
  it('does not leak from one card to another', () => {
    const salinity = { ...AQUARIUM_SENSORS.salinity };
    build('salinity', 35, { tank_type: 'reef' });
    expect(AQUARIUM_SENSORS.salinity).toEqual(salinity);
    expect(build('salinity', 35).state).toBe('Very Poor');
  });

  it('still refuses a configuration with no sensors at all', () => {
    const card = new AquariumMonitorCard();
    expect(() => card.setConfig({ tank_type: 'reef' })).toThrow('sensors');
  });
});

describe('the tank type tables are well formed', () => {
  test('every overridden key exists in the registry', () => {
    TANK_TYPES.forEach(type => {
      Object.keys(TANK_TYPE_PRESETS[type]).forEach(key => {
        expect(AQUARIUM_SENSORS, `${type} overrides unknown preset ${key}`).toHaveProperty(key);
      });
    });
  });

  // Same rule the registry itself is held to in sensors.test.js: a preset drives
  // its scale either from a setpoint and a step, or from four ascending limits,
  // never from both.
  test('every override still commits to exactly one scale model', () => {
    TANK_TYPES.forEach(type => {
      Object.entries(TANK_TYPE_PRESETS[type]).forEach(([key, override]) => {
        const merged = { ...AQUARIUM_SENSORS[key], ...override };
        const hasLimits = Array.isArray(merged.limits);
        expect(hasLimits, `${type}.${key} carries both models`).toBe(merged.setpoint === undefined);
        if (hasLimits) {
          expect(merged.limits, `${type}.${key} limits`).toHaveLength(4);
          expect(merged.limits).toEqual([...merged.limits].sort((a, b) => a - b));
        } else {
          expect(typeof merged.setpoint, `${type}.${key} setpoint`).toBe('number');
          expect(typeof merged.step, `${type}.${key} step`).toBe('number');
          expect(['heatflow', 'centric'], `${type}.${key} mode`).toContain(merged.mode);
        }
      });
    });
  });
});
