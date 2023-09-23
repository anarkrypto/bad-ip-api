export default class DNSBLs {
	/*
        Google JSON API for DNS over HTTPS (DoH)
        https://developers.google.com/speed/public-dns/docs/doh/json
    */
	readonly dnsAPI = "https://dns.google/resolve?name=";

	dnsbls: string[];

	constructor(dnsbls: string[]) {
		this.dnsbls = dnsbls;
	}

	async checkRecordExists(name: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.dnsAPI}${name}`);
			const data = await response.json<Record<string, unknown>>();
			return data.Status === 0;
		} catch (error) {
			console.error(`Error checking record ${name}. Details: ${error}`);
			return false;
		}
	}

	async searchByIP(ip: string) {
		const reverseIP = ip.split(".").reverse().join(".");

		const found = await Promise.all(
			this.dnsbls.map(async (dnsbl) => {
				const exists = await this.checkRecordExists(`${reverseIP}.${dnsbl}`);
				return { dnsbl, exists };
			})
		);
		return found
			.filter((result) => result.exists)
			.map((result) => result.dnsbl);
	}
}
