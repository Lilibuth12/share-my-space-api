import { version } from '../../package.json';
import { Router } from 'express';
import Suggestions from './suggestions';

export default ({ config, db }) => {
	let api = Router();

	// Mount endpoint
  api.use('/suggestions', new Suggestions);

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}