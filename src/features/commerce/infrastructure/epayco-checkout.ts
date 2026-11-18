// Script oficial de ePayco Smart Checkout (docs.davipay.com/docs/checkout-implementacion).
const SCRIPT_URL = "https://checkout.epayco.co/checkout-v2.js";

type EpaycoGlobal = {
  checkout: {
    configure(options: {
      sessionId: string;
      type: "standard" | "onpage";
      test: boolean;
    }): { open(): void };
  };
};

let loading: Promise<EpaycoGlobal> | null = null;

function loadScript(): Promise<EpaycoGlobal> {
  const existing = (window as unknown as { ePayco?: EpaycoGlobal }).ePayco;
  if (existing) return Promise.resolve(existing);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const loaded = (window as unknown as { ePayco?: EpaycoGlobal }).ePayco;
      if (loaded) resolve(loaded);
      else reject(new Error("No pudimos cargar ePayco."));
    };
    script.onerror = () => {
      loading = null;
      reject(new Error("No pudimos cargar ePayco. Revisa tu conexión."));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** Abre Smart Checkout en modo "standard": ePayco lleva al comprador a su página y lo devuelve. */
export async function openEpaycoCheckout(sessionId: string, test: boolean) {
  const ePayco = await loadScript();
  ePayco.checkout.configure({ sessionId, type: "standard", test }).open();
}
