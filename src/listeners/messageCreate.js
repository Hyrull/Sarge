import incrementCount from '../utils/incrementCount.js'
import { getSettings } from '../utils/settingsManager.js'
import youtubeSearchCommand from '../slash-commands/youtube.js'

async function messageCreateListener(message, client) {
  if(message.author.bot) return
  const lowerCaseContent = message.content.toLowerCase()
  const settings = await getSettings(message.guild.id)

  if (lowerCaseContent.includes('<:gorfil:1209654573871013888>') && settings.gorfil) {
    message.react(message.guild.emojis.cache.get('1209654573871013888'))
  } // this is so specific to our own channel, feel free to change it if you want but it just won't do anything on your own server

  if (lowerCaseContent.includes('french') && settings.frenchSnake) {
    message.react('🐍')
    incrementCount(message.guild.id, 'frenchSnakeCount')
  }

  if (lowerCaseContent.includes('american') && settings.americanSnake) {
    message.react('🐍')
    incrementCount(message.guild.id, 'americanSnakeCount')
  }
  
  const englishKeywords = ['british', 'english']
  if (englishKeywords.some(word => lowerCaseContent.includes(word)) && settings.englishTea) {
    message.react('🫖')
    // incrementCount(message, 'englishTea-count')
  }
  
  if (lowerCaseContent.includes('fr3nch') && settings.frenchSnake) {
    message.react('👀')
  }

  if (lowerCaseContent.includes('good bot') 
    || lowerCaseContent.includes('gud bot')
    || lowerCaseContent.includes('ty sarge')
    || lowerCaseContent.includes('thanks sarge')
    || lowerCaseContent.includes('thank you sarge')) {
    message.react('🩵')
  }

  if (lowerCaseContent.includes('crazy') && settings.crazy) {
    const randomNumber = Math.floor(Math.random() * 100)
    if (settings.crazyOdds >= randomNumber) {
      message.reply('Crazy? I was crazy once. They put me in a room. A rubber room. A rubber room with rats. And rats make me crazy.')
    } else {
      console.log(`Dodged crazy! RNG: ${randomNumber}/${settings.crazyOdds}`)
    }
  }

  // YouTube Search (legacy)
  if (lowerCaseContent.startsWith('$youtube')) {
    const query = lowerCaseContent.slice('$youtube '.length)
    await youtubeSearchCommand(query, true, message)
  }

}

export default messageCreateListener