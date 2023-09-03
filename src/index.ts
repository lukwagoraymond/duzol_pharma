import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Database';
import 'dotenv/config';

let PORT: string = (process.env.NODE_ENV === 'dev') ? `${process.env.PORT}` : `${7000}`;

const startServer = () => {
  const app = express();
  App(app);
  app.listen(PORT, () => {
    //console.clear();
    console.log(`Server is listening on PORT ${PORT}`);
  });
  // Connect to the Mongo DB Atlas Cloud Cluster
  dbConnection();
  return app;
};
if (process.env.NODE_ENV === 'dev') startServer();
export default startServer;
