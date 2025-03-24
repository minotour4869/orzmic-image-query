import { MessageFlags, SlashCommandBuilder } from "discord.js";
import getUpdate from '../utils/update.js'

export default {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Update the latest data from the game to bot [owner only]')
		.setDescriptionLocalization('vi', 'Cập nhật dữ liệu mới nhất của game cho bot [lệnh của owner]'),
	async execute (interaction) {
		const runUpdate = () => new Promise((resolve, reject) => {
			try {
				getUpdate()
				resolve()
			} catch (err) {
				reject(err)
			}
		})
		if (interaction.user.id === '370740237024100353') {
			await interaction.reply({ content: 'Updating the latest game\'s data, please DO NOT to use the bot as it may not malfunction as normal', flags: MessageFlags.Ephemeral })
			runUpdate()	
		} else {
			throw new Error('NoPermission')
		}
	}
}
