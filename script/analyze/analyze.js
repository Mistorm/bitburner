import { scan } from "script/auto/autoLib";

/** @param {NS} ns */
export async function main(ns) {

	const SEPERATOR = ";";
	const hosts = scan(ns, ns.getHostname(), []);

	let statsList = [];

	for (const host of hosts.values()) {
		statsList.push(new ServerStats(ns, host));
	}

	statsList = statsList.filter(stat => stat.getMoneyPerSecond() > 0);
	statsList.sort((a, b) => a.getMoneyForMultithreadedHack() - b.getMoneyForMultithreadedHack());

	for(const stats of statsList) {
		const formattedMoney = ns.nFormat(stats.getMoneyPerSecond(), "($ 0.00 a)");
		const formattedMultiThreadMoney = ns.nFormat(stats.getMoneyForMultithreadedHack(), "($ 0.00 a)");
		//ns.tprint(stats);
		ns.tprintf("%s: %s per second, %s multithreaded (%f est./%f real threads)", 
			stats.host, 
			formattedMoney, 
			formattedMultiThreadMoney, 
			stats.getEstimateThreadsForMultithreadedHack(),
			stats.getHackThreads()
		);
	}
}

class ServerStats {
	#hackPercentage = 0.30;
	#host;
	#maxMoney;

	#minSecLevel;

	#growTime;
	#growthRate;
	#growThreads

	#weakenTime;
	#weakenRate;

	#hackTime;
	#hackResult;
	#hackChance;
	#hackThreads;
	/** @param {NS} ns */
	constructor(ns, host) {
		this.host = host;
		this.minSecLevel = ns.getServerMinSecurityLevel(host);
		this.maxMoney = ns.getServerMaxMoney(host);

		this.hackResult = ns.hackAnalyze(host);
		this.hackThreads = ns.hackAnalyzeThreads(host, (this.maxMoney * 0.3));
		this.hackTime = ns.getHackTime(host);
		this.hackChance = ns.hackAnalyzeChance(host);

		this.weakenTime = ns.getWeakenTime(host);
		this.weakenRate = ns.weakenAnalyze(1);

		this.growTime = ns.getGrowTime(host);
		this.growthRate = ns.getServerGrowth(host);
		this.growThreads = ns.growthAnalyze(host, 1.3);
	}
	getMoneyPerSecond() {
		const moneyPerHack = (this.maxMoney * this.hackResult) * this.hackChance;
		return moneyPerHack / ((this.hackTime + this.growTime + this.weakenTime) / 1000);
	}
	getMoneyForMultithreadedHack(){
		const hackGoal = (this.maxMoney * 0.3) * this.hackChance;
		return hackGoal / ((this.hackTime + this.growTime + this.weakenTime) / 1000);
	}
	getEstimateThreadsForMultithreadedHack(){
		const moneyPerHack = (this.maxMoney * this.hackResult) * this.hackChance;
		const hackGoal = this.maxMoney * 0.3;
		return hackGoal / moneyPerHack;
	}
	getHackThreads(){
		return this.hackThreads;
	}
	getHost(){
		return host;
	}
}