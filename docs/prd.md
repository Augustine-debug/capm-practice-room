# PRD: CAPM Practice Room (MVP)

> **Status: Approved** · Version 1.4 · Approved by Duy Nguyễn on 21 November 2026, updated 22 November 2026.
> This file is the source of truth for the product requirements. Any change in scope raises the version and gets a line in the [change log](#change-log). Acceptance criteria are tracked in the linked GitHub issues and ticked there when a feature is built and tested.

## Overview

This PRD describes what the MVP of CAPM Practice Room must do at launch on **24 November 2026**, as user stories with testable acceptance criteria. How a candidate moves through the app is drawn in [user-flow.md](user-flow.md); the reasons behind the main choices are in [decisions.md](decisions.md).

**How to read it**
- Each epic is a group of Must-have features. Each story has a code (A1, B2…) that names its GitHub issue.
- User stories follow *As a… I want… so that…*.
- Acceptance criteria are a checklist: a story is done only when every point is met.
- "Existing" means the prototype already did it and it only needed keeping or light changes; "new" means it was built from scratch.

**Input data:** a bank of 396 questions (327 exam-style, 69 definition review). Each has a domain, ECO task, difficulty, explanations in English and Vietnamese, a source and a licence. Format: [question-schema.md](question-schema.md).

## Epic A: Timed 150-question mock exam

Mirror the real exam so candidates get used to its pace and time pressure.

### A1. Start a full mock exam
Existing; question draw changed · [#8](https://github.com/Augustine-debug/capm-practice-room/issues/8)

*As a CAPM candidate, I want to take a 150-question timed exam that mirrors the real one, so that I know whether I am ready.*

- Exactly 150 exam-mode questions, drawn by ECO weight: Domain 1 54, Domain 2 26, Domain 3 30, Domain 4 40.
- No repeated question in one exam; questions that share one set of facts (for example a network diagram) stay next to each other.
- The start screen states: 150 questions, 180 minutes, an optional break of up to 10 minutes after question 75, no return to section 1 after the break.
- Question order is shuffled on every attempt.

### A2. Answer, navigate and flag
Existing · [#9](https://github.com/Augustine-debug/capm-practice-room/issues/9)

*As a candidate, I want to move between questions and flag the ones I am unsure about, so that I can come back to them before time runs out.*

- Previous and Next buttons, and a navigator showing which questions are answered, unanswered and flagged.
- Flag / Unflag works on every question; flagged questions stand out in the navigator.
- Multiple-response questions ("Select two") accept exactly the number of answers asked for.
- In exam mode no answer or explanation is shown before submitting.

### A3. Timer, break and section lock
Existing · [#10](https://github.com/Augustine-debug/capm-practice-room/issues/10)

*As a candidate, I want the exam timer and the break to work like the real test, so that I practise pacing under the same rules.*

- A 180-minute countdown, always visible; the break does not count against the 180 minutes.
- After question 75 a dialog confirms the end of section 1; once confirmed, questions 1–75 are locked.
- The break screen counts down 10 minutes; the candidate can start section 2 early.
- When time runs out the exam is submitted automatically.

### A4. Pause and resume
Existing · [#11](https://github.com/Augustine-debug/capm-practice-room/issues/11)

*As a busy learner, I want to continue an unfinished exam after closing the tab, so that I do not lose my progress.*

- The attempt in progress is saved in the browser after every answer.
- When the app is opened again, the home page offers Resume, returning to the same question with the same time left.
- The attempt in progress can be discarded, after a confirmation.

## Epic B: Custom practice and reviewing mistakes

Short, targeted practice on weak areas, for candidates with little time.

### B1. Build a custom practice set
Existing; source filter removed · [#12](https://github.com/Augustine-debug/capm-practice-room/issues/12)

*As a learner with limited time, I want to choose domains, ECO tasks, difficulty and number of questions, so that I can focus on my weak areas.*

- Filters by domain, ECO task and difficulty; each choice shows how many questions it has.
- The number of questions is set with a slider, as in the prototype: from 1 to the number of questions matching the filters, 20 by default, with the number shown next to the slider; the maximum updates when the filters change.
- No filter or set by source (Yassine, Master of Project) remains.
- If the filters match no question, the app says so and Start is disabled.

### B2. Practice options
Existing · [#13](https://github.com/Augustine-debug/capm-practice-room/issues/13)

*As a learner, I want to choose instant feedback and an optional timer, so that practice fits how I study.*

- Instant answer and explanation after each question, on or off (on by default).
- A 72-seconds-per-question timer, on or off (off by default).
- A reference pace of about 72 seconds per question is shown (practice only; the mock shows only the total clock, like the real exam).
- Shuffle question order and option order, on or off.
- With shuffled options, scoring and the "why this option is wrong" explanations still match the right option.

### B3. Review my mistakes
Existing · [#14](https://github.com/Augustine-debug/capm-practice-room/issues/14)

*As a learner, I want to practise again only the questions I got wrong, so that I fix my gaps faster.*

- The home page shows how many questions have been answered wrong across attempts, with a button to practise only those.
- The results page of every attempt, practice and full mock (after submitting), has Retry mistakes (redo this attempt's wrong questions) and Retake (redo the whole set), as in the prototype.
- Answering a question correctly in a review removes it from the mistakes list.

## Epic C: Flashcards for definitions

New mode using the 69 definition questions, so candidates know the terms before scenario questions.

### C1. Study definitions as flashcards
New · [#19](https://github.com/Augustine-debug/capm-practice-room/issues/19)

*As a career switcher, I want to review key CAPM terms as flashcards, so that I master the vocabulary before scenario questions.*

- The front shows the question and options; tap the card or press Space to flip.
- The back shows the correct answer, the short explanation and the "In short" line.
- Filter by domain; cards are shuffled.
- Move between cards with Previous / Next, or by swiping on a phone.

### C2. Track what I know
New · [#20](https://github.com/Augustine-debug/capm-practice-room/issues/20)

*As a learner, I want to mark each card as "Know it" or "Review again", so that I spend time on the terms I have not learned yet.*

- Each card has Know it and Review again; the marks are saved in the browser.
- An option to study only the cards marked Review again.
- Progress shown as "x / 69 cards known".

### C3. Link to the related scenario question
New, small · [#21](https://github.com/Augustine-debug/capm-practice-room/issues/21)

*As a learner, I want to try a scenario question on the same concept right after a card, so that I can apply what I just reviewed.*

- A card with a related question shows "Try a related question".
- The button opens that question with instant feedback, then returns to the same card.

## Epic D: Results, review and history

Show candidates where they are weak and what to study next.

### D1. See my results by domain
Existing; wording changed · [#15](https://github.com/Augustine-debug/capm-practice-room/issues/15)

*As a candidate, I want to see my score by domain, ECO task and difficulty, so that I know what to study next.*

- Total score (number correct and %) and time used.
- % correct by domain, ECO task and difficulty.
- A 70% reference mark, as in the prototype: each domain bar has a line at 70%; the total comes with a verdict, On track (75% and above), Borderline (65–74%) or Needs work (below 65%). The app states that this is a reference mark, not PMI's passing score (which PMI does not publish), so it never says "Pass" or "Fail". The three weakest tasks are listed with a suggestion to practise them.
- Each weak task opens a practice set filtered to that task.

### D2. Review each question
Existing · [#16](https://github.com/Augustine-debug/capm-practice-room/issues/16)

*As a candidate, I want to review every question with the correct answer and explanations, so that I understand why I was wrong.*

- Each question shows the candidate's answer, the correct answer, why it is correct and why each other option is wrong.
- After every attempt (practice and mock) the review is split into tabs, as in the prototype: All, Incorrect, Unanswered, Flagged, each with its count; an empty tab says there are no questions.
- Each question shows its domain, ECO task and difficulty.

### D3. Track my history
Existing · [#17](https://github.com/Augustine-debug/capm-practice-room/issues/17)

*As a learner, I want to see my past attempts, so that I can tell whether I am improving.*

- A list of attempts: date, mode, number of questions, score %.
- The review page of each attempt can be opened again.
- The app states that history is kept only in this browser and is lost if browser data is cleared.

## Epic E: Language, information pages, feedback and themes

What the product needs to launch publicly, legally, and to hear back from users.

### E1. English interface
Changed from the prototype · [#5](https://github.com/Augustine-debug/capm-practice-room/issues/5)

*As an international candidate, I want the whole interface in English, so that it feels like the real exam.*

- Every button, heading, message and label is in English; no Vietnamese outside the Vietnamese explanations.
- Domain and ECO task names use the exact ECO 2023 wording.

### E2. Switch explanations between English and Vietnamese
New · [#18](https://github.com/Augustine-debug/capm-practice-room/issues/18)

*As a Vietnamese learner, I want to read explanations in Vietnamese when I need to, so that I understand tricky concepts faster.*

- Explanations are in English by default, with an EN/VI switch wherever an explanation is shown.
- The switch changes all four parts: short explanation, why correct, why wrong, In short.
- Questions and options always stay in English.
- The language choice is remembered.

### E3. About page
New · [#6](https://github.com/Augustine-debug/capm-practice-room/issues/6)

*As a visitor, I want to know who made this app, where the questions come from and how they may be used, so that I can trust it.*

- A disclaimer: CAPM, PMP, PMBOK and PMI are trademarks of PMI; the app is not affiliated with PMI and contains no real exam questions.
- Full credit for the Creative Commons sources (Oguz, Farag) with links and licences; code under MIT, question content under CC BY-NC-SA 4.0.
- The ECO followed (CAPM ECO 2023) and the date the question bank was last updated.
- A short note about the maker, with LinkedIn and GitHub links.
- A "Support this project" button to [Ko-fi](https://ko-fi.com/duyduy3396) on the About page and in the footer; no pop-up or floating widget.

### E6. CAPM exam guide page
New; its own page, separate from About · [#7](https://github.com/Augustine-debug/capm-practice-room/issues/7)

*As a first-time candidate, I want a short guide to how the CAPM exam works, so that I know what to expect before I start practising.*

- A separate "Exam guide" page, linked from the navigation and the home page; in English, short, about 5 minutes to read.
- Exam structure: 150 questions (135 scored, 15 unscored pretest questions mixed in at random), 3 hours, a 10-minute break after question 75 with no return to section 1; the tutorial and survey do not count toward the 3 hours.
- Question types: single and multiple response, drag-and-drop/matching, hot spot, comic strip and animation (online exams have comic strip only); states that the app has multiple choice only.
- A table of the 4 domains with weights 36/17/20/27% and the matching counts in a 150-question exam (54/26/30/40), with a short list of the ECO 2023 tasks.
- Eligibility (secondary degree or equivalent + 23 hours of project management education), how to sit the exam (test centre or online), up to 3 attempts in one year, a one-year wait after three failed attempts; renewal every 3 years with 15 PDUs.
- States that the CAPM still follows ECO 2023 (PMBOK 7 terms), although the PMP exam changed on 9 July 2026 and PMBOK 8 is out; lists a few key PMBOK 8 changes so learners are not confused by newer material.
- Exam day: arrive 30 minutes early with a valid photo ID; a calculator is built into the exam software; translations are offered in some languages (not Vietnamese) and are shown next to the English.
- References listed in the ECO: PMBOK Guide 7th Edition, Process Groups: A Practice Guide, The PMI Guide to Business Analysis, Business Analysis for Practitioners, Agile Practice Guide; plus the Scrum Guide, the Agile Manifesto and the PMI Code of Ethics as quick reads.
- Scoring: the passing standard is criteria-based and not published; explains why the app uses a 70% reference mark (see D1).
- How to use the app to study: flashcards → practice by domain → 150-question mock → review mistakes; reference pace 72 seconds per question.
- Sources: links to PMI's official CAPM page, the CAPM ECO 2023 and the PMI Certification Handbook, with an as-of date and "check PMI's site, rules can change". No exam fee amounts, only the link.
- Before release, every figure is checked against the ECO 2023 and the Handbook (June 2026 edition).

### E4. Report a problem and give feedback
New · [#22](https://github.com/Augustine-debug/capm-practice-room/issues/22)

*As a learner, I want to report a wrong question or share feedback easily, so that the question bank keeps improving.*

- Every question, when its explanation is shown, has "Report this question", which opens the Google Form with the question ID filled in.
- The home and results pages have a general feedback link that asks for a 1–5 rating.
- The form does not require an email address.

### E5. Count visits privately
New · [#23](https://github.com/Augustine-debug/capm-practice-room/issues/23)

*As the product owner, I want to count visits and finished attempts without tracking people, so that I can measure the goals in the brief.*

- GoatCounter counts page views and two events: attempt started and attempt submitted.
- No cookies; no answers or scores are sent.
- The About page says that visits are counted anonymously.

### E7. Choose light or dark theme
New; moved from v1.1 into the launch release on 22 November · [#25](https://github.com/Augustine-debug/capm-practice-room/issues/25)

*As a learner who studies late at night, I want to choose a dark or light theme, so that the screen is comfortable for long sessions.*

- The colours already follow the device's light/dark setting; a switch in the navigation offers System (default), Light and Dark.
- The choice is saved in the browser and applied before the page draws, with no flash of the wrong colours.
- It can be changed during an exam without leaving it.
- Text, labels, the timer, the navigator and the charts meet WCAG AA contrast in both themes; usable by keyboard, with readable labels.

## Non-functional requirements

These apply to every screen and are checked in testing ([#24](https://github.com/Augustine-debug/capm-practice-room/issues/24)).

| Area | Requirement | How it is checked |
|---|---|---|
| Phones | Works from 360 px wide; tap targets large enough; no horizontal scrolling | Real phone and browser emulation |
| Speed | Home page loads in under 3 s on 4G; Lighthouse Performance ≥ 90 | Lighthouse, mobile |
| Browsers | Latest Chrome, Safari, Edge, Firefox; Safari on iPhone and Chrome on Android | Main flows by hand |
| Accessibility | Usable by keyboard; text contrast meets WCAG 2.1 AA; every button labelled; Lighthouse Accessibility ≥ 90 | Lighthouse, axe and keyboard testing |
| Privacy | No accounts, no cookies; progress kept only in the user's browser | Browser developer tools |
| Data quality | `scripts/validate.js` passes before every release: all fields present, valid answers, EN and VI explanations, no duplicate IDs | Run the script (also runs on GitHub) |
| Maintenance | The question bank is its own JSON file; editing questions needs no change to the interface code | Repo structure review |
| Hosting | Static site deployed by Vercel (free Hobby plan), code on GitHub; every merge to `main` deploys, every PR gets a preview link; no server, no build step | Live link works |
| Legal | No PMI logo; disclaimer and CC credits on the About page | Content review |

## Out of scope and open questions

**Not in the 24 November release** (updated 22 November):

- **v1.1:** drag-and-drop (matching), hot spot and comic strip questions like the real exam ([#26](https://github.com/Augustine-debug/capm-practice-room/issues/26)); sharing results on social media ([#28](https://github.com/Augustine-debug/capm-practice-room/issues/28)).
- **v1.2, not a priority:** using progress on more than one device ([#29](https://github.com/Augustine-debug/capm-practice-room/issues/29)), by exporting and importing history or by signing in. Signing in may mean changing hosting.
- **Not planned:** offline mode (PWA, [#27](https://github.com/Augustine-debug/capm-practice-room/issues/27)), dropped on 22 November as unnecessary; leaderboards, ads, fees.

**Decisions on the open questions** (all answered, 21 November 2026):

- Feedback form tool: Google Forms (easiest for everyday users, results in Google Sheets) or GitHub Issues (public, needs a GitHub account)? → **Google Forms.**
- A support link on the About page from launch? → **Yes, Ko-fi** ([ko-fi.com/duyduy3396](https://ko-fi.com/duyduy3396)) instead of Buy Me a Coffee, which does not pay out to Vietnam.
- Keep the 72-seconds-per-question pace in the mock (A3), or only the total clock as in the real exam? → **Practice only (B2).**
- Priority order if time runs short: E1, E3, A, B, D, E2, C, E4, E5 → **Agreed.** E6 (Exam guide) was built together with E3, as both are static content pages.

## Change log

| Version | Date | Change | Approved by |
|---|---|---|---|
| 1.4 | 22/11/2026 | PRD moved into the repo as the source of truth and translated into English; stories linked to their GitHub issues | Duy |
| 1.3 | 22/11/2026 | Dark mode moved into the launch release (E7, #25); v1.1 = #26 and #28; v1.2 (not a priority) = #29; offline mode dropped (#27) | Duy |
| 1.2 | 21/11/2026 | Hosting moved from GitHub Pages to Vercel, code stays on GitHub; question bank stays JSON, so running locally needs a local server | Duy |
| 1.1 | 21/11/2026 | Support link set: Ko-fi instead of Buy Me a Coffee; Support button added to E3 | Duy |
| 1.0 | 21/11/2026 | From Duy's review: question-count slider (B1); 72-second pace moved from A3 to B2; Retry mistakes and review tabs for the mock too (B3, D2); 70% reference mark (D1); E6 Exam guide added; Google Forms, priority order and support link decided | Duy |
| 0.1 | 21/11/2026 | First draft: epics A–E, non-functional requirements, out of scope | – |
