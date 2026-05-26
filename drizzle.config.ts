// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   schema: "./server/db/schema.ts",
//   out: "./server/db/migrations",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
//   verbose: true,
//   strict: true,
// });


// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env variables

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ← This was missing/undefined
  },
});