# scrapemesomethinggood
Yet another Craigslist scraper.

This was written for my own purposes (i.e. to use, to learn more about
craigslist, work on my node/js skills, to do something in my free time)
> NOTE This is definitely NOT production ready. Use at your own risk

## dependencies
- node
- npm

## setup

```bash
git clone git@github.com:kgraves/scrapemesomethinggood.git
cd scrapemesomethinggood
npm install
```

## example usage
From the command line:
```bash
node index.js --color --neighborhoods=berkeley,berkeley_north_hills --maxAsk=5000 --bedrooms=4
```
> See index.js for a complete list of options

Or in node/js:
```js
var Scraper = require('./scrapemesomethinggood/lib/scraper');
var scraper = new Scraper();
scraper.start(...);
```
> This will/needs to be refactored to behave like a normal node module.
> (e.g. `var scraper = require('scrapemesomethinggood');`)

## contributing
Create a fork, (hack hack hack), submit a pull request

## todos
- refactor to make module usage more node like
- refactor the `--color` option so the user doesn't have to pass it
- config file
- email
- new output format
- support more options
- support more cities?
- tests
- publish to npm?
