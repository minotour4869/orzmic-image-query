import { Events, MessageFlags } from "discord.js";

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName)

			if (!command) {
				console.error(`[!] No command ${interaction.commandName}`)
				return
			}

			console.log(`[i] ${interaction.user.tag} issued command ${interaction.commandName}`)

			try {
				await command.execute(interaction)
			} catch (error) {
				// console.error(error)
				// console.log(error.cause[0])
				let errMessage = ''
				switch (error.message) {
					case 'NoPermission':
						errMessage = 'You don\'t have permission to use this command'
						break
					case 'InvalidInput':
						errMessage = `Invalid input: ${error.cause[0].message}`
						break
					case 'NoQRFound':
						errMessage = 'No QR Found! Make use your QR is visible for me to read'
						break
					case 'FileNotFound':
						errMessage = 'File not found, either by game\'s data isn\'t the latest or invalid json input'
						break
					default:
						console.error(error)
						errMessage = 'An unknown error occurred when executing this command'
				}
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: errMessage, flags: MessageFlags.Ephemeral })
				} else {
					await interaction.reply({ content: errMessage, flags: MessageFlags.Ephemeral })
				}
			}
		} else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName)

			if (!command) {
				console.error(`[!] No command ${interaction.commandName}`)
				return
			}

			try {
				await command.autocomplete(interaction)
			} catch (error) {
				console.error('[!] ' + error.message)
			}
		}
		
		
	}
}
