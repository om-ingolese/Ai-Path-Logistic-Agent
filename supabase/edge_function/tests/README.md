# Edge Functions Testing Quick Reference

## Running Specific Test Files

### Using npm scripts
```bash
# Run a specific test file
npm run test:edge-functions:file tests/my-function.test.ts

# Run all tests
npm run test:edge-functions


### Using Deno directly
```bash
# Run a specific test file
deno test --allow-net --allow-env tests/my-function.test.ts

# Run all tests in tests directory
deno test --allow-net --allow-env tests/

# Run tests matching a pattern
deno test --allow-net --allow-env tests/*.test.ts
```

### Using Deno tasks
```bash
# Run a specific test file
deno task test -- tests/my-function.test.ts

# Run all tests
deno task test
```

## Environment Variables Setup

### Option 1: Using .env File (Recommended)
```bash
# Create .env file from template
cp tests/env.example .env

# Edit .env file with your actual values
# The file will be automatically loaded when running tests
```

### Option 2: Export Environment Variables
```bash
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
```

### Environment Variables Loading Order
1. **System environment variables** (exported in shell)
2. **`.env` file** (automatically loaded with `--env-file=.env`)
3. **Code-set variables** (using `Deno.env.set()`)

## Test File Structure

```typescript
import { assertEquals, assertExists } from "../deps.ts"

const FUNCTION_NAME = "your-function-name"

Deno.test("Your Function - Basic Test", async () => {
  // Your test implementation
})
```

## Available Test Files

- `remote-advanced.test.ts` - Advanced remote tests using fetch
- `supabase-client.test.ts` - Tests using Supabase client library
- `my-function.test.ts` - Template for custom function tests

## Creating Edge Functions

To create a new Edge Function:

1. Create a new `.ts` file directly in the `supabase/edge_function/` directory
2. Copy `example-function.ts` as a starting point
3. Implement your function logic
4. Create corresponding test files in the `tests/` directory
