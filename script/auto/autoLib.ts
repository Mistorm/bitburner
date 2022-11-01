/** @param {NS} ns */
export function scan(ns, host, visitedHosts) {

	if (!visitedHosts.includes(host)) {
		var servers = ns.scan(host);
		visitedHosts.push(host);
		servers.forEach(function (value, index, array) {
			scan(ns, value, visitedHosts);
		})
	}

	return visitedHosts;
}