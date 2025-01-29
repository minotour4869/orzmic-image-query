import { SlashCommandBuilder, InteractionContextType, MessageFlags } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check the latency of the BOT')
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		if (interaction.user.id === '370740237024100353') {
			await interaction.reply({ content: `Pong! (latency: ${Date.now() - interaction.createdAt}ms, API latency: ${Math.round(interaction.client.ws.ping)}ms)`, flags: MessageFlags.Ephemeral})
		} else {
			throw new Error('noPermission')
		}
	}
}
