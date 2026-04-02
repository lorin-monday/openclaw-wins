/**
 * openclaw-wins JS/Node SDK
 *
 * Usage:
 *   import { report } from "@openclaw/wins";
 *   await report("Win title", { apiKey: "xxx", tags: ["tag"] });
 *
 *   // Or with a client:
 *   import { WinsClient } from "@openclaw/wins";
 *   const client = new WinsClient({ apiKey: "xxx" });
 *   await client.report("Win title", { tags: ["gate"] });
 */

const DEFAULT_BASE_URL = "https://openclaw-wins.vercel.app";

export class WinsClient {
  constructor({ apiKey, baseUrl = DEFAULT_BASE_URL } = {}) {
    this.apiKey = apiKey || process.env.OPENCLAW_WINS_API_KEY || "";
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Report a win.
   * @param {string} title
   * @param {object} opts - tags, status, confidence, source, provider, ...
   * @returns {Promise<object>} API response
   */
  async report(title, opts = {}) {
    const { tags = [], status = "reported", confidence = "medium", ...rest } = opts;
    const payload = { title, tags, status, confidence, ...rest };

    const res = await fetch(`${this.baseUrl}/api/wins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) throw new Error(`openclaw-wins: ${data.error || "unknown error"}`);
    return data;
  }

  /**
   * List wins.
   * @param {object} filters - query, status, tag
   * @returns {Promise<Array>}
   */
  async listWins({ query = "", status = "", tag = "" } = {}) {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (status) params.set("status", status);
    if (tag) params.set("tag", tag);
    const qs = params.toString() ? `?${params}` : "";

    const res = await fetch(`${this.baseUrl}/api/wins${qs}`, {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    return data.wins || [];
  }
}

// Default client instance (lazy, reads env at call time)
let _defaultClient = null;

function getDefaultClient() {
  if (!_defaultClient) _defaultClient = new WinsClient({});
  return _defaultClient;
}

/**
 * One-liner report function.
 * @param {string} title
 * @param {object} opts - apiKey, tags, status, confidence, ...
 */
export async function report(title, opts = {}) {
  const { apiKey, baseUrl, ...rest } = opts;
  const client = apiKey || baseUrl
    ? new WinsClient({ apiKey, baseUrl })
    : getDefaultClient();
  return client.report(title, rest);
}
