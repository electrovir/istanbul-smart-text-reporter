const {join, dirname} = require('path');
const baseOptions = require('virmator/base-configs/base-nyc.js');

const repoDir = dirname(__dirname);

const nycConfig = {
    ...baseOptions,
    extends: '@istanbuljs/nyc-config-typescript',
    instrument: true,
    exclude: '**/*.test.ts',
    include: 'src/*',
    reporter: join(repoDir, 'dist', 'index.js'),
};

module.exports = nycConfig;
