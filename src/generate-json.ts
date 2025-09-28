import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as network from './network.ts';
import * as imp from './import.ts';
import * as exp from './export.ts';
import { parse } from 'jsonc-parser';

// Load network data
console.log("Loading network data...");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const networkJsonPath = path.join(__dirname, './json/network.jsonc');
const networkData = parse(fs.readFileSync(networkJsonPath, 'utf-8'));
console.log("Finished loading network data");

const jsonOutputDir = path.join(__dirname, "../public/json/");
const generateRoutes = (ver: string, filename: string, noNether: boolean) => {
	console.log(`GENERATING ${ver.toUpperCase()} ROUTES`);
	console.log(`Parsing network data... (${ver})`);
	const [net, networkVersion] = imp.parse(networkData, noNether);
	console.log(`Finished parsing network data (${ver})`);
	console.log(`Generating routes... (${ver})`);
	const startGen = Date.now();
	const routes = network.generateRoutes(net);
	const endGen = Date.now();
	const genTimeSec = ((endGen - startGen) / 1000).toFixed(2);
	console.log(`Finished generating routes (${ver}) (took ${genTimeSec} seconds)`);
	console.log(`Exporting routes... (${ver})`);
	const exportPath = path.join(jsonOutputDir, filename);
	fs.mkdirSync(path.dirname(exportPath), { recursive: true });
	exp.exportRoutes(routes, networkVersion, exportPath);
	console.log(`Finished exporting routes (${ver})`);
};

generateRoutes("standard", "routes.json", false);
generateRoutes("no Nether", "routes_no_nether.json", true);

console.log("COPYING NETWORK FILE");
fs.writeFileSync(path.join(jsonOutputDir, "network.json"), JSON.stringify(networkData));