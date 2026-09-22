/** Rows as they come back from Supabase. Mirrors supabase/migrations/0001_init.sql. */

export type EventStatus = 'open' | 'closed';

export type EventRow = {
  id: string;
  code: string;
  name: string;
  date: string;
  buy_in_dollars: number;
  chips_per_buy_in: number;
  chips_per_point: number;
  host_pin_hash: string;
  status: EventStatus;
  created_at: string;
};

export type TableRow = {
  id: string;
  event_id: string;
  code: string;
  name: string;
  created_at: string;
};

export type PlayerRow = {
  id: string;
  event_id: string;
  table_id: string | null;
  name: string;
  buy_ins: number;
  chips: number;
  cashed_out: boolean;
  created_at: string;
};
