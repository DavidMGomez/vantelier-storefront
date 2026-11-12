import { afterEach, describe, expect, it, vi } from "vitest";
import { publicPath } from "../src/shared/config/public-path";
import { beginCheckout } from "../src/features/commerce/infrastructure/browser-checkout";
import { getCommerceProvider } from "../src/composition/storefront/provider";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GitHub Pages deployment", () => {
  it("prefixes local assets without rewriting external product images", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/vantelier-storefront");
    expect(publicPath("/images/vantelier/hero-signature.png")).toBe(
      "/vantelier-storefront/images/vantelier/hero-signature.png",
    );
    expect(publicPath("https://cdn.example.com/shirt.jpg")).toBe(
      "https://cdn.example.com/shirt.jpg",
    );
    expect(publicPath("//cdn.example.com/shirt.jpg")).toBe(
      "//cdn.example.com/shirt.jpg",
    );
  });

  it("keeps root paths unchanged for local development and custom domains", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    expect(publicPath("/images/vantelier/hero-signature.png")).toBe(
      "/images/vantelier/hero-signature.png",
    );
  });

  it("does not post to a nonexistent Pages checkout endpoint", async () => {
    vi.stubEnv("NEXT_PUBLIC_STATIC_EXPORT", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      beginCheckout([{ variantId: "vestigio-M", quantity: 1 }]),
    ).rejects.toThrow("Los pagos aún no están habilitados");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("always publishes the local catalogue in Pages mode", async () => {
    vi.stubEnv("GITHUB_PAGES", "true");
    vi.stubEnv("COMMERCE_PROVIDER", "shopify");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const products = await getCommerceProvider().getProducts();
    expect(products).toHaveLength(16);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
