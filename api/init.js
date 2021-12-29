const { v4: uuidv4 } = require('uuid');
const Client = require('./lib/client');
const { isValidUserId } = require('./lib/helpers');
const { Bot } = require('./lib/bot');

module.exports = async (req, res) => {
    // Check for body
    const { body } = req;
    if (!body) {
        res.status(400);
        res.send({ Message: 'Invalid body' });
        return;
    }
    if (!body.userId) {
        res.status(400);
        res.send({ Message: 'Invalid body' });
        return;
    }

    if (!isValidUserId(body.userId)) {
        console.error(`Bad userId`)
        res.status(400);
        res.send({ Message: 'Invalid userId' });
        return; 
    }

    const bot = new Bot();
    await bot.login();

    // send token in DM to user on discord
    let discordUserId;
    try {
        discordUserId = await bot.getUserId(body.userId);
    } catch (err) {
        // send response
        console.error(err);
        res.status(500);
        res.send({ Message: err.message });
    }

    // write to pending collection
    const token = uuidv4();
    const query = { userId: body.userId };
    const update = { $set: { 
        token,
        id: discordUserId,
        created: (new Date()).toISOString(),
    } };
    const options = { upsert: true };

    const client = new Client();
    try {
        await client.connect();
        const database = client.db(process.env.MONGO_DB);
        const collection = database.collection('pending');
        await collection.updateOne(query, update, options);
    } catch (err) {
        bot.close();
        console.error(err);
        res.status(500);
        res.send({ Message: 'Internal error' });
        return;
    } finally {
        await client.close();
    }

    try {
        await bot.sendMessage(discordUserId, `Your token is: ${token}\nCopy and paste this into your client to continue.`);
    } catch (err) {
        console.error(err);
        res.status(500);
        res.send({ Message: err.message });
    } finally {
        bot.close();
    }

    res.send()
}