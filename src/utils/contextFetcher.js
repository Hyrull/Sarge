
/**
 * Fetches recent channel history and formats it chronologically.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction 
 * @param {number} limit 
 * @returns {Promise<string>}
 */
export async function getChannelHistory(interaction, limit = 15) {
  try {
    if (!interaction.channel) return "No channel context available."

    // Fetch last N messages from DM or Server channel
    const messages = await interaction.channel.messages.fetch({ limit })
    
    // Discord returns newest -> oldest. Reverse for natural chronological order.
    const chronological = Array.from(messages.values()).reverse()

    const formatted = chronological
      .map(m => {
        let text = m.content || ""
        
        // Fallback for Sarge's previous embed responses
        if (!text && m.embeds.length > 0) {
          const embed = m.embeds[0]
          text = `[Embed: ${embed.title || ''}] ${embed.description || ''}`.trim()
        }

        return text ? `${m.author.username}: ${text}` : null
      })
      .filter(Boolean)
      .join("\n")

    return formatted || "No prior conversation history."
  } catch (err) {
    console.error("[CONTEXT] Failed to fetch channel history:", err.message)
    return "Unable to fetch channel history."
  }
}