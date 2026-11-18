"use client";
import { CheckoutResult } from "@/features/commerce/presentation/components/checkout-result";
import {
  checkPaymentStatus,
  clearPendingCheckout,
} from "@/features/commerce/infrastructure/browser-checkout";
import { publicPath } from "@/shared/config/public-path";

export function CheckoutResultClient() {
  return (
    <CheckoutResult
      checkStatus={checkPaymentStatus}
      onPaid={clearPendingCheckout}
      homeHref={publicPath("/")}
    />
  );
}
