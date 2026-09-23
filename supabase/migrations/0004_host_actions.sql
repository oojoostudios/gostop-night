-- GoStop Club — Stage 2, part 4: host-only actions (rebuy, move, early cash-out).
--
-- Run this once in the Supabase dashboard (SQL Editor), after 0003_replica_identity.sql.

-- ────────────────────────────────────────────────────────────────────────────
-- rebuy_player: +100 chips (or whatever the event's chips-per-buy-in is),
-- +1 buy-in, and a matching ledger row, all in one step — same reasoning as
-- record_hand in 0002_live_updates.sql: a chip change should never be saved
-- without its ledger row, or vice versa.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function rebuy_player(
  p_player_id uuid,
  p_event_id uuid,
  p_chips integer
) returns players
language plpgsql
as $$
declare
  v_player players;
begin
  update players
  set chips = chips + p_chips, buy_ins = buy_ins + 1
  where id = p_player_id
  returning * into v_player;

  if not found then
    raise exception 'Player not found';
  end if;

  insert into ledger (event_id, player_id, kind, chips_delta)
  values (p_event_id, p_player_id, 'rebuy', p_chips);

  return v_player;
end;
$$;

-- Only server code (the service-role key) may call this — see the same note on
-- record_hand/undo_hand in 0002_live_updates.sql.
revoke all on function rebuy_player(uuid, uuid, integer) from public;
