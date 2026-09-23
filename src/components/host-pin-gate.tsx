'use client';

import { useActionState } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { verifyHostPinAction, type PinGateState } from '@/app/host/[eventCode]/actions';

const initialState: PinGateState = { error: null };

/** Shown on `/host/[eventCode]` until this browser proves it knows the host PIN. */
export function HostPinGate({ eventCode }: { eventCode: string }) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const boundAction = verifyHostPinAction.bind(null, eventCode);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="font-display text-title">{t('Host PIN', '호스트 PIN')}</h1>
      <p className="mt-2 text-body text-ink-soft">
        {t(
          'Enter the PIN you set when you created this event.',
          '이 이벤트를 만들 때 설정한 PIN을 입력하세요.',
        )}
      </p>
      <form action={action} className="club-card mt-6 space-y-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-label font-medium">{t('PIN', 'PIN')}</span>
          <input
            className="club-input !bg-paper w-full text-center tracking-[0.3em]"
            name="pin"
            type="text"
            inputMode="numeric"
            pattern="\d{4,6}"
            maxLength={6}
            autoFocus
            required
          />
        </label>
        {state.error && (
          <p role="alert" className="text-body text-plum">
            {state.error === 'not-found'
              ? t('This event could not be found.', '이 이벤트를 찾을 수 없어요.')
              : t('Wrong PIN. Try again.', 'PIN이 틀렸어요. 다시 시도하세요.')}
          </p>
        )}
        <button
          type="submit"
          className="club-btn club-btn--primary w-full text-body disabled:cursor-not-allowed disabled:opacity-40"
          disabled={pending}
        >
          {pending ? t('Checking…', '확인 중…') : t('Unlock', '잠금 해제')}
        </button>
      </form>
    </div>
  );
}
