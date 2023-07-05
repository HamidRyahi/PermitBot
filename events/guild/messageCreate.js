const { MessageEmbed } = require('discord.js');
const prefixModel = require('../../database/models/prefixSchemaPermit.js');

module.exports = async (client, Discord, message) => {
    let prefixProfile;
    try {
        prefixProfile = await prefixModel.findOne({ serverID: message.guild.id })
    } catch (err) { console.log(err); }
    //
    let prefix;
    if (prefixProfile) {
        prefix = prefixProfile.prefix;
    } else {
        prefix = '-';
    }
    //
    if (message.content.startsWith('-') && !prefixProfile) {
        let prefixProfile = await prefixModel.create({
            serverID: message.guild.id,
            serverName: message.guild.name,
            prefix: '-',
            owner: message.guild.ownerId,
            members: message.guild.memberCount,
            updates: message.guild.systemChannelId,
            scores: []
        }).catch((err) => { console.log(err); });

        prefixProfile.save().catch(console.error);
    }
    //
    try {
        prefixProfile = await prefixModel.findOne({ serverID: message.guild.id });
    } catch (err) { console.log(err); }
    //
    if (message.content === '<@!1122349793709133884>' || message.content === '<@1122349793709133884>') {
        const msgEmbed = new MessageEmbed()
            .setColor('#5865F2')
            .setTitle(`My prefix in this server is **\`${prefix}\`**`)
            .setDescription(`For more help please type \`${prefix}help\``)
        return message.reply({ embeds: [msgEmbed] })
            .catch(console.error);
    }
    //
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    //
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();
    //
    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
    //
    if (command) command.execute(client, message, args, Discord, prefixProfile);
}