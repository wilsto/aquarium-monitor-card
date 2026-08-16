# Aquarium Monitor Card: Sensor Details

This document explains each sensor, why it matters, and what the ideal ranges mean.

## Nitrogen Cycle

*The #1 killer in aquariums. Ammonia and nitrite must be zero in a cycled tank.*

### Ammonia (`ammonia`)

- **Unit**: ppm
- **Defaults**: 0

Must be 0 ppm in a cycled tank. Any reading means your biofilter is overwhelmed or cycling.

### Nitrite (`nitrite`)

- **Unit**: ppm
- **Defaults**: 0

Must be 0 ppm in a cycled tank. Toxic to fish even at low levels.

### Nitrate (`nitrate`)

- **Unit**: ppm
- **Defaults**: 20

Keep below 20-40 ppm for fish, below 5 ppm for sensitive corals. Controlled by water changes and plants.

## Water Chemistry

*Stability matters more than hitting exact numbers. Sudden shifts stress fish.*

### Temperature (`temperature`)

- **Unit**: °C
- **Defaults**: 25

Most tropical fish thrive at 24-26°C. Stability is more important than hitting an exact number.

### pH (`ph`)

- **Unit**: pH
- **Defaults**: 7.0

Freshwater: 6.5-7.5 depending on species. Marine: 8.1-8.4. Avoid sudden swings.

### General Hardness (`gh`)

- **Unit**: dGH
- **Defaults**: 8

General Hardness measures calcium + magnesium ions. 4-8 dGH for most community fish.

### Carbonate Hardness (`kh`)

- **Unit**: dKH
- **Defaults**: 6

Carbonate Hardness buffers pH. Below 3 dKH and your pH can crash overnight.

### CO2 (`co2`)

- **Unit**: mg/L
- **Defaults**: 20

Planted tanks target 20-30 mg/L during lights-on. Too much suffocates fish.

## Reef & Saltwater

*Corals consume calcium and alkalinity daily. Keeping them stable is key to growth.*

### Salinity (`salinity`)

- **Unit**: ppt
- **Defaults**: 0

Marine tanks: 33-35 ppt. Freshwater: 0. Brackish: varies by species.

### Specific Gravity (`specific_gravity`)

- **Unit**: sg
- **Defaults**: 1.025

Reef tanks: 1.024-1.026. Measure with a refractometer for accuracy.

### Calcium (`calcium`)

- **Unit**: ppm
- **Defaults**: 420

Reef tanks: 380-450 ppm. Consumed by corals, coralline algae, and clams daily.

### Magnesium (`magnesium`)

- **Unit**: ppm
- **Defaults**: 1300

Reef tanks: 1250-1350 ppm. Low magnesium makes it impossible to maintain calcium.

### Alkalinity (`alkalinity`)

- **Unit**: dKH
- **Defaults**: 8

Reef tanks: 7-11 dKH. The most important stability parameter for coral health.

## Maintenance

*Prevent phosphate-driven algae and catch evaporation before it concentrates salts.*

### Phosphate (`phosphate`)

- **Unit**: ppm
- **Defaults**: 0.5

Feeds algae. Keep below 0.5 ppm. Reduce with water changes or phosphate remover.

### Water Level (`water_level`)

- **Unit**: %
- **Defaults**: 100

Evaporation concentrates salts and raises salinity. Auto top-off systems help.
