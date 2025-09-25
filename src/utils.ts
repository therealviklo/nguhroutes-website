export function getEl(id: string): HTMLElement {
	const el = document.getElementById(id);
	if (!el)
		throw Error(`Element #${id} does not exist`);
	return el;
}