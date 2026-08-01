import { execFileSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL || "";
const usePostgres =
  process.env.DATABASE_PROVIDER === "postgresql" ||
  /^postgres(?:ql)?:\/\//i.test(databaseUrl);
const schema = usePostgres
  ? "prisma/schema.neon.prisma"
  : "prisma/schema.prisma";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

console.log(`[prisma] generating ${usePostgres ? "Neon/Postgres" : "local SQLite"} client`);
execFileSync(npx, ["prisma", "generate", "--schema", schema], {
  stdio: "inherit",
});
