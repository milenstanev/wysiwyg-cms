import mongoose from "mongoose";

export class Database {
  constructor(private readonly uri: string) {}

  async connect(): Promise<void> {
    await mongoose.connect(this.uri);
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  get isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}
