const {getBaseConfigWithCoveragePercent} = require('virmator/base-configs/base-nyc.js');

const nycConfig = {
    ...getBaseConfigWithCoveragePercent(100),
    checkCoverage: false,
};

module.exports = nycConfig;
