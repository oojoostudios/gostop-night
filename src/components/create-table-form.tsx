'use client';

import { useActionState } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { createTableAction, type CreateTableState } from '@/app/host/[eventCode]/actions';

const initialState: CreateTableState = { error: null };

export function CreateTableForm({ eventCode }: { eventCode: string }) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const boundAction = createTableAction.bind(null, eventCode);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="mb-1.5 block text-label font-medium">
          {t('Table name', '테이블 이름')}
        </span>
        <input
          className="club-input !bg-paper"
          name="name"
          placeholder={t('Table 1', '테이블 1')}
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
    </form>
  );
}
