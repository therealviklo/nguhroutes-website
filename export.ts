import * as fs from 'fs';
import * as network from './network.ts';

function generateRoutesJSON(routes: network.Routes): string {
	let objRoutes: { [route: string]: network.Connection[] } = {};
	routes.forEach((conns, route) => {
		objRoutes[route] = conns;
	});
	let obj = {
		format_version: "0.1",
		date: new Date().toISOString().split("T")[0],
		routes: objRoutes
	};
	return JSON.stringify(obj);
}

export function exportRoutes(routes: network.Routes, exportPath: string) {
	fs.writeFileSync(exportPath, generateRoutesJSON(routes), 'utf-8');
}