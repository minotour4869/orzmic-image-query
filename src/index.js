import 'dotenv/config'
import { Client, Collection, GatewayIntentBits } from 'discord.js'
import * as path from 'path'
import * as fs from 'fs'
// import { getB30 } from './utils/getB30.js'

const musicDatas = JSON.parse(fs.readFileSync('.tmp/MusicDatas.json'))
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
client.commands = new Collection()

const __dirname = import.meta.dirname

// registering commands
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const { default: command } = await import(filePath)
	client.commands.set(command.data.name, command)
}

// listening events
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file)
	const { default: event } = await import(filePath)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args))
	} else {
		client.on(event.name, (...args) => event.execute(...args))
	}
}

client.login()

// getUpdate(process.env.ITCH_APIKEY)
// getB30(JSON.parse(fs.readFileSync('data/player.json', 'utf8')))
