# capm-practice-room
CAPM Practice Room: a free web app where anyone can practice for the CAPM exam, with timed mock exams and detailed explanations.

## Run locally

The app loads its questions from `data/questions.json`, and browsers block that when you open `index.html` straight from your disk. Start a small local web server in the project folder instead:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.
