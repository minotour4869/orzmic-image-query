export async function log(interaction, type, message) {
    const log_guild = await interaction.client.guilds.fetch(process.env.GUILD_DEBUG)
    const log_channel = await log_guild.fetch(process.env.CHANNEL_DEBUG)
    await log_channel.send(type.icon + `\`\`\`${message}\`\`\``)
}
