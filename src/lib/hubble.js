import rp from 'request-promise';
import Google from '../lib/google';

export default class Hubble {

  constructor(config) {
      this.apikey = config.apikey;
      this.google = new Google({apikey: config.googleKey});
  }

  search({postcode, sqft}) {
    console.time('hubble');
    const apiKey = this.apikey;

    return this.google.location(postcode)
      .then(({lat, lng}) => {
        const people = Math.floor(sqft / 100);

        return rp({
          method: 'GET',
          uri: 'https://api.hubblehq.com/api/v2/browse',
          qs: {
            api_key: apiKey,
            space_type: "coworking,shared_office",
            lon: lng,
            lat: lat,
            radius: '2km',
            people: people
          },
          json: true
        }).then((result) => {
          const sum = result.map(listing => listing.office.price_per_person * people).reduce((a, b) => a + b);
          const avg = Math.round((sum / result.length * 100)) / 100;

          console.timeEnd('hubble');
          return avg;
        })
      })
  }
}