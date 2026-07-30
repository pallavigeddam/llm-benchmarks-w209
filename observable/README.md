# Exploratory D3 work (Observable)

This is the exported source of the Observable notebook we used to explore all three hypotheses before building the final Chart.js and D3 site. It has the full chart by chart progression: line to banded line to beeswarm for H1, scatter to dual trend scatter to slope chart for H2, and the two panel cost comparison for H3, each with notes on what worked and what we changed next.

Live notebook: https://observablehq.com/d/f52de3b8ff1fb482

## Viewing it locally

Module imports need to be served over HTTP, not opened directly as a file. From this folder:

```
npx http-server
```

Then open the local address it prints.

## Files

- `LLMBenchMarkD3Observable.js`: the notebook, exported as a JS module
- `files/`: the two source CSVs the notebook reads (`llm_unified.csv`, `mmlu_saturation_by_year.csv`)
- `index.html`, `index.js`, `runtime.js`, `inspector.css`: Observable's runtime, needed to render the notebook standalone
