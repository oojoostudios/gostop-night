'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { addPlayerAction, type AddPlayerState } from '@/app/host/[eventCode]/actions';
import type { TableRow } from '@/lib/live/types';

const initialState: AddPlayerState = { error: null, createdId: null };

export function AddPlayerForm({
  eventCode,
  tables,
  onCreated,
}: {
  eventCode: string;
  tables: TableRow[];
  onCreated?: (playerId: string) => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const boundAction = addPlayerAction.bind(null, eventCode);
  const [state, action, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const lastHandledId = useRef<string | null>(null);

  useEffect(() => {
    if (state.createdId && state.createdId !== lastHandledId.current) {
      lastHandledId.current = state.createdId;
      formRef.current?.reset();
      onCreated?.(state.createdId);
    }
  }, [state.createdId, onCreated]);

  if (tables.length === 0) {
    return (
      <p className="text-body text-ink-soft">
        {t(
          'Add a table first, then you can add players to it.',
          '먼저 테이블을 추가하면 플레이어를 넣을 수 있어요.',
        )}
      </p>
    );
  }

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="mb-1.5 block text-label font-medium">
          {t('Player name', '플레이어 이름')}
        </span>
        <input className="club-input !bg-paper" name="name" maxLength={20} required />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-label font-medium">{t('Table', '테이블')}</span>
        <select className="club-input !bg-paper" name="tableId" required>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="club-btn club-btn--primary text-body disabled:cursor-not-allowed disabled:opacity-40"
        disabled={pending}
      >
        {pending ? t('Adding…', '추가 중…') : t('Add player', '플레이어 추가')}
      </button>
      {state.error === 'name-required' && (
        <p role="alert" className="w-full text-body text-plum">
          {t('Enter a player name.', '플레이어 이름을 입력하세요.')}
        </p>
      )}
    </form>
  );
}
