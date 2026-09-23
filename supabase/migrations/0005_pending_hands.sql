-- GoStop Club — Stage 2, part 5: the rebuy-when-short rule.
--
-- Run this once in the Supabase dashboard (SQL Editor), after 0004_host_actions.sql.
-- Remember: if a function you add here doesn't seem to take effect, run
-- `NOTIFY pgrst, 'reload schema';` and re-check — see the note in 0004_host_actions.sql.
--
-- If a hand would take a loser's chips below zero, it isn't saved yet — it's parked here
-- instead. The table screen shows "Mina needs to rebuy. Waiting for host"; the host screen
-- shows a prompt to collect the buy-in and rebuy her. Once that happens, the hand is saved
-- for real (src/lib/live/pending-hands.ts `resolvePendingHandLive`) and this row is deleted.

create table pending_hands (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references game_tables (id) on delete cascade,
  event_id uuid not null references events (id) on delete cascade,
  -- The hand's inputs and each short player's shortfall in chips — everything needed to
  -- finish saving it once the host has rebought the short player(s).
  payload jsonb not null,
  entered_by text not null,
  created_at timestamptz not null default now()
);

create index pending_hands_table_id_idx on pending_hands (table_id);

alter table pending_hands enable row level security;
alter table pending_hands replica identity full;
alter publication supabase_realtime add table pending_hands;

revoke all on table pending_hands from anon, authenticated;
grant select on table pending_hands to authenticated;

create policy "host reads own pending hands" on pending_hands
  for select using (
    event_id = (auth.jwt() ->> 'event_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'host'
  );
create policy "player reads own table pending hands" on pending_hands
  for select using (
    table_id = (auth.jwt() ->> 'table_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'player'
  );
