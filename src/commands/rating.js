import { EmbedBuilder } from "@discordjs/builders";
import { AttachmentBuilder } from "discord.js";
import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { readFileSync } from "fs";

const musicDatas = JSON.parse(readFileSync('.tmp/MusicDatas.json', 'utf-8'))
const locales = JSON.parse(readFileSync('src/locales/commands.json', 'utf-8'))
const queries = musicDatas.filter(song => song.Difficulties[0].Rating > 0).map(song => [song.Title, song.FileName])

export default {
    data: new SlashCommandBuilder()
        .setName('rating')
	.setDescription(locales.rating.description.EnglishUS)
        .setDescriptionLocalizations(locales.rating.description)
        .addStringOption(option =>
            option.setName('query')
		.setDescription(locales.rating.options.query.EnglishUS)
                .setDescriptionLocalizations(locales.rating.options.query)
                .setAutocomplete(true)
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('difficulty')
		.setDescription(locales.rating.options.difficulty.EnglishUS)
                .setDescriptionLocalizations(locales.rating.options.difficulty)
                .setRequired(true)
                .addChoices(
                    { name: 'EZ', value: 0 },
                    { name: 'NM', value: 1 },
                    { name: 'HD', value: 2 }))
        .addIntegerOption(option =>
            option.setName('score')
		.setDescription(locales.rating.options.score.EnglishUS)
                .setDescriptionLocalizations(locales.rating.options.score)
                .setRequired(true)
                .setMinValue(0))
        .addIntegerOption(option =>
            option.setName('ex_score')
		.setDescription(locales.rating.options.ex_score.EnglishUS)
                .setDescriptionLocalizations(locales.rating.options.ex_score)
                .setRequired(true)
                .addChoices(
                    { name: 'Gold Plus', value: 0 },
                    { name: 'Silver Plus', value: 1 },
                    { name: 'None', value: 2 })),
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
        const difficulty = interaction.options.getInteger('difficulty')
        const score = interaction.options.getInteger('score')
        const exScore = interaction.options.getInteger('ex_score')

        // validating inputs
        const songs = musicDatas.filter(song => song.FileName === query)
		if (!songs.length) {
			await interaction.reply({ content: locales.info.execute.no_song_found[interaction.locale].replace('{0}', songs), flags: MessageFlags.Ephemeral })
			return
		}
        
        const noteCount = songs[0].Difficulties[difficulty].NoteCount
        if (score > 1_000_000 + noteCount) {
            await interaction.reply({ content: locales.rating.execute.invalid_score[interaction.locale].replace('{0}', 1_000_000 + noteCount).replace('{1}', score), flags: MessageFlags.Ephemeral })
            return
        } 

        function rate(chartConstant, noteCount, score, exScore) {
		    function baseRating() {
                // new formula, shoutout to Sixi
                // https://mzh.moegirl.org.cn/Orzmic#Rating.E8.AE.A1.E7.AE.97.E6.9C.BA.E5.88.B6
			    if (score < 700_000) return 0
			    if (score < 900_000) 
				    return (chartConstant < 2 ? 
					    chartConstant*((score - 700_000)/200_000) :
					    chartConstant - 2.0 + ((score - 700_000)/100_000)
				    )
			    if (score < 950_000)
				    return chartConstant + ((score - 900_000)/125_000)
    			if (score < 980_000)
	    			return chartConstant + 0.4 + ((score - 950_000)/50_000)
		    	if (score < 1_000_000)
			    	return chartConstant + 1.0 + ((score - 980_000)/20_000)
    			if (score === 1_000_000)
	    			return chartConstant + 2.0
		    	if (score < 1_000_000 + noteCount)
			    	return chartConstant + 2.1
    			return chartConstant + 2.2
	    	}
		    if (exScore == 0) 
                return baseRating() + (score < 1_000_000 ? 0.05 : 0.10)
    		if (exScore == 1) 
                return baseRating() + (score < 1_000_000 ? 0.02 : 0.04)
		    return baseRating()
	    }

	    function rank(noteCount, score) {
		    if (score < 800_000) return 'F'
		    if (score < 850_000) return 'D'
		    if (score < 900_000) return 'C'
		    if (score < 950_000) return 'B'
		    if (score < 980_000) return 'A'
		    if (score < 1_000_000) return 'S'
		    if (score === 1_000_000) return 'O'
		    if (score < 1_000_000 + noteCount*0.8) return 'R'
		    if (score < 1_000_000 + noteCount) return 'Z'
		    return 'ORZ'
	    }
        await interaction.deferReply()
        
        const [score_embeds, score_images] = songs.reduce((res, song) => {
            const diff = song.Difficulties[difficulty]
            const embed_colors = [0x81defd, 0xffdf80, 0xfe7e7d]
            const diff_name = ['EZ', 'NM', 'HD']
            const image = new AttachmentBuilder(`.tmp/illustrators/${song.FileName}_img.png`)
            const embed = new EmbedBuilder({
                color: embed_colors[difficulty],
                title: song.Title,
                description: `**Difficulty**: ${diff_name[difficulty]} ${diff.Difficulty}`
            })
		.setThumbnail(`attachment://${song.FileName}_img.png`)
            embed.addFields(
                {
                    name: '**Score**',
                    value: `${score.toString().padStart(7, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                },
                {
                    name: '**Rank**',
                    value: `${rank(noteCount, score)}${'+'.repeat(2 - exScore)}`,
                    inline: true
                },
                {
                    name: '**Rating**',
                    value: `${diff.Rating.toFixed(1)} >> ${Math.round(1000*rate(diff.Rating, noteCount, score, exScore))/1000}`
                }
            )
            res[0].push(embed)
            res[1].push(image)
            return res
        }, [ [], [] ])
        await interaction.editReply({
            embeds: score_embeds,
	    files: score_images
        })
    }
}
