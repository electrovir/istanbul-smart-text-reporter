const {getBaseConfigWithCoveragePercent} = require('virmator/base-configs/base-nyc.js');

const c8Config = {
    ...getBaseConfigWithCoveragePercent(100),
    checkCoverage: false,
    failBelow: 100,
};

module.exports = c8Config;
