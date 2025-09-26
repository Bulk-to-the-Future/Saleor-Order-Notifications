"use client";

import { useEffect } from "react";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { useDashboardToken } from "@saleor/app-sdk/app-bridge";
import dynamic from "next/dynamic";

// Dynamically import ToastContainer
const ToastContainer = dynamic(() => import("react-toastify").then((mod) => mod.ToastContainer), {
  ssr: false,
});

export default function NotificationsPage() {
  const { tokenClaims, hasAppToken } = useDashboardToken();

  useEffect(() => {
    if (!hasAppToken || !tokenClaims) return;

    const appBridge = typeof window !== "undefined" ? new AppBridge() : undefined;
    if (!appBridge) return;

    const token = appBridge.getState().token;
    if (!token) return;

    import("socket.io-client").then(({ io }) => {
      const socket = io(process.env.APP_IFRAME_BASE_URL, {
        auth: { token },
      });

      socket.on("new-order", (data) => {
        import("react-toastify").then(({ toast }) => {
          toast(
            <div>
              <h4>{data.title}</h4>
              <p>{data.body}</p>
              <button
                onClick={() => {
                  if (appBridge) {
                    appBridge.dispatch({
                      type: "redirect",
                      payload: { to: `/orders/${data.orderId}`, actionId: "view-order-notification" },
                    });
                  }
                }}
              >
                View Order
              </button>
            </div>,
            { autoClose: 7000, closeOnClick: false }
          );
        });
      });

      return () => {
        socket.disconnect();
      };
    });

    // Load CSS client-side
    if (typeof window !== "undefined") {
      import("react-toastify/dist/ReactToastify.css");
    }
  }, [hasAppToken, tokenClaims]);

  const appBridge = typeof window !== "undefined" ? new AppBridge() : undefined;

  return (
    <AppBridgeProvider appBridgeInstance={appBridge}>
      <div>Live Order Notifications - Keep this page open to receive real-time alerts.</div>
      <ToastContainer position="top-right" autoClose={7000} />
    </AppBridgeProvider>
  );
}