import { SlashCommandBuilder, EmbedBuilder, MessageFlags, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ActionRowBuilder } from "discord.js";
import { readFileSync } from 'fs'

const musicDatas = JSON.parse(readFileSync('.tmp/MusicDatas.json', 'utf-8'))
const queries = musicDatas.map(music => [music.Title, music.FileName])

export default {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get the info of a song in the game')
		.setDescriptionLocalization('vi', 'Lấy thông tin từ một bài hát trong game')
		.addStringOption(option => 
			option.setName('query')
				.setDescription('Song title to search for')
				.setDescriptionLocalization('vi', 'Tên bài hát cần tìm')
				.setAutocomplete(true)
				.setRequired(true)),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused()
		const regexp = new RegExp(focusedValue, "i")
		const filtered = queries.filter(query => (query[0].match(regexp) || query[1].match(regexp)))
		await interaction.respond(
			filtered.map(query => ({ name: query[0], value: query[1] }))
		)
	},
	async execute(interaction) {
		const query = interaction.options.getString('query')
		const songs = musicDatas.filter(song => song.FileName === query)
		if (!songs) {
			await interaction.reply({ content: `No songs found with name ${query}`, flags: MessageFlags.Ephemeral })
			return
		}
		await interaction.deferReply()
		const [embeds, images] = songs.reduce((res, song) => {
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
			files: images,
			embeds: embeds
		})
	}
}
