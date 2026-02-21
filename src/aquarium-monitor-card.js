/**
 * @fileoverview Aquarium Monitor Card - Home Assistant custom card for aquarium water monitoring
 * Extends MonitorCardBase with aquarium-specific sensor presets.
 */

import { MonitorCardBase } from './card-base.js';
import { AQUARIUM_SENSORS } from './sensors.js';

const VERSION = '0.1.0';
/* global __BUILD_TIMESTAMP__ */
const BUILD_TIMESTAMP = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'dev';
const CARD_VERSION = `${VERSION} (${BUILD_TIMESTAMP})`;

console.info(
  `%c AQUARIUM-MONITORING-CARD %c ${CARD_VERSION} `,
  'color: white; background: #0984e3; font-weight: 700;',
  'color: #0984e3; background: white; font-weight: 700;',
);

export class AquariumMonitorCard extends MonitorCardBase {
  static CARD_INFO = {
    cardType: 'aquarium-monitor-card',
    cardName: 'Aquarium Monitor Card',
    cardDescription:
      'A Home Assistant card for monitoring aquarium water parameters (pH, ammonia, nitrite, nitrate, temperature, etc.)',
  };

  static SENSORS = AQUARIUM_SENSORS;

  static IMAGE_BASE_URL =
    'https://raw.githubusercontent.com/wilsto/aquarium-monitor-card/master/resources';
}

customElements.define('aquarium-monitor-card', AquariumMonitorCard);
