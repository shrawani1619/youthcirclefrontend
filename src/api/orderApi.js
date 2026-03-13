import apiClient, { getAuthConfig } from "./client";

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

export const createOrders = async ({ token, items }) => {
  const { data } = await apiClient.post("/orders", { items }, getAuthConfig(token));
  return data;
};

export const getMyOrders = async ({ token }) => {
  const { data } = await apiClient.get("/orders/my", getAuthConfig(token));
  return data;
};

export const getAdminOrders = async ({ token }) => {
  const { data } = await apiClient.get("/orders/admin", getAuthConfig(token));
  return data;
};

export const getOrderById = async ({ token, orderId }) => {
  const { data } = await apiClient.get(`/orders/${orderId}`, getAuthConfig(token));
  return data;
};

export const cancelOrder = async ({ token, orderId }) => {
  const { data } = await apiClient.patch(`/orders/${orderId}/cancel`, {}, getAuthConfig(token));
  return data;
};

export const createPaymentOrder = async ({ token, orderIds }) => {
  const { data } = await apiClient.post(
    "/orders/payment/create",
    { orderIds },
    getAuthConfig(token)
  );

  return data.paymentOrder;
};

export const verifyRazorpayPayment = async ({
  token,
  orderIds,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const { data } = await apiClient.post(
    "/orders/payment/verify",
    {
      orderIds,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    },
    getAuthConfig(token)
  );

  return data;
};

export const openRazorpayCheckout = async ({
  token,
  orderIds,
  customer,
  onSuccess,
  onFailure,
}) => {
  await loadRazorpayScript();

  const paymentOrder = await createPaymentOrder({ token, orderIds });

  const razorpay = new window.Razorpay({
    key: paymentOrder.keyId,
    amount: paymentOrder.amount,
    currency: paymentOrder.currency,
    name: "Youth Circle",
    description: "Payment for your multi-vendor order",
    order_id: paymentOrder.id,
    prefill: {
      name: customer?.name || "",
      email: customer?.email || "",
      contact: customer?.phone || "",
    },
    notes: {
      internalOrderIds: paymentOrder.internalOrderIds.join(","),
    },
    theme: {
      color: "#4F46E5",
    },
    modal: {
      ondismiss: () => {
        onFailure?.(new Error("Payment popup was closed before completion."));
      },
    },
    handler: async (response) => {
      try {
        const result = await verifyRazorpayPayment({
          token,
          orderIds: paymentOrder.internalOrderIds,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        onSuccess?.(result);
      } catch (error) {
        onFailure?.(error);
      }
    },
  });

  razorpay.on("payment.failed", (response) => {
    const message =
      response?.error?.description || "Payment failed. Please try again.";
    onFailure?.(new Error(message));
  });

  razorpay.open();

  return paymentOrder;
};

export default apiClient;
