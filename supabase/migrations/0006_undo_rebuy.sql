-- GoStop Club — Stage 2, part 6: undo the last rebuy.
--
-- Run this once in the Supabase dashboard (SQL Editor), after 0005_pending_hands.sql.
-- Remember: if the function doesn't seem to take effect, run
-- NOTIFY pgrst, 'reload schema'; and re-check — see the note in 0004_host_actions.sql.

-- ────────────────────────────────────────────────────────────────────────────
-- undo_rebuy: reverses one specific rebuy's ledger row and the matching chip/
-- buy-in change, atomically. The caller (src/lib/live/host-actions.ts) has
-- already checked this ledger row is the player's most recent entry before
-- calling this — the re-check here just guards against a second rebuy or hand
-- landing in the gap between that check and this call.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function undo_rebuy(p_player_id uuid, p_ledger_id uuid) returns players
language plpgsql
as $$
declare
  v_ledger ledger;
  v_player players;
begin
  select * into v_ledger
  from ledger
  where id = p_ledger_id and player_id = p_player_id and kind = 'rebuy';

  if not found then
    raise exception 'Not a rebuy for this player';
  end if;

  if exists (
    select 1 from ledger
    where player_id = p_player_id and created_at > v_ledger.created_at
  ) then
    raise exception 'No longer the most recent entry';
  end if;

  update players
  set chips = chips - v_ledger.chips_delta, buy_ins = buy_ins - 1
  where id = p_player_id
  returning * into v_player;

  delete from ledger where id = v_ledger.id;

  return v_player;
end;
$$;

revoke all on function undo_rebuy(uuid, uuid) from public;
