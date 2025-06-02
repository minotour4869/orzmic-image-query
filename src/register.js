import { REST, Routes } from "discord.js";
import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'

const commands = []
const __dirname = import.meta.dirname

const commandsPath = path.join(__dirname, 'commands')

console.log(commandsPath)
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	console.log(file)
	const filePath = path.join(commandsPath, file)
	const { default: command } = await import(filePath)
	if ('data' in command && 'execute' in command) 
	{
		// console.log(command.data)
		commands.push(command.data.toJSON())
	}
	else console.log(`[WARNING] Command ${command.data.name} may not be registered`)
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		console.log(`Reloading ${commands.length} commands...`)

		const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: commands})

		console.log(`Reloaded ${data.length} commands`)
	} catch (error) {
		console.error(error)
	}
})();
