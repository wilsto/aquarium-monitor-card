import { describe, test, expect, beforeEach } from 'vitest';
import { AquariumMonitorCard } from '../src/aquarium-monitor-card.js';
import { AQUARIUM_SENSORS } from '../src/sensors.js';

const validConfig = {
  sensors: {
    temperature: { entity: 'sensor.aquarium_temperature' },
  },
};

describe('AquariumMonitorCard', () => {
  let card;

  beforeEach(() => {
    card = new AquariumMonitorCard();
  });

  describe('static properties', () => {
    test('should have CARD_INFO with required fields', () => {
      expect(AquariumMonitorCard.CARD_INFO).toBeDefined();
      expect(AquariumMonitorCard.CARD_INFO.cardType).toBe('aquarium-monitor-card');
      expect(AquariumMonitorCard.CARD_INFO.cardName).toBe('Aquarium Monitor Card');
      expect(typeof AquariumMonitorCard.CARD_INFO.cardDescription).toBe('string');
    });

    test('should have SENSORS equal to AQUARIUM_SENSORS', () => {
      expect(AquariumMonitorCard.SENSORS).toBe(AQUARIUM_SENSORS);
    });

    test('should have IMAGE_BASE_URL', () => {
      expect(AquariumMonitorCard.IMAGE_BASE_URL).toContain('aquarium-monitor-card');
    });
  });

  describe('setConfig', () => {
    test('should accept valid configuration', () => {
      expect(() => card.setConfig(validConfig)).not.toThrow();
    });

    test('should throw if sensors key is missing', () => {
      expect(() => card.setConfig({})).toThrow('sensors');
    });

    test('should throw if sensor entity is missing', () => {
      expect(() => card.setConfig({ sensors: { temperature: {} } })).toThrow('entity');
    });

    test('should throw on empty sensor array', () => {
      expect(() => card.setConfig({ sensors: { temperature: [] } })).toThrow('Empty sensor array');
    });

    test('should merge display defaults', () => {
      card.setConfig(validConfig);
      const cfg = card.getConfig();
      expect(cfg.display.show_names).toBe(true);
      expect(cfg.display.language).toBe('en');
    });

    test('should override display defaults with user values', () => {
      card.setConfig({ ...validConfig, display: { compact: true, language: 'fr' } });
      const cfg = card.getConfig();
      expect(cfg.display.compact).toBe(true);
      expect(cfg.display.language).toBe('fr');
      // other defaults remain
      expect(cfg.display.show_names).toBe(true);
    });

    test('should merge registry defaults into a configured sensor', () => {
      card.setConfig(validConfig);
      const [sensor] = card.getConfig().sensors.temperature;
      expect(sensor.setpoint).toBe(AQUARIUM_SENSORS.temperature.setpoint);
      expect(sensor.unit).toBe(AQUARIUM_SENSORS.temperature.unit);
    });

    // A key outside the registry is kept but flagged, so the card can say
    // "unknown sensor" in place rather than silently dropping the entry.
    test('should flag a sensor type the registry does not know', () => {
      card.setConfig({ sensors: { plutonium: { entity: 'sensor.plutonium' } } });
      expect(card.getConfig().sensors.plutonium[0].invalid).toBe(true);
    });
  });
});
