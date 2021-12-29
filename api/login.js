const Client = require('./lib/client');
const { isValidUuid, isValidUserId } = require('./lib/helpers');

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
    try {
        await client.connect();
        const database = client.db(process.env.MONGO_DB);
        const userDB = database.collection('users');
        const query = { userId: body.userId, token: body.token };
        const user = await userDB.findOne(query);
        if (!user) {
            throw new Error('User/Token not found!');
        }
    } catch (err) {
        console.error(err);
        res.status(404);
        res.send({ Message: err.message });
        return;
    } finally {
        await client.close();
    };

    res.send();

}
