import { customElement } from 'lit/decorators.js';
import { MonitorCardBase } from './card-base.js';
import { AQUARIUM_SENSORS } from './sensors.js';
import type { SensorsRegistry, CardInfo } from './ha/types.js';

declare let __BUILD_TIMESTAMP__: string;

const VERSION = '0.8.1';
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
});

@customElement('aquarium-monitor-card')
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
