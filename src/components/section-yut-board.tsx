'use client';

import { useState } from 'react';
import { ArrowRight, CornerUpRight, Map, MoveDownLeft } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { YutBoard, type BoardHighlight } from '@/components/yut-board';
import { YutBoardDemo } from '@/components/yut-board-demo';

const HIGHLIGHTS: ReadonlyArray<{
  id: BoardHighlight;
  labelKo: string;
  labelEn: string;
  icon: React.ReactNode;
  descKo: string;
  descEn: string;
}> = [
  {
    id: 'none',
    labelKo: '기본',
    labelEn: 'Default',
    icon: <Map className="size-3.5" />,
    descKo: '29자리 전체 — 외곽 20 + 안쪽 대각 8 + 가운데 1.',
    descEn: 'All 29 stations — 20 outer ring + 8 diagonal interior + 1 center.',
  },
  {
    id: 'outer',
    labelKo: '외곽길',
    labelEn: 'Outer path',
    icon: <ArrowRight className="size-3.5" />,
    descKo: '출발에서 시계 반대 방향으로 외곽을 한 바퀴 돌면 20칸. 화살표 방향으로 진행해요.',
    descEn: 'From start, the outer loop counterclockwise takes 20 stations. Follow the arrows.',
  },
  {
    id: 'shortcut',
    labelKo: '지름길',
    labelEn: 'Shortcuts',
    icon: <MoveDownLeft className="size-3.5" />,
    descKo:
      '코너에 정확히 멈추면 가운데 방여를 거쳐 가로지르는 지름길로 갈 수 있어요. 한 바퀴 절약.',
    descEn:
      'Land exactly on a corner to take the diagonal through the center — shaves a full side off the trip.',
  },
  {
    id: 'corners',
    labelKo: '코너',
    labelEn: 'Corners',
    icon: <CornerUpRight className="size-3.5" />,
    descKo: '4개 코너 (출발 + 첫모/둘모/셋모) — 지름길 진입 지점이에요.',
    descEn:
      'Four corners (start + 3 named corners) — these are the only spots that trigger a shortcut.',
  },
];

export function SectionYutBoard() {
  const { locale } = useLocale();
  const [highlight, setHighlight] = useState<BoardHighlight>('none');
  const active = HIGHLIGHTS.find((h) => h.id === highlight) ?? HIGHLIGHTS[0];

  return (
    <section id="yut-board" className="relative py-24 border-t border-foreground/10">
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-xs tabular-nums text-foreground/50 mb-4">SECTION 02</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            {locale === 'ko' ? '말판' : 'The board'}
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-12">
            {locale === 'ko'
              ? '29자리가 십자 모양으로 배치돼요. 외곽으로 한 바퀴 돌면 20칸이지만, 코너에 정확히 멈추면 가로지르는 지름길로 갈 수 있어요.'
              : '29 stations laid out in a cross. The outer loop is 20 stations long — but landing exactly on a corner unlocks a diagonal shortcut through the center.'}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
            {/* Board */}
            <div className="rounded-xl overflow-hidden ring-1 ring-foreground/10 shadow-sm">
              <YutBoard highlight={highlight} />
            </div>

            {/* Filter buttons + active description */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                {HIGHLIGHTS.map((h) => {
                  const isActive = highlight === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHighlight(h.id)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-foreground text-background font-medium'
                          : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
                      }`}
                    >
                      <span className={isActive ? '' : 'text-foreground/50'}>{h.icon}</span>
                      <span>{locale === 'ko' ? h.labelKo : h.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-md border border-foreground/15 bg-foreground/[0.02] p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50 font-semibold mb-2">
                  {locale === 'ko' ? active.labelKo : active.labelEn}
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {locale === 'ko' ? active.descKo : active.descEn}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label={locale === 'ko' ? '외곽' : 'Outer'} value="20" />
                <Stat label={locale === 'ko' ? '대각' : 'Diagonal'} value="8" />
                <Stat label={locale === 'ko' ? '가운데' : 'Center'} value="1" />
              </div>
            </div>
          </div>

          {/* Interactive piece-movement demo */}
          <div className="mt-20 pt-12 border-t border-foreground/10">
            <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">
              {locale === 'ko' ? '직접 해보기' : 'Try it'}
            </div>
            <h3 className="text-2xl font-semibold tracking-tight mb-2">
              {locale === 'ko' ? '말 하나 움직여보기' : 'Move a piece'}
            </h3>
            <p className="text-sm text-foreground/60 max-w-2xl leading-relaxed mb-8">
              {locale === 'ko'
                ? '출발에서 시작해서 윷을 던지면 그만큼 칸을 이동해요. 코너에 정확히 멈추면 지름길로 가는 선택이 떠요. 한 바퀴 돌아 출발로 돌아오면 골인!'
                : 'Starting at home, throw the yut and the piece moves that many steps along the outer ring. Land exactly on a corner and you get the option to take the diagonal shortcut. Make it back to start to finish.'}
            </p>

            <YutBoardDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-foreground/10 px-3 py-2">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-foreground/55 mt-0.5">{label}</div>
    </div>
  );
}
