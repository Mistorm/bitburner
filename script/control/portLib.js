export const targetPort = 1;
export const taskPort = 2;
export const taskWeaken = "wk";
export const taskGrow = "gr";
export const taskHack = "hc";

/** @param {NS} ns */
export function getTargetPort(ns) {
	return ns.getPortHandle(targetPort);
}

/** @param {NS} ns */
export function getTaskPort(ns) {
	return ns.getPortHandle(taskPort);
}

/** @param {NS} ns */
export function isTaskWeaken(task){
	return taskWeaken == task;
}

/** @param {NS} ns */
export function isTaskGrow(task){
	return taskGrow == task;
}

/** @param {NS} ns */
export function isTaskHack(task){
	return taskHack == task;
}