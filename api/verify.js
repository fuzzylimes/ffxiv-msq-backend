const Client = require('./lib/client');
const { isValidUuid, isValidUserId } = require('./lib/helpers');
const { Bot } = require('./lib/bot');

module.exports = async (req, res) => {
    // Check for body
    const { body } = req;
    if (!body) {
        res.status(400);
        res.send({ Message: 'Invalid body' });
        return;
    }
    if (!body.userId || !body.token) {
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

    if (!isValidUuid(body.token)) {
        console.error(`Bad user token`)
        res.status(400);
        res.send({ Message: 'Invalid token' });
        return;
    }

    // get pending record
    const client = new Client();
    let user;
    try {
        await client.connect();
        const database = client.db(process.env.MONGO_DB);
        const pendingDB = database.collection('pending');
        let query = { userId: body.userId, token: body.token };
        user = await pendingDB.findOne(query);
        if (!user) {
            throw new Error('User/Token not found!');
        }

        const {_id, ...userProps} = user;
        query = { userId: body.userId };
        const update = {
            $set: {
                ...userProps
            }
        };
        const options = { upsert: true };
        const userDB = database.collection('users');
        await userDB.updateOne(query, update, options);
    } catch (err) {
        console.error(err);
        res.status(404);
        res.send({ Message: err.message });
        return;
    } finally {
        await client.close();
    };

    const bot = new Bot();
    try {
        await bot.login();
        await bot.sendMessage(user.id, 'Registration complete. Enjoy FFXIV: MSQ!')
    } catch (err) {
        console.error('Error connecting to discord', err);
    } finally {
        bot.close();
    }

    res.send();

}
