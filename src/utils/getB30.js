import * as fs from 'fs'
import { registerFont, createCanvas, loadImage } from 'canvas'
import { execSync } from 'child_process'
registerFont('miscs/Geometos.ttf', { family: 'Geometos' })

export async function getB30(player_data, timestamp, locale) {
	function rate(chartConstant, noteCount, score, exScore) {
		function baseRating() {
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
		if (exScore == 0) return (Math.ceil((baseRating() + 0.10)*20)/20).toFixed(3)
		if (exScore == 1) return (Math.ceil((baseRating() + 0.05)*50)/50).toFixed(3)
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
		return 'Orz'
	}
	let musicDatas = []
	try {
		musicDatas = JSON.parse(fs.readFileSync('.tmp/MusicDatas.json', 'utf8'))
	} catch (error) {
		if (error.message) throw new Error('fileNotFound')
		throw error
	}

	const canvas = createCanvas(1920, 1080)
	const ctx = canvas.getContext('2d')
	class Play {
		constructor(index, play) {
			
			const [musicID, difficulty, score, play_status, exScore] = play.split(',')
			this.score = score
			this.status = play_status
			this.exScore = exScore
			this.music = musicDatas.find(x => x.MusicID == musicID)
			// getAsset('chart', this.music.FileName)
			this.diff = difficulty
			this.chart = this.music.Difficulties.at(difficulty)
			this.index = index
			this.rank = rank(parseInt(this.chart.NoteCount), parseInt(this.score))
			this.rating = rate(parseFloat(this.chart.Rating), parseInt(this.chart.NoteCount), parseInt(this.score), this.chart.exScore)
		}
		
		// 306, 157, start from 27, 219
		draw(context) {

			const pos = [this.index%6, Math.floor(this.index/6)]
			const cvpos = [27 + pos[0]*306 + (pos[0] - 1)*6, 219 + pos[1]*157 + (pos[1] - 1)*7]
			loadImage(`.tmp/illustrators/${this.music.FileName}_img.png`).then((image) => {
				context.drawImage(image,
					0, 0,
					image.width, image.height,
					cvpos[0], cvpos[1],
					306, 157)
				context.fillStyle = '#000000cc'
				context.beginPath()
				context.fillRect(cvpos[0], cvpos[1], 306, 157)
				
				if (this.diff == 0) context.fillStyle = '#81defd'
				else if (this.diff == 1) context.fillStyle = '#ffdf80'
				else context.fillStyle = '#fe7e7d'
				context.fillRect(cvpos[0], cvpos[1], 4, 157)

				context.fillStyle = '#ffffff'
				context.font = '18px Geometos'
				context.textBaseline = 'alphabetic'
				context.textAlign = 'left'
				const truncate = (str) => {
					if (str.length <= 20) return str
					return str.substr(0, 17) + '...'
				}
				context.fillText(`${truncate(this.music.Title)}`, cvpos[0] + 10, cvpos[1] + 25)
				context.font = '20px Geometos'
				context.fillText(`${this.chart.Rating.toFixed(1)} > ${this.rating.toFixed(3)}`, cvpos[0] + 10, cvpos[1] + 55)

				context.font = '24px Geometos'
				context.textAlign = 'right'
				context.fillText(`#${this.index + 1}`, cvpos[0] + 300, cvpos[1] + 30)
			}).catch((err) => {
				if (err.message === 'No such file or directory') {
					throw new Error('fileNotFound')
				}
				throw err
			})

			loadImage(`miscs/Ranks/${this.rank}.png`).then((image) => {
				context.drawImage(image,
						0, 0,
						image.width, image.height,
						cvpos[0] + 230, cvpos[1] + 90,
						64, 64)

				if (this.status <= 2) context.fillStyle = '#fbd800'
				if (this.status == 3) context.fillStyle = '#33ccff'

				context.font = '44px Geometos'
				context.textAlign = 'left'
				context.textBaseline = 'bottom'
				context.fillText(this.score.padStart(7, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ","), cvpos[0] + 10, cvpos[1] + 158)
			})
			if (this.exScore < 2) {
				const plus = (this.exScore != 0 ? "SilverPlus" : "GoldPlus")
				loadImage(`miscs/Ranks/${plus}.png`).then((image) => {
					context.drawImage(image,
							0, 0,
							image.width, image.height,
							cvpos[0] + 275, cvpos[1] + 70,
							32, 32)
				})
			}
		}
	}

	let bg_file = 'miscs/Backgrounds/BG_'
	if (timestamp.getHours() >= 6 && timestamp.getHours() < 12) bg_file += 'NormalDay.png'
	else if (timestamp.getHours() >= 12 && timestamp.getHours() < 18) bg_file += 'SpecialDay.png'
	else if (timestamp.getHours() >= 18 && timestamp.getHours() < 21) bg_file += 'SpecialNight.png'
	else bg_file += 'NormalNight.png'
	loadImage(bg_file).then((image) => ctx.drawImage(image, 0, 0, 1920, 1080))
	loadImage('miscs/user.png').then((image) => ctx.drawImage(image, 0, 0, 1920, 1080))
	loadImage(`.tmp/characters/${player_data.CharID}_${player_data.CharSkinID}.png`).then((image) => {
		ctx.drawImage(image, 
			(image.width - image.height)/2, 0,
			image.height, image.height,
			27, 16,
			160, 160)
		ctx.font = "bold 42px Arial"
		ctx.fillStyle = 'white'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText(player_data.Name, 343, 97)

		ctx.font = '250px Geometos'
		ctx.fillStyle = '#ffffff26'
		ctx.fillText(player_data.SPRat, 752, 124)

		ctx.fillStyle = 'white'
		ctx.font = "42px Geometos"
		ctx.textAlign = 'left'
		ctx.textBaseline = 'alphabetic'
		ctx.fillText(player_data.Rat.slice(0, -1), 705, 115)
		const len = ctx.measureText(player_data.Rat.slice(0, -1))
		const new_pos = 705 + len.width
		console.log(new_pos)
		ctx.fillStyle = '#868686'
		ctx.font = '20px Geometos'
		ctx.fillText(player_data.Rat.at(-1), 705 + len.width, 115)

		ctx.fillStyle = 'white'
		ctx.font = '42px Geometos'
		ctx.textAlign = 'right'
		ctx.textBaseline = 'middle'
		ctx.fillText(player_data.Coin, 1830, 118)

		ctx.fillStyle = '#ffffff8a'
		ctx.font = '18px Geometos'
		ctx.textAlign = 'right'
		ctx.textBaseline = 'bottom'
		ctx.fillText(timestamp.toLocaleString(locale), 1915, 1075)
	}).catch((error) => {
			if (error.message === 'No such file or directory') {
				throw new Error('fileNotFound')
			}
			throw err
		})
	for (const [i, data] of player_data.B30Scores.entries()) {
		let play = new Play(i, data)
		play.draw(ctx)
	}
	console.log('Canvas drawn')
	return canvas
}
