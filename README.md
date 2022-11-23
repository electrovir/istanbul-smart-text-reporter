# istanbul-smart-text-reporter

Istanbul's text reporter but with smarter output; Doesn't print a table if there are no files to print.

If any lines _are_ printed, the reporter fails the `nyc` process so that you can use the `checkCoverage: false` option in `nyc` and eliminate extraneous `console.error` logging from `nyc`.

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
