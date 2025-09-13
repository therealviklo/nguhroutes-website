import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as network from './network.ts';
import './export.ts';
import { exportRoutes } from './export.ts';
import { exit } from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let startStation = "N-SVW";
let endStation = "N-XSG";

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
`Usage: ts-node index.ts [-- [options]]

Arguments:
	-s, --start <station>   Set start station code (default: N-SVW)
	-e, --end <station>     Set end station code (default: N-XSG)
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

const net = network.parse(networkData);
const routes = network.generateRoutes(net);

console.log(`ROUTE FROM ${startStation} TO ${endStation}:`);
console.log("=============");
const route = routes.get(`${startStation}\`${endStation}`);
if (route !== undefined) {
	for (const stop of route) {
		console.log(`${stop.code} (${stop.line})`)
	}
	const exportPath = path.join(__dirname, "./gen/routes.json");
	exportRoutes(routes, exportPath);
	console.log(`Exported routes to "${exportPath}".`)
}
