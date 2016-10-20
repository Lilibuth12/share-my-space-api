import { Router } from 'express';
import resource from 'resource-router-middleware';
import rp from 'request-promise';
import promise from 'bluebird';

import Airbb from '../lib/airbb';
import Google from '../lib/google';
import AppearHere from '../lib/appearhere';

export default class SuggestionsApi {

  constructor() {
    this.keys = {
        google: 'AIzaSyBpxoo3XjiCd7XzOCXEuCGUBj-RjBTFqVI',
        hubble: '',
        airbb: '3092nxybyb0otqw18e8nh5nty',
    }

    // Setup libs.
    this.airbb = new Airbb({apikey: this.keys.airbb});
    this.google = new Google({apikey: this.keys.google});
    this.appearHere = new AppearHere();

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
      this.appearHere.search(params)
    ]).then((result) => {
      res.json({
        success: true, 
        data: {
          airbb: result[0],
          appearHere: result[1]
        }
      });
    }, this._errorHandler);
  }

  // Handle error message
  _errorHandler(e) {
    res.json({success: false, error: e});
  }
}