import { add } from "./main.ts";

function assertEquals(actual: unknown, expected: unknown): void {
  if (actual !== expected) {
    throw new Error(`Expected ${actual} to strictly equal ${expected}`);
  }
}

Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});
