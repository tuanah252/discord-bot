const fs = require('fs');
const { Client, GatewayIntentBits, MessageAttachment, Attachment, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Activity, } = require('discord.js');
const { token } = require('./config.json');
const { log } = require('console');
const { ComponentType } = require('discord.js');
const { ActivityType } = require('discord.js');
const { interactionCreate } = require('./events/interactionCreate')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const data = {
    "JS": JSON.parse(fs.readFileSync('./questions/JS-questions.json')),
    "CPP": JSON.parse(fs.readFileSync('./questions/CPP-questions.json'))
}

const bananas = {
    'one': 0,
    'two': 1,
    'three': 2,
    'four': 3,
}

let fat = {};

function get_question(type) {
    const questions = data[type];
    const index = Math.floor(Math.random() * (questions.length - 1));
    const question = questions[index];
    return [question, index];
}

function getButton(type, index) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`one_${type.toUpperCase()}_${index}`)
                .setLabel('1️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`two_${type.toUpperCase()}_${index}`)
                .setLabel('2')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`three_${type.toUpperCase()}_${index}`)
                .setLabel('3')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`four_${type.toUpperCase()}_${index}`)
                .setLabel('4')
                .setStyle(ButtonStyle.Secondary),
        );
}

client.on("ready", () => {
    let state = 0;
    const presences = [
        { type: 'Playing', message: 'Đùa Tình Cảm Của Phát' },
        { type: 'Watching', message: 'Duy Bán Cần Sa' },
        { type: 'Listening', message: 'Blasheeb Gõ Phím' },
        { type: 'Watching', message: 'Hồng Đức Code Dạo' }
    ];
    setInterval(() => {
        state = (state + 1) % presences.length;
        const presence = presences[state];
        client.user.setActivity(presence.message, { type: ActivityType[presence.type] });
    }, 5000);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    if (Object.keys(data).includes(commandName.toUpperCase())) {

        const [question, index] = get_question(commandName.toUpperCase());

        const row = getButton(commandName.toUpperCase(), index);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL(),
            })
            .setColor("Navy")
            .setDescription(
                `
                **Câu hỏi: **
                \`\`\` ${question.name}\`\`\`
                `
            )
            .setImage(
                question.image ||
                "https://st.quantrimang.com/photos/image/2019/03/02/loi-chuc-thi-tot-1.jpg"
            );

        const message = await interaction.reply({
            embeds: [embed],
            fetchReply: true,
        });

        let answers = '';
        question.answers.map((x, i) => answers += `**${i + 1}**: ${x.content}\n`);

        const answerMessage = await interaction.followUp({
            content: answers,
            components: [row]
        });

        fat = answerMessage;
    }
});

client.on("interactionCreate", async (interaction) => {

    if (interaction.isButton()) {

        const [choice, type, index] = interaction.customId.split('_');
        const question = data[type];
        const trueAnswer = question[index].answers.findIndex(x => x.isCorrect);
        const userName = interaction.user.id;
        const dataUser = JSON.parse(fs.readFileSync('./database.json'));
        dataUser.player.sort((a, b) => b.point - a.point);

        fat.edit({
            components: []
        });

        if (bananas[choice] == trueAnswer) {

            await interaction.reply({ content: `<@${userName}> | Chọn phương án ${bananas[choice] + 1} | **ĐÚNG**` });

            const index = dataUser.player.findIndex(player => player.id == interaction.user.id);

            if (index != -1) dataUser.player[index].point++;
            else dataUser.player.push({ name: interaction.user.username, id: interaction.user.id, point: 1, best: false });

            const role = interaction.guild.roles.cache.get("1012944310435594241");

            dataUser.player[0].best = true;
            dataUser.player.map((player, index) => {
                if (index > 0) {
                    const member = interaction.guild.members.cache.get(player.id);
                    member.roles.remove(role);
                    player.best = false;
                }
            });

            const member = interaction.guild.members.cache.get(dataUser.player[0].id);
            member.roles.add(role);

            fs.writeFileSync('./database.json', JSON.stringify(dataUser, null, 4));
        } else {
            await interaction.reply({ content: `<@${userName}> | Chọn phương án ${bananas[choice] + 1} | **SAI**` });
            const index = dataUser.player.findIndex(player => player.id == interaction.user.id);

            if (index != -1 && dataUser.player[index].point > 0)
                dataUser.player[index].point--;

            const role = interaction.guild.roles.cache.get("1012944310435594241");

            dataUser.player[0].best = true;
            dataUser.player.map((player, index) => {
                if (index > 0) {
                    const member = interaction.guild.members.cache.get(player.id);
                    member.roles.remove(role);
                    player.best = false;
                }
            });

            const member = interaction.guild.members.cache.get(dataUser.player[0].id);

            member.roles.add(role);

            fs.writeFileSync('./database.json', JSON.stringify(dataUser, null, 4));
        }
    }
});

// ============================= economic system =============================================================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    if (commandName === 'leaderboard') {
        const data = JSON.parse(fs.readFileSync('./database.json')).player.sort((a, b) => b.point - a.point);
        const topLeaders = data.slice(0, 6);

        const ldEmbed = new EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL(),
            })
            .setColor("Yellow")
            .setDescription(
                topLeaders.map((player, index) => `\`\`\`fix
${(player.best) ? '👑' : ''} [${index + 1}] ${player.name} sở hữu: ${player.point}🥇  \`\`\`
                `).join('\n')
            )

        return interaction.reply({
            embeds: [ldEmbed]
        }
        );
    }
})

client.once('ready', () => {
    console.log('Ready!');
});

client.login(token);