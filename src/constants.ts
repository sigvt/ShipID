import assert from "assert";

export const isDev = process.env.NODE_ENV !== "production";

export const PREFIX = process.env.BOT_PREFIX || "!sid";

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
assert(DISCORD_TOKEN, "DISCORD_TOKEN is missing");

export const MONGODB_URL = process.env.MONGODB_URL!;
// assert(MONGODB_URL, "MONGODB_URL is missing");

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
assert(GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID is missing");

export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
assert(GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET is missing");

export const JWT_SECRET = process.env.JWT_SECRET!;
assert(JWT_SECRET);

export const HB_MONGO_URI = process.env.HB_MONGO_URI!;
assert(HB_MONGO_URI);

export const PORT = Number(process.env.PORT || 3000);

export const HOST = isDev
  ? `http://localhost:${PORT}`
  : `https://shipid.holodata.org`;
