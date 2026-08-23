import type { SensorPreset } from './ha/types.js';

/**
 * A freshwater tank and a reef tank do not measure the same water. Salinity is
 * near zero in one and 35 ppt in the other; phosphate is a nutrient people dose
 * on purpose in a planted tank and a problem measured in hundredths of a ppm in
 * a reef; the pH a community tank aims for would be an emergency on a reef.
 *
 * A single set of thresholds therefore cannot serve both, and averaging them
 * would serve neither. The user says which tank this is, and that choice picks
 * the thresholds (#73).
 *
 * Only the presets whose published targets genuinely differ appear here. The
 * rest of the registry is the same water chemistry either way.
 */
export type TankType = 'freshwater' | 'reef';

export const TANK_TYPES: readonly TankType[] = ['freshwater', 'reef'];

/**
 * Freshwater is the default, for two reasons. It is the larger population of
 * aquarium keepers, and it is what `AQUARIUM_SENSORS` already held: every card
 * installed before this option existed keeps the scale it was showing, except
 * for salinity, whose freshwater scale had collapsed onto zero and had to be
 * repaired in both cases. Someone running a reef opts in; nobody is moved
 * without asking.
 */
export const DEFAULT_TANK_TYPE: TankType = 'freshwater';

/**
 * Per tank type, what replaces the registry default. The registry itself holds
 * the freshwater case, so `freshwater` is empty by construction rather than a
 * copy that could drift away from it.
 */
export const TANK_TYPE_PRESETS: Record<TankType, Record<string, Partial<SensorPreset>>> = {
  freshwater: {},
  reef: {
    // Natural seawater averages pH 8.1 and reef aquaria are kept at 8.1 to 8.4,
    // higher than the ocean because calcification runs better there. Centred on
    // 8.2 with a step of 0.1, the five classes land on 8.0 / 8.1 / 8.2 / 8.3 /
    // 8.4, which is that recommendation with one class of margin below it.
    // The freshwater default, 7.0 +/- 0.3, would call every healthy reef
    // catastrophically high.
    //
    // Sources:
    // - Typical chemical characteristics of full-strength seawater, Claude E.
    //   Boyd, Global Seafood Alliance: "The pH of seawater ranges from 7.6 to
    //   8.4. The average ocean pH is said to be 8.1."
    //   https://www.globalseafood.org/advocate/typical-chemical-characteristics-of-full-strength-seawater/
    // - Reef Aquarium Water Parameters, Randy Holmes-Farley, Reefkeeping
    //   Magazine, May 2004: recommended pH 8.1 to 8.4.
    //   http://www.reefkeeping.com/issues/2004-05/rhf/
    ph: { setpoint: 8.2, step: 0.1 },

    // The reading this whole option exists for. A reef sits at the salinity of
    // the ocean, and the ocean's own spread, 31 to 41 ppt with 35 the value
    // almost everyone quotes, is the tolerance: a step of 1 ppt puts the five
    // classes on 33 / 34 / 35 / 36 / 37.
    //
    // `limits` and `direction` are cleared because this preset changes scale
    // model, not just numbers: freshwater grades salinity as a band scale where
    // less is better, a reef grades it as a deviation from a target in either
    // direction. A preset carrying both would leave the card to guess.
    //
    // Source: Typical chemical characteristics of full-strength seawater,
    // Claude E. Boyd, Global Seafood Alliance: "The salinity of seawater varies
    // somewhat from as low as 31 ppt in some areas of the ocean to as much as
    // 41 ppt in the Red Sea. The average value most commonly reported is 35
    // ppt."
    // https://www.globalseafood.org/advocate/typical-chemical-characteristics-of-full-strength-seawater/
    salinity: {
      setpoint: 35,
      step: 1,
      mode: 'centric',
      limits: undefined,
      direction: undefined,
    },

    // Reef phosphate is measured in hundredths of a ppm. The freshwater default
    // centres on 0.5 ppm, which is roughly ten times the top of every published
    // reef range, so a reef tank in real trouble would still have read as
    // "acceptable low". Centred on 0.06 with a step of 0.02, the classes land on
    // 0.02 / 0.04 / 0.06 / 0.08 / 0.10: the two middle ones are the target and
    // the outer two are the edges of the acceptable range.
    //
    // Zero is deliberately not the ideal, which is why this stays a centred
    // scale: phosphate is a nutrient corals need, and a reef stripped of it
    // bleaches. That is the same reason nitrate was left centred in #66.
    //
    // Sources, two independent ones giving the same range:
    // - Phosphate in a Reef Aquarium: Understanding Safe Levels and Management,
    //   Aquarium Specialty: safe levels 0.02 to 0.1 ppm, 0.02 to 0.05 for SPS,
    //   0.05 to 0.1 for LPS and softies.
    //   https://www.aquariumspecialty.com/blog/phosphate-in-a-reef-aquarium-understanding-safe-levels-and-management
    // - Ideal reef parameters, reefcalcs, citing Randy Holmes-Farley: target
    //   0.04 to 0.08 ppm PO4, acceptable range 0.02 to 0.10.
    //   https://reefcalcs.com/guides/ideal-reef-parameters/
    phosphate: { setpoint: 0.06, step: 0.02 },

    // Nitrate is not here on purpose. It is the obvious fourth candidate and
    // the sources do not agree well enough to move it: Holmes-Farley now lets a
    // mature mixed reef float between 5 and 50 ppm, while the widely repeated
    // figure is 2 to 10. The registry default, centred on 20 with a step of 10,
    // sits inside the first range and above the second, so changing it would
    // mean picking a winner between two credible sources on a reading that
    // decides whether corals are fed or starved. Left for the PO to arbitrate.
  },
};

/**
 * Reads `tank_type` from a card configuration.
 *
 * An unrecognised value is refused rather than quietly treated as freshwater: a
 * typo would otherwise show a reef the freshwater scale, which is exactly the
 * failure this option exists to remove.
 */
export function resolveTankType(value: unknown): TankType {
  if (value === undefined || value === null || value === '') return DEFAULT_TANK_TYPE;
  if (TANK_TYPES.includes(value as TankType)) return value as TankType;
  throw new Error(`Unknown tank_type "${String(value)}". Use one of: ${TANK_TYPES.join(', ')}.`);
}

/**
 * Folds the tank type's thresholds into a configuration, between the registry
 * defaults and what the user wrote: the registry is the floor, the tank type
 * replaces what differs, and an explicit value in the user's YAML still wins
 * over both.
 */
export function applyTankType(config: any): any {
  const presets = TANK_TYPE_PRESETS[resolveTankType(config?.tank_type)];
  if (!config?.sensors || Object.keys(presets).length === 0) return config;

  const sensors: Record<string, unknown> = {};
  Object.entries(config.sensors).forEach(([sensorType, sensorConfig]: [string, any]) => {
    const preset = presets[sensorType];
    if (!preset) {
      sensors[sensorType] = sensorConfig;
    } else if (Array.isArray(sensorConfig)) {
      sensors[sensorType] = sensorConfig.map((sensor: any) => ({ ...preset, ...sensor }));
    } else {
      sensors[sensorType] = { ...preset, ...sensorConfig };
    }
  });

  return { ...config, sensors };
}
