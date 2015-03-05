#!/usr/bin/env node

var app = require('./package.json');
var opts = require('commander');
var scraper = require('./lib/scraper');

// NOTE the `color` option is to support chalk and printing colors.
//      you must specify this option to get colors!
opts
  .version( app.version )
  .usage('[options]')
  .option('-ba, --bathrooms [amount]',        'Bathrooms (min)')
  .option('-bd, --bedrooms [amount]',         'Bedrooms (min)')
  .option('-c, --color',                      'Color')
  .option('-hp, --hasPic [boolean]',          'Has Pics')
  .option('-max, --maxAsk [amount]',          'Maximum asking amount')
  .option('-min, --minAsk [amount]',          'Minimum asking amount')
  .option('-n, --neighborhoods [type]',       'Comma delimited list of neighborhoods', '')
  .option('-pc, --petsCat [boolean]',         'Cats OK')
  .option('-pd, --petsDog [boolean]',         'Dogs OK')
  // .option('-s, --sender [type]',              'Sender credentials in the form of sender@gmail.com:my_password; set to false to disable email', 'false')
  // .option('-r, --recipients [items]',         'Comma delimited list of recipients', 'bar@gmail.com,foo@baz.com')
  .parse(process.argv);

scraper.prototype.start(opts);
