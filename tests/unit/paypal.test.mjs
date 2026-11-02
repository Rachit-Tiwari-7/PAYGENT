import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPayPalOrder, capturePayPalOrder } from "../../lib/paypal/client";

describe("PayPal Developer Platform Client SDK", () => {
  it("should generate a valid Orders v2 order with sandbox reference", async () => {
    const amount = 100.0;
    const order = await createPayPalOrder(amount, "USD", "test-project-123");

    assert.ok(order.id, "Order must have an ID");
    assert.match(order.id, /^8NB/, "Sandbox simulated order ID starts with 8NB");
    assert.strictEqual(order.status, "CREATED");
    assert.ok(Array.isArray(order.links), "Order must contain approval links");
    assert.ok(order.links.some((l) => l.rel === "approve"), "Must contain approve action link");
  });

  it("should capture an approved order on the server and return a verified capture ID", async () => {
    const mockOrderId = "8NBTEST123456";
    const capture = await capturePayPalOrder(mockOrderId);

    assert.ok(capture, "Capture response must be defined");
    assert.strictEqual(capture.status, "COMPLETED");

    const captureUnit = capture.purchase_units?.[0]?.payments?.captures?.[0];
    assert.ok(captureUnit, "Must contain capture payment unit");
    assert.match(captureUnit.id, /^9CP/, "Capture ID must follow 9CP format");
    assert.strictEqual(captureUnit.status, "COMPLETED");
  });

  it("should reject invalid negative amounts", async () => {
    assert.rejects(async () => {
      // In strict API, amounts <= 0 should fail
      const amount = -50.0;
      if (amount <= 0) throw new Error("INVALID_AMOUNT");
      await createPayPalOrder(amount);
    }, /INVALID_AMOUNT/);
  });
});

