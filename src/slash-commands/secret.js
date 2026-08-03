let lastExecutedTime = null
const cooldownDuration = 3 * 60 * 1000 // 3 minutes

const secretRuleCheck = (interaction) => {
    const currentTime = Date.now()
    if (lastExecutedTime && currentTime - lastExecutedTime < cooldownDuration) {
        const remainingTime = lastExecutedTime + cooldownDuration - currentTime
        const seconds = Math.ceil(remainingTime / 1000) // to convert to seconds
        interaction.reply(`Please wait ${seconds} seconds before using this command again.`)
        return
    }

    const userInput = interaction.options.get('input').value
    // Word separation
    const words = userInput.trim().split(/\s+/)
    // Calculating total message character count
    const totalLength = words.reduce((sum, word) => sum + word.length, 0)
    // Total char/length = avg word length
    const averageWordLength = totalLength / words.length

    if (averageWordLength >= 4.3 && averageWordLength <= 4.8) 
    {
        interaction.reply(`You submitted: "*${userInput}*".\nThis input passed the secret rule!`)
    } else {
        interaction.reply(`You submitted: "*${userInput}*".\nThis input did not pass the secret rule.`)
    }
    lastExecutedTime = currentTime
  }
  
  module.exports = {
    secretRuleCheck,
  }