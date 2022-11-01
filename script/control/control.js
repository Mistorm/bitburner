export const targetPort = 1;
export const taskPort = 2;
export const taskWeaken = "wk";
export const taskGrow = "gr";
export const taskHack = "hc";

/** @param {NS} ns */
export async function main(ns) {
	var host = ns.args[0];
	await control(ns, host);
}
/** @param {NS} ns */

function perpControl(ns) {
	ns.disableLog("ALL");
	ns.clearPort(targetPort);
	ns.clearPort(taskPort);
}

/** @param {NS} ns */
export async function control(ns, host) {

	perpControl(ns);
	await ns.tryWritePort(targetPort, host);

	while (true) {

		var minSec = ns.getServerMinSecurityLevel(host);
		var currentSec = ns.getServerSecurityLevel(host);
		var secLimit = minSec + 5;

		var maxCash = ns.getServerMaxMoney(host);
		var currentCash = ns.getServerMoneyAvailable(host);
		var cashLimit = maxCash * 0.75;

		if (currentSec > secLimit) {
			ns.print("Sec: " + currentSec + " (limit: " + secLimit + "): weaken." );
			await ns.tryWritePort(taskPort, taskWeaken);
		} else {
			if (currentCash < cashLimit) {
				ns.print("Cash: " + currentCash + " (limit: " + cashLimit + "): grow." );
				await ns.tryWritePort(taskPort, taskGrow);
			} else {
				ns.print("Cash: " + currentCash + " (limit: " + cashLimit + "): hack." );
				await ns.tryWritePort(taskPort, taskHack);
			}
		}

		await ns.sleep(2000);
	}
}