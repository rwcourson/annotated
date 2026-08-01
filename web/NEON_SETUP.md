# Neon production database setup

The app is ready for Neon but intentionally remains on local SQLite until a Neon project is provisioned.

## Provisioning

1. Create a Neon project and copy its pooled Postgres connection string.
2. Add these production environment variables:

   ```text
   DATABASE_PROVIDER=postgresql
   DATABASE_URL=postgresql://...?...sslmode=require
   ```

3. Initialize the empty database once:

   ```bash
   DATABASE_PROVIDER=postgresql DATABASE_URL="postgresql://..." npm run neon:push
   ```

4. Generate the production client and build:

   ```bash
   DATABASE_PROVIDER=postgresql DATABASE_URL="postgresql://..." npm run prisma:generate
   npm run build
   ```

`scripts/generate-prisma.mjs` automatically selects the Postgres schema whenever `DATABASE_PROVIDER=postgresql` or `DATABASE_URL` begins with `postgres://` or `postgresql://`. Local installs continue to generate the SQLite client.

## Recorded commentary storage

Production audio uses Vercel Blob. Set `BLOB_READ_WRITE_TOKEN` before deployment. Without it, production uploads fail explicitly with `503` instead of silently writing to an ephemeral filesystem. Local development still writes to `public/uploads/`.
