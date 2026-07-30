# LLM Benchmarks Are Broken

Visualizing the gap between AI benchmark scores and real world performance.

UC Berkeley MIDS, W209 Data Visualization, Spring 2026, Group 03, Section 04.

Live site: https://llm-benchmarks-w209.vercel.app/

## Team

Pallavi Geddam, Gunhui Kim, Mehek Bhargava, Sahana Venkatesh

## What this is

MMLU is the benchmark most AI labs quote when they announce a new model, but recent models are packed so close together at the top of the scale that the number barely tells them apart anymore. We wanted to know whether MMLU still tracks what people actually think of these models, so we compared it against Arena ELO, a rating built from head to head human preference votes, across 281 models. We also checked whether paying more for a model buys a better score on either metric.

## What we found

**MMLU has saturated.** Across 281 models, the standard deviation of MMLU scores collapsed from 19.0 points in early releases to 0.9 points in recent ones, while the mean climbed from 33 percent to 93 percent. Most current models sit within a point or two of each other, so the benchmark has almost no room left to separate them.

**The two benchmarks agree less at the top.** MMLU and Arena ELO rank correlate at r = 0.841 across the full field, but the score correlation drops to r = 0.666 among just the top 20 models by ELO (n = 56 frontier models). The benchmark that's easiest to game is also the one that matters least once a model is already competing at the frontier.

**Price doesn't track human preference.** Cost per million tokens correlates with MMLU at r = 0.31 but with Arena ELO at only r = 0.066 (n = 49 models with both cost and ELO data). Paying more buys a slightly better benchmark score more reliably than it buys a model people actually prefer.

## Who this is for

Anyone deciding which model to use or cite based on a leaderboard number, and anyone curious about how benchmark saturation happens in practice.

## Data

- `data/llm_unified.csv`: one row per model, with MMLU, Arena ELO, cost, release date, and other benchmark scores, plus derived columns used in the analysis (rank, rank gap, frontier core flag, cost ratios)
- `data/llm_long.csv`: the same data in tidy long format, for benchmark by benchmark comparisons
- `data/mmlu_saturation_by_year.csv`: MMLU summary statistics grouped by release year, behind the saturation chart

Scores and ratings were compiled from publicly available model leaderboards and provider documentation, not collected by us firsthand. See `docs/` for the full source list from the class report.

## How it's built

The site is a single `index.html` using Chart.js and D3.js, deployed straight from this repo to Vercel with an automatic redeploy on every push to `main`. We picked D3 over Altair or Tableau for the interactive pieces, mainly because it let us show the engineering underneath the visualization rather than just the output of a charting library.

The data pipeline, pulling the raw benchmark numbers, computing the derived columns, and running the correlation tests, was built in Python and pandas in Google Colab (`notebooks/`).

The original exploratory D3 work lives on Observable: https://observablehq.com/d/f52de3b8ff1fb482. An exported copy sits in `observable/LLMBenchMarkD3Observable.js`, from before it was folded into the main site.

## Repo structure

```
index.html      the live site
data/           the three CSVs behind the charts
observable/     original Observable and D3 exploration
docs/           exploratory analysis writeup, usability study
presentations/  midterm and final decks
```

## License

MIT. See LICENSE.
