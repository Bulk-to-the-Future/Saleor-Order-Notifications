# Saleor-Order-Notifications

A Saleor app that provides real-time order notifications for sellers, displaying toast alerts on the `/notifications` page when new orders are created.

## Overview

This app integrates with Saleor to listen for `ORDER_CREATED` webhook events, processes order details, and notifies sellers via a WebSocket-based notification system. It is designed for deployment on an EC2 instance with an Application Load Balancer (ALB) routing to `https://ordernotify.saleor.bulkmagic.co`.

## Features
- Real-time order notifications via toast alerts.
- Customizable notification content (e.g., order number, customer name, total amount).
- WebSocket support for live updates.
- Compatible with Saleor 3.21 schema.

## Prerequisites
- Node.js >= 22.0.0 < 23.0.0
- pnpm >= 10.0.0 < 11.0.0
- A Saleor instance with API access
- EC2 instance for deployment
- AWS ALB and DNS configuration for `ordernotify.saleor.bulkmagic.co`

## Setup

### Local Development
1. **Clone the Repository**:
- git clone https://github.com/Bulk-to-the-Future/Saleor-Order-Notifications.git
- cd Saleor-Order-Notifications
2. **Install Dependencies**:
- pnpm install
3. **Set Environment Variables**:
- Create a `.env` file based on `.env.example`:
- Update with your Saleor instance URL and local port:
- APP_IFRAME_BASE_URL=http://localhost:3003
- APP_API_BASE_URL=http://localhost:3003
- SALEOR_API_URL=https://api.saleor.bulkmagic.co/graphql/
4. **Run the App**:
- - Access at `http://localhost:3003/notifications`.

### Deployment
1. **Deploy to EC2**:
- Clone the repository on the EC2 instance:
- git clone https://github.com/Bulk-to-the-Future/Saleor-Order-Notifications.git
- cd Saleor-Order-Notifications
- Install dependencies:
- pnpm install
- Update `.env` with production values:
- APP_IFRAME_BASE_URL=https://ordernotify.saleor.bulkmagic.co
- APP_API_BASE_URL=https://ordernotify.saleor.bulkmagic.co
- SALEOR_API_URL=https://api.saleor.bulkmagic.co/graphql/

Start the server with PM2
