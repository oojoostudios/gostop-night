<div align="center">

![Go-Stop: A Visual Guide](./src/app/opengraph-image.png)

# Go-Stop: A Visual Guide

A visual guide to Korean go-stop (고스톱), for first-time players.

[Live demo → gostopguide.com](https://gostopguide.com)  ·  [Source on GitHub](https://github.com/k-culture-play/gostop-guide)

</div>

---

## About

Go-stop is the most popular card game in Korea — played at every family gathering, every Lunar New Year, every Chuseok. But the rules look brutal on Wikipedia: **48 cards, 12 monthly suits, four card tiers, special calls, scoring multipliers, and a decision every turn.**

This site walks you through them visually, in about five minutes. It's the guide I wished existed when I tried to teach friends and they bounced off "what's a 쌍피".

Inspired by [themahjong.guide](https://themahjong.guide) — the structure, paper-and-mat tone, and tile-by-tile teaching approach all came from there.

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

## Contributing

Issues and PRs welcome. Easiest places to help:

- **Translations** — the site has an `en` / `ko` toggle. If a phrase reads awkwardly in either language, that's a one-line fix.
- **Rule clarifications** — go-stop has many regional variants. If something's wrong or oversimplified for your region, open an issue.
- **A11y / mobile polish** — the site is responsive but rough edges welcome.

## Credits

- Inspired by [themahjong.guide](https://themahjong.guide) — the structure, paper-and-mat tone, and tile-by-tile teaching approach all came from there.
- **Hwatu card illustrations** are PNG slices of a Wikimedia Commons SVG by **huzinger827** and **pk0001** (2021, updated 2023-12-02), distributed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Source: [File:Hwatu012.svg on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Hwatu012.svg). Full attribution in [`NOTICE.md`](./NOTICE.md).

## License

This project uses two licenses:

- **Source code:** [MIT](./LICENSE) — fork and reuse freely.
- **Card images** in `public/cards/`: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) inherited from the upstream Wikimedia source. If you redistribute the images, you must preserve attribution and license derivatives under the same terms — see [`NOTICE.md`](./NOTICE.md).

---

Built by [jaeha](https://github.com/jaehafe) · [@miniapp223](https://x.com/miniapp223)
