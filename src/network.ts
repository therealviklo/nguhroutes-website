/**
 * The speed that one travels at on rail, expressed in **seconds per block**.
 */
export const minecartSpeedFactor = 1 / 100;
export const netherPrefix = "N-";

/**
 * Represents a connection to another station via a line.
 */
export type Connection = {
	code: string;
	line: string;
	cost: number; // The standard unit is seconds
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
	stations: Map<string, Station>;
};

export type Routes = Map<string, [number, Connection[]]>;

/**
 * Returns the route string for a route from one station to another.
 * The format for a route is "code\`code", e.g. "N-SVW\`N-SXG", with a
 * backtick separating the two codes.
 * @param from The starting station
 * @param to The end station
 * @returns The route string
 */
export function routeStr(from: string, to: string): string {
	return `${from}\`${to}`;
}

/**
 * Generates all optimal routes between all pairs of stations in a Network.
 * The format for a route is "code\`code", e.g. "N-SVW\`N-XSG", with a
 * backtick separating the two codes.
 * @param network The network to generate routes for
 * @returns A map of routes.
 */
export function generateRoutes(network: Network): Routes {
	// Algorithm is Floyd–Warshall with path reconstruction
	const routes: Routes = new Map();
	const dist: Map<string, number> = new Map();
	const prev: Map<string, ([string, Connection] | null)> = new Map();
	network.stations.forEach((_, i) => {
		network.stations.forEach((_, j) => {
			const route = routeStr(i, j);
			dist.set(route, Infinity);
			prev.set(route, null);
		});
	});
	network.stations.forEach((station, stationCode) => {
		for (const conn of station.connections) {
			const route = routeStr(stationCode, conn.code);
			dist.set(route, conn.cost);
			prev.set(route, [stationCode, conn]);
		}
	});
	network.stations.forEach((_, k) => {
		network.stations.forEach((_, i) => {
			network.stations.forEach((_, j) => {
				const ij = routeStr(i, j);
				const ik = routeStr(i, k);
				const kj = routeStr(k, j);
				if ((dist.get(ij) ?? Infinity) > (dist.get(ik) ?? Infinity) + (dist.get(kj) ?? Infinity)) {
					dist.set(ij, (dist.get(ik) ?? Infinity) + (dist.get(kj) ?? Infinity));
					prev.set(ij, prev.get(kj) ?? null);
				}
			});
		});
	});
	network.stations.forEach((_, startStationCode) => {
		network.stations.forEach((_, endStationCode) => {
			const route = routeStr(startStationCode, endStationCode);
			if (prev.get(route) !== null) {
				let currEndCode = endStationCode;
				let path = [];
				while (startStationCode != currEndCode) {
					const newPrev = prev.get(routeStr(startStationCode, currEndCode)) ?? null;
					if (newPrev === null) {
						return;
					}
					const [newEndCode, conn] = newPrev;
					currEndCode = newEndCode;
					path.unshift(conn);
				}
				routes.set(route, [path.reduce((sum, i) => sum + i.cost, 0), path]);
			}
		});
	});
	return routes;
}