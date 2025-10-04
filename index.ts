import chalk from "chalk";
import { Client, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import ora from "ora";
import prompts from "prompts";

console.log(chalk.bold.green("Discord Active Developer Badge"));
console.log(chalk.bold(chalk.red("Remember to do not share your Discord Bot token with anyone!\n")));

console.log(chalk.bold("This tool will help you to get the " + chalk.cyan.underline("Discord Active Developer Badge")));
console.log(chalk.bold("If you have any problem, please contact me on Discord: " + chalk.cyan.underline("VAR00N") + "\n"));

export async function checkToken(value: string): Promise<boolean> {
 if (!value) return false;

 const res = await fetch("https://discord.com/api/v10/users/@me", {
  method: "GET",
  headers: {
   Authorization: `Bot ${value.toString()}`,
  },
 });
 return res.status !== 200 ? false : true;
}

const community = await prompts({
 type: "confirm",
 name: "value",
 message: "You created new Discord Server and enabled Community in Server Settings?",
 initial: true,
});

if (!community.value) {
 console.log(chalk.bold.red("✖ You need to create new Discord Server and enable Community in Server Settings!"));
 process.exit(0);
}

const tokenPrompt = await prompts({
 type: "password",
 name: "token",
 message: "Enter your Discord Bot token",
 validate: async (value: string) => {
  const valid = await checkToken(value);
  return valid ? true : "Invalid Discord Bot token!";
 },
});

const valid = await checkToken(tokenPrompt.token);

if (!valid) {
 console.log(chalk.bold.red("✖ Invalid Discord Bot token!"));
 process.exit(0);
}

console.log();
const spinner = ora(chalk.bold("Running Discord Bot")).start();

const client = new Client({
 intents: [],
});

try {
 client.login(tokenPrompt.token);
} catch (e) {
 spinner.fail(chalk.bold("Error while logging in to Discord! GG, You broke Discord!"));
 process.exit(0);
}

const slashSpinner = ora(chalk.bold("Creating slash command interaction..."));

client.on("ready", async (client) => {
 spinner.succeed(chalk.bold(`Logged in as ${chalk.cyan.underline(client.user.tag)}!`));
 console.log(chalk.bold.green("✔") + chalk.bold(" Use this link to add your bot to your server: " + chalk.cyan.italic.underline(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands%20bot\n`)));
 slashSpinner.start();

 await client.application?.commands.set([
  {
   name: "active",
   description: "Get the Discord Active Developer Badge",
  },
 ]);

 slashSpinner.text = chalk.bold("Go to your Discord Server (where you added your bot) and use the slash command " + chalk.cyan.bold("/active"));
 slashSpinner.start();
});

client.on("interactionCreate", async (interaction) => {
 if (!interaction.isCommand()) return;

 if (interaction.commandName === "active") {
  const embed = new EmbedBuilder()
   .setAuthor({
    name: "🎯 Discord Active Developer Badge",
    iconURL: "https://media.discordapp.net/attachments/1412391247808565279/1423773086397763715/icon.png?ex=68e18784&is=68e03604&hm=ab1ed09b910d6aaaefa10b2e1d1bba30b29a5f47084fbd4c2fe94621da639811&=&format=webp&quality=lossless",
   })
   .setTitle("✅ The command was executed successfully!")
   .setColor("#00FF88")
   .setDescription("🎉 **Congratulations! You have successfully run the slash command!**\n\n" +
    "📋 **Steps to obtain the badge:**\n" +
    "• 🔗 Go to [Discord Active Developer](https://discord.com/developers/active-developer) and request your badge\n" +
    "• ⏰ The verification process may take up to 24 hours, so please be patient.\n" +
    "• 🎊 Once approved, the badge will appear on your profile.\n\n" +
    "💡 **Tip:** Make sure you have a community server enabled in your server settings.")
   .addFields([
    {
     name: "🔧 Additional information",
     value: "• The badge is only available for active developers\n• You must have a community server enabled\n• You can only use this command once",
     inline: false
    }
   ])
   .setThumbnail("https://media.discordapp.net/attachments/1412391247808565279/1423773086397763715/icon.png?ex=68e18784&is=68e03604&hm=ab1ed09b910d6aaaefa10b2e1d1bba30b29a5f47084fbd4c2fe94621da639811&=&format=webp&quality=lossless")
   .setTimestamp()
   .setFooter({
    text: "Made by VAR00N • All rights reserved",
    iconURL: "https://media.discordapp.net/attachments/1412391247808565279/1423773086397763715/icon.png?ex=68e18784&is=68e03604&hm=ab1ed09b910d6aaaefa10b2e1d1bba30b29a5f47084fbd4c2fe94621da639811&=&format=webp&quality=lossless",
   });
  
  slashSpinner.succeed(chalk.bold("The command was executed successfully! Follow the instructions in the Discord message you received!"));
  await interaction.reply({ embeds: [embed], ephemeral: true });
 }
});
