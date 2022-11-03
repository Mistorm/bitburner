import { anounce } from "/smarthack/worker.js";

/** @param {NS} ns */
export async function main(ns) {
	let task = ns.args[0];
	if (null != task) {
		task = JSON.parse(task);
		await ns.grow(task.target);
	}
	//await anounce(ns);
}