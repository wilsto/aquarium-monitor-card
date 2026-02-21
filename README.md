# Aquarium Monitor Card

Home Assistant HACS card for aquarium parameter monitoring.

## Installation

Install via [HACS](https://hacs.xyz/) as a custom repository.

## Usage

```yaml
type: custom:aquarium-monitor-card
title: My Aquarium
sensors:
  temperature:
    entity: sensor.aquarium_temperature
  ph:
    entity: sensor.aquarium_ph
```

Built from [monitor-cards](https://github.com/wilsto/monitor-cards) monorepo.
