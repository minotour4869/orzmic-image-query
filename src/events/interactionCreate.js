import { Events, MessageFlags } from "discord.js";

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return
		
		const command = interaction.client.commands.get(interaction.commandName)

		if (!command) {
			console.error(`No command ${interaction.commandName}`)
			return
		}

		try {
			command.execute(interaction)
		} catch (error) {
			console.error(error)
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'An error occurred when executing this command', flags: MessageFlags.Ephemeral })
			} else {
				await interaction.reply({ content: 'An error occurred when executing this command', flags: MessageFlags.Ephemeral })
			}
		}
	}
}
