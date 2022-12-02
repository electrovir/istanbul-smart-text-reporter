const baseOptions = require('virmator/base-configs/base-mocharc.js');

const oneMinuteMs = 60_000;

/** @type {import('mocha').MochaOptions} */
const mochaConfig = {
    ...baseOptions,
    slow: oneMinuteMs,
    timeout: 20 * oneMinuteMs,
};

module.exports = mochaConfig;
