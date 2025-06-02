import { SlashCommandBuilder, EmbedBuilder, MessageFlags, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ActionRowBuilder } from "discord.js";
import { readFileSync } from 'fs'

const musicDatas = JSON.parse(readFileSync('.tmp/MusicDatas.json', 'utf-8'))
const locales = JSON.parse(readFileSync('src/locales/commands.json', 'utf-8'))
const queries = musicDatas.map(music => [music.Title, music.FileName])

export default {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription(locales.info.description.EnglishUS)
        .setDescriptionLocalizations(locales.info.description)
		.addStringOption(option => 
			option.setName('query')
				.setDescription(locales.info.options.query.EnglishUS)
                .setDescriptionLocalizations(locales.info.options.query)
				.setAutocomplete(true)
				.setRequired(true)),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused()
		const regexp = new RegExp(focusedValue, "i")
		const filtered = queries.filter(query => (query[0].match(regexp) || query[1].match(regexp))).slice(0, 25);
		await interaction.respond(
			filtered.map(query => ({ name: query[0], value: query[1] }))
		)
	},
	async execute(interaction) {
		const query = interaction.options.getString('query')
		const songs = musicDatas.filter(song => song.FileName === query)
		if (!songs.length) {
			await interaction.reply({ content: locales.info.execute.no_song_found[interaction.locale], flags: MessageFlags.Ephemeral })
			return
		}
		await interaction.deferReply()
		const [info_embeds, info_images] = songs.reduce((res, song) => {
			const image = new AttachmentBuilder(`.tmp/illustrators/${song.FileName}_img.png`)
			const embed = new EmbedBuilder({
				color: 0xfee75c,
				title: song.Title,
				thumbnail: {
					url: `attachment://${song.FileName}_img.png`
				},
				description: `**Artist**: ${song.Artist}
**Cover**: ${song.CoverPainter}
**BPM Range**: ${song.BPMRange}`
			})
			const diffs = song.Difficulties
			const diffIcon = [':blue_square:', ':yellow_square:', ':red_square:', ':black_large_square:']
			let stringDiff = ''
			for (const diff in diffs) {
				if (!diffs[diff]) continue
				if (diff > 0) stringDiff += ' / '
				stringDiff += `${diffIcon[diff]} ${diffs[diff].Difficulty}`
				if (diffs[diff].Rating > 0) stringDiff += ` (${diffs[diff].Rating.toFixed(1)})`
			}
			embed.addFields(
				{
					name: '**Difficulty**',
					value: stringDiff
				},
				{
					name: '**Keywords**',
					value: `${song.Title}, ${song.FileName},...`
				}
			)
			res[0].push(embed)
			res[1].push(image)
			return res
		}, [ [], []])
		await interaction.editReply({
			files: info_images,
			embeds: info_embeds,
		})
	}
}
