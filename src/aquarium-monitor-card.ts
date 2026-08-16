import { MonitorCardBase, defineCard } from './card-base.js';
import { AQUARIUM_SENSORS } from './sensors.js';
import type { SensorsRegistry, CardInfo } from './ha/types.js';
import { buildEntitySuggestion } from './entity-suggestion.js';

declare let __BUILD_TIMESTAMP__: string;
declare let __BUILD_VERSION__: string;

const VERSION = typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : 'dev';
const BUILD_TIMESTAMP = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'dev';
const CARD_VERSION = `${VERSION} (${BUILD_TIMESTAMP})`;

console.info(
  `%c AQUARIUM-MONITORING-CARD %c ${CARD_VERSION} `,
  'color: white; background: #0984e3; font-weight: 700;',
  'color: #0984e3; background: white; font-weight: 700;',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'aquarium-monitor-card',
  name: 'Aquarium Monitor Card',
  description: 'Monitor aquarium water parameters (pH, ammonia, nitrite, temperature, etc.)',
  preview: true,
  documentationURL: 'https://github.com/wilsto/aquarium-monitor-card',
  // Home Assistant 2026.6 and later: offer this card when the user picks an
  // entity this card actually has a preset for. Returns null otherwise, so
  // the picker does not fill up with cards that cannot render the reading.
  getEntitySuggestion: buildEntitySuggestion(
    'aquarium-monitor-card',
    AQUARIUM_SENSORS,
    { ph: 'ph', carbon_dioxide: 'co2' },
    [
      'ammonia',
      'nitrite',
      'nitrate',
      'gh',
      'kh',
      'salinity',
      'specific_gravity',
      'alkalinity',
      'phosphate',
      'calcium',
      'magnesium',
    ],
  ),
});

export class AquariumMonitorCard extends MonitorCardBase {
  static CARD_INFO: CardInfo = {
    cardType: 'aquarium-monitor-card',
    cardName: 'Aquarium Monitor Card',
    cardDescription:
      'A Home Assistant card for monitoring aquarium water parameters (pH, ammonia, nitrite, nitrate, temperature, etc.)',
  };

  static SENSORS: SensorsRegistry = AQUARIUM_SENSORS;

  static IMAGE_BASE_URL =
    'https://raw.githubusercontent.com/wilsto/aquarium-monitor-card/master/resources';

  static async getConfigElement(): Promise<HTMLElement> {
    await import('./editor.js');
    return document.createElement('aquarium-monitor-card-editor');
  }

  static getStubConfig(): Record<string, unknown> {
    return {
      sensors: {
        temperature: { entity: '' },
      },
    };
  }
}

defineCard('aquarium-monitor-card', AquariumMonitorCard);
