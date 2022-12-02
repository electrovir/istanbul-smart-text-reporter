# istanbul-smart-text-reporter

Istanbul's text reporter but with smarter output; Doesn't print a table if there are no files to print.

## @electrovir/nyc

If you use the [`@electrovir/nyc`](https://www.npmjs.com/package/@electrovir/nyc) fork of `nyc` and provide the `failBelow` config value to nyc then when any lines are printed, the reporter fails the `nyc` process so that you can use the `checkCoverage: false` option in `nyc` and eliminate extraneous `console.error` logging from `nyc`. [Example.](https://github.com/electrovir/istanbul-smart-text-reporter/blob/0d586d4e21c23ec2b0f2e2c09c6625fc960fc57e/test-files/partial-coverage/configs/nyc.config.js)

## Usage

```bash
npm i -D istanbul-smart-text-reporter
```

### Using config file

```javascript
// nyc.config.js

module.exports = {
    reporter: 'istanbul-smart-text-reporter',
};
```

### In CLI

```bash
ncy --reporter istanbul-smart-text-reporter
```
