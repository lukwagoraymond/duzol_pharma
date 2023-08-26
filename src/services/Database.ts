import mongoose, { ConnectOptions } from "mongoose";
import 'dotenv/config';

const dbConnection = async () => {
  try {
    if (process.env.NODE_ENV === 'dev') {
      await mongoose.connect(`${process.env.MONGO_URI}`);
      //console.log("Connected to Cloud Database!");
    } else if (process.env.NODE_ENV === 'test') {
      await mongoose.connect(`${process.env.MONGO_URI_TEST}`);
      //console.log("Connected to Cloud Database!");
    }
  } catch (err: any) {
    console.log(`Failed to connect to Cloud Database Error: ${err.message}`);
    process.exit(1);
  }
};

// Verify actual connection to cloud Database
const dbConnections = mongoose.connection;
dbConnections.once("open", () => console.log("Connected to Cloud Database!"));

export default dbConnection;
