import type { SensorsRegistry } from './ha/types.js';

export const AQUARIUM_SENSORS: SensorsRegistry = {
  temperature: {
    name: 'Temperature',
    unit: '°C',
    setpoint: 25,
    step: 1,
    mode: 'heatflow',
  },
  ph: {
    name: 'pH',
    unit: 'pH',
    setpoint: 7.0,
    step: 0.3,
    mode: 'centric',
    min_limit: 0,
  },
  // Ammonia and nitrite are the two readings where zero is the target and every
  // step up is worse, never an equivalent deviation. A centred scale cannot say
  // that: it read 0.25 ppm of ammonia, which means the biofilter has stopped
  // working, as "Acceptable High". They carry bands instead, like the CO of
  // air-quality, and for the same reason: a toxicity threshold is not an
  // aesthetic preference.
  //
  // Boundaries are the steps of a hobby test kit (0.25 / 0.5 / 1 / 2 ppm),
  // because that is the resolution the reading actually has. What each step
  // means is below, per sensor.
  //
  // Both are read in ppm of the total measured species, which is what a colour
  // test kit reports.
  //
  // Assumed simplification, ammonia: toxicity is carried by the un-ionized
  // fraction NH3, whose share of the total rises roughly tenfold per pH unit
  // (0.57 % at pH 7 / 25 C, about ten times that at pH 8). A single total
  // ammonia scale therefore cannot be right for every tank, and this one is
  // calibrated on the unfavourable case, a hard-water or marine tank at pH 8+.
  // In a soft-water tank at pH 6.5 the same reading is far less toxic and the
  // card will overstate it. That is the intended failure direction for a
  // poison, and the alternative, deriving NH3 from a linked pH and temperature
  // entity, is not something a preset can express.
  //
  // Sources:
  // - Ammonia in Aquatic Systems, Francis-Floyd et al., UF/IFAS EDIS FA16
  //   (FA031): un-ionized ammonia harms fish above 0.05 mg/L and kills at
  //   2.0 mg/L. https://ask.ifas.ufl.edu/publication/FA031
  // - Nitrite toxicity affected by species susceptibility, environmental
  //   conditions, Claude E. Boyd, Global Seafood Alliance: safe nitrite
  //   nitrogen is 0.0125 to 0.5 mg/L for freshwater coldwater fish, 0.5 to
  //   2.5 mg/L for warmwater fish and invertebrates. https://www.globalseafood.org/advocate/nitrite-toxicity-affected-by-species-susceptibility-environmental-conditions/
  ammonia: {
    name: 'Ammonia',
    unit: 'ppm',
    // 0.25 is the first step a colour kit can resolve, so anything below it is
    // an undetectable tank. 0.5 and above crosses the UF/IFAS 0.05 mg/L NH3
    // harm threshold once the pH reaches 8. 2 ppm is about twice that threshold
    // at the same pH, which damages fish whatever the species.
    limits: [0.25, 0.5, 1, 2],
    direction: 'lower_is_better',
    min_limit: 0,
  },
  nitrite: {
    name: 'Nitrite',
    unit: 'ppm',
    // Same kit steps, different derivation. Converting Boyd's nitrogen figures
    // to the nitrite ion a kit reports (x 3.28), his safe ceiling for coldwater
    // fish, 0.5 mg/L NO2-N, lands at 1.6 ppm NO2-, and chronic harm starts
    // around 1 ppm. So 1 ppm is where it stops being tolerable and 2 ppm is
    // past every freshwater safe range he gives.
    limits: [0.25, 0.5, 1, 2],
    direction: 'lower_is_better',
    min_limit: 0,
  },
  // Nitrate deliberately stays centred. Unlike ammonia and nitrite, zero is not
  // the ideal: a reef tank starves its corals below roughly 3 ppm, and in a
  // planted tank nitrate is the macronutrient people dose on purpose. Too low
  // is a real fault here, which is exactly what a centred scale says. Freshwater
  // and reef tolerances also differ by an order of magnitude, so one band set
  // could not serve both, and averaging them would serve neither.
  nitrate: {
    name: 'Nitrate',
    unit: 'ppm',
    setpoint: 20,
    step: 10,
    mode: 'centric',
    min_limit: 0,
  },
  gh: {
    name: 'General Hardness',
    unit: 'dGH',
    setpoint: 8,
    step: 2,
    mode: 'centric',
    min_limit: 0,
  },
  kh: {
    name: 'Carbonate Hardness',
    unit: 'dKH',
    setpoint: 6,
    step: 1,
    mode: 'centric',
    min_limit: 0,
  },
  co2: {
    name: 'CO2',
    unit: 'mg/L',
    setpoint: 20,
    step: 5,
    mode: 'centric',
    min_limit: 0,
  },
  phosphate: {
    name: 'Phosphate',
    unit: 'ppm',
    setpoint: 0.5,
    step: 0.25,
    mode: 'centric',
    min_limit: 0,
  },
  salinity: {
    name: 'Salinity',
    unit: 'ppt',
    setpoint: 0,
    step: 1,
    mode: 'centric',
    min_limit: 0,
  },
  specific_gravity: {
    name: 'Specific Gravity',
    unit: 'sg',
    setpoint: 1.025,
    step: 0.002,
    mode: 'centric',
  },
  calcium: {
    name: 'Calcium',
    unit: 'ppm',
    setpoint: 420,
    step: 20,
    mode: 'centric',
    min_limit: 0,
  },
  magnesium: {
    name: 'Magnesium',
    unit: 'ppm',
    setpoint: 1300,
    step: 50,
    mode: 'centric',
    min_limit: 0,
  },
  alkalinity: {
    name: 'Alkalinity',
    unit: 'dKH',
    setpoint: 8,
    step: 1,
    mode: 'centric',
    min_limit: 0,
  },
  water_level: {
    name: 'Water Level',
    unit: '%',
    setpoint: 100,
    step: 5,
    mode: 'centric',
    min_limit: 0,
  },
};
