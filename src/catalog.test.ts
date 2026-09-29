import assert from "node:assert/strict";
import test from "node:test";
import { formatForAgent, getComponent, searchComponents } from "./catalog.js";

test("searches by a prop description", () => {
  assert.deepEqual(searchComponents("валидации").map(({ name }) => name), ["TextField"]);
});

test("gets a component without case sensitivity", () => {
  assert.equal(getComponent("button")?.name, "Button");
});

test("builds compact context with props, rules and examples", () => {
  const component = getComponent("Modal");
  assert.ok(component);
  const context = formatForAgent(component);
  assert.match(context, /## Props/);
  assert.match(context, /## Rules/);
  assert.match(context, /<Modal/);
});
