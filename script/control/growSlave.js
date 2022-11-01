import * as portLib from "./script/control/portLib.js";

/** @param {NS} ns */
export async function main(ns) {

	var targetPort = portLib.getTargetPort(ns);
	var target = targetPort.peek();

	//Can't do much without a target
	while (target == "NULL PORT DATA") {
		ns.toast(ns.sprintf("%1$s can't read target from port. Sleeping!", host));
		target = targetPort.peek();
		await ns.sleep(1000);
	}

	await ns.grow(target);
}

async function grow(ns) {

	ns.disableLog("ALL");

	var taskPort = portLib.getTaskPort(ns);
	var targetPort = portLib.getTargetPort(ns);
	//var host = ns.getHostname()

	while (true) {
		var target = targetPort.peek();;

		//Can't do much without a target
		if (target == "NULL PORT DATA") {
			//ns.print(ns.sprintf("%1$s can't read target from port. Sleeping!", host));
			await ns.sleep(1000);
			continue;
		}

		var task = taskPort.peek();

		if (portLib.isTaskGrow(task)) {
			taskPort.read();
			//ns.print(ns.sprintf("%1$s growing %2$s", host, target));
			await ns.grow(target);
		} else {
			ns.print("No need to grow, sleeping...");
			await ns.sleep(1000);
		}

		ns.clearLog();
	}
}