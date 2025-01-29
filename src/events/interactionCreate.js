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
			await command.execute(interaction)
		} catch (error) {
			// console.error(error)
			let errMessage = ''
			switch (error.message) {
				case 'noPermission':
					errMessage = 'You don\'t have permission to use this command'
					break
				case 'invalidInput':
					errMessage = 'Invalid input'
					break
				case 'noQRFound':
					errMessage = 'No QR Found! Make use your QR is visible for me to read'
					break
				case 'fileNotFound':
					errMessage = 'File not found, either by game\'s data isn\'t the latest or invalid json input'
					break
				default:
					console.log(error)
					errMessage = 'An unknown error occurred when executing this command'
			}
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: errMessage, flags: MessageFlags.Ephemeral })
			} else {
				await interaction.reply({ content: errMessage, flags: MessageFlags.Ephemeral })
			}
		}
	}
}
