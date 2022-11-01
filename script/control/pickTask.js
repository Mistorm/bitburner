import * as portLib from "./script/control/portLib.js";

/** @param {NS} ns */
export async function main(ns) {

	var files = ["/script/control/hackSlave.js",
		"/script/control/growSlave.js",
		"/script/control/weakenSlave.js"];

	ns.disableLog("ALL");

	var taskPort = portLib.getTaskPort(ns);
	var targetPort = portLib.getTargetPort(ns);
	var host = ns.getHostname()

	while (true) {
		var target = targetPort.peek();;
		while (target == "NULL PORT DATA") {
			ns.toast(ns.sprintf("%1$s can't read target from port. Sleeping!", host));
			await ns.sleep(1000);
			target = targetPort.peek();;
			continue;
		}

		var task = taskPort.read();

		var script = "";
		if (portLib.isTaskWeaken(task)) {
			script = files[2];
		} else if (portLib.isTaskGrow(task)) {
			script = files[1];
		} else if (portLib.isTaskHack(task)) {
			script = files[0];
		}

		if ("" == script) {
			//No task yet..
			await ns.sleep(500);
			continue;
		}

		if (!ns.fileExists(script)) {
			ns.tprint("Can't find script!");
		}

		//Calculate script properties
		var ramTotal = ns.getServerMaxRam(host);
		var ramUsed = ns.getServerUsedRam(host);
		//ns.tprintf("RAM total: %1$i, RAM used: %2$i", ramTotal, ramUsed);
		
		var ramAvailble = ramTotal - ramUsed;
		var ramPerThread = ns.getScriptRam(script, host);
		var numOfThreads = Math.floor(ramAvailble / ramPerThread)
		//ns.tprintf("RAM Availble: %1$i, RAM per thread: %2$i", ramAvailble, ramPerThread);
		

		if (numOfThreads > 0) {
			//ns.tprintf("Running %1$s with %2$i threads.", script, numOfThreads);
			ns.run(script, numOfThreads);
		}else{
			ns.tprintf("%1$s can't run scripts: not enough RAM!", host);
			ns.exit();
		}

		while (ns.isRunning(script, host)) {
			await ns.sleep(1000);
		}
	}
}