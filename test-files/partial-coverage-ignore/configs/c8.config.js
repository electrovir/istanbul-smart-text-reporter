const {getBaseConfigWithCoveragePercent} = require('virmator/base-configs/base-nyc.js');

const c8Config = {
    ...getBaseConfigWithCoveragePercent(0),
};

module.exports = c8Config;
