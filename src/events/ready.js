import { ActivityType, Events } from "discord.js";
import { readFileSync } from 'fs'

const musicDatas = JSON.parse(readFileSync('.tmp/MusicDatas.json'))

const randomSong = () => {
	const randInt = (min, max) => {
		return Math.floor(Math.random() * (max - min)) + min
	}
	const songID = randInt(0, musicDatas.length)
	return musicDatas.filter(song => song.MusicID === songID)
}

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		const song = randomSong()[0]
		const curPlaying = `${song.Artist} - ${song.Title}`
		console.log(curPlaying)
		client.user.setActivity({
			name: curPlaying,
			type: ActivityType.Listening
		})
		setInterval(() => {
			const song = randomSong()[0]
			const curPlaying = `${song.Artist} - ${song.Title}`
			console.log(curPlaying)
			client.user.setActivity({
				name: curPlaying,
				type: ActivityType.Listening
			})
		}, 600_000) // listening to a new song every 10 mins
		console.log(`${client.user.tag} has awoken`)
	}
}
