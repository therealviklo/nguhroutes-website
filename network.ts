/**
 * Represents a connection to another station via a line.
 */
export type Connection = {
	code: string;
	line: string;
};

/**
 * Represents a station.
 */
export type Station = {
	connections: Connection[]
};

/**
 * Represents a network of stations with the connections that
 * those stations have stored for each station.
 */
export type Network = {
	stations: Map<string, Station>
};

/**
 * Parses JSON into a Network.
 * @param networkData The JSON data to be parsed
 * @returns A network constructed from that data
 */
export function parse(networkData: any): Network {
	const baseObj: Record<string, any> = networkData;
	check(baseObj, "object", "network.js is not an object");
	checkProp(baseObj, "lines", "network.js does not have a \"lines\" property");
	const lines: Record<string, Record<string, any>[]> = baseObj["lines"];
	check(lines, "object", "\"lines\" is not an object");
	const stations = new Map<string, Station>();
	for (const [lineName, line] of Object.entries(lines)) {
		checkArr(line, `Line "${line}" is not an array`);
		let prevStation: string | null = null;
		for (const station of line) {
			check(station, "object", `A station in line "${line}" is not an object`);
			checkProp(station, "code", `A station in line "${line}" does not have a code`);
			const code: string = station["code"];
			check(code, "string", `A station code in line "${line} is not a string"`);
			if (!stations.has(code)) {
				stations.set(code, { connections: [] });
			}
			if (prevStation !== null) {
				stations.get(prevStation)?.connections.push({ code: code, line: lineName });
				stations.get(code)?.connections.push({ code: prevStation, line: lineName });
			}
			prevStation = code;
		}
	}
	return { stations };
}

export type Routes = Map<string, Connection[]>;

/**
 * Generates all optimal routes between all pairs of stations in a Network.
 * The format for a route is "code\`code", e.g. "N-SVW\`N-XSG", with a
 * backtick separating the two codes.
 * @param network The network to generate routes for
 * @returns A map of routes.
 */
export function generateRoutes(network: Network): Routes {
	const routes: Routes = new Map();
	network.stations.forEach((startStation, startStationCode) => {
		const queue: Array<[Connection, Connection[]]> = [];
		for (const connection of startStation.connections) {
			queue.push([connection, []]);
		}
		while (queue.length > 0) {
			const [conn, route] = queue.shift()!;
			if (startStationCode === conn.code) {
				continue;
			}
			const key: string = `${startStationCode}\`${conn.code}`;
			if (routes.has(key)) {
				continue;
			}
			const newRoute = [...route, { ...conn }];
			const currentStation = network.stations.get(conn.code);
			if (!currentStation) {
				throw new Error("Station that is supposed to exist does not exist");
			}
			for (const nextConnection of currentStation.connections) {
				queue.push([nextConnection, newRoute]);
			}
			routes.set(key, newRoute);
		}
	});
	return routes;
}

/**
 * Checks if a value is of a certain type and throws a TypeError if not.
 * @param val The value to check
 * @param type The type that the value should be
 * @param err_msg The error message for the TypeError
 */
function check(val: any, type: string, err_msg: string) {
	if (typeof(val) != type) {
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