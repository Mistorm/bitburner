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

	await ns.hack(target);
}

/** @param {NS} ns */
async function hack(ns) {

	ns.disableLog("ALL");

	var taskPort = portLib.getTaskPort(ns);
	var targetPort = portLib.getTargetPort(ns);
	//var host = ns.getHostname()

	while (true) {
		var target = targetPort.peek();;

		//Can't do much without a target
		if (target == "NULL PORT DATA") {
			//ns.toast(ns.sprintf("%1$s can't read target from port. Sleeping!", host));
			await ns.sleep(1000);
			continue;
		}

		var task = taskPort.peek();

		if (portLib.isTaskHack(task)) {
			taskPort.read();
			//ns.print(ns.sprintf("%1$s hacking %2$s", host, target));
			await ns.hack(target);
		} else {
			//ns.print(ns.sprintf("%1$s no need to hack %2$s sleeping...", host, target));
			await ns.sleep(1000);
		}

		ns.clearLog();
	}
}