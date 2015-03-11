// TODO includes
var bluebird = require('bluebird');
var chalk = require('chalk');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var qs = require('qs');
var request = bluebird.promisifyAll(require('request'));

var scraper = function() {};

// constants
scraper.BASE_URL = 'sfbay.craigslist.org';
scraper.BASE_SCRAPE_URL = 'sfbay.craigslist.org/search/eby/apa?';
scraper.CITY_LENGTH = 27;
scraper.CITY_PADDING = '                                     ';
scraper.DATE_LENGTH = 15;
scraper.DATE_PADDING = '               ';
scraper.DATE_REGEX = /\d+\ (minute|hour|day)s ago/i;
scraper.HOUSING_LENGTH = 18;
scraper.HOUSING_PADDING = '               ';
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
scraper.PIC_MAP_LENGTH = 7;
scraper.PIC_MAP_PADDING = '       ';
scraper.PRICE_LENGTH = 8;
scraper.PRICE_PADDING = '        ';
scraper.PROTOCOL = 'http://';
scraper.SEPARATOR = '&';
scraper.TITLE_LENGTH = 50;
scraper.TITLE_PADDING = '                                                  ';

/**
 * Parses specified `options`, then stringify-ies into a query string
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

  // parse neighborhood codes and append to the querystring
  neighborhoods = options.neighborhoods.split(',');
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

  request.getAsync(url)
      .then(this.parseResponse)
      .then(this.displayContents)
      // .then(scraper.prepareEmail)
      // .then(scraper.sendEmail)
      .catch(function(e) {
        // TODO use chalk for prettier messages
        console.log('ERROR!!!');
        console.log(e.message);
      });
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
    var data = $(element);

    // lookup date info and parse via regex
    var date = scraper.DATE_REGEX.exec(data.find('time').attr('title'));
    date = (date && date[0]) || '(?)';

    var picsMapString = data.find('span.pnr .px .p').text();
    var title = data.find('a.hdrlnk').text();

    responseObjects.push({
      city: data.find('span.pnr small').text(),
      date: date,
      hasMap: picsMapString.indexOf('map') === -1 ? false : true,
      hasPic: picsMapString.indexOf('pic') === -1 ? false : true,
      housing: data.find('span.housing').text(),
      price: data.find('span.price').text(),
      title: title,
      url: scraper.PROTOCOL + scraper.BASE_URL + data.find('.hdrlnk').attr('href'),
    });
  });

  return responseObjects;
}

/**
 * print parsed objects
 *
 * @param {Array} responseObjects
 * @return {Array} responseObjects
 */
scraper.prototype.displayContents = function(responseObjects) {
  responseObjects.forEach(function(obj, index) {
    var picString = obj.hasPic? 'pic' : '';
    var mapString = obj.hasMap? 'map' : '';

    // TODO should refactor this to use formatted printing
    // pad data
    var paddedTitle = (obj.title + scraper.TITLE_PADDING).slice(
        0, scraper.TITLE_LENGTH);
    var paddedCity = (obj.city + scraper.CITY_PADDING).slice(
        0, scraper.CITY_LENGTH);
    var paddedHousing = ('(' + obj.housing.slice(2, obj.housing.length - 2) + 
        ')' + scraper.HOUSING_PADDING).slice(0, scraper.HOUSING_LENGTH);
    var paddedPicMap = (picString + '|' + mapString +
        scraper.PIC_MAP_PADDING).slice(0, scraper.PIC_MAP_LENGTH);
    var paddedDate = ('(' + obj.date + ')' + scraper.DATE_PADDING).slice(
        0, scraper.DATE_LENGTH);
    var paddedPrice = (obj.price + scraper.PRICE_PADDING).slice(
        0, scraper.PRICE_LENGTH);

    console.log(
        chalk.gray.bold(paddedTitle) + ' ' +
        chalk.gray.bold(paddedCity) + ' ' +
        chalk.gray(paddedHousing) + ' ' +
        chalk.gray(paddedPicMap) + ' ' +
        chalk.yellow(paddedDate) + ' ' +
        chalk.red(paddedPrice) + ' ' +
        chalk.cyan.underline(obj.url));
  });

  return responseObjects;
}

/**
 * TODO
 */
scraper.prototype.prepareEmail = function(data) {
}

/**
 * TODO
 */
scraper.prototype.sendEmail = function(data) {
}

/**
 * TODO
 */
scraper.prototype.start = function(options) {
  // construct query string
  var qs = this.constructQueryString(options);

  // construct url
  var url = this.constructUrl(scraper.PROTOCOL, scraper.BASE_SCRAPE_URL, qs);

  // call does the following:
  // - compute url and query string
  // - request data
  // - parse data
  // - display data
  // - TODO prepare email
  // - TODO send email(s)
  this.scrape(url);
};

module.exports = scraper;
