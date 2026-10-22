// Dependencies for Supabase Edge Functions
// This file centralizes all external dependencies

// Standard library imports from JSR
export {
  assertEquals,
  assertExists,
  assertNotEquals,
  assertThrows,
  assertRejects,
  assert,
} from "jsr:@std/assert"

// Supabase client
export { createClient } from "npm:@supabase/supabase-js"