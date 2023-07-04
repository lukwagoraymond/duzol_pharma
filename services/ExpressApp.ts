import express, { Application } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { AdminRoute, ShoppingRoute, VendorRoute } from '../routes';

export default async (app: Application) => {

// Middleware for parsing incoming request data
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

// Configuration for Static-files
  app.use('/images', express.static(path.join(__dirname, '../images')));

// Middleware to handle routes under different services
  app.use('/admin', AdminRoute);
  app.use('/vendor', VendorRoute);
  app.use(ShoppingRoute);

  return app;
}
