# Question bank format

All questions live in `data/questions.json`: one JSON array, one question per line, so a change to one question shows up as one changed line in a pull request. A readable table of the same data, `data/questions.csv`, is generated from it by `node scripts/export-csv.js`; never edit the CSV by hand.

Run `node scripts/validate.js` after every edit. It checks every rule below.

## Example

```json
{
  "id": 1,
  "mode": "exam",
  "style": "scenario",
  "domain": 1,
  "task": "1.1",
  "difficulty": 2,
  "question": "A bank's strategy office oversees … What is this collection BEST called?",
  "options": ["A portfolio", "A program", "A megaproject", "An operating model"],
  "answer": 0,
  "explanation": {
    "short":      { "en": "…", "vi": "…" },
    "whyCorrect": { "en": "…", "vi": "…" },
    "whyWrong":   { "en": { "B": "…", "C": "…", "D": "…" }, "vi": { "B": "…", "C": "…", "D": "…" } },
    "inShort":    { "en": "…", "vi": "…" }
  },
  "source": { "type": "own", "text": "Original question written for CAPM Practice Room" }
}
```

## Fields

| Field | Required | Rule |
| --- | --- | --- |
| `id` | yes | Whole number. Ids run 1, 2, 3… with no gaps or repeats; a question's id equals its position in the file. |
| `mode` | yes | `exam` (scenario-style, used in mock exams and practice) or `definition` (term review, used for flashcards). |
| `style` | yes | `scenario`, `knowledge`, `definition` or `calc`. |
| `domain` | yes | 1–4, the CAPM ECO 2023 domain. |
| `task` | yes | An ECO 2023 task of that domain, e.g. `"2.3"`. |
| `difficulty` | yes | 1 basic, 2 intermediate, 3 advanced. |
| `context` | no | Shared facts shown above the question (e.g. a network diagram as text). |
| `question` | yes | Question text, in English. |
| `options` | yes | 4 or 5 option texts, in English, no duplicates. |
| `answer` | yes | Index of the correct option (0 = A). For "Select two/three": a sorted list of indexes, e.g. `[1, 3]`. |
| `explanation.short` | yes | One-paragraph answer, `en` and `vi`. |
| `explanation.whyCorrect` | yes | Why the correct option is right, `en` and `vi`. |
| `explanation.whyWrong` | yes | For each wrong option, keyed by its letter in the original order (`"B"`, `"C"`…), `en` and `vi`. No entry for correct options. |
| `explanation.inShort` | yes | One-sentence takeaway, `en` and `vi`. The app adds the "In short:" / "Tóm lại:" label. |
| `pmbok8Note` | no | What changes in PMBOK Guide 8th Edition (Vietnamese). |
| `related` | no | Id of a question on the same concept (flashcard → scenario link, story C3). Must exist. |
| `source.type` | yes | `own` (written for this project) or `cc` (adapted from a Creative Commons source). |
| `source.text` | yes | Attribution line shown to users. |
| `source.license`, `source.url` | for `cc` | Licence name (e.g. `CC BY-NC 4.0`) and link to the original. `source.reference` gives the chapter or question number. |

## Warnings

The script also warns, without failing, when the correct option is much longer than the others, because test-takers learn to pick the longest option.
