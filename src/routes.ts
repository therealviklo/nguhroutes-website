import { getEl } from './utils.ts';

let routes: Record<string, any> | null = null;
let routesData: Record<string, any> = {};

function loadRoutes(path: string, name: string) {
	const loading = getEl("loading");
	const searcher = getEl("searcher");
	if (!routesData[name]) {
		loading.hidden = false;
		searcher.hidden = true;
		fetch(path)
			.then(response => response.json())
			.then(data => {
				routesData[name] = data;
				routes = routesData[name];
				loading.hidden = true;
				searcher.hidden = false;
			})
			.catch(error => {
				console.error('Error loading routes JSON:', error);
				getEl("loading-text").innerText = "An error occured while loading.";
			});
	} else {
		routes = routesData[name];
	}
}

export function setRoutes(noNether: boolean) {
	routes = null;
	getEl("route").innerText = "";
	if (noNether) {
		loadRoutes("./gen/json/routes_no_nether.json", "noNether");
	} else {
		loadRoutes("./gen/json/routes.json", "standard");
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
		output.innerText = "Please enter a start station";
		return;
	}
	const endStation = (getEl("end-station") as HTMLInputElement).value.trim().toUpperCase();
	if (!endStation) {
		output.innerText = "Please enter an end station";
		return;
	}
	const route = routes["routes"][`${startStation}\`${endStation}`];
	if (!route) {
		output.innerText = `Could not find a route between "${startStation}" and "${endStation}"`;
		return;
	}
	let routeStr = `${startStation} (Start)`;
	let line = "Unknown line";
	for (const stop of route) {
		let code;
		if (Array.isArray(stop)) {
			code = stop[0];
			line = stop[1];
		} else {
			code = stop;
		}
		routeStr += "<br>";
		routeStr += `${code} (${line})`;
	}
	output.innerHTML = routeStr;
}