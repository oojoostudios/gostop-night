'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Drawer, useOverlayState } from '@heroui/react';
import { useLocale } from '@/contexts/locale-context';
import { NavContent } from '@/components/nav-content';
import { Mascot } from '@/components/mascot';
import { Wordmark } from '@/components/wordmark';

export function MobileTopbar() {
  const drawer = useOverlayState();
  const { locale } = useLocale();

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-5 h-14 border-b border-hairline bg-paper">
      <Link href="/gostop" className="flex min-w-0 items-center gap-3">
        <Mascot size="sm" className="w-10" />
        <Wordmark size="sm" />
      </Link>
      <Drawer state={drawer}>
        <Drawer.Trigger
          aria-label={locale === 'ko' ? '메뉴 열기' : 'Open menu'}
          className="p-2 -mr-2 rounded-full text-ink-soft hover:text-ink hover:bg-surface"
        >
          <Menu className="size-5" />
        </Drawer.Trigger>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog className="flex flex-col gap-8 p-6 w-72 h-full bg-paper">
              <Drawer.Body className="contents">
                <NavContent onNavigate={drawer.close} />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </header>
  );
}
