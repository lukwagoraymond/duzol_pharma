import express, { Application } from 'express';
import path from 'path';
import { AdminRoute, ShoppingRoute, VendorRoute, CustomerRoute, DeliveryRoute } from '../routes';

export default async (app: Application) => {
// Middleware for parsing incoming request data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

// Configuration for Static-files
  app.use('/images', express.static(path.join(__dirname, '../images')));

// Middleware to handle routes under different services
  app.use('/admin', AdminRoute);
  app.use('/vendor', VendorRoute);
  app.use('/customer', CustomerRoute);
  app.use('/delivery', DeliveryRoute);
  app.use(ShoppingRoute);

  return app;
}
