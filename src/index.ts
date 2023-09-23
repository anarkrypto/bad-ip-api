import { Hono } from "hono";
import { blacklists } from "./config";
import DNSBLs from "./dnsbl";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { errorHandler } from "./middlewares";

const app = new Hono();

app.onError(errorHandler)

const querySchema = z.object({
	strategy: z.enum(["full", "quick"]).optional()
}).strict();

app.get("/:ip", zValidator("query", querySchema), async (c) => {
	
	const ip = c.req.param("ip");

	const strategy = c.req.query("strategy");

	const isValidIPv4 =
		ip.split(".").length === 4 &&
		ip
			.split(".")
			.every((octet) => parseInt(octet, 10) >= 0 && parseInt(octet, 10) <= 255);

	if (!isValidIPv4) {
		return c.json({ error: "Invalid IPv4 address" }, 400);
	}

	const responseThreshold = strategy === "quick" ? 1 : blacklists.length;

	const dnsbls = new DNSBLs(blacklists, responseThreshold);

	const results = await dnsbls.searchByIP(ip);

	return c.json({ results });
});

export default app;
