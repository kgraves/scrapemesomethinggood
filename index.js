#!/usr/bin/env node

var app = require('./package.json');
var opts = require('commander');
var scraper = require('./lib/scraper');

// .option('-s, --sender [type]',              'Sender credentials in the form of sender@gmail.com:my_password; set to false to disable email', 'false')
// NOTE the `color` option is to support chalk and printing colors
opts
  .version( app.version )
  .usage('[options]')
  .option('-ba, --bathrooms [amount]',        'Bathrooms (min)', '2')
  .option('-bd, --bedrooms [amount]',         'Bedrooms (min)', '4')
  .option('-c, --color',                      'Color')
  .option('-hp, --hasPic [boolean]',          'Has Pics', '0 or 1')
  .option('-max, --maxAsk [amount]',          'Maximum asking amount', '3000')
  .option('-min, --minAsk [amount]',          'Minimum asking amount', '1000')
  .option('-n, --neighborhoods [type]',       'Comma delimited list of neighborhoods', '10,11,12')
  .option('-pc, --petsCat [boolean]',         'Cats OK', '0 or 1')
  .option('-pd, --petsDog [boolean]',         'Dogs OK', '0 or 1')
  // .option('-r, --recipients [items]',         'Comma delimited list of recipients', 'bar@gmail.com,foo@baz.com')
  .parse(process.argv);

//
// 1. Get URLs for all cities.
// 2. Start pinging the URLs
// 3. Save URLs to DB.
// 4. Email new results.
//
// var urls = urlBuilder.getURLs(opts.cities, opts.query);

/**
var secretary = new Secretary({
    recipients: opts.recipients,
    sender: opts.sender,
  });
*/

// secretary.listen(scout);

scraper.prototype.start();
