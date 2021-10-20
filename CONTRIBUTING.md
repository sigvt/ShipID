# Contribution Guide

## Development Guide

```bash
git clone https://github.com/holodata/ShipID.git && cd ShipID
npm install
cp .env.placeholder .env
vim .env
npm run devcontainer

```

## Deploy Guide (Maintainers only)

```bash
git pull
docker-compose up --build
```

```js
db.createUser({
  user: "shipid",
  pwd: passwordPrompt(), // or cleartext password
  roles: [{ role: "read", db: "honeybee" }],
});
```

## References

- [discord.js](https://discord.js.org/#/docs/main/stable/general/welcome)
- [Discord.js Guide](https://discordjs.guide/#before-you-begin)
- [discordjs-bot-guide/roles.md](https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/understanding/roles.md)
- [Gentei](https://docs.member-gentei.tindabox.net/Discord/server-onboarding)
