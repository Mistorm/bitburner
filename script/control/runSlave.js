/** @param {NS} ns */
export async function main(ns) {

	var files = ["/script/control/hackSlave.js",
		"/script/control/growSlave.js",
		"/script/control/weakenSlave.js",
		"/script/control/pickTask.js",
		"/script/control/portLib.js"];

	var host = ns.args[0];
	var script = "/script/control/pickTask.js";

	ns.tprintf(ns.sprintf("Checking if scripts exist on %1$s...", host));
	if (!ns.fileExists(script, host)){
		ns.tprintf("Copying scripts to target...");
		await ns.scp(files, "home", host);
	}

	if (ns.fileExists(script, host)) {
		ns.tprintf(ns.sprintf("Starting %1$s on %2$s...", script, host));
		ns.exec("/script/control/pickTask.js", host, 1);
		ns.tprintf("Done!");
	} else {
		ns.tprintf("Script doesn't exist!");
	}
}