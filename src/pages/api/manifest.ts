import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppExtension, AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl, request, schemaVersion }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl ?? "https://ordernotify.saleor.bulkmagic.co";
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl ?? "https://ordernotify.saleor.bulkmagic.co";

    console.log("Generating manifest with appBaseUrl:", iframeBaseUrl); // Debug log

    const extensionsForSaleor3_22: AppExtension[] = [
      {
        label: "Live Order Notifications",
        mount: "NAVIGATION_ORDERS",
        target: "APP_PAGE",
        permissions: ["MANAGE_ORDERS"],
        url: "/notifications",
      },
    ]; // Only the notifications extension

    const saleorMajor = schemaVersion && schemaVersion[0];
    const saleorMinor = schemaVersion && schemaVersion[1];
    const is3_22 = saleorMajor === 3 && saleorMinor === 22;

    const extensions = is3_22 ? extensionsForSaleor3_22 : []; // Enable only if supported

    const manifest: AppManifest = {
      id: "saleor.app.order-notifications",
      version: packageJson.version,
      name: "Order Notifications",
      about: "Provides real-time in-app notifications for new orders to sellers.",
      permissions: ["MANAGE_ORDERS", "MANAGE_CHANNELS"],
      appUrl: iframeBaseUrl,
      configurationUrl: iframeBaseUrl + "/configuration",
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      homepageUrl: `${iframeBaseUrl}`,
      // Temporarily removed webhooks to test extension installation
      extensions: extensions,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`, // Ensure logo.png exists
        },
      },
    };

    console.log("Generated manifest:", JSON.stringify(manifest, null, 2)); // Debug log
    return manifest;
  },
});