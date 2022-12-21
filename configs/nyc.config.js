const {join, dirname} = require('path');
const baseOptions = require('virmator/base-configs/base-nyc.js');

const repoDir = dirname(__dirname);

const c8Config = {
    ...baseOptions,
    instrument: true,
    exclude: '**/*.test.ts',
    include: 'src/*',
    reporter: join(repoDir, 'dist', 'index.js'),
};

module.exports = c8Config;
