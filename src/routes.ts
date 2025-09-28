import * as network from './network.ts';
import * as imp from './import.ts';
import { getEl } from './utils.ts';

let routes: Record<string, any> | null = null;
let routesData: Record<string, any> = {};
let net: network.Network | null = null;
let loaded: Record<string, boolean> = { "routes": false, "net": false };

function setLoaded(id: string, val: boolean) {
	loaded[id] = val;
	const loading = getEl("loading");
	const searcher = getEl("searcher");
	if (val) {
		if (Object.values(loaded).every(Boolean)) {
			loading.hidden = true;
			searcher.hidden = false;
		}
	} else {
		loading.hidden = false;
		searcher.hidden = true;
	}
}

function loadRoutes(path: string, name: string) {
	if (!routesData[name]) {
		setLoaded("routes", false);
		fetch(path)
			.then(response => response.json())
			.then(data => {
				routesData[name] = data;
				routes = routesData[name];
				setLoaded("routes", true);
				findRoute();
			})
			.catch(error => {
				console.error('Error loading routes JSON:', error);
				getEl("loading-text").innerText = "An error occured while loading.";
			});
	} else {
		routes = routesData[name];
		findRoute();
	}
}

function loadNetwork() {
	fetch("./json/network.json")
		.then(response => response.json())
		.then(data => {
			[net] = imp.parseNetwork(data, false);
			setLoaded("net", true);
		})
		.catch(error => {
			console.error('Error loading network JSON:', error);
			getEl("loading-text").innerText = "An error occured while loading.";
		});
}

export function setRoutes(noNether: boolean) {
	routes = null;
	getEl("route").innerText = "";
	if (noNether) {
		loadRoutes("./json/routes_no_nether.json", "noNether");
	} else {
		loadRoutes("./json/routes.json", "standard");
	}
}

export function findRoute() {
	if (!routes) {
		console.error("Cannot find route because routes have not been loaded yet");
		return;
	}
	const output = getEl("route");
	const startStation = (getEl("start-station") as HTMLInputElement).value.trim().toUpperCase();
	if (!startStation) {
		// output.innerText = "Please enter a start station";
		return;
	}
	const endStation = (getEl("end-station") as HTMLInputElement).value.trim().toUpperCase();
	if (!endStation) {
		// output.innerText = "Please enter an end station";
		return;
	}
	const route = routes["routes"][`${startStation}\`${endStation}`];
	if (!route) {
		output.innerText = `Could not find a route between "${startStation}" and "${endStation}"`;
		return;
	}
	const [, stops] = route;
	let routeStr = `${startStation} (Start)`;
	let line = "Unknown line";
	for (const stop of stops) {
		let code;
		if (Array.isArray(stop)) {
			code = stop[0];
			line = net?.lines.get(stop[1]) ?? stop[1];
		} else {
			code = stop;
		}
		routeStr += "<br>";
		routeStr += `${code} (${line})`;
	}
	output.innerHTML = routeStr;
}