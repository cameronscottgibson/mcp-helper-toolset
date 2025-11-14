# Curl MCP Server - Test Cases

This document contains test cases for validating the curl MCP server functionality.

## Test Case 1: Simple GET Request

**Purpose**: Verify basic GET request functionality

**Input**:
```json
{
  "url": "https://httpbin.org/get"
}
```

**Expected**:
- Status: 200
- Response includes request details from httpbin

---

## Test Case 2: GET with Query Parameters

**Purpose**: Verify URL with query parameters

**Input**:
```json
{
  "url": "https://httpbin.org/get?foo=bar&test=123"
}
```

**Expected**:
- Status: 200
- Response body includes query parameters in args field

---

## Test Case 3: POST with Object Body (Auto-stringify)

**Purpose**: Verify automatic JSON stringification of object bodies

**Input**:
```json
{
  "url": "https://httpbin.org/post",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }
}
```

**Expected**:
- Status: 200
- Response body.json field contains the posted data
- Body is automatically stringified before sending

---

## Test Case 4: POST with String Body (Pre-stringified)

**Purpose**: Verify that pre-stringified JSON works correctly

**Input**:
```json
{
  "url": "https://httpbin.org/post",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"name\": \"Jane Doe\", \"email\": \"jane@example.com\"}"
}
```

**Expected**:
- Status: 200
- Response body.json field contains the posted data
- Body is passed through as-is

---

## Test Case 5: POST with Array Body

**Purpose**: Verify automatic JSON stringification of array bodies

**Input**:
```json
{
  "url": "https://httpbin.org/post",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": [
    {"id": 1, "name": "Item 1"},
    {"id": 2, "name": "Item 2"}
  ]
}
```

**Expected**:
- Status: 200
- Response body.json field contains the posted array
- Array is automatically stringified

---

## Test Case 6: Custom Headers

**Purpose**: Verify custom header injection

**Input**:
```json
{
  "url": "https://httpbin.org/headers",
  "headers": {
    "X-Custom-Header": "test-value",
    "Authorization": "Bearer fake-token-123"
  }
}
```

**Expected**:
- Status: 200
- Response includes X-Custom-Header and Authorization in headers
- User-Agent is set to 'mcp-helper-toolset/curl-server'

---

## Test Case 7: PUT Request

**Purpose**: Verify PUT method works correctly

**Input**:
```json
{
  "url": "https://httpbin.org/put",
  "method": "PUT",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "id": 123,
    "updated": true
  }
}
```

**Expected**:
- Status: 200
- Response confirms PUT method was used

---

## Test Case 8: DELETE Request

**Purpose**: Verify DELETE method works correctly

**Input**:
```json
{
  "url": "https://httpbin.org/delete",
  "method": "DELETE"
}
```

**Expected**:
- Status: 200
- Response confirms DELETE method was used

---

## Test Case 9: Custom Timeout

**Purpose**: Verify timeout configuration works

**Input**:
```json
{
  "url": "https://httpbin.org/delay/2",
  "timeout": 5000
}
```

**Expected**:
- Status: 200
- Request completes within 5 seconds

---

## Test Case 10: Timeout Exceeded

**Purpose**: Verify timeout error handling

**Input**:
```json
{
  "url": "https://httpbin.org/delay/10",
  "timeout": 2000
}
```

**Expected**:
- Error: "Request timed out after 2000ms"

---

## Test Case 11: Invalid URL

**Purpose**: Verify URL validation

**Input**:
```json
{
  "url": "not-a-valid-url"
}
```

**Expected**:
- Validation error indicating invalid URL format

---

## Test Case 12: Response Headers Capture

**Purpose**: Verify response headers are captured correctly

**Input**:
```json
{
  "url": "https://httpbin.org/response-headers?custom-header=test-value"
}
```

**Expected**:
- Status: 200
- Response.headers object includes custom-header
- Response.headers includes standard headers (content-type, etc.)

---

## Test Case 13: PATCH Request

**Purpose**: Verify PATCH method works correctly

**Input**:
```json
{
  "url": "https://httpbin.org/patch",
  "method": "PATCH",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "field": "updated-value"
  }
}
```

**Expected**:
- Status: 200
- Response confirms PATCH method was used

---

## Test Case 14: HEAD Request

**Purpose**: Verify HEAD method (no body response)

**Input**:
```json
{
  "url": "https://httpbin.org/get",
  "method": "HEAD"
}
```

**Expected**:
- Status: 200
- Response body is empty (HEAD returns no body)
- Headers are present

---

## Test Case 15: OPTIONS Request

**Purpose**: Verify OPTIONS method for CORS preflight

**Input**:
```json
{
  "url": "https://httpbin.org/get",
  "method": "OPTIONS"
}
```

**Expected**:
- Status: 200
- Response includes allowed methods in headers

---

## Test Case 16: Form Data (URL Encoded)

**Purpose**: Verify sending form data as string

**Input**:
```json
{
  "url": "https://httpbin.org/post",
  "method": "POST",
  "headers": {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  "body": "name=John+Doe&email=john%40example.com"
}
```

**Expected**:
- Status: 200
- Response body.form field contains parsed form data

---

## Test Case 17: Plain Text Body

**Purpose**: Verify sending plain text

**Input**:
```json
{
  "url": "https://httpbin.org/post",
  "method": "POST",
  "headers": {
    "Content-Type": "text/plain"
  },
  "body": "This is plain text content"
}
```

**Expected**:
- Status: 200
- Response body.data field contains the plain text

---

## Debug Mode Test

**Purpose**: Verify debug logging when enabled

**Setup**: Enable debug in server config

**Input**:
```json
{
  "url": "https://httpbin.org/get"
}
```

**Expected**:
- Console output includes: `[DEBUG] Making GET request to https://httpbin.org/get`
- Request succeeds normally

---

## Testing with Smithery Playground

1. Start the dev server:
   ```bash
   cd mcp-helper-toolset
   npm run dev
   ```

2. Open the Smithery Playground (should open automatically)

3. Select the "curl" tool

4. Copy and paste test cases from above into the tool parameters

5. Verify the responses match expected outcomes

## Testing with curl (Protocol Level)

```bash
# Initialize connection
curl -X POST "http://127.0.0.1:8081/mcp?debug=true" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"clientInfo":{"name":"test","version":"1.0.0"}}}'

# Send initialized notification
curl -X POST "http://127.0.0.1:8081/mcp?debug=true" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}'

# Test Case 3: POST with Object Body
curl -X POST "http://127.0.0.1:8081/mcp?debug=true" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"curl","arguments":{"url":"https://httpbin.org/post","method":"POST","headers":{"Content-Type":"application/json"},"body":{"name":"John Doe","email":"john@example.com"}}}}'
```
