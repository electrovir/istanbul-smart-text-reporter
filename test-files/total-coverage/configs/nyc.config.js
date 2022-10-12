const baseOptions = require('virmator/base-configs/base-nyc.js');

const nycConfig = {
    ...baseOptions,
    extends: '@istanbuljs/nyc-config-typescript',
    instrument: true,
    exclude: '**/*.test.ts',
    include: 'src/*',
    reporter: 'istanbul-smart-text-reporter',
};

module.exports = nycConfig;
