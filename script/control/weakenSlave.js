import * as portLib from "./script/control/portLib.js";

/** @param {NS} ns */
export async function main(ns) {
	await weaken(ns);
}

/** @param {NS} ns */
async function weaken(ns) {

	var targetPort = portLib.getTargetPort(ns);
	var target = targetPort.peek();

	//Can't do much without a target
	while (target == "NULL PORT DATA") {
		ns.toast(ns.sprintf("%1$s can't read target from port. Sleeping!", host));
		target = targetPort.peek();
		await ns.sleep(1000);
	}

	await ns.weaken(target);
}