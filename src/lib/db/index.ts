import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const isEdge = process.env.NEXT_RUNTIME === "edge";

// Only create the client if we are NOT in the Edge runtime
// because the Edge runtime doesn't support 'file:' URLs
const client = !isEdge ? createClient({
  url: process.env.TURSO_CONNECTION_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
}) : null;

export const db = client ? drizzle(client, { schema }) : ({} as any);

