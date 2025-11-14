# HTTP & Currency MCP Server

[![smithery badge](https://smithery.ai/badge/@cameronscottgibson/mcp-helper-toolset)](https://smithery.ai/server/@cameronscottgibson/mcp-helper-toolset)

An MCP server that provides two powerful capabilities:
1. **HTTP Requests**: Make HTTP requests to any URL using a curl-like interface
2. **Currency Conversion**: Real-time currency conversion and exchange rate information

Built with [Smithery SDK](https://smithery.ai/docs)

## Features

### HTTP Request Tool
- Make HTTP requests to any URL
- Support for all common HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- Customizable headers and request body
- Configurable timeout (default: 30s, max: 5min)
- Full response information including status, headers, and body

### Currency Conversion Tools
- Convert amounts between 32+ currencies
- Get current exchange rates
- List all supported currencies
- Access historical exchange rates
- Powered by the Frankfurter API

### General
- Optional debug logging
- Type-safe Zod validation

## Prerequisites

- **Smithery API key**: Get yours at [smithery.ai/account/api-keys](https://smithery.ai/account/api-keys)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

The server provides **5 tools** that you can test in the Smithery Playground.

## Tools Documentation

### 1. curl - HTTP Request Tool

Make HTTP requests to any URL with full control over method, headers, and body.

**Parameters**:

- **url** (required, string): The URL to make the request to
- **method** (optional, string): HTTP method to use - GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS (default: GET)
- **headers** (optional, object): Object containing HTTP headers
- **body** (optional, string/object/array): Request body for POST/PUT/PATCH requests. Can be a string, object, or array. Objects and arrays are automatically JSON-stringified
- **timeout** (optional, number): Request timeout in milliseconds (default: 30000, max: 300000)

**Example - Simple GET Request**:

```json
{
  "url": "https://api.example.com/data"
}
```

**Example - POST Request with Headers and Body (Object)**:

```json
{
  "url": "https://api.example.com/users",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timeout": 5000
}
```

**Example - POST Request with Body (String)**:

You can also pass a pre-stringified JSON string:

```json
{
  "url": "https://api.example.com/users",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"name\": \"John Doe\", \"email\": \"john@example.com\"}"
}
```

**Response Format**:

The curl tool returns a JSON object with:

```json
{
  "status": 200,
  "statusText": "OK",
  "headers": {
    "content-type": "application/json",
    "server": "nginx"
  },
  "body": "{\"result\": \"success\"}"
}
```

---

### 2. convert_currency - Currency Conversion Tool

Convert an amount from one currency to another using real-time exchange rates.

**Parameters**:

- **from** (required, string): Source currency code (3-letter ISO format, e.g., USD)
- **to** (required, string): Target currency code (3-letter ISO format, e.g., EUR)
- **amount** (required, number): Amount to convert (must be positive)

**Example**:

```json
{
  "from": "USD",
  "to": "EUR",
  "amount": 100
}
```

**Response Format**:

```json
{
  "from": "USD",
  "to": "EUR",
  "amount": 100,
  "converted": 92.5,
  "rate": 0.925,
  "date": "2025-01-14"
}
```

---

### 3. get_latest_rates - Get Latest Exchange Rates

Get current exchange rates for all or specific currencies.

**Parameters**:

- **base** (optional, string): Base currency code (default: EUR)
- **symbols** (optional, string): Comma-separated list of target currency codes (e.g., USD,GBP,JPY)

**Example - All Rates from USD**:

```json
{
  "base": "USD"
}
```

**Example - Specific Rates**:

```json
{
  "base": "USD",
  "symbols": "EUR,GBP,JPY"
}
```

**Response Format**:

```json
{
  "amount": 1,
  "base": "USD",
  "date": "2025-01-14",
  "rates": {
    "EUR": 0.925,
    "GBP": 0.79,
    "JPY": 149.5
  }
}
```

---

### 4. get_currencies - List Supported Currencies

Get a list of all supported currency codes and their full names. No parameters required.

**Example**:

```json
{}
```

**Response Format**:

```json
{
  "AUD": "Australian Dollar",
  "BGN": "Bulgarian Lev",
  "BRL": "Brazilian Real",
  "CAD": "Canadian Dollar",
  "CHF": "Swiss Franc",
  "CNY": "Chinese Renminbi Yuan",
  "EUR": "Euro",
  "GBP": "British Pound",
  "USD": "United States Dollar",
  ...
}
```

---

### 5. get_historical_rates - Get Historical Exchange Rates

Get exchange rates for a specific date in the past.

**Parameters**:

- **date** (required, string): Date in YYYY-MM-DD format
- **base** (optional, string): Base currency code (default: EUR)
- **symbols** (optional, string): Comma-separated list of target currency codes

**Example**:

```json
{
  "date": "2024-01-01",
  "base": "USD",
  "symbols": "EUR,GBP"
}
```

**Response Format**:

```json
{
  "amount": 1,
  "base": "USD",
  "date": "2024-01-01",
  "rates": {
    "EUR": 0.905,
    "GBP": 0.785
  }
}
```

---

## Configuration

The server supports an optional `debug` configuration parameter that enables verbose logging:

- **debug** (boolean, default: false): Enable debug logging for requests

When deploying to Smithery, users can enable this in their connection settings.

## Development

Your code is organized as:
- `src/index.ts` - MCP server implementation with curl tool
- `smithery.yaml` - Runtime specification

## Build

```bash
npm run build
```

Creates bundled server in `.smithery/`

## Deploy

Ready to deploy? Push your code to GitHub and deploy to Smithery:

1. Create a new repository at [github.com/new](https://github.com/new)

2. Initialize git and push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. Deploy your server to Smithery at [smithery.ai/new](https://smithery.ai/new)

## Learn More

- [Smithery Docs](https://smithery.ai/docs)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Original Curl Server](https://github.com/mcp-get/community-servers/tree/main/src/server-curl)