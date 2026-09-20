'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Drawer, useOverlayState } from '@heroui/react';
import { NavContent } from '@/components/nav-content';
import { GAMES, getActiveGame } from '@/lib/games';
import { useLocale } from '@/contexts/locale-context';

export function MobileTopbar() {
  const drawer = useOverlayState();
  const pathname = usePathname();
  const game = GAMES.find((g) => g.id === getActiveGame(pathname));
  const { locale } = useLocale();

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-5 h-14 border-b border-hairline bg-paper">
      <div className="flex items-baseline gap-2 font-display text-xl">
        <span>{locale === 'ko' ? game?.labelKo : game?.labelEn}</span>
        <span className="font-sans text-ink-soft text-sm">
          {locale === 'ko' ? game?.labelEn : game?.labelKo}
        </span>
      </div>
      <Drawer state={drawer}>
        <Drawer.Trigger
          aria-label="Open menu"
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
