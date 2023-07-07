import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Database';
import { PORT } from './config';


const StartServer = async () => {
  const app = express();

// Connect to the Mongo DB Atlas Cloud Cluster
  await dbConnection();

// Attach Express app to App
  await App(app);

  app.listen(PORT, () => {
    //console.clear();
    console.log(`Server is listening on PORT ${PORT}`);
  });
}

StartServer();
