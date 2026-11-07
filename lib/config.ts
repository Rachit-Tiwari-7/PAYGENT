// Server-Side Configuration & Credential Store
// Manages environment secrets without exposing them to client-side localStorage.

export interface ServerConfig {
  paypalClientId: string;
  paypalClientSecret: string;
  paypalEnvironment: "sandbox" | "live";
  geminiApiKey: string;
  channel3ApiKey: string;
  elasticsearchUrl: string;
  kernelApiKey: string;
  zapierWebhookUrl: string;
}

export interface MaskedServerConfig {
  paypalClientId: string;
  paypalClientSecretMasked: string;
  paypalEnvironment: "sandbox" | "live";
  paypalConfigured: boolean;
  geminiConfigured: boolean;
  geminiKeyMasked: string;
  channel3Configured: boolean;
  elasticsearchConfigured: boolean;
  kernelConfigured: boolean;
  zapierConfigured: boolean;
}

function maskSecret(val?: string): string {
  if (!val || val.length < 6) return val ? "••••••" : "";
  return `${val.substring(0, 4)}••••${val.substring(val.length - 3)}`;
}

class ServerConfigManager {
  private config: ServerConfig;

  constructor() {
    this.config = {
      paypalClientId: process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb-client-id-demo",
      paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || "sb-secret-demo",
      paypalEnvironment: (process.env.PAYPAL_ENVIRONMENT as any) || "sandbox",
      geminiApiKey: process.env.GEMINI_API_KEY || "",
      channel3ApiKey: process.env.CHANNEL3_API_KEY || "",
      elasticsearchUrl: process.env.ELASTICSEARCH_URL || "",
      kernelApiKey: process.env.KERNEL_API_KEY || "",
      zapierWebhookUrl: process.env.ZAPIER_WEBHOOK_URL || "",
    };
  }

  public getConfig(): ServerConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<ServerConfig>): void {
    if (partial.paypalClientId !== undefined) this.config.paypalClientId = partial.paypalClientId;
    if (partial.paypalClientSecret !== undefined && partial.paypalClientSecret.trim() !== "") {
      this.config.paypalClientSecret = partial.paypalClientSecret;
    }
    if (partial.paypalEnvironment !== undefined) this.config.paypalEnvironment = partial.paypalEnvironment;
    if (partial.geminiApiKey !== undefined && partial.geminiApiKey.trim() !== "") {
      this.config.geminiApiKey = partial.geminiApiKey;
    }
    if (partial.channel3ApiKey !== undefined) this.config.channel3ApiKey = partial.channel3ApiKey;
    if (partial.elasticsearchUrl !== undefined) this.config.elasticsearchUrl = partial.elasticsearchUrl;
    if (partial.kernelApiKey !== undefined) this.config.kernelApiKey = partial.kernelApiKey;
    if (partial.zapierWebhookUrl !== undefined) this.config.zapierWebhookUrl = partial.zapierWebhookUrl;
  }

  public getMaskedConfig(): MaskedServerConfig {
    const isPaypalCustom =
      Boolean(this.config.paypalClientId) &&
      !this.config.paypalClientId.startsWith("sb-client-id-demo") &&
      Boolean(this.config.paypalClientSecret) &&
      !this.config.paypalClientSecret.startsWith("sb-secret-demo");

    return {
      paypalClientId: this.config.paypalClientId,
      paypalClientSecretMasked: maskSecret(this.config.paypalClientSecret),
      paypalEnvironment: this.config.paypalEnvironment,
      paypalConfigured: isPaypalCustom || Boolean(this.config.paypalClientId),
      geminiConfigured: Boolean(this.config.geminiApiKey && this.config.geminiApiKey.trim().length > 0),
      geminiKeyMasked: maskSecret(this.config.geminiApiKey),
      channel3Configured: Boolean(this.config.channel3ApiKey),
      elasticsearchConfigured: Boolean(this.config.elasticsearchUrl),
      kernelConfigured: Boolean(this.config.kernelApiKey),
      zapierConfigured: Boolean(this.config.zapierWebhookUrl),
    };
  }
}

// Global singleton instance
const globalForConfig = global as unknown as { serverConfigManager?: ServerConfigManager };
export const serverConfig = globalForConfig.serverConfigManager || new ServerConfigManager();
if (process.env.NODE_ENV !== "production") globalForConfig.serverConfigManager = serverConfig;

export function getServerConfig(): ServerConfig {
  return serverConfig.getConfig();
}

export function updateServerConfig(partial: Partial<ServerConfig>): void {
  serverConfig.updateConfig(partial);
}

export function getMaskedConfig(): MaskedServerConfig {
  return serverConfig.getMaskedConfig();
}
