import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

// ============================================================================
// CURL TOOL SCHEMAS AND FUNCTIONS
// ============================================================================

// Define schema for curl request options
const CurlOptionsSchema = z.object({
	url: z.string().url().describe("The URL to make the request to"),
	method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
		.default('GET')
		.describe("HTTP method to use"),
	headers: z.record(z.string())
		.optional()
		.describe("HTTP headers to include in the request"),
	body: z.union([z.string(), z.record(z.any()), z.array(z.any())])
		.optional()
		.transform((val) => {
			// If it's already a string, return as-is
			if (typeof val === 'string') return val
			// If it's an object or array, stringify it
			if (val !== undefined) return JSON.stringify(val)
			return undefined
		})
		.describe("Request body (string, object, or array). Objects/arrays will be automatically JSON-stringified"),
	timeout: z.number()
		.min(0)
		.max(300000)
		.default(30000)
		.describe("Request timeout in milliseconds (max 300000ms/5min)")
})

// Optional: Configuration schema for user-level settings
export const configSchema = z.object({
	debug: z.boolean().default(false).describe("Enable debug logging"),
})

// Core curl request function
async function makeCurlRequest(
	options: z.infer<typeof CurlOptionsSchema>,
	debug: boolean = false
) {
	const { url, method, headers, body, timeout } = options
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), timeout)

	try {
		if (debug) {
			console.error(`[DEBUG] Making ${method} request to ${url}`)
		}

		const response = await fetch(url, {
			method,
			headers: {
				...headers,
				'User-Agent': 'mcp-helper-toolset/curl-server'
			},
			body: body,
			signal: controller.signal
		})

		const responseBody = await response.text()
		const responseHeaders: Record<string, string> = {}
		response.headers.forEach((value, key) => {
			responseHeaders[key] = value
		})

		return {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
			body: responseBody
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				throw new Error(`Request timed out after ${timeout}ms`)
			}
			throw new Error(`Curl request failed: ${error.message}`)
		}
		throw error
	} finally {
		clearTimeout(timeoutId)
	}
}

// ============================================================================
// CURRENCY CONVERSION SCHEMAS AND FUNCTIONS
// ============================================================================

const FRANKFURTER_API_BASE = "https://api.frankfurter.app"

// Schema for convert_currency tool
const ConvertCurrencySchema = z.object({
	from: z.string().length(3).describe("Source currency code (3-letter ISO format, e.g., USD)"),
	to: z.string().length(3).describe("Target currency code (3-letter ISO format, e.g., EUR)"),
	amount: z.number().positive().describe("Amount to convert (must be positive)")
})

// Schema for get_latest_rates tool
const GetLatestRatesSchema = z.object({
	base: z.string().length(3).optional().describe("Base currency code (default: EUR)"),
	symbols: z.string().optional().describe("Comma-separated list of target currency codes (e.g., USD,GBP,JPY)")
})

// Schema for get_historical_rates tool
const GetHistoricalRatesSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Date in YYYY-MM-DD format"),
	base: z.string().length(3).optional().describe("Base currency code (default: EUR)"),
	symbols: z.string().optional().describe("Comma-separated list of target currency codes")
})

// Currency conversion function
async function convertCurrency(
	options: z.infer<typeof ConvertCurrencySchema>,
	debug: boolean = false
) {
	const { from, to, amount } = options
	const url = `${FRANKFURTER_API_BASE}/latest?from=${from}&to=${to}&amount=${amount}`

	if (debug) {
		console.error(`[DEBUG] Converting ${amount} ${from} to ${to}`)
	}

	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Currency conversion failed: ${response.statusText}`)
	}

	const data = await response.json()
	return {
		from,
		to,
		amount,
		converted: data.rates[to],
		rate: data.rates[to] / amount,
		date: data.date
	}
}

// Get latest exchange rates
async function getLatestRates(
	options: z.infer<typeof GetLatestRatesSchema>,
	debug: boolean = false
) {
	const { base, symbols } = options
	let url = `${FRANKFURTER_API_BASE}/latest`
	const params = new URLSearchParams()

	if (base) params.append('from', base)
	if (symbols) params.append('to', symbols)

	if (params.toString()) url += `?${params.toString()}`

	if (debug) {
		console.error(`[DEBUG] Fetching latest rates for ${base || 'EUR'}`)
	}

	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Failed to fetch rates: ${response.statusText}`)
	}

	return await response.json()
}

// Get all supported currencies
async function getCurrencies(debug: boolean = false) {
	const url = `${FRANKFURTER_API_BASE}/currencies`

	if (debug) {
		console.error(`[DEBUG] Fetching supported currencies`)
	}

	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Failed to fetch currencies: ${response.statusText}`)
	}

	return await response.json()
}

// Get historical exchange rates
async function getHistoricalRates(
	options: z.infer<typeof GetHistoricalRatesSchema>,
	debug: boolean = false
) {
	const { date, base, symbols } = options
	let url = `${FRANKFURTER_API_BASE}/${date}`
	const params = new URLSearchParams()

	if (base) params.append('from', base)
	if (symbols) params.append('to', symbols)

	if (params.toString()) url += `?${params.toString()}`

	if (debug) {
		console.error(`[DEBUG] Fetching historical rates for ${date}`)
	}

	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Failed to fetch historical rates: ${response.statusText}`)
	}

	return await response.json()
}

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

export default function createServer({
	config,
}: {
	config: z.infer<typeof configSchema>
}) {
	const server = new McpServer({
		name: "HTTP & Currency MCP Server",
		version: "1.0.0",
	})

	// ========================================================================
	// Register the curl tool
	// ========================================================================
	server.registerTool(
		"curl",
		{
			title: "HTTP Request Tool",
			description: "Make an HTTP request to any URL with customizable method, headers, and body. Supports GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS methods.",
			inputSchema: {
				url: CurlOptionsSchema.shape.url,
				method: CurlOptionsSchema.shape.method,
				headers: CurlOptionsSchema.shape.headers,
				body: CurlOptionsSchema.shape.body,
				timeout: CurlOptionsSchema.shape.timeout,
			},
		},
		async (args) => {
			const validatedArgs = CurlOptionsSchema.parse(args)
			const result = await makeCurlRequest(validatedArgs, config.debug)

			return {
				content: [{
					type: "text",
					text: JSON.stringify(result, null, 2)
				}]
			}
		}
	)

	// ========================================================================
	// Register the currency conversion tools
	// ========================================================================

	// 1. Convert Currency
	server.registerTool(
		"convert_currency",
		{
			title: "Convert Currency",
			description: "Convert an amount from one currency to another using real-time exchange rates",
			inputSchema: {
				from: ConvertCurrencySchema.shape.from,
				to: ConvertCurrencySchema.shape.to,
				amount: ConvertCurrencySchema.shape.amount,
			},
		},
		async (args) => {
			const validatedArgs = ConvertCurrencySchema.parse(args)
			const result = await convertCurrency(validatedArgs, config.debug)

			return {
				content: [{
					type: "text",
					text: JSON.stringify(result, null, 2)
				}]
			}
		}
	)

	// 2. Get Latest Rates
	server.registerTool(
		"get_latest_rates",
		{
			title: "Get Latest Exchange Rates",
			description: "Get current exchange rates for all or specific currencies",
			inputSchema: {
				base: GetLatestRatesSchema.shape.base,
				symbols: GetLatestRatesSchema.shape.symbols,
			},
		},
		async (args) => {
			const validatedArgs = GetLatestRatesSchema.parse(args)
			const result = await getLatestRates(validatedArgs, config.debug)

			return {
				content: [{
					type: "text",
					text: JSON.stringify(result, null, 2)
				}]
			}
		}
	)

	// 3. Get Currencies
	server.registerTool(
		"get_currencies",
		{
			title: "Get Supported Currencies",
			description: "Get a list of all supported currency codes and their full names",
			inputSchema: {},
		},
		async () => {
			const result = await getCurrencies(config.debug)

			return {
				content: [{
					type: "text",
					text: JSON.stringify(result, null, 2)
				}]
			}
		}
	)

	// 4. Get Historical Rates
	server.registerTool(
		"get_historical_rates",
		{
			title: "Get Historical Exchange Rates",
			description: "Get exchange rates for a specific date in the past",
			inputSchema: {
				date: GetHistoricalRatesSchema.shape.date,
				base: GetHistoricalRatesSchema.shape.base,
				symbols: GetHistoricalRatesSchema.shape.symbols,
			},
		},
		async (args) => {
			const validatedArgs = GetHistoricalRatesSchema.parse(args)
			const result = await getHistoricalRates(validatedArgs, config.debug)

			return {
				content: [{
					type: "text",
					text: JSON.stringify(result, null, 2)
				}]
			}
		}
	)

	return server.server
}
