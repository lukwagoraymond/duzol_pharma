import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import dbConnection from './services/Database';

import { AdminRoute, VendorRoute } from './routes';


const StartServer = async () => {
  const app = express();
  const PORT: Number = 5000;

// Middleware for parsing incoming request data
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

// Configuration for Static-files
  app.use(express.static(path.join(__dirname, 'images')));

// Middleware to handle routes under different services
  app.use('/admin', AdminRoute);
  app.use('/vendor', VendorRoute);

// Connect to the Mongo DB Atlas Cloud Cluster
await dbConnection();

app.listen(PORT, () => {
  //console.clear();
  console.log(`Server is listening on PORT ${PORT}`);
});
}

StartServer();
