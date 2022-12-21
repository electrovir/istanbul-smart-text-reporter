const {getBaseConfigWithCoveragePercent} = require('virmator/base-configs/base-nyc.js');
const {join} = require('path');

const c8Config = {
    ...getBaseConfigWithCoveragePercent(100),
    include: [join('src', '**', '*.ts')],
    exclude: [
        join('**', '*.test.ts'),
        join('**', '*.example.ts'),
        join('**', '*.type.test.ts'),
        join('**', '*.test-helper.ts'),
    ],
};

module.exports = c8Config;
