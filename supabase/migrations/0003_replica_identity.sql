-- GoStop Club — Stage 2, part 3: fix Realtime DELETE/UPDATE filtering.
--
-- Run this once in the Supabase dashboard (SQL Editor), after 0002_live_updates.sql.
--
-- By default Postgres only includes a row's primary key in the "old row" data for an
-- UPDATE or DELETE change. Our Realtime subscriptions filter by `table_id` (not the
-- primary key), so without this, a DELETE's old row wouldn't carry `table_id` and
-- Realtime would silently drop it for every subscriber — e.g. "hand 7" disappearing
-- server-side (undo) but never reaching the other phones at the table.

alter table game_tables replica identity full;
alter table players replica identity full;
alter table hands replica identity full;
alter table hand_locks replica identity full;
