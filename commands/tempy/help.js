module.exports = {
    name: 'help',
    description: '',
    async execute(client, message, args, Discord) {
        const helpEmbed = new Discord.MessageEmbed()
            .setTitle(`PermiBot Help Menu`)
            .setColor('#f2d42c')
            .setThumbnail(`${client.user.avatarURL()}`)
            .setDescription(`
**Commands:**
- **-evaluation** (*-e*): Start an evaluation in a private thread to assess your driving knowledge. Receive a final score upon completion. To end the evaluation, use \`-e stop\`.
- **-start** (*-s*): Begin a new multiplayer quiz where each user has only one attempt per question. You have 30 seconds to answer each round, and correct answers earn one point.
- **-learn** (*-lr*): Engage in a single-question quiz designed to help you learn. If you answer incorrectly, the bot will provide the correct answer (explanation coming soon).
- **-score** (*-sc*): Check your current score earned by answering correctly in multiplayer quizzes.
- **-leaderboard** (*-lb*): Display the leaderboard showcasing the scores of all users.
- **-prefix**: Retrieve or change the bot's prefix in this guild. Specify a new prefix as an argument to update it.

**Usage Examples:**
- To start an evaluation: \`-evaluation\`
- To begin a multiplayer quiz: \`-start\`
- To learn a single question: \`-learn\`
- To check your score: \`-score\`
- To view the leaderboard: \`-leaderboard\`
- To change the bot's prefix: \`-prefix <new-prefix> \`

**Note:**
*For further assistance or inquiries, please contact the bot developer.*

**Helpful links:**
[Invite link](https://discord.com/api/oauth2/authorize?client_id=1122349793709133884&permissions=397284854848&scope=bot/)
`)
            // .setAuthor({ name: 'PermitBot', iconURL: `${client.user.displayAvatarURL()}` })
            .setFooter({ text: `Developed by: @harry420, special thanks to: @nextcord and chatGPT`, iconURL: `${client.user.avatarURL()}` })

        message.reply({ embeds: [helpEmbed] })
            .catch(err => console.log(err));
    }
}