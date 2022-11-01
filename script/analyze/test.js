/** @param {NS} ns */
export async function main(ns) {
	//ns.alert(ns.toString());
	//debugger;
	//ns.alert(Reflect.ownKeys(ns).toString());
	//ns.alert(Reflect.get(ns, "a"));
	//ns.alert(Reflect.getOwnPropertyDescriptor(ns, "upgradeHomeRam").value.toString());
	//ns.alterReality.toString();
	//ns.alert(typeof Reflect.getOwnPropertyDescriptor(ns, "e"));

	ns.tprint(Object.getPrototypeOf(ns));

	//ns.tprint(Object.getOwnPropertyNames(ns.alert));

	//for (const [key, value] of Object.entries(ns)) {
		//ns.tprint(`${key}: ${value}`);
	//}

	//ns.tprint(ns.contructor);

	//for (const [key, value] of Object.entries(ns)) {
	//ns.tprint(`${key}: ${value}`);
	//}
}