import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as network from './src/network.ts';
import './src/export.ts';
import * as exp from './src/export.ts';
import { exit } from 'process';
import * as imp from './src/import.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let startStationDefault = "SVW";
let endStationDefault = "SXG";
let startStation = startStationDefault;
let endStation = endStationDefault;

let argit = process.argv.values();
// Skip the node command
argit.next();
// and the file name
argit.next();
for (let i: IteratorResult<string, undefined> = argit.next(); !i.done; i = argit.next()) {
	const arg = i.value.startsWith("--") ? i.value.substring(1) : i.value;
	switch (arg) {
		case "-s":
		case "-start": {
			let val = argit.next();
			if (val.done)
				throw Error("Expected value after --start");
			startStation = val.value;
			break;
		}
	
		case "-e":
		case "-end": {
			let val = argit.next();
			if (val.done)
				throw Error("Expected value after --start");
			endStation = val.value;
			break;
		}

		case "-h":
		case "-help": {
			console.log(
`Usage: ts-node cmd.ts [-- [options]]

Arguments:
	-s, --start <station>   Set start station code (default: ${startStationDefault})
	-e, --end <station>     Set end station code (default: ${endStationDefault})
	-h, --help              Show this help message`
			);
			exit();
		}
	
		default:
			break;
	}
}

const networkJsonPath = path.join(__dirname, './json/network.json');
const networkData = JSON.parse(fs.readFileSync(networkJsonPath, 'utf-8'));

const [net, networkVersion] = imp.parse(networkData, false);
const routes = network.generateRoutes(net);

const routeInfo = routes.get(`${startStation}\`${endStation}`);
if (!routeInfo) {
	console.log(`Unable to find route from ${startStation} to ${endStation}`);
	exit();
}
console.log(`ROUTE FROM ${startStation} TO ${endStation}:`);
console.log("=============");
const [, route] = routeInfo;
if (route !== undefined) {
	for (const stop of route) {
		console.log(`${stop.code} (${stop.line})`)
	}
	const exportPath = path.join(__dirname, "./gen/routes.json");
	exp.exportRoutes(routes, networkVersion, exportPath);
	console.log(`Exported routes to "${exportPath}".`)
}
