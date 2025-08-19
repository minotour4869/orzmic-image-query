import { ActionRowBuilder, AttachmentBuilder, Component, ComponentType, EmbedBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import { getB30 } from "../utils/getB30.js";
import { Jimp } from "jimp";
import jsQR from "jsqr";
import { Validator, validate } from "jsonschema";
import * as fs from 'fs'

const locales = JSON.parse(fs.readFileSync('src/locales/commands.json', 'utf-8'))

export default {
	data: new SlashCommandBuilder()
		.setName('get-b30')
		.setDescription(locales.get_b30.description.EnglishUS)
        	.setDescriptionLocalizations(locales.get_b30.description)
		// .setContexts(InteractionContextType.Guild)
		.addSubcommand(subcmd => 
			subcmd
				.setName('image')
				.setDescription(locales.get_b30.subcmds.image.description.EnglishUS)
                		.setDescriptionLocalizations(locales.get_b30.subcmds.image.description)
				.addAttachmentOption(option =>
					option
						.setName('image')
						.setDescription(locales.get_b30.subcmds.image.options.image.EnglishUS)
                        			.setDescriptionLocalizations(locales.get_b30.subcmds.image.options.image)
						.setRequired(true)
					)
		)
		.addSubcommand(subcmd =>
			subcmd
				.setName('data')
				.setDescription(locales.get_b30.subcmds.data.description.EnglishUS)
                .setDescriptionLocalizations(locales.get_b30.subcmds.data.description)
				.addStringOption(option =>
					option
						.setName('data')
						.setDescription(locales.get_b30.subcmds.data.options.data.EnglishUS)
                        .setDescriptionLocalizations(locales.get_b30.subcmds.data.options.data)
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
			const results = await getB30(data, interaction.createdAt, interaction.locale, interaction.client)

            const b30_attachment = new AttachmentBuilder(results[0].toBuffer(), { name: `${interaction.client.user.id}_b30.png` })
            const marathon_attachment = new AttachmentBuilder(results[1].toBuffer(), { name: `${interaction.client.user.id}_marathon.png` })

            const select_choices = [
                {
                    label: 'Best 30',
                    description: 'Your B30 image',
                    value: 'b30'
                },
                {
                    label: 'Survival time',
                    description: 'Your best time in the Rank Survival mode',
                    value: 'marathon'
                }
            ]

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(interaction.id)
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(select_choices)

            const actionRow = new ActionRowBuilder()
                .addComponents(selectMenu)

			const reply = await interaction.editReply({ 
                files: [b30_attachment],
                components: [actionRow],
                withResponse: true
            })

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: i => i.user.id === interaction.user.id && i.customId === interaction.id,
                time: 60_000
            })

            collector.on('collect', (interaction) => {
                interaction.deferUpdate()
                if (interaction.values[0] === 'b30')
                    reply.edit({
                        files: [b30_attachment]
                    })

                if (interaction.values[0] === 'marathon')
                    reply.edit({
                        files: [marathon_attachment]
                    })
            })
		} catch (err) {
			throw err
		}
	}
}
