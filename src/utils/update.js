import got from 'got'
import * as fs from 'fs'
import { createHash } from 'crypto'
import { SingleBar, Presets } from 'cli-progress'
import { spawnSync } from 'child_process'
import { signs } from './signs.js'
import 'dotenv/config'

const API_KEY = process.env.ITCH_APIKEY
const fileDir = ".tmp/Orzmic3.0.apk"
const bar = new SingleBar({
	etaBuffer: 1000,
	etaAsynchronousUpdate: false,
	format: '{bar} {percentage}% | ETA: {eta}s | {value}MB / {total}MB'
}, Presets.shades_classic)

export default async function getUpdate() {
	const itchAPI = got.extend({
		prefixUrl: 'https://itch.io/api/1/' + API_KEY,
		responseType: 'json'
	})

	const downloadFile = () => new Promise((resolve, rejects) => {
		itchAPI.get('game/1839054/uploads')
		.then(res => {
			const game_info = res.body.uploads[0]
			fs.readFile(fileDir, (err, data) => {
				if (!err && createHash('md5').update(data).digest('hex') === game_info.md5_hash) {
						console.log(signs.Info, 'Already at the latest version')
						resolve()
					}
				else {
					if (err && err.code != 'ENOENT') throw err
					console.log(signs.Info, `Downloading the latest version...`)
					itchAPI.get(`upload/${game_info.id}/download`)
				.	then(res => {
						const downloadStream = got.stream(res.body.url)
						const fileWritterStream = fs.createWriteStream(fileDir)

						downloadStream
						.on('response', () => {
							bar.start(Math.round(downloadStream.downloadProgress.total/1048576, 2), 0)
						})
						.on('downloadProgress', (progress, chunk) => {
							bar.update(Math.round(progress.transferred/1048576, 2))
						})
						.on('error', (err) => {
							console.error(signs.Error, `Download failed: ${err.message}`)					
							rejects(err)
						})
					
						fileWritterStream
						.on('error', (err) => {
							console.error(signs.Error, `Writing file failed: ${err.message}`)
							rejects(err)
						})
						.on('finish', () => {
							bar.stop()
							console.log(signs.Info, 'File downloaded')
							resolve()
						})
	
						downloadStream.pipe(fileWritterStream)
						bar.start(downloadStream.downloadProgress.total)
					})
				}
			})
		})
		.catch(rejects)
	})
	await downloadFile()
	spawnSync('python', ['src/utils/get_data.py', fileDir],  { stdio: 'inherit' })
	console.log(signs.Info, 'Update completed')
}
