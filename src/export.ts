import * as fs from 'fs';
import * as network from './network.ts';

function generateRoutesJSON(routes: network.Routes, network_version: string): string {
	let objRoutes: { [route: string]: network.Connection[] } = {};
	routes.forEach((routeData, route) => {
		objRoutes[route] = makeRoute(routeData);
	});
	let obj = {
		version: network_version,
		format_version: "0.3",
		date: new Date().toISOString(),
		routes: objRoutes
	};
	return JSON.stringify(obj);
}

function makeRoute(routeData: [number, network.Connection[]]): any[] {
	let [time, conns] = routeData
	let route: any[] = [];
	let lastLine: string | null = null;
	for (const conn of conns) {
		if (lastLine !== conn.line) {
			lastLine = conn.line;
			route.push([conn.code, conn.line]);
		} else {
			route.push(conn.code);
		}
	}
	return [time, route];
}

export function exportRoutes(routes: network.Routes, network_version: string, exportPath: string) {
	fs.writeFileSync(exportPath, generateRoutesJSON(routes, network_version), 'utf-8');
}