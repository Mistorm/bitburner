import { Worker, getAvailableWorkerPortHandle } from "/smarthack/smartLib.js";

/** @param {NS} ns */
export async function main(ns) {
	await anounce(ns);
}

/** @param {NS} ns */
export async function anounce(ns) {
	let worker = new Worker(ns.getHostname(), null, null, null);

	let beenAnnouced = false;
	while (!beenAnnouced) {
		beenAnnouced = await getAvailableWorkerPortHandle(ns).tryWrite(JSON.stringify(worker));

		if (beenAnnouced) {
			ns.exit();
		} else {
			await ns.sleep(500 + Math.random() * 1000);
		}
	}
}