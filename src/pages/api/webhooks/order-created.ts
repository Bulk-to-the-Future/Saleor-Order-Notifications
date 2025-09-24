import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import {
  OrderCreatedNotificationDocument, // Updated document name
  OrderCreatedWebhookPayloadSubscriptionFragment,
} from "@/generated/graphql";
import { createClient } from "@/lib/create-graphq-client";
import { saleorApp } from "@/saleor-app";
import { io } from "@/socket";

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderCreatedWebhookPayloadSubscriptionFragment>({
  name: "Order Created in Saleor",
  webhookPath: "api/webhooks/order-created",
  event: "ORDER_CREATED",
  apl: saleorApp.apl,
  query: OrderCreatedNotificationDocument, // Updated query
});

export default orderCreatedWebhook.createHandler((req, res, ctx) => {
  const { payload } = ctx;

  const order = payload.order;

  if (order) {
    const channelId = order.channel?.id || "default";
    const firstName = order.billingAddress?.firstName || "Customer";
    const readyByTime = order.privateMetadata?.find((meta) => meta.key === "readyByTime")?.value || "ASAP";
    const amount = order.total?.gross?.amount || 0;
    const currency = order.total?.gross?.currency || "USD";

    const notificationData = {
      title: "New Order Received",
      body: `Order #${order.number} placed by ${firstName} — Ready by ${readyByTime} | $${amount} ${currency}`,
      orderId: order.id,
    };

    io.to(`channel:${channelId}`).emit("new-order", notificationData);
    return res.status(200).end();
  }
  return res.status(400).end();
});

export const config = {
  api: {
    bodyParser: false,
  },
};