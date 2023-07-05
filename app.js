const prefixModel = require('./database/models/prefixSchemaPermit.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const mongoose = require('./database/mongoose');

const Discord = require("discord.js");
const { Client, Intents, Collection } = require("discord.js");
const { MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS] });
require("dotenv").config();
const fs = require('fs');
const config = require("./config.json");
client.config = config;
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})

// const commands = [
//     {
//         name: 'ping',
//         description: 'Replies with "Pong!"',
//     },
//     {
//         name: 'evaluation',
//         description: 'sss',
//     },
//     // Add more commands here
// ];

// console.log(client.commands)

// const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

// (async () => {
//     try {
//         console.log('Started refreshing application commands.');

//         await rest.put(
//             Routes.applicationCommands('1122349793709133884'),
//             { body: commands },
//         );

//         console.log('Successfully registered application commands.');
//     } catch (error) {
//         console.error('Error while registering application commands:', error);
//     }
// })();






// client.on('interactionCreate', async (interaction) => {
//     if (!interaction.isCommand()) return;

//     const { commandName } = interaction;

//     // Retrieve the command from the collection based on the command name
//     const command = client.commands.get(commandName);

//     if (!command) return;

//     try {
//         // Execute the command's execute function and pass the interaction
//         await command.execute(interaction);
//     } catch (error) {
//         console.error('Error in command execution:', error);
//         await interaction.reply('An error occurred while executing the command.');
//     }
// });



client.on("guildCreate", async guild => {
    let oldPrefixProfile;
    try {
        oldPrefixProfile = await prefixModel.findOne({ serverID: guild.id });
    } catch (err) { console.log(err); }
    if (oldPrefixProfile) {
        await prefixModel.findOneAndUpdate(
            { serverID: guild.id },
            {
                serverName: guild.name,
                prefix: '-',
                owner: guild.ownerId,
                members: guild.memberCount,
            }
        ).catch((err) => { console.log(err) });
    } else {
        let newPrefixProfile = await prefixModel.create({
            serverID: guild.id,
            serverName: guild.name,
            prefix: '-',
            owner: guild.ownerId,
            members: guild.memberCount,
            updates: guild.systemChannelId,
            scores: []
        }).catch((err) => { console.log(err) });
        newPrefixProfile.save().catch((err) => { console.log(err) });
    }
    let prefixProfile;
    try {
        prefixProfile = await prefixModel.findOne({ serverID: guild.id });
    } catch (err) { console.log(err); }
    const updatesChannel = guild.channels.cache.get(prefixProfile?.updates);
});




mongoose.init();

client.login(process.env.TOKEN);