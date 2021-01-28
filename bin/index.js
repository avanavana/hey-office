#!/usr/bin/env node

const readline = require('readline');
const path = require('path');
const GoogleAssistant = require('google-assistant');
const { exec } = require('child_process');
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});
const { name, version } = require('../package.json');

const config = {
  auth: {
    keyFilePath: path.join(
      __dirname,
      '..',
      '.auth',
      process.env.CLIENT_SECRET_JSON
    ),
    savedTokensPath: path.join(__dirname, '..', '.auth', 'tokens.json'),
  },
  conversation: {
    lang: 'en-US',
    showDebugInfo: false,
  },
};

const { program } = require('commander');
program
  .name(name)
  .usage(`[ command ] [ ( -a | --say-aloud ) ]`)
  .arguments('[command]')
  .description('Sends individual text commands to Google Assistant via CLI', {
    command:
      'Text command to send to Google Assistant. If no command is provided, you will be prompted to enter one interactively.',
  })
  .action((command) => {
    if (command) {
      config.conversation.textQuery = command;
      console.log(`Command: "${command}"`);
    }
  })
  .option(
    '-a, --say-aloud',
    'Speaks Google Assistant response aloud on host machine.'
  )
  .version(
    version || '0.1.0',
    '-v, --version',
    `Displays the current version of ${name}.`
  )
  .helpOption('-h, --help', 'Displays this help file.')
  .parse(process.argv);

const respond = (text) => {
  if (
    process.argv.indexOf('-a') > 0 ||
    process.argv.indexOf('--say-aloud') > 0
  ) {
    exec(`say "${text}" -v Samantha`, (error, stdout, stderr) => {
      if (error) console.error(`error: ${error.message}`);
      if (stderr) console.error(`stderr: ${stderr}`);
      if (stdout) console.log(`stdout: ${stdout}`);
    });
  }

  console.log('Google Assistant:', text);
};

const startConversation = (conversation) => {
  conversation
    .on('response', (text) => text && respond(text))
    .on('device-action', (action) => console.log('Device Action:', action))
    .on('ended', (error, continueConversation) => {
      if (error) {
        console.log('Conversation Ended Error:', error);
      } else if (continueConversation) {
        processInput();
      } else {
        console.log('Conversation Complete');
        conversation.end();
      }
    })
    .on('error', (error) => {
      console.log('Conversation Error:', error);
    });
};

const processInput = () => {
  if (config.conversation.textQuery) {
    assistant.start(config.conversation, startConversation);
  } else {
    const read = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    read.question('Type your request: ', (request) => {
      config.conversation.textQuery = request;
      assistant.start(config.conversation, startConversation);
      read.close();
    });
  }
};

const assistant = new GoogleAssistant(config.auth);
assistant.on('ready', processInput).on('error', (error) => {
  console.log('Assistant Error:', error);
});
