# Epicans Discord Bot

## Install

- run `npm install`
- install ffmeg
  - Windows
    - [Tutorial](https://phoenixnap.com/kb/ffmpeg-windows)
  - Linux
    - sudo apt install ffmpeg
- `npm run check` to verify the setup (formatting, lint, commands, events, `.env`) without connecting to Discord; `npm run format` fixes formatting
- `npm start`

## Configuration (`.env`)

| Variable                                   | Purpose                                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `TOKEN`                                    | Discord bot token                                                                                    |
| `CLIENTID`                                 | Bot application ID                                                                                   |
| `GUILDID`                                  | Server the slash commands are registered to                                                          |
| `OPENAI_KEY`                               | API key for `/chatgpt`                                                                               |
| `SPOTIFTYCLIENTID`, `SPOTIFTYCLIENTSECRET` | Spotify app credentials for playing Spotify links                                                    |
| `MUSIC_CHANNEL_ID`                         | `/play` only works in this channel (optional)                                                        |
| `DEV_CHANNEL_ID`                           | `/play` also works here, for testing (optional)                                                      |
| `DJ_ROLE_ID`                               | Only members with this role can use `/play` (optional)                                               |
| `AUDIT_IGNORE_CHANNEL_IDS`                 | Comma-separated channels or categories to leave out of the message log, e.g. private ones (optional) |

Leave an optional variable unset to turn that restriction off. Restart the bot after changing `.env`.

## Log channels

Errors, deleted/edited messages, joins/leaves and role changes all go to #epicans-log by default. An admin can send each one to its own channel with `/logs set`, check with `/logs show`, and undo with `/logs reset`. The choices are saved in `.data/settings.json` (not in git), so they survive pulls and deploys.
