import axios from "axios";
import { APIConnection } from "discord-api-types/v9";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";
import { createOrUpdateUser } from "../db";
import { debugLog, errorLog } from "../util";
import { JwtToken } from "./interfaces";

interface Token {
  access_token: string;
}

const DISCORD_AUTHORIZE_URL = "https://discord.com/api/oauth2/authorize";
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";

function renderHTML(res: Response, content: string) {
  res.contentType("html");
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ShipID</title>
<style>
html, body {
  height: 100%;
  font-family: sans-serif;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

h1 {
  font-size: 50pt;
}

</style>
</head>
<body>
<h1>🚢 ShipID</h1>
<p>${content}</p>
</body>
</html>`);
}

async function getConnections(token: string): Promise<APIConnection[]> {
  const res = await axios.get<APIConnection[]>(
    "https://discord.com/api/users/@me/connections",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (res.status !== 200) throw new Error(res.statusText);
  return res.data;
}

export function createAuthHandler({
  clientId,
  clientSecret,
  redirectUri,
}: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  async function getToken(code: string): Promise<Token> {
    const body = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    };
    const res = await axios.post<Token>(
      DISCORD_TOKEN_URL,
      new URLSearchParams(body)
    );
    return res.data;
  }

  function authorize(req: Request, res: Response) {
    res.setHeader("Cache-Control", "no-store");

    const state = req.query.state;
    if (typeof state !== "string") {
      return renderHTML(res.status(403), "no valid state found");
    }
    const params = {
      response_type: "code",
      client_id: clientId,
      scope: "connections",
      state,
      redirect_uri: redirectUri,
      prompt: "consent",
    };
    const authorizeUrl =
      DISCORD_AUTHORIZE_URL + "?" + new URLSearchParams(params);
    res.redirect(authorizeUrl);
  }

  async function callback(req: Request, res: Response) {
    res.setHeader("Cache-Control", "no-store");

    const code = req.query.code;
    if (typeof code !== "string") {
      return renderHTML(res.status(403), "Invalid request");
    }

    // validate state
    const state = req.query.state;
    if (typeof state !== "string") {
      return renderHTML(res.status(403), "Invalid state");
    }

    let id_token: JwtToken;
    try {
      id_token = jwt.verify(state, JWT_SECRET) as JwtToken;
    } catch (err) {
      return renderHTML(res.status(403), `Invalid state`);
    }

    if (Date.now() - id_token.iat > 1000 * 60 * 5) {
      return renderHTML(
        res.status(403),
        `Your request has been expired. Try /verify again.`
      );
    }

    // handle the code
    const discordId = id_token.discordId;
    debugLog(discordId);

    try {
      const token = await getToken(code);

      const connections = await getConnections(token.access_token);
      const youtubeConnection = connections.find(
        (conn) => conn.type === "youtube"
      );
      if (!youtubeConnection) {
        // add YouTube to Discord account first!
        return renderHTML(
          res.status(403),
          `Connect your YouTube account with Discord account first`
        );
      }

      const channelName = youtubeConnection.name;
      const youtubeChannelId = youtubeConnection.id;

      // create user
      const user = await createOrUpdateUser({ discordId, youtubeChannelId });
      debugLog(channelName, user);

      renderHTML(
        res,
        `Your YouTube account has successfully been confirmed. Return to Discord app and try \`/verify\` command again on the server where you want member-specific roles.`
      );
    } catch (err: any) {
      if (err.code === "400") {
        // invalid grant
        return res.redirect("/discord/authorize");
      }
      errorLog("auth", err);
      renderHTML(
        res.status(500),
        "Unexpected error has occurred. Ask admin (uetchy#1717)"
      );
    }
  }

  const router = Router();

  router.get("/discord/authorize", authorize);
  router.get("/discord/callback", callback);

  return router;
}
