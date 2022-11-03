//Don't use these constants directly but always use the Constants class!
const WEAKEN = "weaken";
const GROW = "grow";
const HACK = "hack";

const WEAKEN_SCRIPT = "/smarthack/weaken.js";
const GROW_SCRIPT = "/smarthack/grow.js";
const HACK_SCRIPT = "/smarthack/hack.js";
const LIB_SCRIPT = "/smarthack/smartLib.js";
const WORKER_SCRIPT = "/smarthack/worker.js";

const AVAILABLE_WORKER_PORT_NR = 3;

/** @param {NS} ns */
export async function main(ns) {
	//Just some test code. Don't mind it much.
	let workerJson = "NULL PORT DATA";
	let portHandle = getAvailableWorkerPortHandle(ns);

	while ("NULL PORT DATA" == workerJson) {
		workerJson = portHandle.peek()
		if ("NULL PORT DATA" == workerJson) {
			await ns.sleep(5000);
		}
	}

	let w = buildWorkerFromJson(ns, workerJson);
	ns.tprintf("----------> %j", w);
	ns.tprint(w.ramAvailble);
	ns.tprintf("Worker port: %i", Constants.availableWorkerPortNr);
	ns.tprint(Constants.allWorkerScripts);
}

/** @param {NS} ns */
export function getAvailableWorkerPortHandle(ns) {
	return ns.getPortHandle(AVAILABLE_WORKER_PORT_NR);
}

export class Worker {
	host = "";
	cores = 1;
	ram = 0;
	ramUsed = 0;
	constructor(host, cores, ram, ramUsed) {
		this.host = host;
		this.cores = cores;
		this.ram = ram;
		this.ramUsed = ramUsed;
	}
	get ramAvailble() {
		return this.ram - this.ramUsed;
	}
}

/** @param {NS} ns */
export function buildWorkerFromJson(ns, json) {
	let obj = JSON.parse(json);
	let svr = ns.getServer(obj.host);

	return new Worker(obj.host, svr.cpuCores, svr.maxRam, svr.ramUsed);
}

export class Constants {
	static get availableWorkerPortNr() {
		return AVAILABLE_WORKER_PORT_NR;
	}
	static get weaken() {
		return WEAKEN;
	}
	static get grow() {
		return GROW;
	}
	static get hack() {
		return HACK;
	}
	static get weakenScript() {
		return WEAKEN_SCRIPT;
	}
	static get growScript() {
		return GROW_SCRIPT;
	}
	static get hackScript() {
		return HACK_SCRIPT;
	}
	static get libScript() {
		return LIB_SCRIPT;
	}
	static get workerScript() {
		return WORKER_SCRIPT;
	}
	static get allWorkerScripts() {
		return [
			WEAKEN_SCRIPT,
			GROW_SCRIPT,
			HACK_SCRIPT,
			LIB_SCRIPT,
			WORKER_SCRIPT
		];
	}
	static get executableWorkerScripts(){
		return [
			WEAKEN_SCRIPT,
			GROW_SCRIPT,
			HACK_SCRIPT
		];
	}
}