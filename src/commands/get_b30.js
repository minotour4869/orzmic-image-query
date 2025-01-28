import { AttachmentBuilder, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { getB30 } from "../utils/getB30.js";
import { Image } from 'canvas'

export default {
	data: new SlashCommandBuilder()
		.setName('getb30')
		.setDescription('Get your best 30 plays')
		.setDescriptionLocalization('vi', "Trả về hình ảnh chứa 30 lần chơi tốt nhất")
		.setContexts(InteractionContextType.Guild)
		.addSubcommand(subcmd => 
			subcmd
				.setName('image')
				.setDescription('Using your QR from "About the BOT"')
				.setDescriptionLocalization('vi', 'Sử dụng ảnh chụp QR từ "Về BOT"')
				.addAttachmentOption(option =>
					option
						.setName('image')
						.setDescription('Image file including valid QR')
						.setDescriptionLocalization('vi', "Hình ảnh có chứa QR hợp lệ")
						.setRequired(true)
					)
		)
		.addSubcommand(subcmd =>
			subcmd
				.setName('data')
				.setDescription('Using copied data from "About the BOT"')
				.setDescriptionLocalization('vi', 'Sử dụng thông tin được sao chép từ "Về BOT"')
				.addStringOption(option =>
					option
						.setName('data')
						.setDescription('JSON data copied')
						.setDescriptionLocalization('vi', 'Thông tin JSON vừa được sao chép')
						.setRequired(true))
		),
	async execute (interaction) {
		// console.log(interaction)
		// await interaction.reply('Pong')
		if (interaction.options.getSubcommand() === 'data') {
			await interaction.deferReply()
			const data = JSON.parse(interaction.options.getString('data'))
			// const buffer = await getB30(data)
			// const attachment = new AttachmentBuilder(buffer, { name: 'result.png' })
			getB30(data)
			.then(buffer => {
					interaction.followUp({ files: [{ attachment: buffer} ] }).then()
					}
				)
		}
	}
}
