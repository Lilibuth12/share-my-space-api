import rp from 'request-promise';

export default class Airbb {

  constructor(config) {
      this.client_id = config.apikey;
  }

  search({postcode, sqft}) {
    console.time('airbb');
    // If less than 80sqft only going to be a single bed, otherwise double
    const guests = sqft < 80 ? 1 : 2;

    return rp({
      method: 'GET',
      uri: 'https://api.airbnb.com/v2/search_results',
      qs: {
          client_id: this.client_id,
          locale: 'en-UK',
          currency: 'GBP',
          _format: 'for_search_results_with_minimal_pricing',
          _limit: '50',
          min_bedrooms: 1,
          location: postcode,
          guests: guests
      },
      json: true
    }).then((result) => {
      const listings = result.search_results;
      const validData = listings.filter(listing => listing.listing.room_type_category === 'private_room');
      const sum = validData.map(listing => listing.pricing_quote.rate.amount)
        .reduce((a, b) => a + b);
      const avg = Math.round((sum / validData.length * 100)) / 100;

      console.timeEnd('airbb');
      return avg * 30;
    });
  }
}