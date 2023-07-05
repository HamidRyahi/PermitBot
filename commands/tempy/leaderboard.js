module.exports = {
    name: 'leaderboard',
    aliases: ["lb"],
    description: '',
    async execute(client, message, args, Discord, prefixProfile) {
        const SERVER_LEADERBOARD = prefixProfile?.scores;
        // const just10lb = SERVER_LEADERBOARD
        const sortedLB = SERVER_LEADERBOARD.sort((a, b) => a.points - b.points).reverse();
        const leaderboardEmbed = new Discord.MessageEmbed()
            .setTitle(`${message.guild.name}'s Leaderboard:`)
            .setColor('#ffffff')
            .setDescription(`${sortedLB.map((obj, index) => index + 1 + '. ' + obj.username + ": " + obj.points).join('\n')}`)
            // .setTimestamp()
            .setFooter({ text: `Use "${prefixProfile.prefix}lb all" to view the global leaderboard`, iconURL: `${client.user.avatarURL()}` })

        message.reply({ embeds: [leaderboardEmbed] })
            .catch(err => console.log(err));
    }
}