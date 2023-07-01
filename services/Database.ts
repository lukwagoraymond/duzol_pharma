import mongoose, { ConnectOptions } from "mongoose";
import { MONGO_URI } from "../config";

const dbConnection = async () => {
  try {
    await mongoose.connect(MONGO_URI);
  } catch (err: any) {
    console.log(`Failed to connect to Cloud Database Error: ${err.message}`);
    process.exit(1);
  }
};

// Verify actual connection to cloud Database
const dbConnections = mongoose.connection;
dbConnections.once("open", () => console.log("Connected to Cloud Database!"));

export default dbConnection;
