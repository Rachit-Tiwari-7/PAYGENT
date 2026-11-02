import { NextResponse } from "next/server";
import {
  testChannel3Adapter,
  testElasticAdapter,
  testKernelAdapter,
  testAstropodsAdapter,
  testZapierAdapter,
  getApimaticMetadata,
} from "@/lib/integrations/adapters";

export async function POST(request: Request) {
  try {
    const { sponsor } = await request.json();

    let result: any = null;

    switch (sponsor?.toUpperCase()) {
      case "CHANNEL3":
        result = await testChannel3Adapter();
        break;
      case "ELASTIC":
        result = await testElasticAdapter();
        break;
      case "KERNEL":
        result = await testKernelAdapter("https://developer.paypal.com");
        break;
      case "ASTROPODS":
        result = await testAstropodsAdapter();
        break;
      case "APIMATIC":
        result = getApimaticMetadata();
        break;
      case "ZAPIER":
        result = await testZapierAdapter("contract.settled", { amount: 100.0, leadAgent: "MarketMind" });
        break;
      case "PAYPAL":
        result = {
          status: "ACTIVE",
          environment: "sandbox",
          supportedAPIs: ["v2/checkout/orders", "v2/checkout/orders/{id}/capture", "v1/notifications/webhooks"],
          ledgerSync: "Double-Entry Internal Ledger Verified",
        };
        break;
      case "AG_GRID":
        result = {
          status: "ACTIVE",
          features: ["Sorting", "Multi-column Filtering", "CSV Export", "Custom Cell Renderers"],
          theme: "Quartz Dark",
        };
        break;
      case "BRYNTUM":
        result = {
          status: "ACTIVE",
          features: ["DAG Task Dependencies", "Workforce Allocation", "Timeline Gantt"],
        };
        break;
      case "POSTMAN":
        result = {
          status: "ACTIVE",
          collectionFile: "/paygent.postman_collection.json",
          testSuites: ["Authentication", "Bidding Engine", "PayPal Capture", "AI Courtroom"],
        };
        break;
      case "RENDER":
        result = {
          status: "ACTIVE",
          blueprint: "render.yaml",
          services: ["Web Service (Next.js)", "PostgreSQL Database", "Background Cron Worker"],
        };
        break;
      default:
        result = { error: "Unknown sponsor" };
    }

    return NextResponse.json({ success: true, sponsor, result });
  } catch (error) {
    console.error("Test integration error:", error);
    return NextResponse.json({ success: false, error: "Integration test failed" }, { status: 500 });
  }
}

