import { scan } from "./script/auto/autoLib.js";

const BRUTESSH = "brutessh.exe";
const FTPCRACK = "FTPCrack.exe";
const RELAYSMTP = "relaySMTP.exe";
const HTTPWORM = "HTTPWorm.exe";
const SQLINJECT = "SQLInject.exe";
const TOOLS = [BRUTESSH, FTPCRACK, RELAYSMTP, HTTPWORM, SQLINJECT];

/** @param {NS} ns */
export async function main(ns) {
	ns.tprint("---- Autohacker ----");
	let hosts = scan(ns, ns.getHostname(), new Array());
	hosts.forEach(function (host) {
		analyze(ns, host);
	})
	ns.tprint("---- Done! ----");
}

/** @param {NS} ns */
function analyze(ns, host) {
	ns.printf("Analyzing %1$s...", host);
	var root = ns.hasRootAccess(host);
	if (!root) {
		{
			if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(host)) {
				var portOpenRequired = ns.getServerNumPortsRequired(host);
				if (canOpenPorts(ns, portOpenRequired)) {
					hack(ns, host);
				} else {
					ns.printf("Open needed: %1$d, can I open: %2$t", portOpenRequired, canOpenPorts(ns, portOpenRequired));
				}
			} else {
				ns.printf("Hacking level needed: %1$d, got: %2$d", ns.getServerRequiredHackingLevel(host), ns.getHackingLevel());
			}
		}
	} else {
		ns.printf("Already root, no action needed.");
	}
}

/** @param {NS} ns */
function canOpenPorts(ns, count) {
	let canOpen = 0;

	TOOLS.forEach(function (tool) {
		if (ns.fileExists(tool)) {
			canOpen++;
		}
	})

	return canOpen >= count;
}

/** @param {NS} ns */
function hack(ns, host) {
	if (ns.fileExists(BRUTESSH)) {
		ns.brutessh(host);
	}

	if (ns.fileExists(FTPCRACK)) {
		ns.ftpcrack(host);
	}

	if (ns.fileExists(RELAYSMTP)) {
		ns.relaysmtp(host);
	}

	if (ns.fileExists(HTTPWORM)) {
		ns.httpworm(host);
	}

	if (ns.fileExists(SQLINJECT)) {
		ns.sqlinject(host);
	}

	ns.tprintf("Nuking %1$s!", host);
	ns.nuke(host);
}