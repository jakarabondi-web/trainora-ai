import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../lib/server/password.ts";

test("verifies a correct password against its own hash", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", hash), true);
});

test("rejects an incorrect password", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword("wrong password", hash), false);
});

test("salts each hash differently even for the same password", async () => {
  const first = await hashPassword("shared-password");
  const second = await hashPassword("shared-password");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("shared-password", first), true);
  assert.equal(await verifyPassword("shared-password", second), true);
});

test("rejects malformed or foreign hash formats", async () => {
  assert.equal(await verifyPassword("anything", "not-a-real-hash"), false);
  assert.equal(await verifyPassword("anything", "bcrypt$10$abc$def"), false);
});
