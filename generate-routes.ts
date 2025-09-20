import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as network from './network.ts';
import * as imp from './import.ts';
import * as exp from './export.ts';
import { parse } from 'jsonc-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const networkJsonPath = path.join(__dirname, './json/network.jsonc');
const networkData = parse(fs.readFileSync(networkJsonPath, 'utf-8'));

const net = imp.parse(networkData, false);
const routes = network.generateRoutes(net);
const exportPath = path.join(__dirname, "./public/gen/json/routes.json");
fs.mkdirSync(path.dirname(exportPath), { recursive: true });
exp.exportRoutes(routes, exportPath);

const netNN = imp.parse(networkData, true);
const routesNN = network.generateRoutes(netNN);
const exportPathNN = path.join(__dirname, "./public/gen/json/routes_no_nether.json");
fs.mkdirSync(path.dirname(exportPathNN), { recursive: true });
exp.exportRoutes(routesNN, exportPathNN);