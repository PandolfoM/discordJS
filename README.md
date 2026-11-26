# Epicans Discord Bot

## Install

- run `npm install`
- install ffmeg
  - Windows
    - [Tutorial](https://phoenixnap.com/kb/ffmpeg-windows)
  - Linux
    - sudo apt install ffmpeg
- `npm start`

## Configuration (`.env`)

| Variable | Purpose |
| --- | --- |
| `TOKEN` | Discord bot token |
| `CLIENTID` | Bot application ID |
| `GUILDID` | Server the slash commands are registered to |
| `OPENAI_KEY` | API key for `/chatgpt` |
| `SPOTIFTYCLIENTID`, `SPOTIFTYCLIENTSECRET` | Spotify app credentials for playing Spotify links |
| `MUSIC_CHANNEL_ID` | `/play` only works in this channel (optional) |
| `DEV_CHANNEL_ID` | `/play` also works here, for testing (optional) |
| `DJ_ROLE_ID` | Only members with this role can use `/play` (optional) |

Leave an optional variable unset to turn that restriction off. Restart the bot after changing `.env`.
