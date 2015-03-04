// TODO includes
var bluebird = require('bluebird');
var chalk = require('chalk');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var qs = require('qs');
var request = bluebird.promisifyAll(require('request'));

var scraper = function(options) {
  this.options = options || {};
};

// setup constants
scraper.BASE_URL = 'sfbay.craigslist.org';
scraper.BASE_SCRAPE_URL = 'sfbay.craigslist.org/search/eby/hhh?';
scraper.NEIGHBORHOOD = 'nh=';
scraper.NEIGHBORHOODS = {
  alameda:  46,
  albany_el_cerrito:  47,
  berkeley: 48,
  berkeley_north_hills: 49,
  brentwood_oakley: 142,
  concord_pleasant_hill_martinez: 51,
  danville_san_ramon: 52,
  dublin_pleasanton_livermore: 53,
  emeryville: 112,
  fairfield_vacaville: 154,
  fremont_union_city_newark: 54,
  hayward_castro_valley: 55,
  hercules_pinole_san_pablo_el_sob: 56,
  lafayette_orinda_moraga: 57,
  oakland_downtown: 58,
  oakland_east: 59,
  oakland_hills_mills: 60,
  oakland_lake_merritt_grand: 61,
  oakland_north_temescal: 62,
  oakland_piedmont_montclair: 63,
  oakland_rockridge_claremont: 66,
  oakland_west: 64,
  pittsburg_antioch: 113,
  richmond_point_annex: 65,
  san_leandro: 67,
  vallejo_benicia: 68,
  walnut_creek: 69
};
scraper.PROTOCOL = 'http://';
scraper.SEPARATOR = '&';

/**
 * Parses `options` for all specified, then stringify-ies into a query string
 *
 * @param {Object} options command line options
 * @return {String} A query string to use in a request
 */
scraper.prototype.constructQueryString = function constructQueryString(options) {
  options = options || {};

  // collect all single values
  var optionsBuffer = {
    bathrooms: options.bathrooms,
    bedrooms: options.bedrooms,
    hasPic: options.hasPic,
    minAsk: options.minAsk,
    maxAsk: options.maxAsk,
    pets_cat: options.petsCat,
    pets_dog: options.petsDog
  };

  var queryString = qs.stringify(optionsBuffer);

  // append all multi values (e.g. neighborhoods)
  // we can't do it before we stringify, because there are multiple, separate
  // values for `nh`. So we have to manually append them here.
  var neighborhoods = options.neighborhoods || [];
  neighborhoods.forEach(function(name, index) {
    var hoodIndex = scraper.NEIGHBORHOODS[name];

    // append to buffer (e.g. `&nh=42`)
    queryString += scraper.SEPARATOR + scraper.NEIGHBORHOOD + hoodIndex;
  });

  return queryString;
}

/**
 * Utility function that constructs url to request
 *
 * @param {String} protocol
 * @param {String} baseUrl
 * @param {String} queryString
 * @return {String}
 */
scraper.prototype.constructUrl = function(protocol, baseUrl, queryString) {
  return protocol + baseUrl + queryString;
}

/**
 * Performs a GET request, parses the results, and calls to display on success.
 * Raises an error otherwise.
 *
 * This is where all the action happens.
 *
 * @param {String} url
 * @return {Object} result of GET request to `url`
 */
scraper.prototype.scrape = function(url) {

  request.getAsync(url).then(function(data) {
    return data;
  })
  .then(this.parseResponse)
  .then(this.displayContents)
  // .then(scraper.prepareEmail)
  // .then(scraper.sendEmail)
  .catch(function(e) {
    // TODO use chalk for prettier messages
    console.log('ERROR!!!');
    console.log(e.message);
  });

  /**
  console.log('before request');
  request(url, function(error, response, body) {
    console.log('after request');
    console.log(typeof body);
    var responseObjects = [];
    $ = cheerio.load(body);

    var elements = $('.row', '.content');
    console.log(elements);
  });
  */
}

/**
 * Parses the `response` parameter, and create an array of objects from data
 *
 * @param {Object} response contains response data from http request
 * @returns {Array} An array of parsed objects
 */
scraper.prototype.parseResponse = function(response) {
  var responseObjects = [];
  var body = response[1];
  $ = cheerio.load(body);

  var elements = $('.row', '.content');

  elements.each(function(index, element) {
    // lookup info and add elements to array
    var data = $(element);
    var picsMapString = data.find('span.pnr .px .p').text();

    responseObjects.push({
      city: data.find('span.pnr small').text(),
      date: data.find('time').attr('title'),
      hasMap: picsMapString.indexOf('map') === -1 ? false : true,
      hasPic: picsMapString.indexOf('pic') === -1 ? false : true,
      housing: data.find('span.housing').text(),
      price: data.find('span.price').text(),
      title: data.find('a.hdrlnk').text(),
      url: scraper.BASE_URL + data.find('.hdrlnk').attr('href'),
    });
  });

  return responseObjects;
}

/**
 * print parsed objects
 *
 * @param {Array} responseObjects
 * @return {void}
 */
scraper.prototype.displayContents = function(responseObjects) {
  console.log(chalk.supportsColor);
  console.log(chalk.green.bold('made it!'));
  responseObjects.forEach(function(index, obj) {
    // chalk.green.bold(obj.title);
  });
}

/**
 */
scraper.prototype.prepareEmail = function(data) {
}

/**
 */
scraper.prototype.sendEmail = function(data) {
}

/**
 */
scraper.prototype.start = function() {
  // construct query string
  var qs = this.constructQueryString(this.options);

  // construct url
  var url = this.constructUrl(scraper.PROTOCOL, scraper.BASE_SCRAPE_URL, qs);
  console.log(url);

  // request contents
  this.scrape(url);

  // parse contents
  // this.parseResponse(options);
  
  // display contents
  // this.displayContents(options);
};

module.exports = scraper;
