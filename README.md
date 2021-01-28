# hey-office

**`hey-office`** is a simple CLI for interacting with a Google Assistant-powered office (or home) using simple text commands, for example: `$ hey-office "turn off office lights"`. It relies heavily on this Node.js implementation of the Google Assistant SDK: [endoplasmic/google-assistant](https://github.com/endoplasmic/google-assistant). This utility is best used in conjunction with an existing implementation of Google Home (or office), for example, with named devices that the Google Assistant can recognize, but the Google Assistant will attempt to process any text query provided to it, for example, `$ hey-office "what time is it?"`. Note that the `command` argument is _optional_—if omitted, **`hey-office`** will run interactively, allowing you to type in a query manually. Besides boilerplate `-h/--help` and `-v/--version` options, a single `-a/--say-aloud` option is provided, which will cause MacOS computers to speak any Google Assistant response aloud.

## Important: Pre-installation Configuration

**`hey-office`** requires authentication with Google via OAuth, a Google Developers console project with a configured OAuth consent screen, and a registered Google Assistant Device before it will run. The ultimate goal of this preparatory work is to create a `client_secret_*.json` file, which will then be used to create authentication credentials with Google. Here's how to set that up:

1. Go to the [Google Actions Console](console.actions.google.com) and click **New Project**.
2. Choose an existing project, or create a new project here.
3. Now, go to the [Google Developers Console](console.developers.google.com/apis/api/embeddedassistant.googleapis.com/overview), make sure the project you selected or created is shown in the header, and click **Enable API**.
4. In order to use any Google Assistant features, including this utility, which uses the GA API, the account you are using to create your project and later your credentials must share certain activity with Google. You can change that [here](https://myaccount.google.com/activitycontrols) if need be. Make sure your account is sharing _Web & App Activity_, in particular make sure _Include Chrome history and activity from sites, apps, and devices that use Google services_ is enabled, as well as _Device Information_. _Voice and Audio Activity_ will only be necessary if you plan on extending this implementation to utilize Voice and Audio features, which this utility does not, out of the box, though the library it is based on supports it.
5. Go to the **Credentials** tab within the **Google Assistant API** in your [Google Developers Console](console.developers.google.com/apis/api/embeddedassistant.googleapis.com/credentials). Again, make sure the same project is shown in the header. Click **Create Credentials** and then choose **OAuth Client ID**.
6. Select **Web Application** from the dropdown. Enter a **name** for your OAuth client, and in the **Authorized redirect URIs** field below, paste this URI exactly as shown: `http://localhost:8080/`. Go ahead and save your credentials.
7. You should now see those credentials you just created show up in the list on the page to which you are redirected. Click the _download_ icon and save the JSON file to the `/.auth` directory within your **`hey-office`** directory. **This is critical**.
8. Copy the entire filename of this JSON file, including the extension, and paste it into the file called `sample.env`, included with this repository, after the equals sign, replacing the placeholder 'fake' JSON file already there.
9. Rename this file, deleting the word 'sample' so it is called simply `.env`, or run this command in the **`hey-office`** directory: `mv sample.env .env`.
10. Go back to the [Google Developers Console](console.developers.google.com/apis/credentials/consent) for your project and click on the **OAuth consent screen** tab.
11. Configure your consent screen step by step, you just need to enter a minimal amount of information, for example, a name to show, an email (or use the generated email provided). Just ensure all required fields in Step 1 are filled out.
12. In Step 2, add the scope labeled **Google Assistant API** _./auth/assistant-sdk-prototype_, and only this scope. Finish the process and save.
13. Now it's time to actually authorize your computer to use the API you have just configured on Google. This involves running some python commands. Start by navigating to the **`hey-office`** directory in your terminal. `cd path/to/hey-office`.
14. If you **do not** have python3 installed, run the following commands in a terminal.

```
$ sudo apt-get update
$ sudo apt-get install python3-dev python3-venv
```

15. If you **already have** python3 installed, _skip the above step_ and enter the following commands, which will create a virtual environment to isolate the Google Assistant SDK software from the rest of your python install. (note: you will be asked to enter a password for `sudo` commands, and also—you can replace 'env' in the first command with any name you wish for your virtual environment, just make sure to use it consistently).

```
$ python3 -m venv env
$ env/bin/python -m pip install --upgrade pip setuptools wheel
$ source env/bin/activate
$ sudo apt-get install portaudio19-dev libffi-dev libssl-dev
$ python -m pip install --upgrade google-assistant-sdk[samples]
$ python -m pip install --upgrade google-auth-oauthlib[tool]
$ env/bin/google-oauthlib-tool \
  --scope https://www.googleapis.com/auth/assistant-sdk-prototype \
  --client-secrets <PASTE_PATH_TO_CLIENT_SECRET_JSON_FILE_HERE> \
  --save
```

16. After you run the last command, it will either open up a browser window automatically, asking you to authenticate with the Google app you just made in the Developers Console, so go ahead and do that with the account you used to create the project in the Google Developers Console. If a browser window does not open, you will see a URL in `stdout` in the terminal, which you can copy and paste into a browser to complete authentication.
17. After you finish authenticating, you will be redirected to http://localhost:8080/, which we specified earlier. But if you look in the address bar, there will be a new URL query parameter, something like ?code=4/XXXX. Copy the entire code, starting after the equals sign, and paste it into your terminal, which now should be prompting you with: `Enter the authorization code:`.
18. If everything goes well, you should get a response saying that credentials were saved to `../some/path/to/.config/google-oauthlib-tool/credentials.json`.
19. Congratulations, you made it! Finally, just run `deactivate` to deactivate the python virtual environment you started, and you should be able to use **`hey-office`**.
20. As shown above, to use, you can `npm install -g .` in the **`hey-office`** directory, to expose a global **`hey-office`** command, so you can run it with `hey-office [ command ] [ ( -a | --say-aloud ) ]`, otherwise you can always run with `node path/to/hey-office/bin/index.js [ command ] [ ( -a | --say-aloud ) ]`

## Installation

To install as a global CLI command: (run in the **`hey-office`** home directory)
`$ npm install -g .`. To run: `$ hey-office [ command ] [ ( -a | --say-aloud ) ]` (see usage below).

Otherwise you can always run **`hey-office`** with `node path/to/hey-office/bin/index.js [ command ] [ ( -a | --say-aloud ) ]`

## Usage

```
Usage: hey-office [ command ] [ ( -a | --say-aloud ) ]

Sends individual text commands to Google Assistant via CLI

Arguments:
  command          Text command to send to Google Assistant. If no command is
                   provided, you will be prompted to enter one interactively.

Options:
  -a, --say-aloud  Speaks Google Assistant response aloud on host machine.
  -v, --version    Displays the current version of hey-office.
  -h, --help       Displays this help file.
```

## Examples

**Turn off device named "Office Lights" from the command-line** _(if you have such a device created in Google Home already)_

```
$ hey-office "turn off office lights"
```

**For MacOS computers, ask Google for and have the computer speak the current time in Rome, Italy**

```
$ hey-office "what time is it in rome?" --say-aloud
```

## Other Uses

I actually set this up so that I could send these simple text messages to my computer from **iOS Shortcuts**, which has an action called "Run script over SSH". I run the **`hey-office`** process a few times in parallel using the UNIX `&` operator to run a task in the background, in order to orchestrate operating several devices over SSH in this manner. Just be aware the **`hey-office`** command itself won't work from iOS Shortcuts—actually even `node` won't work—you have to specify the full, absolute paths to `node` and to **`hey-office`**'s `index.js` file, for example:

```
$ /usr/local/bin/node ~/full/path/to/hey-office/bin/index.js "turn off humidifier"
```

## Attribution

This simple utility depends heavily on the library [endoplasmic/google-assistant](https://github.com/endoplasmic/google-assistant). You can easily extend the features of this little text-based Google Assistant messenger with the methods provided by this library.

MIT License
Copyright (c) 2021 Avana Vana
