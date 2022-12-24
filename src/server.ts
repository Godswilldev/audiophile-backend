import "dotenv/config";
import app from "./app";
import mongoose from "mongoose";
const { HOST, DATABASE_HOSTED } = process.env;

process.on("uncaughtException", (err) => {
  console.log("****** UNCAUGHT EXCEPTION 🔥🔥🔥 SHUTTING DOWN *****");
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT || 9898;

//  CONNECT TO THE DATABASE
const dbConnect = async () => {
  try {
    await mongoose.connect(DATABASE_HOSTED as string);
    console.log("************DATABASE CONNECTED************");
  } catch (error) {
    throw new Error(`Cannot connect to database ${error}`);
  }
};

// START APP
const server = app.listen(port, async () => {
  await dbConnect();
  console.log(`Server started on http://${HOST}:${port}`);
});

// HANDLE ERRORS
process.on("unhandledRejection", (err: any) => {
  console.log(err.name, err.message);
  console.log("****** UMHANDLED REJECTION 🔥🔥🔥 SHUTTING DOWN *****");
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("****** SIGTERM RECEIVED 🔥🔥🔥 SHUTTING DOWN *****");
  server.close(() => console.log("🔥🔥🔥 process terminated"));
});
