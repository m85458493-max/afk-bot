const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const afkUsers = new Map();

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity('AFK System | /afk', { type: 0 });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // اذا الشخص رجع من AFK
  if (afkUsers.has(message.author.id)) {
    const data = afkUsers.get(message.author.id);
    afkUsers.delete(message.author.id);
    const time = Math.floor((Date.now() - data.time) / 1000);
    let timeText = time < 60 ? `${time} ثانية` : time < 3600 ? `${Math.floor(time/60)} دقيقة` : `${Math.floor(time/3600)} ساعة`;
    return message.reply(`👋 اهلا بعودتك **${message.author.username}**! كنت AFK لمدة **${timeText}**\n> السبب كان: ${data.reason}`);
  }

  // اذا احد ذكر شخص AFK
  if (message.mentions.users.size > 0) {
    message.mentions.users.forEach(user => {
      if (afkUsers.has(user.id)) {
        const data = afkUsers.get(user.id);
        message.reply(`💤 **${user.username}** حالياً AFK\n> السبب: ${data.reason}\n> منذ: <t:${Math.floor(data.time/1000)}:R>`);
      }
    });
  }

  // امر AFK
  if (message.content.startsWith('!afk')) {
    const reason = message.content.slice(5).trim() || 'بدون سبب';
    afkUsers.set(message.author.id, { reason, time: Date.now() });
    return message.reply(`💤 تم تفعيل وضع AFK لك\n> السبب: ${reason}\n> اكتب اي رسالة للعودة`);
  }

  if (message.content === '!help') {
    const embed = new EmbedBuilder()
      .setTitle('🤖 اوامر بوت AFK')
      .setDescription('**!afk [سبب]** - تفعيل وضع AFK\nمثال: `!afk رايح انام`\n\n**!help** - عرض هذه القائمة\n\nعندما يذكرك احد وانت AFK، البوت يرد عليه تلقائياً.')
      .setColor(0x5865F2);
    return message.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
