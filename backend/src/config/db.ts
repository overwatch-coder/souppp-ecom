import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL as string);
    if (conn.connection.readyState === 1) {
      console.log(`Connected to DB - ${conn.connection.host}`);
    }
  } catch (error: any) {
    console.log(error?.message);
    process.exit(1);
  }
};
