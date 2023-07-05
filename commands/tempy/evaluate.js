const acceptsTwoAnswersOrLess = ["1", "2", "12"];
const acceptsThreeAnswersOrLess = ["1", "2", "3", "12", "13", "123", "23"];
const acceptsFourAnswersOrLess = ["1", "2", "3", "4", "12", "13", "14", "123", "124", "1234", "134", "23", "24", "234", "34"];
const questionsModule = require('./questions');

const questions = questionsModule.questions;
const scoring_images = questionsModule.scoring_images;

// helper functions
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomUniqueQuestions(array, count) {
    let random40Questions = [];
    if (count > array.length) {
        console.log("Error: Requested count exceeds the array length.");
        return random40Questions;
    }
    while (random40Questions.length < count) {
        let randomIndex = getRandomNumber(0, array.length - 1);
        let randomQ = array[randomIndex];
        if (!random40Questions.includes(randomQ)) {
            random40Questions.push(randomQ);
        }
    }
    return random40Questions;
}
function countFinalScore(str, character) {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === character) {
            count++;
        }
    }
    return count;
}
function generatePin() {
    var pin = "";
    for (var i = 0; i < 4; i++) {
        pin += Math.floor(Math.random() * 10);
    }
    return pin;
}
const numberOfQuestions = 40;



let all_users_data = [];
module.exports = {
    name: 'evaluation',
    aliases: ["e"],
    description: '',
    async execute(client, message, args, Discord) {
        let currentQuestion;
        let isCurrentQuestionAnswered;
        let current_user_data = all_users_data.find(u => u.id === message.author.id);
        let isEvaluationActive = current_user_data?.isEvaluationActive;
        let isThreadActive = message.channel?.threads?.cache.find(th => th.id === current_user_data?.threadId);
        let answerCollector;
        let answerCollector2;



        // If user typed "-e stop" to stop an active evaluation
        if (args[0] === 'stop') {
            // If evaluation is not active
            if (!isEvaluationActive) return;
            // Reply with this message: لقد قمتم بإيقاف تقييمكم الحالي
            const evaluationStoppedEmbed = new Discord.MessageEmbed()
                .setTitle(`لقد قمتم بإيقاف تقييمكم الحالي`)
                .setColor('#FF7F50')
            message.reply({ embeds: [evaluationStoppedEmbed] })
                .catch(err => console.log(err));
            // if user typed "-e stop" in a regular channel => send the message in the evaluation thread too
            if (message.channel.threads) {
                message.channel?.threads?.cache.find(th => th.id === current_user_data?.threadId).
                    send({ embeds: [evaluationStoppedEmbed] })
                    .catch(err => console.log(err));
            }
            // Stop both message collectors
            answerCollector?.stop();
            answerCollector2?.stop();
            // Set isEvaluationActive to false
            current_user_data.isEvaluationActive = false;
            // Lock evaluation thread
            await message.channel?.threads?.cache.find(th => th.id === current_user_data?.threadId)?.setLocked(true)
                .catch(err => console.log(err));
            // calculate final results
            finalResultsCalculator(evaluationThread);
        }



        // if user typed "-e" or "-e ksdjhfkjsdf" in a thread and user's evaluation is active => return
        if (message.author.id === current_user_data?.id && (args?.length === 0 || (args.length > 0 && args[0] !== 'stop')) && !message.channel.threads && isEvaluationActive) {
            console.log('if user typed "-e" or "-e ksdjhfkjsdf" in a thread and user\'s evaluation is active => return');
            return;
        }



        // if user's thread deleted => delete user data
        if (!isThreadActive) {
            console.log('if user\'s thread deleted => delete user data');
            all_users_data = all_users_data.filter(user => user.id !== message.author.id);
        }



        // if user typed "-e" and user's evaluation and evaluation's thread are active => reply with "there is another evaluation ongoing"
        if (isEvaluationActive && isThreadActive && args.length === 0) {
            const anotherQuestionPlaying = new Discord.MessageEmbed()
                .setTitle(`عذرا، هناك تقييم آخر جاري حاليا.`)
                .setDescription(`https://discord.com/channels/${message.guild.id}/${evaluationThread.id}

**\`-e stop\`** لإيقاف التقييم السابق, يمكنكم استعمال الأمر التالي`)
                .setColor('#FF7F50');
            return message.reply({ embeds: [anotherQuestionPlaying] })
                .catch(err => console.log(err));
        }



        // if user typed "-e" in a regular channel => start a new evaluation by:
        if (message.channel.threads && args.length === 0) {
            // 1. add user starting data to all_users_data
            if (!all_users_data.some(user => user.id === message.author.id)) {
                all_users_data.push({
                    id: message.author.id,
                    user_questions: getRandomUniqueQuestions(questions, numberOfQuestions),
                    question_counter: -1,
                    results: [],
                    isEvaluationActive: true
                })
            }
            // 2. create an evaluation thread for the user
            evaluationThread = await message.channel.threads?.create({
                name: `${message.author.username}'s evaluation thread`,
                autoArchiveDuration: 60,
                type: 'GUILD_PRIVATE_THREAD',
                reason: 'Needed a separate thread for evaluation',
            }).catch(err => console.log(err));
            const threadDeletedEmbed = new Discord.MessageEmbed()
                .setTitle(`Click on this link to join your private evaluation thread!`)
                .setDescription(`https://discord.com/channels/${message.guild.id}/${evaluationThread.id}`)
                .setColor('#00FF00')
            message.reply({ embeds: [threadDeletedEmbed] })
                .catch(err => console.log(err));
            await evaluationThread.members.add(message.author.id)
                .catch(err => console.log(err));
            const current_user_data = all_users_data.find(u => u.id === message.author.id);
            // set isEvaluationActive to true
            current_user_data.isEvaluationActive = true;
            // set user's thread Id
            current_user_data.threadId = evaluationThread.id;
            if (evaluationThread?.joinable) await evaluationThread?.join()
                .catch(err => console.log(err));
            const user_pin = generatePin();
            const startEvaluationEmbed = new Discord.MessageEmbed()
                .setTitle(`المرجو كتابة رقمكم السري لبدأ إمتحان السياقة التجريبي`)
                .setDescription(`>>> <a:attention:1125158911176089630> **\`${user_pin}\`** <a:attention:1125158911176089630> :رقمكم السري هو

جاوب عن طريق كتابة رقم الجواب أو أرقام الأجوبة الصحيحة **__تصاعديا__**

هذه الدردشة خاصة ، لإضافة أعضاء آخرين يمكنك الإشارة إليهم

**\`-e stop\`** لإيقاف الإمتحان في أي لحظة بإمكانكم استعمال الأمر التالي`)
                .setColor('#00FFFF')
            evaluationThread?.send({ embeds: [startEvaluationEmbed] })
                .then(m => {
                    let filter = m => m.content.trim().replace(/[\s,+-]+/g, "") && m.content.trim().replace(/[\s,+-]+/g, "") === user_pin;
                    answerCollector2 = evaluationThread.createMessageCollector({ filter: filter, time: 90000 });
                    // on collected
                    answerCollector2.on('collect', async (collected, u) => {
                        // if user stopped evaluation before typing passcode
                        if (!current_user_data.isEvaluationActive) return;
                        if (message.author.id === collected.author.id) {
                            // if correct user reacted => Set isEvaluationActive true + START EVALUATION
                            startQuiz(evaluationThread);
                        }
                    })



                    // on collector end
                    answerCollector2.on('end', async collected => {
                        // if correct user didn't type correct passcode
                        if (collected.size === 0) {
                            // if evaluation still active
                            if (current_user_data.isEvaluationActive) {
                                all_users_data = all_users_data.filter(user => user.id !== message.author.id);
                                const threadDeletedEmbed = new Discord.MessageEmbed()
                                    .setTitle(`Evaluation thread deleted.`)
                                    .setDescription('Reason: Time out')
                                    .setColor('#FF7F50')
                                message.reply({ embeds: [threadDeletedEmbed] })
                                    .catch(err => console.log(err));
                                evaluationThread.delete()
                                    .catch(err => console.log(err));
                            }
                        }
                    })
                }).catch(err => console.log(err));
        }



        // Start quiz question function
        async function startQuiz(evaluationThread) {
            const current_user_data = all_users_data.find(u => u.id === message.author.id);
            // 0. set isCurrentQuestionAnswered to false
            isCurrentQuestionAnswered = false;
            // 1. check if this is the first question => increment counter by 1
            if (current_user_data.question_counter === -1) current_user_data.question_counter++;
            currentQuestion = current_user_data?.user_questions?.[current_user_data.question_counter];
            // 2. if there is no more question to ask for this evaluation begin calculating the final score
            if (!currentQuestion)
                finalResultsCalculator(evaluationThread);
            // 3. Send question embed and wait for an answer
            const questionEmbed = new Discord.MessageEmbed()
                .setTitle(`السؤال رقم ${current_user_data.question_counter + 1}/${numberOfQuestions}`)
                .setImage(currentQuestion?.image)
            evaluationThread.send({ embeds: [questionEmbed] })
                .then((questionMessage) => {
                    let filter2 = m => acceptsTwoAnswersOrLess.includes(m.content.trim().replace(/[\s,+-]+/g, ""));
                    let filter3 = m => acceptsThreeAnswersOrLess.includes(m.content.trim().replace(/[\s,+-]+/g, ""));
                    let filter4 = m => acceptsFourAnswersOrLess.includes(m.content.trim().replace(/[\s,+-]+/g, ""));
                    answerCollector = evaluationThread.createMessageCollector({ filter: currentQuestion?.noa === 2 ? filter2 : currentQuestion?.noa === 3 ? filter3 : filter4, time: 50000 });
                    // on collecting a valid answer from the right user in the right thread:
                    answerCollector.on('collect', (collected, user) => {
                        const userAnswer = collected.content.trim().replace(/[\s,+-]+/g, "");
                        const userThread = all_users_data.find(u => u.threadId === collected.channelId)?.threadId;
                        if (collected.author.id === message.author.id && collected.channelId === userThread) {
                            // 1. push current question and correct answer and user's answer to user's results
                            const current_user_results = current_user_data.results;
                            if (current_user_results) {
                                current_user_results.push({
                                    question: currentQuestion?.image,
                                    correct_answer: currentQuestion?.answers,
                                    user_answer: userAnswer.split('')
                                });
                            }
                            // 2. set isCurrentQuestionAnswered to true so when answer collector ends we don't push ["0"] to user's results
                            isCurrentQuestionAnswered = true;
                            // 3. stop answer  idk
                            answerCollector?.stop();
                            // 4. increment question_counter by one to move to the next question
                            current_user_data.question_counter++;
                            currentQuestion = current_user_data?.user_questions?.[current_user_data?.question_counter];
                            // 5. if there is no more question to ask from this evaluation begin calculating the final score
                            if (!currentQuestion) {
                                finalResultsCalculator(evaluationThread);
                            } else {
                                // 6. if this is not the last question and there still questions to ask for this evaluation start a new quiz automatically
                                if (!current_user_data.isEvaluationActive) return;
                                startQuiz(evaluationThread);
                            }
                        }
                    });



                    // on question quiz end
                    answerCollector.on('end', collected => {
                        // 1. check if an answer was not submitted while collecting valid answers
                        isEvaluationActive = current_user_data?.isEvaluationActive;
                        if (!isCurrentQuestionAnswered && isEvaluationActive) {
                            // 2. if true => send "Time over" message to the evaluation thread
                            const timeOver = new Discord.MessageEmbed()
                                .setTitle('انتهى الوقت!')
                                .setColor('#ff0000')
                            evaluationThread.send(`${message.author}`)
                                .then(m => m.edit({ embeds: [timeOver] })
                                    .catch(err => console.log(err)))
                                .catch(err => console.log(err))
                            // 3. push current question and correct answer and ['0'] as user answer to user's results
                            const current_user_results = current_user_data.results;
                            if (current_user_results) {
                                current_user_results.push({
                                    question: currentQuestion?.image,
                                    correct_answer: currentQuestion?.answers,
                                    user_answer: ['0']
                                });
                                // 4. check if the user didn't answer for the last three questions 
                                if (current_user_results?.[current_user_results?.length - 1]?.user_answer[0] === "0"
                                    && current_user_results?.[current_user_results.length - 2]?.user_answer[0] === "0"
                                    && current_user_results?.[current_user_results?.length - 3]?.user_answer[0] === "0") {
                                    // 4.1. send END SESSION MESSAGE to thread [TODO]
                                    // evaluationThread.send('END SESSION')
                                    //     .catch(err => console.log(err));
                                    // 4.2. calculate final results
                                    return finalResultsCalculator(evaluationThread);
                                }
                            }
                            // 5. increment question_counter by one to move to the next question
                            current_user_data.question_counter++;
                            currentQuestion = all_users_data.find(u => u.id === message.author.id)?.user_questions?.[current_user_data.question_counter];
                            // 4. if there is no more question to ask from this evaluation begin calculating the final score
                            if (!currentQuestion) {
                                finalResultsCalculator(evaluationThread);
                            } else {
                                // 5. if this is not the last question and there still questions to ask for this evaluation start a new quiz automatically
                                startQuiz(evaluationThread);
                            }
                        }
                    });
                }).catch(err => console.log(err));
        }



        // Final results calculator function
        async function finalResultsCalculator(evaluationThread) {
            let current_user_results = all_users_data.find(user => user.id === message.author.id)?.results;
            let finalResultsP1 = '>>> ';
            let finalResultsP2 = '>>> ';
            let finalScore = 0;
            let userAnswer;
            let correctAnswer;
            for (let i = 0; i < current_user_results?.length; i++) {
                userAnswer = current_user_results[i]?.user_answer?.join(', ');
                correctAnswer = current_user_results[i]?.correct_answer?.join(', ');
                if (current_user_results.length > 20) {
                    if (i <= (current_user_results.length - 1) / 2) {
                        finalResultsP1 += `${userAnswer === correctAnswer ? '✅' : `❌`} [Q${i + 1}](${current_user_results[i].question}): ${userAnswer === correctAnswer ? `**${correctAnswer}**` : `${userAnswer === '0' ? `***Skipped***` : `*You:* **${userAnswer}**`}, *Correct:* **${correctAnswer}**`}
`}
                    if (i > (current_user_results.length - 1) / 2) {
                        finalResultsP2 += `${userAnswer === correctAnswer ? '✅' : `❌`} [Q${i + 1}](${current_user_results[i].question}): ${userAnswer === correctAnswer ? `**${correctAnswer}**` : `${userAnswer === '0' ? `***Skipped***` : `*You:* **${userAnswer}**`}, *Correct:* **${correctAnswer}**`}
`
                    }
                    if (i === current_user_results.length - 1) {
                        finalScore = countFinalScore(finalResultsP1, '✅');
                        finalScore += countFinalScore(finalResultsP2, '✅');
                        console.log("finalScore: ", finalScore);
                    }
                } else {
                    finalResultsP1 += `${userAnswer === correctAnswer ? '✅' : `❌`} [Q${i + 1}](${current_user_results[i].question}): ${userAnswer === correctAnswer ? `**${correctAnswer}**` : `${userAnswer === '0' ? `***Skipped***` : `*You:* **${userAnswer}**`}, *Correct:* **${correctAnswer}**`}
`
                    if (i === current_user_results.length - 1) {
                        finalScore = countFinalScore(finalResultsP1, '✅');
                        console.log("finalScore: ", finalScore);
                    }
                }
            }
            let finalResultsEmbed = new Discord.MessageEmbed();
            if (current_user_results.length < 20) {
                finalResultsEmbed
                    .setTimestamp()
                    .setFooter({ text: `${message.author.username}`, iconURL: `${message.author.avatarURL()}` })
            }
            isCurrentQuestionAnswered = false;
            all_users_data = all_users_data.filter(user => user.id !== message.author.id);
            await evaluationThread?.setLocked(true)
                .catch(err => console.log(err));
            // if user stopped evaluation before answering any question => return without send final results message
            if (finalResultsP1 === '>>> ') return;
            let resultsEmbedColor = finalScore < 32 ? '#ff0000' : '#00ff00';
            finalResultsEmbed
                .setTitle(`Your score: ${finalScore}/${numberOfQuestions}`)
                .setColor(resultsEmbedColor)
                .setDescription(`${finalResultsP1}`)
                .setThumbnail(`${scoring_images.find(si => si.score === finalScore)?.image}`);
            evaluationThread?.send({ embeds: [finalResultsEmbed] })
                .catch(err => console.log(err));
            let finalResultsEmbed2;
            if (current_user_results?.length && current_user_results.length > 20) {
                finalResultsEmbed2 = new Discord.MessageEmbed()
                    .setColor(resultsEmbedColor)
                    .setDescription(`${finalResultsP2}`)
                    .setTimestamp()
                    .setFooter({ text: `${message.author.username}`, iconURL: `${message.author.avatarURL()}` });
                evaluationThread.send({ embeds: [finalResultsEmbed2] })
                    .catch(err => console.log(err));
            }
            const user = message.author;
            try {
                await user.send({ embeds: [finalResultsEmbed] });
                if (current_user_results?.length && current_user_results.length > 20) {
                    await user.send({ embeds: [finalResultsEmbed2] });
                }
            } catch (error) {
                console.error(`Failed to send DM to user ${user.tag}:`, error);
            }
            return;
        }
    }
}