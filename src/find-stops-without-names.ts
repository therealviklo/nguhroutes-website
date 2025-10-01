import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'jsonc-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const networkJsonPath = path.join(__dirname, './json/network.jsonc');
const networkData = parse(fs.readFileSync(networkJsonPath, 'utf-8'));

const missingSet = new Set<String>();
for (const dim in networkData["lines"]) {
	for (const line of networkData["lines"][dim]) {
		for (const stop of line["stops"]) {
			const code = dim == "the_nether" ? `N-${stop.code}` : stop.code;
			if (!networkData["stations"][code]) {
				missingSet.add(code);
			}
		}
	}
}
for (const code of missingSet) {
	console.log(code);
}