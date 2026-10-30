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

const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
};

// Preserve MongoDB client across warm serverless lambdas and hot reloads
if (!global._mongoClient) {
  global._mongoClient = new MongoClient(uri, mongoOptions);
  global._mongoClientPromise = global._mongoClient.connect();
}
client = global._mongoClient;
clientPromise = global._mongoClientPromise!;

// Ensure all user documents in MongoDB have a default role of "user"
clientPromise.then(async (c) => {
  try {
    const db = c.db();
    await db.collection("user").updateMany(
      { $or: [{ role: { $exists: false } }, { role: null }, { role: "" }] },
      { $set: { role: "user" } }
    );
  } catch {
    // Non-blocking initialization
  }
}).catch(() => {});

export { client };
export default clientPromise;
