import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/hatkhola-bazar";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // Preserve MongoDB client across hot reloads in development
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
    global._mongoClientPromise = global._mongoClient.connect();
  }
  client = global._mongoClient;
  clientPromise = global._mongoClientPromise!;
} else {
  // In production, instantiate fresh client
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export { client };
export default clientPromise;
