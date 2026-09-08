# English and Vietnamese

English remains the default on each page load. `translations.js` pairs the existing English source strings with Vietnamese translations. `i18n.js` updates text nodes in place, preserving inline emphasis, annotation controls, shuffled quiz buttons and the illustrated population. Dynamic copy in `script.js`, `annotations.js` and `progress.js` uses `MeaslesI18n.t()`.

When editing English copy, update its corresponding catalog key and Vietnamese translation together. Some entries are adjacent fragments around inline markup; read the complete rendered sentence in both languages. Keep scientific values and definitions aligned with `references/research/measles-study.pdf`. Paper titles, journal names, author names, IgM and PCR retain their source forms. Vietnamese term notes include English terminology where useful.

Switching languages refreshes existing ScrollTrigger measurements and restores the reader's position relative to the current scene (or the pinned age sequence's progress). It does not reload the page, recreate story components or reset quizzes.

## Verification

Build with `node tools/build-pages.mjs` and serve with `node tools/serve.mjs`. Run `node tools/verify-localization.mjs` with Playwright installed, or set `PLAYWRIGHT_MODULE` to an existing Playwright module URL. `BROWSER_EXECUTABLE` optionally selects a browser executable; Windows defaults to the existing Edge installation. `TEST_URL` optionally overrides the default built-site URL, `http://127.0.0.1:4173/_site/`.

The checks cover translation coverage, round trips, responsive overflow, age-scene staging and reversal, tooltips, quiz gates, preserved answers, stable DOM objects and stable ScrollTriggers during language switching. Screenshots and results go into the ignored `verification/` directory.

The existing GitHub Pages workflow remains unchanged. Its existing build helper includes the two localization scripts in `_site/`.
