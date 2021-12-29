const { Client, Intents } = require('discord.js');
const token = process.env.BOT_TOKEN;
const guildId = process.env.GUILD_ID;

class Bot {
    constructor() {
        if (!token || !guildId) {
            throw Error('Missing env variable');
        }

        this.guildId = guildId;
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });
    }

    async login() {
        await this.client.login(token);
    }

    close() {
        this.client.destroy();
    }

    async getUserId(userHash) {
        const [username, discriminator] = userHash.split('#');
        let members;
        try {
            const guild = this.client.guilds.cache.get(guildId);
            members = await guild.members.fetch();
        } catch (err) {
            console.error(err);
            throw Error('Error finding user');
        }

        const user = members.find((member) => member.user.username === username && member.user.discriminator === discriminator);
        if (!user) {
            throw Error('User does not exist!');
        }
        return user.id;
    }

    async sendMessage(id, message) {
        const user = await this.client.users.fetch(id);
        await user.send(message);
    }
}


const sendMessage = async (userId, message) => {
    if (!token || !guildId) {
        throw Error('Missing env variable');
    }

    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

    const [username, discriminator] = userId.split('#');

    let members;
    try {
        await client.login(token);
        const guild = client.guilds.cache.get(guildId);
        members = await guild.members.fetch();
    } catch (err) {
        console.error(err);
        client.destroy();
        throw Error('Error communicating with Discord server');
    }
    
    const user = members.find((member) => member.user.username === username && member.user.discriminator === discriminator);
    if (!user) {
        client.destroy();
        throw Error('User does not exist!');
    }

    try {
        await user.send(message);
    } catch (err) {
        console.error(err);
        throw Error('Error sending message to user');
    } finally {
        client.destroy();
    }

    return user.id;
}

module.exports = {
    sendMessage,
    Bot,
}
