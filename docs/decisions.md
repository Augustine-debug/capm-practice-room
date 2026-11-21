# Decision log

The main product and technical decisions behind CAPM Practice Room, with the options weighed and why each was chosen. Newest decisions are added at the end; a changed decision gets a new entry that points back to the old one.

| # | Decision | Date |
|---|---|---|
| D1 | Static site in plain HTML, CSS and JavaScript | 2026-11-20 |
| D2 | Question bank as a JSON file in the repo | 2026-11-21 |
| D3 | Only original or openly licensed questions | 2026-11-20 |
| D4 | Content under CC BY-NC-SA 4.0, code under MIT | 2026-11-21 |
| D5 | Progress kept in the browser, no accounts | 2026-11-21 |
| D6 | English interface, explanations in English and Vietnamese | 2026-11-21 |
| D7 | Host on Vercel, keep the code on GitHub | 2026-11-21 |
| D8 | Feedback through a Google Form | 2026-11-21 |
| D9 | Count visits with GoatCounter | 2026-11-21 |
| D10 | Donations through Ko-fi; no ads, no paid tier | 2026-11-21 |
| D11 | 70% shown as a reference mark, not a pass mark | 2026-11-21 |

---

## D1 · Static site in plain HTML, CSS and JavaScript

- **Context:** the app started as a single-file prototype. It needs no server: questions are fixed, and scores stay on the candidate's device.
- **Options:** a framework (React, Vue) with a build step · plain HTML/CSS/JS with no build.
- **Decision:** plain HTML, CSS and JavaScript; pages switch with `#/` links.
- **Why:** nothing to install or build, so any change can be reviewed and shipped in minutes; the whole app loads fast on a phone (Lighthouse mobile 98 for performance). `#/` links work on any static host without server rules.
- **Trade-off:** `js/app.js` is one large file. If the app grows past v1.1, split it into modules first.

## D2 · Question bank as a JSON file in the repo

- **Context:** the bank (396 questions) was kept in a spreadsheet while being reviewed.
- **Options:** keep it in a Google Sheet and fetch it · a database · a JSON file in the repo.
- **Decision:** `data/questions.json`, one question per line, checked by `scripts/validate.js` on every push (GitHub Actions).
- **Why:** every change to a question is a reviewed commit with history; the check catches broken answers or missing translations before they go live; no outside service can break the app.
- **Trade-off:** editing questions needs a pull request, not a spreadsheet. The format is described in [question-schema.md](question-schema.md).

## D3 · Only original or openly licensed questions

- **Context:** many CAPM question sets online are copyrighted, and some claim to be real exam content.
- **Decision:** the bank holds 350 original questions plus 46 adapted from two Creative Commons sources (37 by Oguz, CC BY-NC 4.0; 9 by Farag, CC BY-NC-SA 4.0), each credited on the question. Sets without a licence were removed, along with the filter that selected them. No leaked or recalled exam content.
- **Why:** a public, free app can only be shared, and listed on a CV, if every question can be published legally. It also respects PMI's exam rules.

## D4 · Content under CC BY-NC-SA 4.0, code under MIT

- **Context:** the adapted questions carry NonCommercial and ShareAlike terms, so the bank as a whole must keep them.
- **Decision:** question content: CC BY-NC-SA 4.0 (see `CONTENT-LICENSE.md`); code: MIT (see `LICENSE`).
- **Why:** this is the most open licence the sources allow for the questions, while anyone may reuse the code.

## D5 · Progress kept in the browser, no accounts

- **Options:** user accounts with a database · progress in the browser (`localStorage`).
- **Decision:** the browser, under keys starting with `cpr.`.
- **Why:** no sign-up step, no personal data to protect, no server cost; candidates can start in one tap.
- **Trade-off:** progress does not move between devices and is lost if browser data is cleared. The app says so on the results history and the About page.

## D6 · English interface, explanations in English and Vietnamese

- **Context:** the prototype was in Vietnamese; the exam itself is in English.
- **Decision:** buttons, labels and domain/task names in English, using the exact ECO 2023 wording; each explanation has an EN/VI switch, English by default.
- **Why:** candidates practise in the language of the exam and can reach anyone preparing for the CAPM, while Vietnamese learners can still check their understanding.

## D7 · Host on Vercel, keep the code on GitHub

- **Context:** GitHub Pages was the first plan.
- **Options:** GitHub Pages · Vercel connected to the GitHub repo.
- **Decision:** Vercel (Hobby plan) at `capm-practice-room.vercel.app`; the code stays on GitHub.
- **Why:** every pull request gets its own preview link, so a change can be tried on a phone before it is merged; every merge to `main` goes live on its own. Changed from GitHub Pages on 21 November 2026.

## D8 · Feedback through a Google Form

- **Options:** GitHub issues only · email · a Google Form.
- **Decision:** one Google Form for problems with a question, bugs, feedback and ideas, with a 1–5 usefulness rating. "Report this question" opens it with the question ID filled in.
- **Why:** candidates need no GitHub account, and no email is collected. GitHub issues stay open for people who prefer them.

## D9 · Count visits with GoatCounter

- **Options:** no analytics · Vercel Web Analytics · GoatCounter.
- **Decision:** GoatCounter (account `duyduy`).
- **Why:** no cookies, so no consent banner; it counts each `#/` page and custom events (modes started and finished), which shows which features are used; it does not depend on the host, so it survives a move away from Vercel; the dashboard can be made public as proof of use.
- **What is never counted:** answers, scores, anything typed.

## D10 · Donations through Ko-fi; no ads, no paid tier

- **Options:** ads · a paid tier · Buy Me a Coffee · Ko-fi.
- **Decision:** a Ko-fi link (`ko-fi.com/duyduy3396`) in the footer and on the About page; no ads and no paid features.
- **Why:** the app is a free community resource. Buy Me a Coffee cannot pay out to a Vietnamese account, so Ko-fi was used.

## D11 · 70% shown as a reference mark, not a pass mark

- **Context:** PMI does not publish a passing score for the CAPM.
- **Decision:** results show a 70% line labelled as a reference mark, and the app says the real passing score is not published.
- **Why:** candidates get a target without the app claiming to know PMI's cut score.

## D13 · No separate landing page; the home page is the practice page

- **Context:** should visitors land on a marketing-style home page and then go to practice, flashcards, the guide and About?
- **Options:** a landing page in front of the app · the app's modes on the home page, with a short introduction on top.
- **Decision:** keep the modes on the home page (renamed "Home" in the navigation), and add two light touches: a trust line under the title (free, no sign-up, number of questions, ECO 2023) and a dismissible "New here?" tip with a suggested order, shown only to visitors with no history.
- **Why:** most visitors arrive from a shared link and already know what the app is for; one more page is one more click before the first question, and a free tool loses people at every extra step. A landing page earns its place with SEO, several audiences or something to sell, none of which applies yet.
- **Revisit when:** GoatCounter shows many visits to `/` but few `start-…` events after launch, which would mean visitors do not see where to begin.
