-- GoStop Club — Stage 2, part 2: live updates.
--
-- Run this once in the Supabase dashboard (SQL Editor), after 0001_init.sql.

-- ────────────────────────────────────────────────────────────────────────────
-- Realtime: let subscribers hear about changes to these tables. RLS (from
-- 0001_init.sql) still decides who's allowed to hear about which rows.
-- ────────────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table game_tables;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table hands;
alter publication supabase_realtime add table hand_locks;

-- ────────────────────────────────────────────────────────────────────────────
-- record_hand: saves one hand (or a draw) and applies its chip changes in one
-- all-or-nothing step, so a hand row is never saved without its ledger rows
-- and updated chip counts (or vice versa).
--
-- The scoring math itself (src/lib/tonight.ts `calcHand`) already ran in
-- Node before this is called — `p_deltas` is its result. This function's job
-- is only to persist that result atomically, and to assign the hand number
-- itself (under a lock) so two phones saving at once can't collide.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function record_hand(
  p_table_id uuid,
  p_event_id uuid,
  p_is_draw boolean,
  p_winner_player_id uuid,
  p_points integer,
  p_gos integer,
  p_shakes integer,
  p_bombs integer,
  p_after_draw boolean,
  p_go_bak_player_id uuid,
  p_losers jsonb,
  p_deltas jsonb,
  p_entered_by text
) returns hands
language plpgsql
as $$
declare
  v_hand hands;
  v_number integer;
  v_row record;
begin
  perform pg_advisory_xact_lock(hashtext(p_table_id::text));

  select coalesce(max(number), 0) + 1 into v_number from hands where table_id = p_table_id;

  insert into hands (
    table_id, number, is_draw, winner_player_id, points, gos, shakes, bombs,
    after_draw, go_bak_player_id, losers, deltas, entered_by
  ) values (
    p_table_id, v_number, p_is_draw, p_winner_player_id, p_points, p_gos, p_shakes, p_bombs,
    coalesce(p_after_draw, false), p_go_bak_player_id, coalesce(p_losers, '{}'::jsonb),
    coalesce(p_deltas, '{}'::jsonb), p_entered_by
  ) returning * into v_hand;

  for v_row in
    select key::uuid as player_id, value::integer as delta
    from jsonb_each_text(coalesce(p_deltas, '{}'::jsonb))
  loop
    update players set chips = chips + v_row.delta where id = v_row.player_id;
    insert into ledger (event_id, player_id, kind, hand_id, chips_delta)
    values (p_event_id, v_row.player_id, 'hand', v_hand.id, v_row.delta);
  end loop;

  delete from hand_locks where table_id = p_table_id;

  return v_hand;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- undo_hand: reverses record_hand's chip changes and removes the hand and its
-- ledger rows. The caller (src/lib/live/hands.ts) only allows this within 2
-- minutes of the hand being saved, and only for the most recent hand.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function undo_hand(p_hand_id uuid) returns void
language plpgsql
as $$
declare
  v_hand hands;
  v_row record;
begin
  select * into v_hand from hands where id = p_hand_id;
  if not found then
    raise exception 'Hand not found';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_hand.table_id::text));

  for v_row in
    select key::uuid as player_id, value::integer as delta
    from jsonb_each_text(coalesce(v_hand.deltas, '{}'::jsonb))
  loop
    update players set chips = chips - v_row.delta where id = v_row.player_id;
  end loop;

  delete from ledger where hand_id = p_hand_id;
  delete from hands where id = p_hand_id;
end;
$$;

-- Only server code (the service-role key) may call these — never a player's or
-- host's browser token, which could otherwise call them directly and skip
-- every check in src/lib/live/hands.ts.
revoke all on function record_hand(
  uuid, uuid, boolean, uuid, integer, integer, integer, integer, boolean, uuid, jsonb, jsonb, text
) from public;
revoke all on function undo_hand(uuid) from public;
