const { MongoClient } = require('mongodb');

class Client {
    constructor() {
        const mongoUser = process.env.MONGO_USER;
        const mongoPass = process.env.MONGO_PASS;
        const mongoUrl = process.env.MONGO_URL;
        const mongoDb = process.env.MONGO_DB;

        if (!mongoUser || !mongoPass || !mongoUrl || !mongoDb) {
            console.error("Missing required env variables...");
            process.exit(1);
        }

        const uri = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoUrl}/${mongoDb}`;
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        return client;
    }
}

module.exports = Client;