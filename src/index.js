import "dotenv/config";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import * as path from "path";
import * as fs from "fs";
import getUpdate from "./utils/update.js";
import { signs } from "./utils/signs.js";

if (!fs.existsSync(".tmp/Orzmic3.0.apk")) {
    console.log(signs.Info, "Apk file not found, performing data initilization...",);
    getUpdate();
}

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.DirectMessages
	] 
});
client.commands = new Collection();

const __dirname = import.meta.dirname;

// registering commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const { default: command } = await import(filePath);
  client.commands.set(command.data.name, command);
}

// listening events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const { default: event } = await import(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login();
