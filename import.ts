import { stat } from 'fs';
import * as network from './network.ts';

/**
 * Parses JSON into a Network.
 * @param networkData The JSON data to be parsed
 * @returns A network constructed from that data
 */
export function parse(networkData: any): network.Network {
	const baseObj: Record<string, any> = networkData;
	check(baseObj, "object", "Network is not an object");
	checkProp(baseObj, "lines", "Network does not have a \"lines\" property");
	const lines: Record<string, any> = baseObj["lines"];
	check(lines, "object", "\"lines\" is not an object");
	let stations = new Map();
	const overworld: Record<string, any> | undefined = lines["overworld"];
	if (overworld) {
		check(overworld, "object", "\"overworld\" is not an object");
		stations = parseDimension(overworld, 1);
	}
	// Skip the Nether for now, since the JSON will need to be adjusted
	return { stations, stations_nether: new Map() };
}

// OLD CODE FOR THE OLD FORMAT

// function parseDimension(dimension: Record<string, any>): Map<string, network.Station> {
// 	const stations = new Map<string, network.Station>();
// 	for (const [lineName, line] of Object.entries(dimension)) {
// 		checkArr(line, `Line "${line}" is not an array`);
// 		let prevStation: string | null = null;
// 		for (const station of line) {
// 			check(station, "object", `A station in line "${line}" is not an object`);
// 			checkProp(station, "code", `A station in line "${line}" does not have a code`);
// 			const code: string = station["code"];
// 			check(code, "string", `A station code in line "${line} is not a string"`);
// 			if (!stations.has(code)) {
// 				stations.set(code, { connections: [] });
// 			}
// 			if (prevStation !== null) {
// 				stations.get(prevStation)?.connections.push({ code: code, line: lineName, cost: 1 });
// 				stations.get(code)?.connections.push({ code: prevStation, line: lineName, cost: 1 });
// 			}
// 			prevStation = code;
// 		}
// 	}
// 	return stations;
// }

/**
 * Helper that parses the JSON object for a certain dimension into the stations
 * for that dimension.
 * @param dimension The dimension JSON to parse
 * @param scaleFactor The scale for distances in relation to the Overworld
 * @returns The stations for that dimension
 */
function parseDimension(dimension: Record<string, any>, scaleFactor: number): Map<string, network.Station> {
	const stations = new Map<string, network.Station>();
	for (const [lineName, line] of Object.entries(dimension)) {
		checkProp(line, "turns", `Line "${lineName}" does not have "turns"`);
		const turns = line["turns"];
		checkArr(turns, `"turns" in line "${lineName}" is not an array`);
		let firstStationCode: string | null = null;
		let lastStationCode: string | null = null;
		let prevTurnCoords: [number, number] | null = null;
		let segmentDist: number | null = null;
		let addConnections = (a: string, b: string) => {
			let addConnection = (from: string, to: string) => {
				stations.get(from)?.connections.push({
					code: to,
					line: lineName,
					cost: (segmentDist ?? 0) * scaleFactor * network.minecartSpeedFactor
				});
			};
			addConnection(a, b);
			addConnection(b, a);
		};
		for (const turn of turns) {
			check(turn, "object", `A turn in line "${lineName}" is not an object`);
			checkProp(turn, "id", `A turn in line "${lineName}" does not have an "id" property`);
			const id: string = turn["id"];
			check(id, "string", `A turn in line "${lineName}" has an id that is not a string`);
			checkProp(turn, "coords", `Turn "${id}" in line "${lineName}" does not have a "coords" property`);
			const coords: number[] = turn["coords"];
			checkArr(coords, `Turn "${id}" in line "${lineName}" has a "coords" property that is not an array`);
			if (coords.length !== 2) {
				throw Error(`Turn "${id}" in line "${lineName}" has a coordinate that is not two-dimensional`);
			}
			check(coords[0], "number", `Turn "${id}" in line "${lineName}" has an x-coordinate that is not a number`);
			check(coords[1], "number", `Turn "${id}" in line "${lineName}" has a y-coordinate that is not a number`);
			// This next line assumes that the line segment number is always two digits,
			// which is always true as of now but if that changes a more clever solution is needed.
			const stationCode = id.substring(0, id.length - 2); 
			if (!stations.has(stationCode)) {
				stations.set(stationCode, { connections: [] });
			}
			if (!firstStationCode) {
				firstStationCode = stationCode;
			}
			// The coords should never be undefined here because of the check earlier
			const coordsTuple: [number, number] = [coords[0] ?? 0, coords[1] ?? 0];
			if (prevTurnCoords !== null && segmentDist !== null) {
				// Calculate distance using taxicab distance
				segmentDist += Math.abs(prevTurnCoords[0] - coordsTuple[0]) + Math.abs(prevTurnCoords[1] - coordsTuple[1]);
			}
			if (lastStationCode === null || lastStationCode !== stationCode) {
				if (lastStationCode !== null) {
					addConnections(stationCode, lastStationCode);
				}
				lastStationCode = stationCode;
				segmentDist = 0;
			}
			prevTurnCoords = coordsTuple;
		}
		if (line["loop"] && lastStationCode && firstStationCode) {
			addConnections(lastStationCode, firstStationCode);
		}
	}
	return stations;
}

/**
 * Checks if a value is of a certain type and throws a TypeError if not.
 * If it is an array it also throws, so that you can check if it is an
 * object that is not an array. Use checkArr() to check if it is an array.
 * @param val The value to check
 * @param type The type that the value should be
 * @param err_msg The error message for the TypeError
 */
function check(val: any, type: string, err_msg: string) {
	if (typeof(val) != type || Array.isArray(val)) {
		throw TypeError(err_msg);
	}
}

/**
 * Checks if a value is an array and throws a TypeError if not.
 * @param val The value to check
 * @param err_msg The error message for the TypeError
 */
function checkArr(val: any, err_msg: string) {
	if (!Array.isArray(val)) {
		throw TypeError(err_msg);
	}
}

/**
 * Checks if a value has a property with a certain key and
 * throws a TypeError if it does not.
 * @param val The value to check
 * @param key The key to check
 * @param err_msg The error message for the TypeError
 */
function checkProp(val: any, key: any, err_msg: string) {
	if (!val.hasOwnProperty(key)) {
		throw new TypeError(err_msg);
	}
}