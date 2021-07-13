import { Request, Response, Router } from "express";
import { Auth, google, youtube_v3 } from "googleapis";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../constants";
import { JwtToken } from "../../auth";
import UserModel from "../../models/user";

export function createYouTubeHandler({
  clientId,
  clientSecret,
  redirectUris,
  scopes,
}: {
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  scopes: string[];
}) {
  function authenticate(req: Request, res: Response) {
    const state = req.query.state;
    if (typeof state !== "string") {
      return res.status(403).json({ error: "no valid state found" });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUris[0]
    );

    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state,
    });
    console.log("authUrl", authorizeUrl);
    res.redirect(authorizeUrl);
  }

  // /callback?code=<code>&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly#
  async function authCallback(req: Request, res: Response) {
    const code = req.query.code;
    if (typeof code !== "string") {
      return res.status(403).json({ error: "no valid code found" });
    }
    const state = req.query.state;
    console.log(state);
    if (typeof state !== "string") {
      return res.status(403).json({ error: "no valid state found" });
    }

    let id_token: JwtToken;
    try {
      id_token = jwt.verify(state, JWT_SECRET) as JwtToken;
    } catch (err) {
      return res.status(403).json({ error: "no valid id_token found" });
    }

    if (Date.now() - id_token.iat > 1000 * 60 * 5) {
      return res.status(403).json({ error: "id_token is expired" });
    }

    const discordId = id_token.discordId;

    // POST https://oauth2.googleapis.com/token
    // tokens: {
    //   access_token: '',
    //   refresh_token: '',
    //   scope: 'https://www.googleapis.com/auth/youtube.readonly',
    //   token_type: 'Bearer',
    //   expiry_date: 1626063940807
    // }
    const client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUris[0]
    );

    try {
      const { tokens } = await client.getToken(code);
      client.credentials = tokens;

      const ids = await getChannelIds(client);
      if (!ids) {
        return res.status(403).json({ error: "channel id not found" });
      }

      const youtubeChannelId = ids[0];

      const user = await UserModel.create({
        discordId,
        youtubeChannelId,
      });
      console.log(user);

      res.json({ error: null, message: "success. try verify command again." });
    } catch (err) {
      if (err.code === "400") {
        // invalid grant
        return res.redirect("/auth");
      }
      console.log(err);
      res.status(500).json({ error: "unexpected error. ask admins." });
    }
  }

  async function getChannelIds(auth: Auth.OAuth2Client) {
    const youtube = new youtube_v3.Youtube({ auth });
    const { status, data } = await youtube.channels.list({
      mine: true,
      part: ["snippet"],
    });
    if (status !== 200) {
      return undefined;
    }
    return data.items?.map((item) => item.id!);
  }

  const router = Router();

  router.get("/auth", authenticate);
  router.get("/callback", authCallback);

  return router;
}
