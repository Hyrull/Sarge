import incrementCount from '../utils/incrementCount.js';
import { getSettings } from '../utils/settingsManager.js';

async function messageCreateListener(message, client) {
  if(message.author.bot) return
  const lowerCaseContent = message.content.toLowerCase()
  const settings = await getSettings(message.guild.id)

  if (lowerCaseContent.includes('<:gorfil:1209654573871013888>') && settings.gorfil) {
    message.react(message.guild.emojis.cache.get('1209654573871013888'))
  }

  if (lowerCaseContent.includes('french') && settings.frenchSnake) {
    message.react('🐍')
    incrementCount(message.guild.id, 'frenchSnakeCount')
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
    || lowerCaseContent.includes('gud bot')) {
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

  // if (lowerCaseContent.startsWith('$greetings')) {
  //   message.reply('https://cdn.discordapp.com/attachments/523257630332813324/1288019769299173407/greetings.mp4?ex=66f3a963&is=66f257e3&hm=ecb7688f9c6b6b045b920ee206d7eadf846b9bb04856dd57f8e6f4bfe5214ed4&')
  // }

  // YouTube Search (legacy)
  if (lowerCaseContent.startsWith('$youtube')) {
    const query = lowerCaseContent.slice('$youtube '.length)
    await youtubeSearchCommand(query, true, message)
  }

}

export default messageCreateListener