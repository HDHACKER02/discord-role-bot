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
const YOUR_DISCORD_ID = 'DITT_DISCORD_ID_HÄR'; // Ersätt med ditt riktiga Discord ID
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

// ==== ENDAST EN client.once('ready') ====
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

// Resten av koden (interactionCreate, messageCreate) här...
// [Klistra in resten av koden från tidigare meddelande här]

client.login(BOT_TOKEN).catch(error => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});
