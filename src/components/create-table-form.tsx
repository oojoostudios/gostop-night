'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { createTableAction, type CreateTableState } from '@/app/host/[eventCode]/actions';

const initialState: CreateTableState = { error: null, createdId: null };

export function CreateTableForm({
  eventCode,
  suggestedName,
  onCreated,
}: {
  eventCode: string;
  /** The next free "Table N" name — also used as `key` so the input refreshes after each add. */
  suggestedName: string;
  onCreated?: (tableId: string) => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const boundAction = createTableAction.bind(null, eventCode);
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

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="mb-1.5 block text-label font-medium">
          {t('Table name', '테이블 이름')}
        </span>
        <input
          key={suggestedName}
          className="club-input !bg-paper"
          name="name"
          defaultValue={suggestedName}
          maxLength={30}
          required
        />
      </label>
      <button
        type="submit"
        className="club-btn club-btn--primary text-body disabled:cursor-not-allowed disabled:opacity-40"
        disabled={pending}
      >
        {pending ? t('Adding…', '추가 중…') : t('Add table', '테이블 추가')}
      </button>
      {state.error === 'name-required' && (
        <p role="alert" className="w-full text-body text-plum">
          {t('Enter a table name.', '테이블 이름을 입력하세요.')}
        </p>
      )}
      {state.error === 'duplicate-name' && (
        <p role="alert" className="w-full text-body text-plum">
          {t(
            'A table with that name already exists. Pick a different name.',
            '이미 같은 이름의 테이블이 있어요. 다른 이름을 사용하세요.',
          )}
        </p>
      )}
    </form>
  );
}
