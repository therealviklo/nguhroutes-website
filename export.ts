import * as fs from 'fs';
import * as network from './network.ts';

function generateRoutesJSON(routes: network.Routes): string {
	let objRoutes: { [route: string]: network.Connection[] } = {};
	routes.forEach((conns, route) => {
		objRoutes[route] = makeRoute(conns);
	});
	let obj = {
		format_version: "0.2",
		date: new Date().toISOString(),
		routes: objRoutes
	};
	return JSON.stringify(obj);
}

function makeRoute(conns: network.Connection[]): any[] {
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
	return route;
}

export function exportRoutes(routes: network.Routes, exportPath: string) {
	fs.writeFileSync(exportPath, generateRoutesJSON(routes), 'utf-8');
}