const acceptsTwoAnswersOrLess = ["1", "2", "12"];
const acceptsThreeAnswersOrLess = ["1", "2", "3", "12", "13", "123", "23"];
const acceptsFourAnswersOrLess = ["1", "2", "3", "4", "12", "13", "14", "123", "124", "1234", "134", "23", "24", "234", "34"];
const questionsModule = require('./questions');
const questions = questionsModule.questions;
let isQuizActive = false;
let isCorrectAnswerFound = false;
let failedTriesParticipants = [];
const prefixModel = require('../database/models/prefixSchemaPermit.js');


module.exports = {
    name: 'start',
    aliases: ["s"],
    description: '',
    async execute(client, message, args, Discord, prefixProfile) {
        // If message user typed command in a thread
        if (!message.channel.threads) return;

        // If there is already another quiz active
        if (isQuizActive) {
            const anotherQuestionPlaying = new Discord.MessageEmbed()
                .setTitle(`هناك جولة أخرى قيد اللعب`)
                .setColor('#FF7F50');
            return message.reply({ embeds: [anotherQuestionPlaying] })
                .catch(err => console.log(err));
        }
        const currentQuestion = questions[Math.floor(Math.random() * questions.length)]
        let collector;
        startQuiz();
        function startQuiz() {
            isQuizActive = true;
            const questionEmbed = new Discord.MessageEmbed()
                .setDescription('جاوب عن طريق كتابة رقم الجواب أو أرقام الأجوبة الصحيحة **__تصاعديا__**')
                .setImage(currentQuestion?.image)
                .setFooter(`تذكير: محاولة واحدة في كل سؤال`);
            message.reply({ embeds: [questionEmbed] }).then((questionMessage) => {
                let filter2 = m => acceptsTwoAnswersOrLess.includes(m.content.trim().replace(/[\s,+-]+/g, ""));
                let filter3 = m => acceptsThreeAnswersOrLess.includes(m.content.trim().replace(/[\s,+-]+/g, ""));
                let filter4 = m => acceptsFourAnswersOrLess.includes(m.content.trim().replace(/[\s,+-]+/g, ""));
                collector = message.channel.createMessageCollector({ filter: currentQuestion?.noa === 2 ? filter2 : currentQuestion?.noa === 3 ? filter3 : filter4, time: 50000 });
                collector.on('collect', async (collected, user) => {
                    const userAnswer = collected.content.trim().replace(/[\s,+-]+/g, "");
                    if (!failedTriesParticipants.includes(collected.author)) {
                        if (userAnswer === currentQuestion?.answers.join('')) {
                            isCorrectAnswerFound = true;
                            let latest_scores = prefixProfile.scores;
                            if (!latest_scores.some(user => user.id === collected.author.id)) {
                                latest_scores.push({
                                    id: collected.author.id,
                                    username: collected.author.username,
                                    points: 1
                                })

                            } else {
                                const winnerUser = latest_scores.find(user => user.id === collected.author.id);
                                if (winnerUser) {
                                    winnerUser.points += 1;
                                } else {
                                    console.log('User not found');
                                }
                            }
                            await prefixModel.findOneAndUpdate(
                                { serverID: message.guild.id },
                                { scores: latest_scores }
                            ).catch(console.error);

                            collected.react('✅')
                                .catch(err => console.log(err));
                            const correctAnswerEmbed = new Discord.MessageEmbed()
                                .setTitle(`Bravo ${collected.author.username}!`)
                                .setColor('#00ff00')
                                .setDescription(`الجواب الصحيح هو **${currentQuestion?.answers.join(', ')}**`);
                            questionMessage.reply(`${collected.author}`).then(m => {
                                m.edit({ embeds: [correctAnswerEmbed] })
                                    .catch(err => console.log(err));
                            }).catch(err => console.log(err));
                            endQuiz();
                        } else if (isQuizActive) {
                            failedTriesParticipants.push(collected.author);
                            collected.react('❌')
                                .catch(err => console.log(err));
                        }
                    }
                });
                collector.on('end', collected => {
                    if (!isCorrectAnswerFound) {
                        const timeOver = new Discord.MessageEmbed()
                            .setTitle('انتهى الوقت!')
                            .setColor('#ff0000')
                            .setDescription(`الجواب الصحيح هو **${currentQuestion?.answers.join(', ')}**`);
                        questionMessage.reply({ embeds: [timeOver] })
                            .catch(err => console.log(err));
                    }
                    endQuiz();
                });
            }).catch(err => console.log(err));
        }
        function endQuiz() {
            collector.stop();
            isQuizActive = false;
            isCorrectAnswerFound = false;
            failedTriesParticipants = [];
        }
    }
}