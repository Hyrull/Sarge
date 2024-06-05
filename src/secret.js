let lastExecutedTime = null
const cooldownDuration = 3 * 60 * 1000 // 3 minutes

const secretRuleCheck = (interaction) => {
    const currentTime = Date.now()
    if (lastExecutedTime && currentTime - lastExecutedTime < cooldownDuration) {
        const remainingTime = lastExecutedTime + cooldownDuration - currentTime
        const seconds = Math.ceil(remainingTime / 1000) // par défaut c'est en ms donc on converti en secondes
        interaction.reply(`Please wait ${seconds} seconds before using this command again.`)
        return
    }

    const userInput = interaction.options.get('input').value
    const userInputLowercase = userInput.toLowerCase()
    if (userInputLowercase.includes('w')
    && userInputLowercase.includes('h')
    && userInputLowercase.includes('a')
    && userInputLowercase.includes('m')
    && userInputLowercase.includes('!')) {
        interaction.reply(`You submitted: "*${userInput}*".\nThis input passed the secret rule!`)
    } else {
        interaction.reply(`You submitted: "*${userInput}*".\nThis input dit not pass the secret rule.`)
    }
    lastExecutedTime = currentTime
  }
  
  module.exports = {
    secretRuleCheck,
  }