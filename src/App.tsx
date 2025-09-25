import { type ChangeEvent, type ChangeEventHandler, type ReactNode } from 'react'
import { setRoutes, findRoute } from './routes.ts';

function NavLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<a className="navlink" href={href}>{children}</a>
	);
}

function Navbar() {
	return (
		<nav className="navbar">
			<h1 className="logo-title">NguhRoutes</h1>
			<NavLink href="https://github.com/therealviklo/nguhroutes/blob/main/src/json/network.jsonc">Network data</NavLink>
			<NavLink href="./json/routes.json">Route data</NavLink>
			<NavLink href="./json/routes_no_nether.json">Route data (no Nether)</NavLink>
		</nav>
	);
}

function LabelledInput({ name, placeholder, children, onChange, autoComplete }: { name: string, placeholder?: string, children: ReactNode, onChange?: ChangeEventHandler<HTMLInputElement>, autoComplete?: string }) {
	return (
		<div className="labelled-input">
			<label htmlFor={name}>{children}</label>
			<br />
			<input type="text" id={name} name={name} placeholder={placeholder ?? ""} onChange={onChange} autoComplete={autoComplete ?? "on"} />
		</div>
	);
}

export function App() {
	return (
		<>
			<Navbar />
			<main>
				<div id="left-bar">
					<div>
						<input type="checkbox" id="no-nether-checkbox" name="no-nether-checkbox" onChange={e => setRoutes(e.target.checked)} />
						<label htmlFor="no-nether-checkbox">No Nether</label>
					</div>
					<div id="loading"><p id="loading-text">Loading...</p></div>
					<div id="searcher" hidden>
						<LabelledInput name="start-station" placeholder="MZS" onChange={findRoute} autoComplete="off">Start Station</LabelledInput>
						<LabelledInput name="end-station" placeholder="SXG" onChange={findRoute} autoComplete="off">End Station</LabelledInput>
					</div>
					<footer id="footer">
						Rail line route planner for Nguhcraft (very WIP). Currently supports most of the stuff that is on SQ's map.
						See the <a href="https://github.com/therealviklo/nguhroutes">Github page</a> for more information.
					</footer>
				</div>
				<div id="right-bar">
					<span id="route"></span>
				</div>
			</main>
		</>
	);
}