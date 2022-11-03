import { Worker, Constants, buildWorkerFromJson, getAvailableWorkerPortHandle } from "/smarthack/smartLib.js";
import { findWorkers, constructWorkerFromHost } from "/smarthack/WorkerFinder.js";

const PREFERRED_MONEY_AVAILABLE_PERCENTAGE = 0.75;
const PREFERRED_MONEY_HACK_PERCENTAGE = 0.20;
const PREFERRED_MAX_SECURITY_ABOVE_MIN = 5;
const AVAILABLE_WORKER_PORT_NR = 3;

let host;
let hosts;
let tasks;
let workers;
let timestampTaskDone = 0;

/** @param {NS} ns */
export async function main(ns) {

	tasks = [];
	workers = [];
	//host = ns.args[0];
	hosts = ns.args;
	ns.disableLog("ALL");

	if (null == hosts) {
		ns.tprintf("Host parameter required for schedulling!");
		ns.exit();
	}

	while (true) {
		for (const host of hosts.values()) {
			ns.printf("--> Scheduling for %s <--", host);
			await schedule(ns, host);
		}
		await ns.sleep(500);
	}
}

/** @param {NS} ns */
async function schedule(ns, host) {

	while (workers.length <= 2) {
		await ns.sleep(250);
		workers = findWorkers(ns);
	}

	const worker = workers.shift();

	//Check if weaken is needed...
	let minSecurity = ns.getServerMinSecurityLevel(host);
	let currentSecurity = ns.getServerSecurityLevel(host);
	let ifSecurityTooHigh = currentSecurity > (minSecurity + PREFERRED_MAX_SECURITY_ABOVE_MIN);
	let nextTaskIsNotWeaken = !gotNoTasks() && tasks[0].task != Constants.weaken;

	if (nextTaskIsNotWeaken && ifSecurityTooHigh || gotNoTasks() && ifSecurityTooHigh) {
		let requiredSecurityDecrease = currentSecurity - (minSecurity + PREFERRED_MAX_SECURITY_ABOVE_MIN);
		await scheduleWeaken(ns, requiredSecurityDecrease, worker, host);
	}

	if (gotNoTasks()) {

		//Check if grow is needed...
		let curentMoney = ns.getServerMoneyAvailable(host);
		let maxMoney = ns.getServerMaxMoney(host);
		let requiredMoney = maxMoney * PREFERRED_MONEY_AVAILABLE_PERCENTAGE;
		let notEnoughMoney = curentMoney < (maxMoney * PREFERRED_MONEY_AVAILABLE_PERCENTAGE);

		if (notEnoughMoney) {
			await scheduleGrow(ns, curentMoney, requiredMoney, worker, host);
		}

		//All good, we can hack
		if (!ifSecurityTooHigh & !notEnoughMoney) {
			let preferedHackResult = maxMoney * PREFERRED_MONEY_HACK_PERCENTAGE;
			await scheduleHack(ns, preferedHackResult, worker, host);
		}
	}

	await startTask(ns, worker);
}

function gotNoTasks() {
	return tasks.length == 0;
}

/** @param {NS} ns */
async function getAvailableWorker(ns) {
	let workerJson = "NULL PORT DATA";

	while ("NULL PORT DATA" == workerJson) {
		workerJson = ns.readPort(AVAILABLE_WORKER_PORT_NR);
		if ("NULL PORT DATA" == workerJson) {
			//ns.tprint("No worker avaible, sleeping!");
			await ns.sleep(5000);
		}
	}

	return buildWorkerFromJson(ns, workerJson);
}

async function buildTask(worker, target, taskStr, threads, time) {

	let taskObj = {
		worker: worker,
		target: target,
		task: taskStr,
		threads: threads,
		time: time
	};

	return taskObj;
}

/** @param {NS} ns */
async function scheduleWeaken(ns, requiredSecurityDecrease, worker, host) {

	let threadCount = 0;
	let securityDecrease = 0;
	while (securityDecrease < requiredSecurityDecrease) {
		threadCount++;
		securityDecrease = ns.weakenAnalyze(threadCount, worker.cores);
	}
	let weakenTime = ns.getWeakenTime(host);

	ns.printf("Security too high, should weaken with %i threads, will take %s.", threadCount, ns.nFormat(weakenTime, '00:00:00'));

	//Put at bottom of task list
	let task = await buildTask(worker.host, host, Constants.weaken, threadCount, weakenTime);
	tasks.unshift(task);
}

/** @param {NS} ns */
async function scheduleGrow(ns, curentMoney, requiredMoney, worker, host) {

	let maxMoney = ns.getServerMaxMoney(host);
	let preferedHackResult = maxMoney * PREFERRED_MONEY_HACK_PERCENTAGE;
	//Let's assume hack threads are running that haven't finished yet.
	//Make sure current (curentMoney - preferedHackResult) won't be a negative number.
	preferedHackResult = (curentMoney < preferedHackResult) ? 0 : preferedHackResult;
	let growAmount = requiredMoney / (curentMoney - preferedHackResult);

	growAmount = (growAmount < 1) ? 1 : growAmount;
	growAmount = (growAmount > 10000) ? 10000 : growAmount;

	let threadCount = ns.growthAnalyze(host, growAmount, worker.cores);
	let growthTime = ns.getGrowTime(host);
	let securityIncrease = ns.growthAnalyzeSecurity(threadCount);

	threadCount = (threadCount < 1) ? 1 : threadCount;

	ns.printf("Money too low (%s required vs. %s availble), should grow with %i threads for %f, will take %s and increase security be %s",
		ns.nFormat(requiredMoney, '$0,0.00'),
		ns.nFormat(curentMoney, '$0,0.00'),
		threadCount,
		growAmount,
		ns.nFormat(growthTime, '00:00:00'),
		ns.nFormat(securityIncrease, '0.000')
	);

	//Put at bottom of task list
	let task = await buildTask(worker.host, host, Constants.grow, threadCount, growthTime);
	tasks.push(task);
}

/** @param {NS} ns */
async function scheduleHack(ns, preferedHackResult, worker, host) {
	let threadCount = ns.hackAnalyzeThreads(host, preferedHackResult);
	let hackChance = ns.hackAnalyzeChance(host);
	let securityIncrease = ns.hackAnalyzeSecurity(threadCount);
	let hackTime = ns.getHackTime(host);

	threadCount = (threadCount < 1) ? 1 : threadCount;

	ns.printf("OK to hack with %i threads, %s success change, will take %s and increase security be %s"
		, threadCount, ns.nFormat(hackChance, '0.00%'), ns.nFormat(hackTime, '00:00:00'), ns.nFormat(securityIncrease, '0.000'));

	//Put at bottom of task list
	let task = await buildTask(worker.host, host, Constants.hack, threadCount, hackTime);
	tasks.push(task);
}

/** @param {NS} ns */
async function startTask(ns, worker) {

	if (tasks.size == 0) {
		ns.tprint("Can't start a task without tasks!");
		return;
	}

	let currentTask = tasks.shift();

	if (null == currentTask) {
		ns.tprintf("Task is null, this should never happen!");
		return;
	}

	//	if(timestampTaskDone > Date.now() + currentTask.time){
	//		let sleepTime = timestampTaskDone - (Date.now() + currentTask.time);
	//		ns.tprintf("Previous task not done yet, sleeping for %s ms", sleepTime);
	//		await ns.sleep(sleepTime);
	//	}

	let script = "";
	switch (currentTask.task) {
		case Constants.weaken:
			script = Constants.weakenScript;
			break;
		case Constants.grow:
			script = Constants.growScript;
			break;
		case Constants.hack:
			script = Constants.hackScript;
			break;
	}

	if (!ns.fileExists(script, worker.host)) {
		ns.tprintf("Can't start %s on %s: script not found!", script, worker.host);
	}

	let ramPerThread = ns.getScriptRam(script, worker.host);
	let maxThreadsForWorker = Math.floor(worker.ramAvailble / ramPerThread);

	//The task requires less threads then the worker can run
	if (currentTask.threads <= maxThreadsForWorker) {
		//Start the task
		ns.printf("Starting %s on %s with %i threads", script, worker.host, currentTask.threads);

		let threads = currentTask.threads;
		let pid = ns.exec(script, worker.host, threads, JSON.stringify(currentTask));
		if (pid == 0) {
			tasks.push(currentTask);
		}

		//Register when this task is done
		//		timestampTaskDone = Date.now() + currentTask.time;

		//Anounce the worker since it has resources free for more work.
		//let workerToAnounce = new Worker(worker.host, null, null, null);
		if (currentTask.threads < maxThreadsForWorker) {
			ns.printf("Worker can handle %i threads but only %i are needed. Anouncing worker...",
				maxThreadsForWorker, currentTask.threads);

			workers.push(constructWorkerFromHost(ns, worker.host));

			//ns.exec(Constants.workerScript, worker.host, 1);
			//await getAvailableWorkerPortHandle(ns).tryWrite(JSON.stringify(worker));
		}
	}
	//The task requires more threads then the worker can run (only run if the worker can handle at 
	//least one thread!)
	else {
		if (maxThreadsForWorker >= 1) {
			ns.printf("Starting %s on %s with %i threads", script, worker.host, currentTask.threads);
			ns.exec(script, worker.host, maxThreadsForWorker, JSON.stringify(currentTask));
		}

		ns.printf("Calculating threads...");
		currentTask.threads = currentTask.threads - maxThreadsForWorker;
		currentTask.threads = (currentTask.threads < 1) ? 1 : currentTask.threads;

		ns.printf("Rescheduling task %s for %i threads", currentTask.task, currentTask.threads);
		tasks.push(currentTask);
	}
}