# Contribution Guide

## Development Guide

```bash
git clone https://github.com/holodata/shipid.git && cd shipid
npm install
cp .env.placeholder .env
vim .env
npm run devcontainer

```

## Release Guide (Maintainers only)

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
- [discordjs-bot-guide/roles.md at master · AnIdiotsGuide/discordjs-bot-guide](https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/understanding/roles.md)
- [googleapis/google-api-nodejs-client](https://github.com/googleapis/google-api-nodejs-client)
- [Server Onboarding - Gentei](https://docs.member-gentei.tindabox.net/Discord/server-onboarding)

