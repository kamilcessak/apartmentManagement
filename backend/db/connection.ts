import { MongoClient, ServerApiVersion } from "mongodb";
import { ATLAS_URI } from "../config";

const client = new MongoClient(ATLAS_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
} catch(err) {
    console.error(err);
}

let db = client.db("");

export default db;