'use client';

import { useLocale } from '@/contexts/locale-context';
import { CreateEventForm } from '@/components/create-event-form';

export function HostHome() {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <h1 className="font-display text-title">{t('Host a game night', '게임 나이트 호스트')}</h1>
      <p className="mt-2 max-w-[46ch] text-body text-ink-soft">
        {t(
          "Every phone at the table will see the same live scores. You'll get a PIN for host actions and a QR code for each table.",
          '테이블의 모든 폰이 같은 실시간 점수를 보게 돼요. 호스트용 PIN과 테이블별 QR 코드가 발급돼요.',
        )}
      </p>
      <div className="mt-8">
        <CreateEventForm />
      </div>
    </div>
  );
}
