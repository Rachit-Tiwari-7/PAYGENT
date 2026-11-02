import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  testChannel3Adapter,
  testElasticAdapter,
  testKernelAdapter,
  testAstropodsAdapter,
  testZapierAdapter,
  getApimaticMetadata,
} from "../../lib/integrations/adapters";

describe("10 Sponsor Integration Adapters", () => {
  it("Channel3: should query structured e-commerce product SKUs & pricing benchmarks", async () => {
    const res = await testChannel3Adapter("AI Agent Micro-transactions");
    assert.ok(res, "Channel3 must return results");
    assert.ok(Array.isArray(res.results), "Must return SKU array");
    assert.ok(res.results.length >= 2);
    assert.ok(res.results[0].sku);
    assert.ok(res.results[0].priceUsd > 0);
  });

  it("Elastic: should execute semantic search matching natural language to agent DNA", async () => {
    const res = await testElasticAdapter("find financial modeling and cash flow agents");
    assert.ok(res, "Elastic adapter must respond");
    assert.match(res.matchType, /Dense Vector/i);
    assert.ok(Array.isArray(res.topAgents));
    assert.ok(res.topAgents.some((a) => a.name === "FinAnalyst"));
  });

  it("Kernel: should enforce domain allowlists for cloud-browser research sandboxes", async () => {
    // 1. Allowed domain
    const allowed = await testKernelAdapter("https://developer.paypal.com/docs/api");
    assert.strictEqual(allowed.allowed, true);
    assert.strictEqual(allowed.status, "SANDBOX_EXECUTED");
    assert.ok(allowed.citationSnapshotUrl);

    // 2. Disallowed domain
    const blocked = await testKernelAdapter("https://unverified-third-party-spam.xyz");
    assert.strictEqual(blocked.allowed, false);
    assert.strictEqual(blocked.status, "DOMAIN_BLOCKED");
  });

  it("Astropods: should provision isolated agent execution pods with memory boundaries", async () => {
    const res = await testAstropodsAdapter("marketmind");
    assert.strictEqual(res.status, "POD_ACTIVE");
    assert.strictEqual(res.memoryLimitMb, 512);
    assert.strictEqual(res.isolationLevel, "HARDENED_KERNEL_NAMESPACE");
  });

  it("APIMatic: should expose OpenAPI contracts and PayPal Context specifications", () => {
    const res = getApimaticMetadata();
    assert.strictEqual(res.sponsor, "APIMatic");
    assert.strictEqual(res.status, "ACTIVE");
    assert.ok(res.generatedSdks.includes("TypeScript / Node.js"));
  });

  it("Postman: should provide a valid exportable collection file with endpoints", () => {
    const filePath = path.join(process.cwd(), "public", "paygent.postman_collection.json");
    assert.ok(fs.existsSync(filePath), "Postman collection file must exist at public/paygent.postman_collection.json");

    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    assert.strictEqual(content.info.name, "Paygent AI Autonomous Economy API");
    assert.ok(Array.isArray(content.item));
    assert.ok(content.item.length >= 3, "Must contain endpoints for Agents, Projects, and Payments");
  });

  it("Render: should provide a complete Infrastructure-as-Code blueprint render.yaml", () => {
    const filePath = path.join(process.cwd(), "render.yaml");
    assert.ok(fs.existsSync(filePath), "render.yaml must exist");

    const content = fs.readFileSync(filePath, "utf-8");
    assert.match(content, /paygent-web/i);
    assert.match(content, /paygent-agent-worker/i);
    assert.match(content, /paygent-db/i);
  });

  it("Zapier: should dispatch automated outbound webhooks on contract settlements", async () => {
    const res = await testZapierAdapter("contract.settled", { amount: 100.0, leadAgent: "MarketMind" });
    assert.ok(res.dispatched || res.status === "ACTIVE");
    assert.strictEqual(res.event, "contract.settled");
  });
});

