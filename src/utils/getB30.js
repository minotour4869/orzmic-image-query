import * as fs from 'fs'
import { registerFont, createCanvas, loadImage } from 'canvas'
import { rate, rank } from './score.js'
registerFont('miscs/Geometos.ttf', { family: 'Geometos' })
registerFont('miscs/NotoSansJP-SemiBold.ttf', { family: 'Noto Sans JP Semi Bold' })

export async function getB30(player_data, timestamp, locale, client) {
	let musicDatas = []
	try {
		musicDatas = JSON.parse(fs.readFileSync('.tmp/MusicDatas.json', 'utf8'))
	} catch (error) {
		if (error.message) throw new Error('FileNotFound')
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
			this.diff = difficulty
			this.chart = this.music.Difficulties.at(difficulty)
			this.index = index
			this.rank = rank(parseInt(this.chart.NoteCount), parseInt(this.score))
			this.rating = rate(this.chart.Rating, this.chart.NoteCount, parseInt(this.score), exScore)
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
				context.fillStyle = '#0000008c'
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
				const title = truncate(this.music.Title)
				const rForeign = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/
				if (title.match(rForeign)) context.font = '18px "Noto Sans JP Semi Bold"'
				context.fillText(`${title}`, cvpos[0] + 10, cvpos[1] + 25)
				context.font = '20px Geometos'
				context.fillText(`${this.chart.Rating.toFixed(1)} > ${this.rating.toFixed(3)}`, cvpos[0] + 10, cvpos[1] + 55)

				context.font = '24px Geometos'
				context.textAlign = 'right'
				context.fillText(`#${this.index + 1}`, cvpos[0] + 300, cvpos[1] + 30)
			}).catch((err) => {
				if (err.message === 'No such file or directory') {
					throw new Error('FileNotFound')
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

	const bg_file = 'miscs/Backgrounds/BG_'
	const day = (timestamp.getDay() > 0 && timestamp.getDay() < 6) ? 'Normal' : 'Special'
	const time = (timestamp.getHours() >= 5 && timestamp.getHours() < 18) ? 'Day': 'Night' 
	loadImage(bg_file + day + time + '.png').then((image) => ctx.drawImage(image, 0, 0, 1920, 1080))
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

		ctx.textAlign = 'left'
		ctx.fillText(`Generated by ${client.user.tag}`, 5, 1075)
	}).catch((error) => {
			if (error.message === 'No such file or directory') {
				throw new Error('FileNotFound')
			}
			throw err
		})
	for (const [i, data] of player_data.B30Scores.entries()) {
		let play = new Play(i, data)
		play.draw(ctx)
	}
	return canvas
}
