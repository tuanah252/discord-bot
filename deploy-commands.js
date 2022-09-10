const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('js').setDescription('Đưa ra câu hỏi về JavaScript ngẫu nhiên'),
	new SlashCommandBuilder().setName('cpp').setDescription('Đưa ra câu hỏi về C++ ngẫu nhiên'),
	new SlashCommandBuilder().setName('pts').setDescription('Thông tin về số points hiện có '),
	new SlashCommandBuilder().setName('leaderboard').setDescription('Bảng xếp hạng points'),
	new SlashCommandBuilder().setName('shop').setDescription('Cửa hàng'),
	
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);