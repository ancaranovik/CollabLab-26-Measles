# English and Vietnamese

English remains the default on each page load. `translations.js` pairs the existing English source strings with Vietnamese translations. `i18n.js` updates text nodes in place, preserving inline emphasis, annotation controls, shuffled quiz buttons and the illustrated population. Dynamic copy in `script.js`, `annotations.js` and `progress.js` uses `MeaslesI18n.t()`.

When editing English copy, update its corresponding catalog key and Vietnamese translation together. Some entries are adjacent fragments around inline markup; read the complete rendered sentence in both languages. Keep scientific values and definitions aligned with `references/research/measles-study.pdf`. Paper titles, journal names, author names, IgM and PCR retain their source forms. Vietnamese term notes include English terminology where useful.

Switching languages refreshes existing ScrollTrigger measurements and restores the reader's position relative to the current scene without changing the restored, unpinned age animation. It does not reload the page, recreate story components or reset quizzes.

## Verification

Build with `node tools/build-pages.mjs` and serve with `node tools/serve.mjs`. Run `node tools/verify-localization.mjs` with Playwright installed, or set `PLAYWRIGHT_MODULE` to an existing Playwright module URL. `BROWSER_EXECUTABLE` optionally selects a browser executable; Windows defaults to the existing Edge installation. `TEST_URL` optionally overrides the default built-site URL, `http://127.0.0.1:4173/_site/`.

The checks cover translation coverage, round trips, responsive overflow, age-scene rollback, tooltips, quiz gates, preserved answers, stable DOM objects and stable ScrollTriggers during language switching. Screenshots and results go into the ignored `verification/` directory.

The existing GitHub Pages workflow remains unchanged. Its existing build helper includes the two localization scripts in `_site/`.

## Vietnamese serif coverage and chart verification

English keeps the existing Georgia display stack. Vietnamese overrides the entire display family with locally hosted Lora regular/italic variable fonts (weights 400–700). The local Georgia files lack Vietnamese characters, including `ưậẻệốồổờợứừ` in the supplied test sentence. The existing Arial reading stack covers them, so body copy, controls and tooltips keep their current typography. Lora's font files and OFL license come from https://github.com/google/fonts/tree/main/ofl/lora; upstream Vietnamese support is documented at https://github.com/cyrealtype/Lora-Cyrillic. Language switching waits for the regular, italic and bold faces before applying Vietnamese text.

Run `node tools/verify-targeted-fixes.mjs` with the same environment options to check Chromium's actual font runs, the original age-scene trigger, pre-JavaScript chart state and monotonic fill during scrolling, resizing and language changes. Chart timelines are retained independently of the analytical layout refresh; only their pending triggers need updated measurements. Reduced motion and the no-JavaScript view show completed charts.
