import {runShellCommand} from 'augment-vir/dist/cjs/node-only';
import chai, {assert} from 'chai';
import {remove} from 'fs-extra';
import {describe, it} from 'mocha';
import {dirname, join} from 'path';

chai.config.truncateThreshold = 0;

const repoDir = dirname(__dirname);
const testFilesDir = join(repoDir, 'test-files');

const testDirPaths = {
    totalCoverage: join(testFilesDir, 'total-coverage'),
    partialCoverage: join(testFilesDir, 'partial-coverage'),
};

async function runTest(dir: string) {
    await runShellCommand(`npm i -D ${process.env.TAR_TO_INSTALL}`, {
        cwd: dir,
        rejectOnError: true,
    });

    const testResults = await runShellCommand(`npm test`, {cwd: dir});

    // clean up after installation
    await remove(join(dir, 'node_modules'));
    await remove(join(dir, 'package-lock.json'));

    return testResults;
}

const tableRegExp = /-{3,}\|-{3,}\|-{3,}\|-{3,}\|-{3,}\|/;

describe('cli tests', () => {
    it('should write no table when there is 100% coverage', async () => {
        const results = await runTest(testDirPaths.totalCoverage);

        assert.notMatch(results.stdout, tableRegExp);
        assert.notInclude(
            results.stderr,
            'ERROR: Coverage for lines (0%) does not meet threshold (100%)',
        );
        assert.strictEqual(results.exitCode, 0, 'exit code should be zero');
    });

    it('should write a table when there is not 100% coverage', async () => {
        const results = await runTest(testDirPaths.partialCoverage);

        assert.match(results.stdout, tableRegExp);
        assert.include(
            results.stderr,
            'ERROR: Coverage for lines (0%) does not meet threshold (100%)',
        );
        assert.strictEqual(results.exitCode, 1, 'should have failed due to partial coverage');
    });
});
