const acceptsTwoAnswersOrLess = ["1", "2", "12"];
const acceptsThreeAnswersOrLess = ["1", "2", "3", "12", "13", "123", "23"];
const acceptsFourAnswersOrLess = ["1", "2", "3", "4", "12", "13", "14", "123", "124", "1234", "134", "23", "24", "234", "34"];
const questionsModule = require('./questions');
const questions = questionsModule.questions;
let isCorrectAnswerFound = false;
let correctedByBot = false;
let currentlyLearning = [];


module.exports = {
    name: 'learn',
    aliases: ["lr"],
    description: '',
    async execute(client, message, args, Discord) {
        if (currentlyLearning.includes(message.author.id)) {
            const anotherQuestionPlaying = new Discord.MessageEmbed()
                .setTitle(`هناك جولة أخرى قيد اللعب`)
                .setColor('#FF7F50');
            return message.reply({ embeds: [anotherQuestionPlaying] })
                .catch(err => console.log(err));
        }

        if (!message.channel.threads) {
            return;
        }

        const currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        let collector;
        startQuiz();
        function startQuiz() {
            currentlyLearning.push(message.author.id);
            const questionEmbed = new Discord.MessageEmbed()
                .setDescription('جاوب عن طريق كتابة رقم الجواب أو أرقام الأجوبة الصحيحة **__تصاعديا__**')
                .setImage(currentQuestion.image);
            message.reply({ embeds: [questionEmbed] }).then((questionMessage) => {
                let filter2 = m => acceptsTwoAnswersOrLess.includes(m.content.trim().replace(/[\s,+-]+/g, ""));
                let filter4 = m => acceptsFourAnswersOrLess.includes(m.content.trim().replace(/[\s,+-]+/g, ""));
                let filter3 = m => acceptsThreeAnswersOrLess.includes(m.content.trim().replace(/[\s,+-]+/g, ""));
                collector = message.channel.createMessageCollector({ filter: currentQuestion?.noa === 2 ? filter2 : currentQuestion?.noa === 3 ? filter3 : filter4, time: 30000 });
                collector.on('collect', (collected, user) => {
                    let userAnswer = collected.content.trim().replace(/[\s,+-]+/g, "");
                    if (message.author.id === collected.author.id) {
                        if (userAnswer === currentQuestion.answers.join('')) {
                            isCorrectAnswerFound = true;
                            const correctAnswerEmbed = new Discord.MessageEmbed()
                                .setTitle(`Bravo ${collected.author.username}!`)
                                .setColor('#00ff00')
                                .setDescription(`الجواب الصحيح هو **${currentQuestion.answers.join(', ')}**`);
                            questionMessage.reply(`${collected.author}`).then(m => {
                                m.edit({ embeds: [correctAnswerEmbed] })
                                    .catch(err => console.log(err));
                            }).catch(err => console.log(err));
                        } else {
                            const correctionEmbed = new Discord.MessageEmbed()
                                .setTitle('جواب خاطئ!')
                                .setColor('#ff0000')
                                .setDescription(`الجواب الصحيح هو ${currentQuestion.answers.join(', ')}`);
                            questionMessage.reply(`${collected.author}`).then(m => {
                                m.edit({ embeds: [correctionEmbed] })
                                    .catch(err => console.log(err));
                            }).catch(err => console.log(err));
                            correctedByBot = true;
                        }
                        endQuiz();
                    }
                });
                collector.on('end', collected => {
                    if (correctedByBot) return endQuiz;
                    if (!isCorrectAnswerFound) {
                        const timeOver = new Discord.MessageEmbed()
                            .setTitle('انتهى الوقت!')
                            .setColor('#ff0000')
                            .setDescription(`الجواب الصحيح هو **${currentQuestion.answers.join(', ')}**`);
                        questionMessage.reply({ embeds: [timeOver] })
                            .catch(err => console.log(err));
                    }
                    endQuiz();
                });
            }).catch(err => console.log(err));
        }
        function endQuiz() {
            collector.stop();
            currentlyLearning = currentlyLearning.filter(player => player !== message.author.id);
            isCorrectAnswerFound = false;
            correctedByBot = false;
        }
    }
}