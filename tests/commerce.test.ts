import { describe, expect, it, vi, afterEach } from "vitest";
import { validateLines } from "../src/features/commerce/domain/catalog";
import { createShopifyProvider } from "../src/features/commerce/infrastructure/shopify-provider";
import { POST } from "../src/app/api/checkout/route";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("cart validation", () => {
  it.each([
    [],
    null,
    [{ variantId: "x", quantity: -1 }],
    [{ variantId: "x", quantity: 1.5 }],
    [{ variantId: "x", quantity: 11 }],
    [
      { variantId: "x", quantity: 1 },
      { variantId: "x", quantity: 2 },
    ],
  ])("rejects malformed lines %j", (value) =>
    expect(() => validateLines(value)).toThrow(),
  );
  it("strips client-supplied pricing", () =>
    expect(
      validateLines([{ variantId: "sku", quantity: 2, price: 1 }]),
    ).toEqual([{ variantId: "sku", quantity: 2 }]));
});
describe("checkout boundary", () => {
  it("blocks cross-origin checkout", async () => {
    const response = await POST(
      new Request("https://shop.test/api/checkout", {
        method: "POST",
        headers: { origin: "https://evil.test" },
        body: "{}",
      }),
    );
    expect(response.status).toBe(403);
  });
  it("does not accept payments in demo mode", async () => {
    vi.stubEnv("COMMERCE_PROVIDER", "demo");
    const response = await POST(
      new Request("https://shop.test/api/checkout", {
        method: "POST",
        body: JSON.stringify({ lines: [{ variantId: "sku", quantity: 1 }] }),
      }),
    );
    expect(response.status).toBe(503);
  });
  it("handles malformed JSON", async () => {
    const response = await POST(
      new Request("https://shop.test/api/checkout", {
        method: "POST",
        body: "{",
      }),
    );
    expect(response.status).toBe(400);
  });
});
describe("Shopify adapter", () => {
  const provider = () =>
    createShopifyProvider({
      domain: "example.myshopify.com",
      token: "test",
      version: "2026-10",
    });
  it("rejects arbitrary upstream hosts", () =>
    expect(() =>
      createShopifyProvider({
        domain: "localhost",
        token: "test",
        version: "2026-10",
      }),
    ).toThrow());
  it("delegates price authority to Shopify", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        data: {
          cartCreate: {
            cart: { checkoutUrl: "https://example.myshopify.com/checkout" },
            userErrors: [],
          },
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    expect(
      await provider().checkout([
        { variantId: "gid://shopify/ProductVariant/123", quantity: 2 },
      ]),
    ).toMatch(/^https:/);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.variables.input.lines).toEqual([
      { merchandiseId: "gid://shopify/ProductVariant/123", quantity: 2 },
    ]);
  });
  it("surfaces inventory errors without a redirect", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          data: {
            cartCreate: { cart: null, userErrors: [{ message: "Sold out" }] },
          },
        }),
      ),
    );
    await expect(
      provider().checkout([{ variantId: "sku", quantity: 1 }]),
    ).rejects.toThrow();
  });
});
