import {removeColor} from '@augment-vir/common';
import {runShellCommand, ShellOutput} from '@augment-vir/node-js';
import chai from 'chai';
import {remove} from 'fs-extra';
import {describe, it} from 'mocha';
import {dirname, join} from 'path';
import {assertExpectation} from 'test-established-expectations';

chai.config.truncateThreshold = 0;

const repoDir = dirname(__dirname);
const testFilesDir = join(repoDir, 'test-files');

const testDirPaths = {
    totalCoverage: join(testFilesDir, 'total-coverage'),
    partialCoverage: join(testFilesDir, 'partial-coverage'),
    partialCoverageIgnore: join(testFilesDir, 'partial-coverage-ignore'),
};

function cleanOutput(output: string): string {
    return removeColor(output).replace(/\(\d+m?s\)/g, '');
}

async function runTest(dir: string, expectationKey: string) {
    await runShellCommand(`npm i -D ${process.env.TAR_TO_INSTALL}`, {
        cwd: dir,
        rejectOnError: true,
    });

    const testResults = await runShellCommand(`npm test`, {cwd: dir});

    // clean up after installation
    await remove(join(dir, 'node_modules'));
    await remove(join(dir, 'package-lock.json'));

    await assertExpectation<Omit<ShellOutput, 'error' | 'exitSignal'>>({
        key: {
            topKey: {describe: 'cli tests'},
            subKey: expectationKey,
        },
        result: {
            stderr: cleanOutput(testResults.stderr),
            stdout: cleanOutput(testResults.stdout),
            exitCode: testResults.exitCode,
        },
    });
}

describe('cli tests', () => {
    it('should write no table when there is 100% coverage', async () => {
        await runTest(testDirPaths.totalCoverage, 'no table at 100%');
    });

    it('should write a table when there is not 100% coverage', async () => {
        await runTest(testDirPaths.partialCoverage, 'fail with table when not at 100%');
    });

    it('should not fail if failBelow is 0', async () => {
        await runTest(testDirPaths.partialCoverageIgnore, 'no fail if failBelow at 0');
    });
});
