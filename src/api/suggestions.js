import { Router } from 'express';
import resource from 'resource-router-middleware';
import rp from 'request-promise';
import promise from 'bluebird';

import Airbb from '../lib/airbb';
import AppearHere from '../lib/appearhere';
import Hubble from '../lib/hubble';

export default class SuggestionsApi {

  constructor() {
    this.keys = {
        google: 'AIzaSyBpxoo3XjiCd7XzOCXEuCGUBj-RjBTFqVI',
        hubble: '8E59DE77A223275A',
        airbb: '3092nxybyb0otqw18e8nh5nty',
    }

    // Setup libs.
    this.airbb = new Airbb({apikey: this.keys.airbb});
    this.appearHere = new AppearHere();
    this.hubble = new Hubble({apikey: this.keys.hubble, googleKey: this.keys.google});

    return this.routes();
  }

  routes() {
    const suggestions = Router();
    suggestions.get('/', this.getSuggestions.bind(this));
    return suggestions;
  }

  // API Endpoint get suggestions
  getSuggestions(req, res) {
    // Basic search params
    const params = {
      postcode: req.query.postcode,
      sqft: req.query.sqft
    }

    // Make api calls to airbb, appearhere and hubble
    Promise.all([
      this.airbb.search(params),
      this.appearHere.search(params),
      this.hubble.search(params)
    ]).then((result) => {
      res.json({
        success: true, 
        data: {
          airbb: result[0],
          appearHere: result[1],
          coworking: result[2]
        }
      });
    }, this._errorHandler);
  }

  // Handle error message
  _errorHandler(e) {
    res.json({success: false, error: e});
  }
}