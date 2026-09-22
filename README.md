<div align="center">

![GoStop Club](./src/app/opengraph-image.png)

# GoStop Club · 고스톱 클럽

A phone-first Go-Stop guide for our game nights. 고스톱 게임 나이트를 위한 모바일 가이드.

</div>

---

## About

Go-stop is the most popular card game in Korea, but the rules look brutal on paper: **48 cards, 12 monthly suits, four card types, special calls, scoring multipliers, and a decision every turn.** GoStop Club walks a first-timer through them visually, in about five minutes, in English and Korean. Guests open a link on their phone: no login, no app.

The look is "Vintage print": warm paper, fine ink lines, no shadows, with a plum-blossom mascot. All colors, fonts, corners and press effects live in one place, `src/app/globals.css` (colors) and `src/lib/fonts.ts` (fonts).

## Sections

- **What is hwatu?** — the 48-card deck broken down by tier (광 / 띠 / 열 / 피)
- **How a round begins** — interactive shuffle and deal demo
- **How a round works** — 9 scenarios: normal match, double match, ttadak, jjok, ppeok, ssakssalri, pokdan, jappeok
- **Scoring** — bright / ribbon / animal / junk combos with running totals
- **Special rules** — go vs. stop, sweep bonuses, bombs, self-traps
- **Go or stop?** — when to push for more, when to lock in

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [HeroUI v3](https://heroui.com) — UI primitives
- [motion](https://motion.dev) — animations
- [Pragmatic drag and drop](https://atlassian.design/components/pragmatic-drag-and-drop) — interactive demos
- pnpm · husky · oxlint · oxfmt

## Local development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

Useful scripts:

```bash
pnpm format         # oxfmt --write
pnpm lint:ox        # oxlint
pnpm build          # production build
```

## Design pages

Two unlinked pages for checking the design while you work: `/stylecheck` (colors with contrast ratios, type, cards, chips, buttons, paper grain) and `/brandcheck` (the mascot and wordmark on light and dark).

## Regenerating images

- `node scripts/export-mascot.mjs` makes the web mascot images in `public/brand/`.
- `node scripts/export-brand-images.mjs` makes the favicon, app icons and share image (needs Chrome).

## Credits

- Based on [gostopguide.com](https://gostopguide.com) by jaeha (MIT).
- That site was inspired by [themahjong.guide](https://themahjong.guide): the structure, paper tone, and step-by-step teaching approach.
- Fonts: Fraunces, Gowun Batang and IBM Plex Sans KR, from Google Fonts (SIL Open Font License).

## License

- **Source code:** [MIT](./LICENSE). The original copyright notice is kept.
- **Card and mascot artwork:** original artwork for this project. See [`NOTICE.md`](./NOTICE.md).
