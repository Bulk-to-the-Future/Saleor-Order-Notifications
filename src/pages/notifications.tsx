import { useEffect } from "react";
import io from "socket.io-client";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { useDashboardToken } from "@saleor/app-sdk/app-bridge";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const appBridge = new AppBridge();

export default function NotificationsPage() {
  const { tokenClaims, hasAppToken } = useDashboardToken();

  useEffect(() => {
    if (!hasAppToken || !tokenClaims) return; // Ensure token is available

    const token = appBridge.getState().token; // Fetch token from appBridge state
    if (!token) return;

    const socket = io(process.env.APP_IFRAME_BASE_URL || "http://localhost:3000", { auth: { token } });

    socket.on("new-order", (data) => {
      toast(
        <div>
          <h4>{data.title}</h4>
          <p>{data.body}</p>
          <button
            onClick={() =>
              appBridge.dispatch({
                type: "redirect",
                payload: { to: `/orders/${data.orderId}`, actionId: "view-order-notification" },
              })
            }
          >
            View Order
          </button>
        </div>,
        { autoClose: 7000, closeOnClick: false }
      );
    });

    // Cleanup function that returns void
    return () => {
      socket.disconnect();
    };
  }, [hasAppToken, tokenClaims]); // Dependency on token availability

  return (
    <AppBridgeProvider appBridgeInstance={appBridge}>
      <div>Live Order Notifications - Keep this page open to receive real-time alerts.</div>
      <ToastContainer position="top-right" autoClose={7000} />
    </AppBridgeProvider>
  );
}