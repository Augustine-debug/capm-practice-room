# User flow

How a candidate moves through CAPM Practice Room. GitHub draws the Mermaid diagrams below; in other viewers, paste them into [mermaid.live](https://mermaid.live).

Pages are reached with `#/` links: Practice (`#/`), Exam guide (`#/guide`), Flashcards (`#/cards`) and About (`#/about`). The exam and results screens have no link of their own, so a reload during an attempt returns to Practice, where the attempt can be resumed.

## 1. Overview

```mermaid
flowchart LR
  Visit([Open the site]) --> Home[Practice home]
  Home <--> Guide[Exam guide]
  Home <--> About[About]
  Home <--> Cards[Flashcards]

  Home -->|Saved attempt?| Resume{Resume or discard}
  Resume -->|Resume| Exam
  Resume -->|Discard| Home

  Home --> Full[1 · Full mock<br/>150 questions, 180 min]
  Home --> Retry[2 · Review mistakes<br/>all questions answered wrong]
  Home --> Custom[4 · Custom practice<br/>domains, tasks, level, count]
  Home --> Cards

  Full --> Exam[Exam screen]
  Retry --> Exam
  Custom --> Exam
  Exam --> Results[Results]
  Results --> Home
```

## 2. Full mock exam

The mock follows the real exam: questions drawn by ECO weight (54 / 26 / 30 / 40), an optional 10-minute break after question 75, and no return to section 1 after it.

```mermaid
flowchart TD
  Start[Start dialog:<br/>rules, 180 minutes] -->|Start exam| S1[Section 1<br/>questions 1–75]
  Start -->|Not now| Home([Practice home])

  S1 -->|Answer, flag, move,<br/>jump with the navigator| S1
  S1 -->|Pause| Saved[(Saved in this browser)]
  Saved -->|Resume from home| S1

  S1 -->|End section 1| Confirm{Confirm:<br/>no return to 1–75}
  Confirm -->|Stay| S1
  Confirm -->|End section 1| Break[Optional break<br/>10 minutes]
  Break -->|Start section 2,<br/>or the break ends| S2[Section 2<br/>questions 76–150]

  S2 -->|Submit| Check{Confirm submit:<br/>unanswered and flagged counts}
  Check -->|Keep going| S2
  Check -->|Submit| Results[Results]
  S2 -->|Time runs out| Results
```

## 3. Practice and review

Custom practice, review mistakes and "practise this task" use the same exam screen, with instant feedback: each answer shows right or wrong, the explanation (EN/VI) and a link to report the question.

```mermaid
flowchart TD
  Pick[Pick filters on home:<br/>domain, task, level,<br/>question type, count] --> Opts[Options: instant feedback,<br/>shuffle options, timer at 72 s per question]
  Opts --> Q[Question]
  Q -->|Answer| Fb[Right or wrong<br/>+ explanation, EN/VI switch<br/>+ Report this question]
  Fb -->|Next| Q
  Fb -->|Last question| Results
  Fb -.->|Report| Form[(Google Form,<br/>question ID filled in)]
```

## 4. Results and what comes next

```mermaid
flowchart TD
  R[Results: score, 70% reference mark,<br/>domain and task breakdown] --> Weak[Study these tasks first:<br/>3 weakest ECO tasks]
  Weak -->|Practise task| Practice[Up to 20 exam questions<br/>on that task]
  R --> Review[Review by tab:<br/>All · Incorrect · Unanswered · Flagged]
  R -->|Redo the wrong ones| RetryThis[Retry this attempt's mistakes]
  R -->|Home| Home([Practice home])
  Home --> Hist[History: last 30 attempts]
  Hist -->|Review| R
```

## 5. Flashcards

```mermaid
flowchart LR
  Deck[69 definition cards,<br/>shuffled, filter by domain] --> Front[Front: term question]
  Front -->|Tap, Space or swipe| Back[Back: answer + explanation]
  Back -->|I know it| Next[Next card]
  Back -->|Again| Next
  Back -->|Related exam question| RQ[One exam question<br/>on the same idea]
  RQ -->|Back to card| Back
  Next --> Front
  Deck -->|Only 'Again' cards| Front
```

Everything a candidate does is kept only in their browser (`localStorage`, prefix `cpr.`). Visits and the modes started or finished are counted with GoatCounter, without answers or scores (see [decisions.md](decisions.md), D9).
