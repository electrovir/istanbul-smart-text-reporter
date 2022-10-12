import {assert} from 'chai';
import {describe, it} from 'mocha';
import {doThing} from './total-coverage-file';

describe('cli tests', () => {
    it('test the thing', async () => {
        assert.strictEqual(doThing(), '');
    });
});
