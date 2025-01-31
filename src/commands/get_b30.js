import { AttachmentBuilder, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { getB30 } from "../utils/getB30.js";
import { Jimp } from "jimp";
import jsQR from "jsqr";
import { Validator, validate } from "jsonschema";
import * as fs from 'fs'

export default {
	data: new SlashCommandBuilder()
		.setName('get-b30')
		.setDescription('Get your best 30 plays')
		.setDescriptionLocalization('vi', "Trả về hình ảnh chứa 30 lần chơi tốt nhất")
		// .setContexts(InteractionContextType.Guild)
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
		let data = {}
		if (interaction.options.getSubcommand() === 'data') {
			data = JSON.parse(interaction.options.getString('data'))
		} else if (interaction.options.getSubcommand() === 'image') { 
			const attachment = interaction.options.getAttachment('image')
			const image = await Jimp.read(attachment.url)
			// console.log(image.bitmap)

			const code = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height)
			if (!code) {
				throw new Error('NoQRFound')
			}
			// console.log(code)
			data = JSON.parse(code.data)
		}
		const schema = fs.readFileSync('src/utils/b30_schema.json')
		const validateResult = validate(data, JSON.parse(schema))
		if (!validateResult.valid) {
			throw new Error('InvalidInput', {cause: validateResult.errors})
		}
		await interaction.deferReply()
		try {
			const canvas = await getB30(data, interaction.createdAt, interaction.locale, interaction.client)
			const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'result.png' })
			await interaction.editReply({ files: [attachment] }).then()	
		} catch (err) {
			throw err
		}
}
}
