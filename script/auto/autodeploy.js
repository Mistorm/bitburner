import { scan } from "script/auto/autoLib";

const filesToDeploy = [
	"/script/control/growSlave.js",
	"/script/control/hackSlave.js",
	"/script/control/weakenSlave.js",
	"/script/control/pickTask.js",
	"/script/control/portLib.js"
];

/** @param {NS} ns */
export async function main(ns) {

	ns.tprint("---- Autodeploy ----");

	let targetHosts = new Array();
	let target = ns.args[0];

	if (null != target) {
		targetHosts.push(target);
	} else {
		let hosts = scan(ns, ns.getHostname(), new Array());
		targetHosts = hosts.filter(host => ns.hasRootAccess(host));

		if(targetHosts.includes("home")){
			targetHosts = targetHosts.filter(host => "home" != host);
		}
	}

	ns.tprintf("Targets: %1$s", targetHosts);

	for (const host of targetHosts.values()) {
		ns.tprintf("Target: %1$s", host);
		await process(ns, host);
	}

	ns.tprint("---- Done! ----");
}

/** @param {NS} ns */
async function process(ns, host) {

	//Stop all current processes, freeing up ram!
	ns.killall(host);

	//Deploy
	let result = await ns.scp(filesToDeploy, "home", host);
	ns.tprintf("--- Transfer of files successful: %1$t", result);
	
	//Start
	let pid = ns.exec("/script/control/pickTask.js", host, 1);
	if (0 == pid) {
		ns.tprintf("Starting script remotely failed!");
	}else{
		ns.tprintf("--- Script started on %1$s", host);
	}
}