# CAPM Practice Room

A free web app for practising for the PMI **CAPM** exam: full 150-question timed mock exams, custom practice by domain and ECO task, review of your mistakes, and a detailed explanation for every answer. No account, no ads.

**Live app:** https://capm-practice-room.vercel.app

## Features

- **Full mock exam**: 150 questions drawn by the CAPM ECO 2023 domain weights (54 / 26 / 30 / 40), 3-hour timer, optional 10-minute break after question 75 with no return to section 1, like the real test.
- **Custom practice**: pick domains, ECO tasks, difficulty and number of questions; instant feedback and an optional 72-second-per-question timer.
- **Review mistakes**: retry the questions you got wrong, across all attempts or from one attempt.
- **Results by domain, task and difficulty**, with a 70% reference mark (PMI does not publish its passing score).
- **Explanations** for the correct option and for every wrong option, in English with a one-tap switch to Vietnamese.
- **History and resume**: attempts and unfinished exams are saved in your browser only.

The question bank has 396 questions (327 exam-style, 69 definition review), each tagged with its ECO 2023 domain and task.

## Run locally

The app is plain HTML, CSS and JavaScript with no build step. It loads its questions from `data/questions.json`, and browsers block that when you open `index.html` straight from your disk, so start a small local web server in the project folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Project structure

```
index.html              page shell
css/style.css           styles
js/app.js               app logic
data/questions.json     question bank (one question per line)
scripts/validate.js     checks the question bank
docs/question-schema.md question format, field by field
```

## Check the question bank before each release

After editing `data/questions.json` (format: [docs/question-schema.md](docs/question-schema.md)), run:

```
node scripts/validate.js
```

It needs only [Node.js](https://nodejs.org), no packages, and ends with `OK: no errors` or a list of what to fix. The same check runs automatically on every pull request that touches the bank (GitHub Actions).

## Hosting

The code lives on GitHub; the site is published with [Vercel](https://vercel.com). Every merge to `main` deploys to production, and every pull request gets its own preview link.

## Report a problem

Found a wrong answer, a typo or a bug? Please [open an issue](https://github.com/Augustine-debug/capm-practice-room/issues).

## Licences

- **Code**: MIT, see [LICENSE](LICENSE).
- **Questions and explanations** (`data/questions.json`): CC BY-NC-SA 4.0, see [CONTENT-LICENSE.md](CONTENT-LICENSE.md). Most questions were written for this project; 46 are adapted from two Creative Commons textbooks, credited there and on each question.

## Disclaimer

CAPM®, PMP®, PMBOK® and PMI® are registered marks of the Project Management Institute, Inc. CAPM Practice Room is an independent, non-commercial project. It is not affiliated with, endorsed by or sponsored by PMI, and it contains no real exam questions. Exam facts follow the CAPM Exam Content Outline (2023) and the PMI Certification Handbook; check [pmi.org](https://www.pmi.org/capm) for the latest rules.

## Support

The app is free. If it helped you, you can [buy me a coffee on Ko-fi](https://ko-fi.com/duyduy3396).

Made by [Augustine-debug](https://github.com/Augustine-debug).
