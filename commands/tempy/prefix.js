const prefixModel = require('../../database/models/prefixSchemaPermit.js');
module.exports = {
    name: 'prefix',
    description: 'This command for viewing and changing the prefix of the bot',
    async execute(client, message, args, Discord, prefixProfile,) {
        if (args.length === 0) {
            const msgEmbed = new Discord.MessageEmbed()
                .setColor('#5865F2')
                .setTitle(`Prefix for this server is **\`${prefixProfile.prefix}\`**`)
                .setDescription(`You can change it with \`${prefixProfile.prefix}prefix new_prefix\``)
                .setFooter(`For more help please type ${prefixProfile.prefix}help`)
            return message.reply({ embeds: [msgEmbed] })
                .catch(err => console.log(err));
        }
        if (args.length > 0) {
            if (!message.member.permissions.has("ADMINISTRATOR")) {
                const msgEmbed = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setDescription(`You do not have sufficient permissions to use that command.`)
                return message.reply({ embeds: [msgEmbed] })
                    .catch(err => console.log(err));
            }
        }
        if (args.length >= 1) {
            let newPrefix = args[0];
            await prefixModel.findOneAndUpdate(
                { serverID: message.guild.id },
                { prefix: newPrefix }
            ).catch((err) => { console.log(err); });
            const msgEmbed = new Discord.MessageEmbed()
                .setColor('#00ff00')
                .setTitle(`Prefix set to:  **\`${args[0]}\`**`);
            return message.reply({ embeds: [msgEmbed] })
                .catch(err => console.log(err));
        }
    }
}