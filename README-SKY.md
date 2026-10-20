# SKY Support admin UI (rustdesk-api-web)

The web administration of the **SKY Support** server (<https://github.com/skycobg/rustdesk-api>), a fork of
[lejianwen/rustdesk-api-web](https://github.com/lejianwen/rustdesk-api-web) (master 3998c2a, the UI of
rustdesk-api v2.7). Our changes live on the `sky` branch:

- Bulgarian (`src/utils/i18n/bg.json`, Element Plus `bg`), the default whatever the browser language (another
  one can be chosen in the menu; upstream took the browser language and showed raw keys for `bg-BG`, `en-US`).
- Connection log: filters by technician and dates; columns for the duration, the end-of-session note and its
  author; every connection type and attempts without access.
- "Time per technician" (`src/views/audit/summary.vue`): sessions and total time in a period.
- Address book: the note of an entry.
- Our logo and favicon; the title "SKY Support".

Build: `npm ci && npm run build`; `dist/` goes to `resources/admin/` of rustdesk-api.
