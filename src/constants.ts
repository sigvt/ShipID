import assert from "assert";

export const isDev = process.env.NODE_ENV !== "production";

export const LIFETIME = Number(process.env.LIFETIME || 1);

export const JWT_SECRET = process.env.JWT_SECRET!;
assert(JWT_SECRET);

export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
assert(DISCORD_CLIENT_ID, "DISCORD_TOKEN is missing");

export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
assert(DISCORD_CLIENT_SECRET, "DISCORD_TOKEN is missing");

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
assert(DISCORD_TOKEN, "DISCORD_TOKEN is missing");

export const MONGODB_URL = process.env.MONGODB_URL!;
if (!isDev) assert(MONGODB_URL, "MONGODB_URL is missing");

export const HB_MONGO_URI = process.env.HB_MONGO_URI!;
if (!isDev) assert(HB_MONGO_URI);

export const PORT = Number(process.env.PORT || 3000);

export const HOST = isDev
  ? `http://localhost:${PORT}`
  : `https://shipid.holodata.org`;
