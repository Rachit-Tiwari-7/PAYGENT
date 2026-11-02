import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { decomposeProject } from "../../lib/orchestrator/engine";

describe("Orchestrator Decomposition Engine", () => {
  it("should decompose a market research project into 4 structured subtasks", () => {
    const budget = 100.0;
    const title = "FinTech AI Agent Market Intelligence & Strategy";
    const desc = "Comprehensive competitor research and market sizing.";

    const result = decomposeProject(title, desc, budget);

    assert.ok(result.tasks, "Result must contain tasks array");
    assert.strictEqual(result.tasks.length, 4, "Must decompose into 4 subtasks");

    // Check task titles and categories
    assert.match(result.tasks[0].title, /Market Sizing/i);
    assert.strictEqual(result.tasks[0].category, "Research");

    assert.match(result.tasks[1].title, /Channel3/i);
    assert.strictEqual(result.tasks[1].category, "Research");

    assert.match(result.tasks[2].title, /Unit Economics/i);
    assert.strictEqual(result.tasks[2].category, "Finance");

    assert.match(result.tasks[3].title, /Executive/i);
    assert.strictEqual(result.tasks[3].category, "Design");
  });

  it("should enforce mathematical budget allocation equal to total project budget", () => {
    const budget = 100.0;
    const result = decomposeProject("Market Research Study", "Detailed diligence", budget);

    const totalAllocated = result.tasks.reduce((sum, t) => sum + t.budget, 0);
    assert.strictEqual(Number(totalAllocated.toFixed(2)), 100.0, "Allocated task budgets must sum to 100%");
  });

  it("should specify explicit DAG dependencies between sequential subtasks", () => {
    const result = decomposeProject("Market Research Study", "Detailed diligence", 100.0);

    // Channel3 scrape depends on Market Sizing
    assert.deepStrictEqual(result.tasks[1].dependencies, [0], "Task 1 must depend on Task 0");

    // Unit economics depends on Channel3 data
    assert.deepStrictEqual(result.tasks[2].dependencies, [1], "Task 2 must depend on Task 1");

    // Executive deck depends on Unit economics
    assert.deepStrictEqual(result.tasks[3].dependencies, [2], "Task 3 must depend on Task 2");
  });

  it("should decompose engineering/system projects with appropriate technical skills", () => {
    const result = decomposeProject("Full Stack API Gateway", "Build secure API routing", 200.0);

    assert.ok(result.tasks.length >= 3);
    assert.match(result.tasks[0].title, /API Specification/i);
    assert.strictEqual(result.tasks[0].category, "Engineering");
  });
});
