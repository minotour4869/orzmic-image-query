import { SlashCommandBuilder, EmbedBuilder, MessageFlags, AttachmentBuilder, Colors } from "discord.js";
import { readFileSync } from 'fs'
import path from "path";

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
		const filtered = queries.filter(query => (query[0].startsWith(focusedValue) || query[1].startsWith(focusedValue)))
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
		const song = songs[0]
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
		let stringDiff = ''
		const diff_name = [':blue_square:', ':yellow_square:', ':red_square:', ':black_large_square:']
		for (const diff in diffs) {
			if (diffs[diff] === null) continue
			if (diff > 0) stringDiff += ' / '
			stringDiff += `**${diff_name[diff]}** ${diffs[diff].Difficulty} (${diffs[diff].Rating})`
		}
		embed.addFields({
			name: '**Difficulties**:',
			value: stringDiff
		})
		await interaction.reply({ files: [image], embeds: [embed] })
	}
}
