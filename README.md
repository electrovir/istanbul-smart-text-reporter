# istanbul-smart-text-reporter

Istanbul's text reporter but with smarter output; Doesn't print a table if there are no files to print.

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
