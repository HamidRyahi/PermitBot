
module.exports = {
    name: 'score',
    aliases: ["sc"],
    description: '',
    async execute(client, message, args, Discord, prefixProfile) {

        let latest_scores = prefixProfile.scores;
        const targetedUser = latest_scores.find(user => user.id === message.author.id);


        if (targetedUser) {
            const scoreEmbed = new Discord.MessageEmbed()
                .setTitle(`${message.author.username}'s score is:`)
                .setDescription(`${targetedUser.points.toString()} points.`);
            message.reply({ embeds: [scoreEmbed] })
                .catch(err => console.log(err));
        } else {
            const scoreEmbed = new Discord.MessageEmbed()
                .setTitle(`${message.author.username}'s score is:`)
                .setDescription(`0 points.`);
            message.reply({ embeds: [scoreEmbed] })
                .catch(err => console.log(err));
        }
    }
}