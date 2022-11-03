import { Constants } from "/smarthack/smartLib.js";

/** @param {NS} ns */
export async function main(ns) {
	let hosts = findSuitableHosts(ns);
	ns.tprint("-> Hosts selected: " + hosts);

	for (const host of hosts.values()) {
		await deploy(ns, host);
		//startWorker(ns, host);
	}
}

/** @param {NS} ns */
function findSuitableHosts(ns) {
	//TODO: I'm sure we want to remove the RAM filter in the future! 
	let hosts = scan(ns, ns.getHostname(), new Array());
	return hosts.filter(host =>
		host != "home" &&
		ns.hasRootAccess(host) &&
		ns.getServerMaxRam(host) >= 2
	);
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
async function deploy(ns, host) {
	ns.killall(host);
	let success = await ns.scp(Constants.allWorkerScripts, "home", host);
	if (!success) {
		ns.tprintf("-> SCP failed for $s", host);
	}
}

/** @param {NS} ns */
function startWorker(ns, host) {
	let pid = ns.exec(Constants.workerScript, host, 1);
	if (0 == pid) {
		ns.tprintf("-> Starting script on $s failed!", host);
	} else {
		ns.tprintf("-> Script started on %1$s", host);
	}
}