import { Hono } from "hono";
import { blacklists } from "./config";
import DNSBLs from "./dnsbl";

const app = new Hono();

app.get("/:ip", async (c) => {
	const ip = c.req.param("ip");

	const isValidIPv4 =
		ip.split(".").length === 4 &&
		ip
			.split(".")
			.every((octet) => parseInt(octet, 10) >= 0 && parseInt(octet, 10) <= 255);

	if (!isValidIPv4) {
		return c.json({ error: "Invalid IPv4 address" }, 400);
	}

	const dnsbls = new DNSBLs(blacklists);

	const results = await dnsbls.searchByIP(ip);

	return c.json({ results });
});

export default app;
