import rp from 'request-promise';
import Horseman from 'node-horseman';
import cheerio from 'cheerio'

export default class AppearHere {

  constructor() {
    // Auth obj
    this.auth = {
      username: 'lizzie@hubblehq.com',
      pass: 'SavvySpace'
    }
  }

  getHeadless() {
    // Create headless
    return new Horseman({
        ignoreSSLErrors: true,
        loadImages: false,
        bluebirdDebug: true
    })
  }

  login() {
    return this.getHeadless()
      .userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
      .open('https://www.appearhere.co.uk/login')
      .type('input[name="session[email]"]', 'lizzie@hubblehq.com' )
      .type('input[name="session[password]"]', 'SavvySpace')
      .click('[type="submit"]')
      .waitForNextPage();
  }

  search({postcode, sqft}) {
    console.time('searching');

    return this.login.bind(this)()
      .open(`https://www.appearhere.co.uk/spaces/search?search_campaign=search-page-form&search_medium=form&search_source=search-page&utf8=%E2%9C%93&type=&sort=relevance&bbox=&lat=&lon=&name=&destination_id=&q=${postcode}&price_min=&price_max=&price_unit=GBP&size_min=&size_max=&size_unit=sqft`)
      .click('[data-value="space"]')
      .waitForSelector('.search-result')
      .html('ol.search-results')
      .then((data) => {
          const $ = cheerio.load(data);
          const scraped = [];

          $('.search-result').each(function(i, elem) {
            // YAY, random selectors ;) sense much sense
            const sqft = $(this).find('.search-result-body .feature-list:not(.feature-list-muted) li:last-child').text().slice(0, -4);
            const dayRate = $(this).find('.search-result-body .space-pricing:not(.space-pricing-muted) span:first-child').text().slice(1).replace(',', '');
            scraped.push({sqft, dayRate})
          });

          const validData = scraped.filter(building => (!isNaN(parseInt(building.dayRate)) && !isNaN(parseInt(building.sqft))));
          const sum = validData.map(building => parseInt(building.dayRate) / parseInt(building.sqft))
                  .reduce((a, b) => a + b);
          const avg = Math.round((sum / validData.length * 100)) / 100;

          console.timeEnd('searching');
          return (avg * sqft) * 30;
      });
  }

}