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
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-5 h-14 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <div className="flex items-baseline gap-2 text-base font-semibold tracking-tight">
        <span>{locale === 'ko' ? game?.labelKo : game?.labelEn}</span>
        <span className="text-foreground/50 font-normal text-sm">
          {locale === 'ko' ? game?.labelEn : game?.labelKo}
        </span>
      </div>
      <Drawer state={drawer}>
        <Drawer.Trigger
          aria-label="Open menu"
          className="p-2 -mr-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-foreground/5"
        >
          <Menu className="size-5" />
        </Drawer.Trigger>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog className="flex flex-col gap-8 p-6 w-72 h-full bg-background">
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
