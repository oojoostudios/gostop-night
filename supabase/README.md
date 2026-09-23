# Database setup

This project's database lives in Supabase, not in this repo. Migrations here are the
source of truth for the schema, but they don't run automatically — apply each one by
hand:

1. Open the [Supabase dashboard](https://supabase.com/dashboard) → this project → **SQL Editor**.
2. Open the next unapplied file in `migrations/` (in order — `0001_init.sql` first), copy it, paste it into the SQL Editor, and click **Run**.
3. If it succeeds, you're done with that file. Move to the next one, if any.

Each migration only needs to be run once per database.
