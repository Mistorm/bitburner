const prefix = 'srv';
const percentageToSpendOnServer = 1.00;
const minRamOfServer = 8;

/** @param {NS} ns */
export async function main(ns) {
	buyServer(ns);
}

/** @param {NS} ns */
function buyServer(ns) {

	let maxPurchasedServerCount = ns.getPurchasedServerLimit();
	if (maxPurchasedServerCount == 0) {
		ns.tprint("Can't buy any more servers! Delete an old one first!");
		ns.exit();
	}

	let ram = determineRam(ns);
	if (ram >= minRamOfServer) {
		let cost = ns.getPurchasedServerCost(ram);
		ns.tprintf("Buying a server with %i GB RAM for %s...", ram, ns.nFormat(cost, "$0,0.00"));

		let newServer = ns.purchaseServer(prefix, ram);

		if ("" == newServer) {
			ns.tprint("There was a problem buying a new server! Exiting script!");
		} else {
			//ns.tprint("Running autodeploy.js!");
			//ns.run("/script/auto/autodeploy.js", 1, newServer);
		}
	}
}

/** @param {NS} ns */
function determineRam(ns) {
	//Loop backward, checking the more expensive servers first
	for (let i = 16; i >= 1; i--) {
		let ram = Math.pow(2, i);
		let cost = ns.getPurchasedServerCost(Math.pow(2, i));

		if (cost <= getMoneyToSpend(ns)) {
			return ram;
		}
	}

	return 0;
}

/** @param {NS} ns */
function getMoneyToSpend(ns) {
	return ns.getPlayer().money * percentageToSpendOnServer;
}