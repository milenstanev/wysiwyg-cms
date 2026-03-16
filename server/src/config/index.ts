import "dotenv/config";

export const config = Object.freeze({
  port: parseInt(process.env.PORT ?? "4000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongo: {
    uri: process.env.MONGO_URI ?? "mongodb://localhost:27017/cms",
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  },
});
