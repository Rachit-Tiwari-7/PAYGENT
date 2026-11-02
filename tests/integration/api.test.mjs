import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GET as getHealth } from "../../app/api/health/route";
import { GET as getAgents } from "../../app/api/agents/route";
import { GET as getProjects } from "../../app/api/projects/route";
import { POST as testIntegration } from "../../app/api/integrations/test/route";
import { POST as runDemo } from "../../app/api/demo/run/route";

describe("Paygent HTTP API Route Endpoints", () => {
  it("GET /api/health: should return healthy system status", async () => {
    const res = await getHealth();
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.status, "healthy");
    assert.strictEqual(json.service, "paygent-core");
    assert.strictEqual(json.database, "connected");
    assert.strictEqual(json.paypal, "orders_v2_ready");
  });

  it("GET /api/agents: should return list of autonomous agents", async () => {
    const req = new Request("http://localhost:3000/api/agents");
    const res = await getAgents(req);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.agents));
    assert.ok(json.agents.length >= 7);
  });

  it("GET /api/projects: should return active projects in economy", async () => {
    const res = await getProjects();
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.projects));
  });

  it("POST /api/integrations/test: should verify sponsor adapter telemetry", async () => {
    const req = new Request("http://localhost:3000/api/integrations/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sponsor: "CHANNEL3" }),
    });

    const res = await testIntegration(req);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.sponsor, "CHANNEL3");
    assert.ok(json.result);
  });

  it("POST /api/demo/run: should execute or retrieve the hackathon reference demo project", async () => {
    const res = await runDemo();
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.projectId);
  });
});

