import { Worker, Constants } from "/smarthack/smartLib.js";

/** @param {NS} ns */
export async function main(ns) {
	ns.tprint("WorkerFinder.findWorkers() would currently return this:");
	ns.tprint(findWorkers(ns));
}

/** @param {NS} ns */
export function findWorkers(ns) {
	let workers = [];
	let hosts = findSuitableHosts(ns);
	let futureWorkers = identifyFutureWorkersFromHosts(ns, hosts);
	workers = constructWorkerFromHosts(ns, futureWorkers);
	return workers;
}

/** @param {NS} ns */
function scan(ns, host, visitedHosts) {
	if (!visitedHosts.includes(host)) {
		var servers = ns.scan(host);
		visitedHosts.push(host);
		servers.forEach(function (value, index, array) {
			scan(ns, value, visitedHosts);
		})
	}

	return visitedHosts;
}

/** @param {NS} ns */
function findSuitableHosts(ns) {
	let hosts = scan(ns, ns.getHostname(), new Array());
	return hosts.filter(host =>
		//host != "home" &&
		ns.hasRootAccess(host) &&
		ns.getServerMaxRam(host) >= 2
	);
}

/** @param {NS} ns */
function identifyFutureWorkersFromHosts(ns, hosts) {
	return hosts.filter(host => {
		let allScriptsAvailable;
		for (const script of Constants.allWorkerScripts.values()) {
			allScriptsAvailable = ns.fileExists(script, host);
			if (allScriptsAvailable == false) {
				return false;
			}
		}
		return true;
	});
}

/** @param {NS} ns */
function constructWorkerFromHosts(ns, hosts) {
	return hosts
		.map(h => constructWorkerFromHost(ns, h))
		.filter(w => w.ramAvailble >= getMinimunFreeRamNeeded(ns, w.host));
}

/** @param {NS} ns */
export function constructWorkerFromHost(ns, host) {
	let svr = ns.getServer(host);
	return new Worker(host, svr.cpuCores, svr.maxRam, svr.ramUsed);
}

/** @param {NS} ns */
function getMinimunFreeRamNeeded(ns, host) {
	let freeRamNeeded = 0;
	for (const script of Constants.executableWorkerScripts.values()) {
		const ram = ns.getScriptRam(script, host);
		freeRamNeeded = (freeRamNeeded < ram) ? ram : freeRamNeeded;
	}
	return freeRamNeeded;
}