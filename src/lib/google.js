import rp from 'request-promise';

export default class Google {

  constructor(config) {
    this.apikey = config.apikey;
  }

  location(postcode) {
    const postcodeSimple = postcode.replace( /\s/g, "");

    return rp.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${postcodeSimple}&key=${this.apikey}`)
        .then((response) => {
            const data = JSON.parse(response);
            return data.results[0].geometry.location;
        })
  }
}