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
	const overworld: any[] | undefined = lines["overworld"];
	const stations = new Map();
	if (overworld) {
		checkArr(overworld, "\"overworld\" is not an array");
		parseDimension(overworld, stations, "");
	}
	const nether: any[] | undefined = lines["nether"];
	if (nether) {
		checkArr(nether, "\"nether\" is not an array");
		parseDimension(nether, stations, network.netherPrefix);
	}
	const connections = lines["connections"];
	if (connections) {
		checkArr(connections, "\"connections\" must be an array");
		addDimensionalConnections(connections, stations);
	}
	return { stations };
}

/**
 * Helper that parses the JSON object for a certain dimension into the stations
 * for that dimension.
 * @param dimension The dimension JSON to parse
 * @param stations The stations map to put stations into
 * @param prefix The prefix that is added to station codes, e.g. N- for the Nether
 */
function parseDimension(dimension: any[], stations: Map<string, network.Station>, prefix: string) {
	for (const line of dimension) {
		check(line, "object", "A line is not an object");
		const name = line["name"] ?? "Unnamed Line";
		check(name, "string", "A name for a line is not a string");
		checkProp(line, "stops", `Line "${name}" has no "stops" array`);
		const stops = line["stops"];
		checkArr(stops, `The "stops" property for line "${name}" is not an array`);

		const getCode = (stop: Record<string, any>): string => {
			checkProp(stop, "code", `A stop in line "${line}" does not have a code`);
			const code = stop["code"];
			check(code, "string", `A stop in line "${line}" has a code that is not a string`);
			return prefix + code;
		};
		const addConnections = (from: Record<string, any>, to: Record<string, any>) => {
			let codeFrom = getCode(from);
			let codeTo = getCode(to);
			addStation(stations, codeFrom);
			addStation(stations, codeTo);

			let cost = null;
			const time: number = to["time"];
			const dist: number = to["dist"];
			const coordsFrom: number[] = from["coords"];
			const coordsTo: number[] = to["coords"];
			if (time) {
				check(time, "number", `The stop "${codeTo}" in line "${line}" has a time that is not a number`);
				cost = time;
			} else if (dist) {
				check(dist, "number", `The stop "${codeTo}" in line "${line}" has a distance that is not a number`);
				cost = dist * network.minecartSpeedFactor;
			} else if (coordsFrom && coordsTo) {
				checkArr(coordsFrom, `The stop "${codeFrom}" in line "${line}" has coordinates that are not an array`);
				checkArr(coordsTo, `The stop "${codeTo}" in line "${line}" has coordinates that are not an array`);
				const extractCoords = (coords: number[], code: string): [number, number] => {
					if (coords.length === 3) {
						check(coords[0], "number", `The stop "${code}" in line "${line}" has an x-coordinate that is not a number`);
						check(coords[2], "number", `The stop "${code}" in line "${line}" has a z-coordinate that is not a number`);
						return [coords[0] ?? 0, coords[2] ?? 0]; // ?? should never trigger because of the checks above
					} else if (coords.length === 2) {
						check(coords[0], "number", `The stop "${code}" in line "${line}" has an x-coordinate that is not a number`);
						check(coords[1], "number", `The stop "${code}" in line "${line}" has a z-coordinate that is not a number`);
						return [coords[0] ?? 0, coords[1] ?? 0]; // ?? should never trigger because of the checks above
					} else {
						throw Error(`The stop "${code}" in line "${line}" has coordinates that are not 2-dimensional or 3-dimensional`);
					}
				}
				let [fromX, fromZ] = extractCoords(coordsFrom, codeFrom);
				let [toX, toZ] = extractCoords(coordsTo, codeTo);
				// Approximate line length by calculating the taxicab distance between the stations
				const dist = Math.abs(fromX - toX) + Math.abs(fromZ - toZ);
				cost = dist * network.minecartSpeedFactor;
			} else {
				throw Error(`There is no way to determine the time it takes to travel from "${codeFrom}" to "${codeTo}" on line "${line}"`);
			}

			const addConnection = (from: string, to: string) => {
				stations.get(from)?.connections.push({
					code: to,
					line: name,
					cost
				});
			};
			addConnection(codeFrom, codeTo);
			addConnection(codeTo, codeFrom);
		};

		let firstStop = null;
		let prevStop = null;
		for (const stop of stops) {
			check(stop, "object", `A stop in line "${stop}" is not an object`);
			if (firstStop === null) {
				firstStop = stop;
			}
			if (prevStop) {
				addConnections(prevStop, stop);
			}
			prevStop = stop;
		}
		if (line["loop"]) {
			addConnections(prevStop, firstStop);
		}
	}
}

/**
 * Adds a station if it does not already exist.
 * @param stations The stations map
 * @param code The code for the station
 */
function addStation(stations: Map<string, network.Station>, code: string) {
	if (!stations.has(code)){
		stations.set(code, {
			connections: []
		});
	}
}

/**
 * Adds connections between Overworld and Nether stations.
 * @param connections The JSON array for the connections
 * @param stations The stations map to add to
 */
function addDimensionalConnections(connections: any[], stations: Map<string, network.Station>) {
	for (const conn in connections) {
		const addDimConn = (overworldCode: string, netherCode: string) => {
			addStation(stations, overworldCode);
			addStation(stations, netherCode);
			const addConn = (from: string, to: string) => {
				stations.get(from)?.connections.push({
					code: to,
					line: "Interdimensional transfer",
					cost: 4 // This is the time that you have to stand in a portal, but it would be better to approximate the time it takes to get to the portal
				});
			}
			addConn(overworldCode, netherCode);
			addConn(netherCode, overworldCode);
		}
		if (typeof(conn) === "string") {
			addDimConn(conn, network.netherPrefix + conn);
		} else if (Array.isArray(conn)) {
			const connAsArr: any[] = conn;
			if (connAsArr.length !== 2) {
				throw Error("Connection arrays should have two items");
			}
			addDimConn(conn[0], network.netherPrefix + conn[1]);
		} else {
			throw TypeError("Connection must be either a string or an array");
		}
	}
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
	if (typeof(val) !== type || Array.isArray(val)) {
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