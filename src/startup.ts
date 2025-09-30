import { setRoutes, loadNetwork } from './routes.ts';

export function startup() {
	setRoutes(false);
	loadNetwork();
}