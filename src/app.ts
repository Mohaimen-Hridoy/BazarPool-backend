import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { sendResponse } from './utils/response.js';

import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/products.routes.js';
import campaignRoutes from './modules/campaigns/campaigns.routes.js';
import commitmentRoutes from './modules/commitments/commitments.routes.js';
import walletRoutes from './modules/wallet/wallet.routes.js';
import fulfillmentRoutes from './modules/fulfillment/fulfillment.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';

const app = express();

// Global Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/v1/health', (_req, res) => {
  sendResponse(res, {
    statusCode: 200,
    message: 'BazarPool Backend Service is healthy and operational.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'BazarPool REST API',
      version: '1.0.0',
    },
  });
});

// Mount Feature API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/commitments', commitmentRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/fulfillment', fulfillmentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Catch-all 404 Route
app.use('*', (req, res) => {
  sendResponse(res, {
    statusCode: 404,
    message: `API Route ${req.originalUrl} not found on this server.`,
    errors: ['NOT_FOUND'],
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
