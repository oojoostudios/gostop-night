-- GoStop Club — Stage 2 live shared scoring (round-4).
--
-- Run this once in the Supabase dashboard: Project → SQL Editor → paste → Run.
--
-- Security model (see CLAUDE.md "Stage 2" for the plain-language version):
--   - There are no Supabase Auth users. A player's only credential is their table's
--     code; the host's only credential is a PIN. Both are checked by Next.js server
--     code (never in the browser), which then mints a short-lived, custom-signed JWT
--     carrying a `gostop_role` + `event_id`/`table_id` claim.
--   - The browser uses that JWT (not a Supabase Auth session) to read data directly
--     via the anon key, for live Realtime updates. The policies below use those claims
--     to scope every read to the caller's own event or table.
--   - Nobody can INSERT/UPDATE/DELETE with that JWT — every write goes through server
--     code using the service-role key, which bypasses RLS entirely and enforces the
--     table-code/PIN check itself. That's why only SELECT is granted below.

create extension if not exists pgcrypto;

-- ────────────────────────────────────────────────────────────────────────────
-- Tables
-- ────────────────────────────────────────────────────────────────────────────

create table events (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  date date not null,
  buy_in_dollars numeric(10, 2) not null default 10 check (buy_in_dollars > 0),
  chips_per_buy_in integer not null default 100 check (chips_per_buy_in > 0),
  chips_per_point integer not null default 1 check (chips_per_point > 0),
  host_pin_hash text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table game_tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  table_id uuid references game_tables (id) on delete set null,
  name text not null,
  buy_ins integer not null default 1 check (buy_ins >= 0),
  -- Current chip balance. A cache kept in step with `ledger` by server code —
  -- `ledger` is the source of truth if the two ever need reconciling.
  chips integer not null default 0 check (chips >= 0),
  cashed_out boolean not null default false,
  created_at timestamptz not null default now()
);

create table hands (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references game_tables (id) on delete cascade,
  -- Per-table hand number (1, 2, 3, ...), shown as "Hand 7 saved by Joon".
  number integer not null check (number > 0),
  is_draw boolean not null default false,
  winner_player_id uuid references players (id),
  points integer check (points >= 0),
  gos integer not null default 0 check (gos >= 0),
  shakes integer not null default 0 check (shakes >= 0),
  bombs integer not null default 0 check (bombs >= 0),
  after_draw boolean not null default false,
  go_bak_player_id uuid references players (id),
  -- { "<playerId>": { "pi": bool, "gwang": bool, "meong": bool } } for each loser.
  losers jsonb not null default '{}'::jsonb,
  -- { "<playerId>": chipsWonOrLost } — frozen at save time, same shape as Stage 1.
  deltas jsonb not null default '{}'::jsonb,
  entered_by text not null,
  created_at timestamptz not null default now(),
  unique (table_id, number)
);

create table ledger (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  kind text not null check (kind in ('hand', 'rebuy', 'cashout', 'move', 'adjustment')),
  hand_id uuid references hands (id) on delete set null,
  chips_delta integer not null,
  note text,
  created_at timestamptz not null default now()
);

-- One row per table: who (if anyone) is mid-entry on a hand right now, so other
-- phones at the table can show "Joon is entering hand 7".
create table hand_locks (
  table_id uuid primary key references game_tables (id) on delete cascade,
  entered_by text not null,
  hand_number integer not null,
  started_at timestamptz not null default now()
);

create index players_event_id_idx on players (event_id);
create index players_table_id_idx on players (table_id);
create index hands_table_id_idx on hands (table_id);
create index ledger_event_id_idx on ledger (event_id);
create index ledger_player_id_idx on ledger (player_id);
create index game_tables_event_id_idx on game_tables (event_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────────────────────

alter table events enable row level security;
alter table game_tables enable row level security;
alter table players enable row level security;
alter table hands enable row level security;
alter table ledger enable row level security;
alter table hand_locks enable row level security;

-- No table below grants anything to `anon`. A request only becomes `authenticated`
-- (and so subject to these SELECT policies) by presenting our custom-signed JWT —
-- an unauthenticated request has no grant at all and is refused outright.
revoke all on table events, game_tables, players, hands, ledger, hand_locks from anon, authenticated;
grant select on table events, game_tables, players, hands, ledger, hand_locks to authenticated;

create policy "host reads own event" on events
  for select using (
    id = (auth.jwt() ->> 'event_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'host'
  );

create policy "host reads own tables" on game_tables
  for select using (
    event_id = (auth.jwt() ->> 'event_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'host'
  );
create policy "player reads own table" on game_tables
  for select using (
    id = (auth.jwt() ->> 'table_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'player'
  );

create policy "host reads own players" on players
  for select using (
    event_id = (auth.jwt() ->> 'event_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'host'
  );
create policy "player reads tablemates" on players
  for select using (
    table_id = (auth.jwt() ->> 'table_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'player'
  );

create policy "host reads own hands" on hands
  for select using (
    auth.jwt() ->> 'gostop_role' = 'host'
    and exists (
      select 1 from game_tables t
      where t.id = hands.table_id and t.event_id = (auth.jwt() ->> 'event_id')::uuid
    )
  );
create policy "player reads own table hands" on hands
  for select using (
    table_id = (auth.jwt() ->> 'table_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'player'
  );

create policy "host reads own ledger" on ledger
  for select using (
    event_id = (auth.jwt() ->> 'event_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'host'
  );

create policy "host reads locks" on hand_locks
  for select using (
    auth.jwt() ->> 'gostop_role' = 'host'
    and exists (
      select 1 from game_tables t
      where t.id = hand_locks.table_id and t.event_id = (auth.jwt() ->> 'event_id')::uuid
    )
  );
create policy "player reads own table lock" on hand_locks
  for select using (
    table_id = (auth.jwt() ->> 'table_id')::uuid
    and auth.jwt() ->> 'gostop_role' = 'player'
  );
