function _1(md){return(
md`md\`
# LLM Benchmarks Are Broken
## Visualizing the Gap Between AI Scores and Real-World Performance

**UC Berkeley MIDS | W209 Data Visualization | Group 03 | Sec 04 | Final Project Exploratory Analysis**
*Pallavi Geddam · Gunhui Kim · Mehek Bhargava · Sahana Venkatesh*

---

### Project Overview

The AI industry runs on benchmarks. Every model launch leads with a headline score like "88% on MMLU," and everyone accepts the assumption that a higher benchmark score means a better model. This project challenges that assumption.

The key insight driving this work: we have two independent measures of model quality that should agree.

- **Benchmark scores** (fixed tests like MMLU) - a model can be optimized or trained toward these
- **Arena ELO** (real humans blind-voting on which model gave a better answer) - this cannot be gamed; there is no answer key to memorize when the test is whether a real person preferred your response

When the two measures disagree, **the benchmark is what is broken.**

---

### Dataset

**Kaggle LLM Benchmark Tracker 2020–2026** - 286 models, 43 columns, sourced entirely from published or official materials.

Several live sources failed during collection: the HuggingFace Leaderboard Space timed out, the LMSYS Chatbot Arena Space threw runtime errors, and the Arena ELO GitHub repo lacked sufficient historical depth. This Kaggle dataset, supplemented by Arena AI GitHub ELO snapshots, was the only source that held up.

The dataset arrived as three tiers:
- **Frontier (80 models)** - commercial flagship models; the only tier with both Arena ELO and cost data
- **Research (106 models)** - academic and open-source models
- **Community (100 models)** - HuggingFace fine-tunes

**Usable analysis core: 56 frontier models with both MMLU score and Arena ELO.**

---

### Preprocessing (Python/Pandas, Google Colab)

1. Loaded and inspected all three raw files - schemas, null counts, date coverage
2. Verified hypotheses were numerically testable before building any charts
3. Merged three files into one unified table with a category column
4. Derived variables: rank columns for MMLU and ELO, rank_gap, cost ratios, release year/quarter
5. Wrote three output files: \\\`llm_unified.csv\\\`, \\\`llm_long.csv\\\`, \\\`mmlu_saturation_by_year.csv\\\`

> **Note on H3 pivot:** The original plan used model size (parameters_b), but that column was 71% null within the 56-model frontier core. Output cost was fully populated for the same tier and told a stronger story.

---

### Three Hypotheses

Before visualizing, we ran quick numerical checks to confirm each signal was real:

| Hypothesis | Signal | Verified stat |
|---|---|---|
| **H1 - Saturation** | MMLU std dev collapsing over time | σ dropped from 19.0 (2023) to 0.9 (2026) |
| **H2 - Frontier Gap** | MMLU-ELO correlation weakens at the top | r=0.841 overall → r=0.666 at top-20 ELO |
| **H3 - Cost Disconnect** | Cost tracks benchmark, not real preference | cost-MMLU r=0.31 vs cost-ELO r=0.066 |

\``
)}

function _2(md){return(
md`md\`
## Data Loading

Two data cells power all nine charts. \\\`satByYear\\\` feeds the H1 line and band charts. \\\`modelScores\\\` feeds everything else - H1 beeswarm, all H2 views, and all H3 views.
\``
)}

function _data(FileAttachment){return(
FileAttachment("llm_unified.csv").csv({ typed: true })
)}

async function _satByYear(FileAttachment)
{
  const raw = await FileAttachment("mmlu_saturation_by_year.csv").csv();
  return raw.map((d) => ({
    release_year: +d.release_year,
    mean: +d.mean,
    std: +d.std,
    count: +d.count
  }));
}


async function _modelScores(FileAttachment)
{
  const raw = await FileAttachment("llm_unified.csv").csv();
  return raw
    .filter(
      (d) =>
        d.mmlu_score != null &&
        d.mmlu_score !== "" &&
        d.release_year != null &&
        d.category != null
    )
    .map((d) => ({
      model: d.model_name,
      provider: d.provider,
      release_year: +d.release_year,
      score: +d.mmlu_score,
      mmlu_score: +d.mmlu_score,
      arena_elo:
        d.arena_elo != null && d.arena_elo !== "" ? +d.arena_elo : null,
      category: d.category,
      frontier_core: d.frontier_core === "True" || d.frontier_core === true,
      mmlu_rank:
        d.mmlu_rank != null && d.mmlu_rank !== "" ? +d.mmlu_rank : null,
      elo_rank: d.elo_rank != null && d.elo_rank !== "" ? +d.elo_rank : null,
      rank_gap: d.rank_gap != null && d.rank_gap !== "" ? +d.rank_gap : null,
      cost_output_per_1m_usd:
        d.cost_output_per_1m_usd != null && d.cost_output_per_1m_usd !== ""
          ? +d.cost_output_per_1m_usd
          : null
    }));
}


function _6(md){return(
md`### H1 Saturation : line → banded line → beeswarm

**Hypothesis 1:** LLM benchmark scores (MMLU) are rapidly approaching the 100% theoretical ceiling, suggesting the benchmark is becoming saturated and will soon lose its ability to differentiate model quality.

**Initial Exploration:** We began by inspecting the \`satByYear\` dataset - mean MMLU scores aggregated by release year from 2020–2026. Before visualizing, we noticed the mean jumped from 33% in 2020 to over 93% in 2026. This immediately suggested a saturation effect. We chose to explore this with three progressive chart types: a simple line chart, a banded line with standard deviation, and finally a beeswarm showing individual model scores.`
)}

function _7(md){return(
md`**View 1 - Line chart: MMLU mean climbing toward the ceiling**

**What's informative about this view:** The simple line chart immediately makes the saturation trend visible. Mean MMLU score rises from 33% in 2020 to 93% in 2026 - a 60-point jump in just 6 years. The dashed 100% ceiling line shows how close models are getting to the theoretical maximum. The steep slope in 2022–2023 coincides with the release of GPT-4 class models.

**What could be improved:** This view only shows the mean - it hides the spread across models within each year. A single aggregate line doesn't tell us whether all models improved uniformly or if a few frontier models are pulling the average up. We need to add uncertainty bands.`
)}

function _view1Line(satByYear,d3)
{
  const data = satByYear;
  const lineColor = d3.schemeTableau10[0];
  const ceilColor = "#a78bfa";
  const width = 700,
    height = 400;
  const margin = { top: 50, right: 30, bottom: 55, left: 60 };

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.release_year))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  const colorScale = d3
    .scaleSequential()
    .domain(d3.extent(data, (d) => d.release_year))
    .interpolator(d3.interpolateViridis);

  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9");

  // chart title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("font-size", 15)
    .attr("font-weight", 500)
    .text("Mean MMLU Score by Year");

  // 100% ceiling
  svg
    .append("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", y(100))
    .attr("y2", y(100))
    .attr("stroke", ceilColor)
    .attr("stroke-dasharray", "6 3")
    .attr("stroke-width", 1.5);

  // mean line
  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", lineColor)
    .attr("stroke-width", 2.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.release_year))
        .y((d) => y(d.mean))
    );

  // dots colored by year
  svg
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => x(d.release_year))
    .attr("cy", (d) => y(d.mean))
    .attr("r", 6)
    .attr("fill", (d) => colorScale(d.release_year))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);

  // axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // axis labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Release Year");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Mean MMLU Score (%)");

  // legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${margin.left + 10}, ${margin.top + 10})`);

  legend
    .append("line")
    .attr("x1", 0)
    .attr("x2", 20)
    .attr("y1", 5)
    .attr("y2", 5)
    .attr("stroke", lineColor)
    .attr("stroke-width", 2.5);
  legend
    .append("text")
    .attr("x", 26)
    .attr("y", 9)
    .attr("font-size", 11)
    .text("Mean MMLU score by year");

  legend
    .append("line")
    .attr("x1", 0)
    .attr("x2", 20)
    .attr("y1", 22)
    .attr("y2", 22)
    .attr("stroke", ceilColor)
    .attr("stroke-dasharray", "6 3")
    .attr("stroke-width", 1.5);
  legend
    .append("text")
    .attr("x", 26)
    .attr("y", 26)
    .attr("font-size", 11)
    .text("100% ceiling (theoretical max)");

  return svg.node();
}


function _9(md){return(
md`View 2 — Same chart, add a min/max band + std ribbon`
)}

function _view2Band(satByYear,d3)
{
  const data = satByYear;
  const lineColor = d3.schemeTableau10[0];
  const ceilColor = "#a78bfa";
  const rangeColor = "#9ca3af";
  const stdColor = d3.schemeTableau10[1];
  const width = 700,
    height = 420;
  const margin = { top: 50, right: 30, bottom: 55, left: 60 };

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.release_year))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  const colorScale = d3
    .scaleSequential()
    .domain(d3.extent(data, (d) => d.release_year))
    .interpolator(d3.interpolateViridis);

  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9");

  // chart title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("font-size", 15)
    .attr("font-weight", 500)
    .text("MMLU Score Spread by Year: Mean ± Std Dev + Full Range");

  // 100% ceiling
  svg
    .append("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", y(100))
    .attr("y2", y(100))
    .attr("stroke", ceilColor)
    .attr("stroke-dasharray", "6 3")
    .attr("stroke-width", 1.5);

  // outer band: full min to max range
  svg
    .append("path")
    .datum(data)
    .attr("fill", rangeColor)
    .attr("opacity", 0.15)
    .attr(
      "d",
      d3
        .area()
        .x((d) => x(d.release_year))
        .y0((d) => y(d.min))
        .y1((d) => y(d.max))
    );

  // inner band: mean ± 1 std deviation
  svg
    .append("path")
    .datum(data)
    .attr("fill", stdColor)
    .attr("opacity", 0.28)
    .attr(
      "d",
      d3
        .area()
        .x((d) => x(d.release_year))
        .y0((d) => y(Math.max(0, d.mean - d.std)))
        .y1((d) => y(Math.min(100, d.mean + d.std)))
    );

  // mean line on top of both bands
  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", lineColor)
    .attr("stroke-width", 2.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.release_year))
        .y((d) => y(d.mean))
    );

  // dots colored by year
  svg
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => x(d.release_year))
    .attr("cy", (d) => y(d.mean))
    .attr("r", 5.5)
    .attr("fill", (d) => colorScale(d.release_year))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);

  // sigma label above each dot (clean, no n= clutter)
  svg
    .selectAll("text.sigma")
    .data(data)
    .join("text")
    .attr("class", "sigma")
    .attr("x", (d) => x(d.release_year))
    .attr("y", (d) => y(d.mean) - 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("fill", "#555")
    .text((d) => `σ=${d.std.toFixed(1)}`);

  // axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // axis labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Release Year");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Mean MMLU Score (%)");

  // legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${margin.left + 10}, ${margin.top + 10})`);

  legend
    .append("line")
    .attr("x1", 0)
    .attr("x2", 20)
    .attr("y1", 5)
    .attr("y2", 5)
    .attr("stroke", lineColor)
    .attr("stroke-width", 2.5);
  legend
    .append("text")
    .attr("x", 26)
    .attr("y", 9)
    .attr("font-size", 11)
    .text("Mean MMLU score");

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 16)
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", stdColor)
    .attr("opacity", 0.3);
  legend
    .append("text")
    .attr("x", 26)
    .attr("y", 25)
    .attr("font-size", 11)
    .text("±1 std deviation band");

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 32)
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", rangeColor)
    .attr("opacity", 0.2);
  legend
    .append("text")
    .attr("x", 26)
    .attr("y", 41)
    .attr("font-size", 11)
    .text("Full min–max range");

  legend
    .append("line")
    .attr("x1", 0)
    .attr("x2", 20)
    .attr("y1", 52)
    .attr("y2", 52)
    .attr("stroke", ceilColor)
    .attr("stroke-dasharray", "6 3")
    .attr("stroke-width", 1.5);
  legend
    .append("text")
    .attr("x", 26)
    .attr("y", 56)
    .attr("font-size", 11)
    .text("100% ceiling (theoretical max)");

  return svg.node();
}


function _11(md){return(
md`**View 2 - Banded line chart: adding uncertainty (±1σ)**

**What's informative about this view:** Adding the ±1 standard deviation band reveals that model performance within each year varies dramatically. The spread actually peaks in 2023 (σ=19.0, n=92 models) as a wave of mid-tier models entered the field, then collapses sharply. The 2022 band is already wide (σ=14.8), meaning some models score 30% while others score 70% in the same year. By 2026, the band narrows to σ=0.9, confirming saturation: models are clustering at the ceiling with almost no variance remaining. The sigma labels on each data point make the compression immediately legible.

**What could be improved:** The line chart still aggregates by year and doesn't show where individual models sit relative to each other. The year bucketing hides sub-year trends and doesn't distinguish frontier vs. community models. We need to break down to the individual model level.`
)}

function _view3Beeswarm(modelScores,d3)
{
  const data = modelScores;
  const years = Array.from(new Set(data.map((d) => d.release_year))).sort(
    (a, b) => a - b
  );
  const catColor = {
    frontier: "#378ADD",
    research: "#1D9E75",
    community: "#D85A30"
  };

  const width = 720,
    height = 460;
  const margin = { top: 50, right: 30, bottom: 55, left: 60 };

  const x = d3
    .scalePoint()
    .domain(years)
    .range([margin.left + 20, width - margin.right - 20])
    .padding(0.5);

  const y = d3
    .scaleLinear()
    .domain([15, 100])
    .range([height - margin.bottom, margin.top]);

  // copy rows so the simulation doesn't mutate modelScores
  const nodes = data.map((d) => ({
    ...d,
    targetX: x(d.release_year),
    fy: y(d.score) // lock each dot to its true MMLU y-position
  }));

  const sim = d3
    .forceSimulation(nodes)
    .force("x", d3.forceX((d) => d.targetX).strength(0.2))
    .force("collide", d3.forceCollide(5))
    .stop();
  for (let i = 0; i < 300; i++) sim.tick();

  // use a div container so the tooltip can be absolutely positioned
  const container = d3.create("div").style("position", "relative");

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9");

  // chart title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("font-size", 15)
    .attr("font-weight", 500)
    .text("Individual MMLU Scores by Year and Category");

  // 100% ceiling
  svg
    .append("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", y(100))
    .attr("y2", y(100))
    .attr("stroke", "#a78bfa")
    .attr("stroke-dasharray", "6 3")
    .attr("stroke-width", 1.5);

  // subtle horizontal grid lines
  svg
    .selectAll(".gridline")
    .data(y.ticks(6))
    .join("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#000")
    .attr("opacity", 0.05);

  // axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // axis labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Release Year");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("MMLU Score (%)");

  // tooltip div
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "4px 8px")
    .style("font-size", "11px")
    .style("white-space", "nowrap")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)");

  // dots
  svg
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 4.5)
    .attr("fill", (d) => catColor[d.category])
    .attr("fill-opacity", 0.8)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.75)
    .style("cursor", "pointer")
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("r", 7).attr("fill-opacity", 1);
      tooltip.style("display", "block").html(`<strong>${d.model}</strong><br>
               ${d.provider} · ${d.release_year}<br>
               ${d.score.toFixed(1)}% MMLU · ${d.category}`);
    })
    .on("mousemove", function (event) {
      const [px, py] = d3.pointer(event, container.node());
      tooltip.style("left", `${px + 12}px`).style("top", `${py - 36}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).attr("r", 4.5).attr("fill-opacity", 0.8);
      tooltip.style("display", "none");
    });

  // legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${margin.left + 10}, ${margin.top + 10})`);

  [
    ["frontier", "Frontier"],
    ["research", "Research / open flagship"],
    ["community", "Community / fine-tuned"]
  ].forEach(([key, label], i) => {
    const row = legend.append("g").attr("transform", `translate(0, ${i * 18})`);
    row
      .append("circle")
      .attr("cx", 6)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", catColor[key]);
    row
      .append("text")
      .attr("x", 16)
      .attr("y", 4)
      .attr("font-size", 11)
      .text(label);
  });

  return container.node();
}


function _13(md){return(
md`**View 3 - Beeswarm: every individual model as a dot (the chart-type switch)**

**What's informative about this view:** Switching from aggregated lines to a beeswarm of individual models reveals the full distribution. Each dot is one model, color-coded by category (blue = frontier, green = research, orange = community). The rightward and upward drift of dots across years is visually compelling: frontier models cluster near the top, while community models spread more widely. The force-simulation layout prevents overplotting while preserving the true MMLU y-position for each model

**What could be improved:** The beeswarm is dense and could benefit from a frontier-only filter toggle to isolate the saturation story for the models that matter most to benchmark consumers. Sub-year release timing is also hidden by the discrete year bucketing.

**Conclusion - H1:** The data strongly supports Hypothesis 1. MMLU mean scores rose from 33% in 2020 to 93% in 2026, a 60-point climb in just 6 years. Standard deviation collapsed from σ=19.0 in 2023 to σ=0.9 in 2026, confirming models are converging at the ceiling. The beeswarm confirms this is not driven by outliers: nearly all 2026 models score above 90%. MMLU is becoming an insufficient differentiator for frontier models.

---

### H2 Frontier Gap: scatter → dual-trend scatter → slope chart

**Hypothesis 2:** Models that score highest on MMLU do not necessarily rank highest in real-world human preference (Arena ELO), suggesting benchmark gaming or that MMLU tests a different skill than conversational quality.

**Initial Exploration:** We filtered to frontier models (frontier_core = True) and plotted MMLU score on the x-axis against Arena ELO on the y-axis. Before visualizing, we noted the correlation between the two metrics wasn't obvious from the data alone — some models with high MMLU appeared mid-range on ELO leaderboards.`
)}

function _14(md){return(
md`View 1 - Scatter: MMLU score vs Arena ELO
`
)}

function _viewOfH2_1(modelScores,d3)
{
  const width = 700,
    height = 440;
  const margin = { top: 50, right: 30, bottom: 55, left: 65 };

  const pts = modelScores.filter(
    (d) => d.frontier_core === true || d.frontier_core === "True"
  );

  const x = d3
    .scaleLinear()
    .domain(d3.extent(pts, (d) => d.mmlu_score))
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(pts, (d) => d.arena_elo))
    .nice()
    .range([height - margin.bottom, margin.top]);

  const colorScale = d3
    .scaleSequential()
    .domain(d3.extent(pts, (d) => d.mmlu_score))
    .interpolator(d3.interpolateCool);

  // div container for tooltip positioning
  const container = d3.create("div").style("position", "relative");

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9");

  // chart title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("font-size", 15)
    .attr("font-weight", 500)
    .text("MMLU Score vs Arena ELO - Frontier Models");

  // dots colored by MMLU score
  svg
    .selectAll("circle")
    .data(pts)
    .join("circle")
    .attr("cx", (d) => x(d.mmlu_score))
    .attr("cy", (d) => y(d.arena_elo))
    .attr("r", 5)
    .attr("fill", (d) => colorScale(d.mmlu_score))
    .attr("opacity", 0.78)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.8)
    .style("cursor", "pointer")
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("r", 8).attr("opacity", 1);
      tooltip.style("display", "block").html(`<strong>${d.model}</strong><br>
               MMLU: ${d.mmlu_score.toFixed(1)}%<br>
               Arena ELO: ${d.arena_elo.toFixed(0)}<br>
               ${d.provider}`);
    })
    .on("mousemove", function (event) {
      const [px, py] = d3.pointer(event, container.node());
      tooltip.style("left", `${px + 12}px`).style("top", `${py - 36}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).attr("r", 5).attr("opacity", 0.78);
      tooltip.style("display", "none");
    });

  // axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // axis labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("MMLU Score (%)");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Arena ELO Rating");

  // correlation annotation
  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", margin.top + 20)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", "#555")
    .text("Overall correlation r = 0.841");

  // gradient legend
  const defs = svg.append("defs");
  const grad = defs
    .append("linearGradient")
    .attr("id", "cool-grad-h2")
    .attr("x1", "0%")
    .attr("x2", "100%");
  [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
    grad
      .append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", d3.interpolateCool(t));
  });

  const lgW = 120,
    lgH = 10;
  const lgX = margin.left + 10,
    lgY = margin.top + 10;

  svg
    .append("rect")
    .attr("x", lgX)
    .attr("y", lgY)
    .attr("width", lgW)
    .attr("height", lgH)
    .attr("fill", "url(#cool-grad-h2)")
    .attr("rx", 3);

  svg
    .append("text")
    .attr("x", lgX)
    .attr("y", lgY + lgH + 13)
    .attr("font-size", 10)
    .attr("fill", "#444")
    .text("MMLU score →  low");

  svg
    .append("text")
    .attr("x", lgX + lgW)
    .attr("y", lgY + lgH + 13)
    .attr("font-size", 10)
    .attr("fill", "#444")
    .attr("text-anchor", "end")
    .text("high");

  // tooltip
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "4px 8px")
    .style("font-size", "11px")
    .style("white-space", "nowrap")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)");

  return container.node();
}


function _16(md){return(
md`**View 1 - Basic scatter: MMLU score vs Arena ELO**

**What's informative about this view:** Even the basic scatter reveals a positive but noisy correlation. Models with very high MMLU (>90%) tend to cluster in the upper Arena ELO range, but there are clear exceptions — some models score 85%+ MMLU yet land below 1,300 ELO, while others with moderate MMLU appear in the top ELO tier. This suggests MMLU score alone is not a reliable predictor of conversational quality.

**What could be improved:** The scatter treats all frontier models equally with no distinction between the overall field and the top tier specifically. The overall correlation (r=0.841) looks reasonably strong, but it may be masking a weaker relationship at the frontier where model selection actually matters. A trend line and top-tier isolation would expose whether the relationship holds at the top or breaks down..`
)}

function _viewOfH2_2(modelScores,d3)
{
  const width = 700,
    height = 440;
  const margin = { top: 50, right: 30, bottom: 55, left: 60 };

  const pts = modelScores.filter(
    (d) => d.frontier_core === true || d.frontier_core === "True"
  );

  const topElo = [...pts]
    .sort((a, b) => b.arena_elo - a.arena_elo)
    .slice(0, 20);
  const topSet = new Set(topElo.map((d) => d.model));

  const x = d3
    .scaleLinear()
    .domain(d3.extent(pts, (d) => d.mmlu_score))
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(pts, (d) => d.arena_elo))
    .nice()
    .range([height - margin.bottom, margin.top]);

  const container = d3.create("div").style("position", "relative");

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9");

  // chart title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("font-size", 15)
    .attr("font-weight", 500)
    .text("MMLU vs Arena ELO - Top-20 ELO Models Highlighted");

  // least-squares fit helper
  function fit(arr) {
    const n = arr.length;
    const sx = d3.sum(arr, (d) => d.mmlu_score);
    const sy = d3.sum(arr, (d) => d.arena_elo);
    const sxy = d3.sum(arr, (d) => d.mmlu_score * d.arena_elo);
    const sxx = d3.sum(arr, (d) => d.mmlu_score ** 2);
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const intercept = (sy - slope * sx) / n;
    const xs = d3.extent(arr, (d) => d.mmlu_score);
    return xs.map((xv) => ({ x: xv, y: slope * xv + intercept }));
  }

  const drawLine = (arr, color, dash) => {
    const seg = fit(arr);
    svg
      .append("line")
      .attr("x1", x(seg[0].x))
      .attr("y1", y(seg[0].y))
      .attr("x2", x(seg[1].x))
      .attr("y2", y(seg[1].y))
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", dash || "none");
  };

  // dots: top-20 ELO red, rest light grey
  svg
    .selectAll("circle")
    .data(pts)
    .join("circle")
    .attr("cx", (d) => x(d.mmlu_score))
    .attr("cy", (d) => y(d.arena_elo))
    .attr("r", 4.5)
    .attr("fill", (d) => (topSet.has(d.model) ? "#dc2626" : "#cbd5e1"))
    .attr("opacity", 0.85)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("r", 7).attr("opacity", 1);
      tooltip.style("display", "block").html(`<strong>${d.model}</strong><br>
               MMLU: ${d.mmlu_score.toFixed(1)}%<br>
               Arena ELO: ${d.arena_elo.toFixed(0)}<br>
               ${topSet.has(d.model) ? "★ Top-20 ELO" : "Other frontier"}`);
    })
    .on("mousemove", function (event) {
      const [px, py] = d3.pointer(event, container.node());
      tooltip.style("left", `${px + 12}px`).style("top", `${py - 36}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).attr("r", 4.5).attr("opacity", 0.85);
      tooltip.style("display", "none");
    });

  // trend lines (drawn after dots so they sit on top)
  drawLine(pts, "#64748b", "5 4"); // all frontier, grey dashed
  drawLine(topElo, "#dc2626"); // top-20 ELO, red solid

  // correlation annotations
  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", margin.top + 20)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", "#555")
    .text("All models: r = 0.841");

  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", margin.top + 36)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", "#dc2626")
    .text("Top-20 ELO: r = 0.666");

  // axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // axis labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("MMLU Score (%)");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Arena ELO Rating");

  // legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${margin.left + 10}, ${margin.top + 10})`);

  legend
    .append("circle")
    .attr("cx", 5)
    .attr("cy", 6)
    .attr("r", 4.5)
    .attr("fill", "#dc2626")
    .attr("opacity", 0.85);
  legend
    .append("text")
    .attr("x", 16)
    .attr("y", 10)
    .attr("font-size", 11)
    .text("Top 20 by Arena ELO");

  legend
    .append("circle")
    .attr("cx", 5)
    .attr("cy", 24)
    .attr("r", 4.5)
    .attr("fill", "#cbd5e1")
    .attr("opacity", 0.85);
  legend
    .append("text")
    .attr("x", 16)
    .attr("y", 28)
    .attr("font-size", 11)
    .text("Other frontier models");

  legend
    .append("line")
    .attr("x1", 0)
    .attr("x2", 18)
    .attr("y1", 42)
    .attr("y2", 42)
    .attr("stroke", "#dc2626")
    .attr("stroke-width", 2);
  legend
    .append("text")
    .attr("x", 22)
    .attr("y", 46)
    .attr("font-size", 11)
    .text("Trend: top-20 models");

  legend
    .append("line")
    .attr("x1", 0)
    .attr("x2", 18)
    .attr("y1", 58)
    .attr("y2", 58)
    .attr("stroke", "#64748b")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5 4");
  legend
    .append("text")
    .attr("x", 22)
    .attr("y", 62)
    .attr("font-size", 11)
    .text("Trend: all frontier models");

  // tooltip
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "4px 8px")
    .style("font-size", "11px")
    .style("white-space", "nowrap")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)");

  return container.node();
}


function _18(md){return(
md`**View 2 - Dual-trend scatter: highlighting top-20 ELO models**

**What's informative about this view:** Color-coding the top 20 Arena ELO models red reveals a striking pattern: top-ELO models cluster in the 85–95% MMLU range, not at the very top of MMLU. The two trend lines tell different stories - the red line (top-20 models) is nearly flat (r=0.666), while the grey dashed line (all models) slopes upward (r=0.841). This means that among truly top-performing models (by ELO), more MMLU score does not predict more ELO - the relationship flattens at the frontier where model selection actually matters.

**What could be improved:** The scatter chart doesn't show individual model identities, making it hard to name specific outliers. A slope chart mapping MMLU rank vs ELO rank would more directly visualize inversions - cases where a model ranks high on one metric but low on the other.`
)}

function _viewOfH2_3(modelScores,d3)
{
  const pts = modelScores
    .filter((d) => d.frontier_core === true || d.frontier_core === "True")
    .filter((d) => d.mmlu_rank != null && d.elo_rank != null);

  const width = 600,
    height = 700;
  const margin = { top: 50, right: 160, bottom: 50, left: 160 };

  const maxRank = d3.max(pts, (d) => Math.max(d.mmlu_rank, d.elo_rank));

  const y = d3
    .scaleLinear()
    .domain([1, maxRank])
    .range([margin.top, height - margin.bottom]);

  const xL = margin.left,
    xR = width - margin.right;

  const color = d3
    .scaleSequential()
    .domain([0, d3.max(pts, (d) => Math.abs(d.rank_gap))])
    .interpolator(d3.interpolatePlasma);

  const container = d3.create("div").style("position", "relative");

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9");

  // chart title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("font-size", 15)
    .attr("font-weight", 500)
    .text("MMLU Rank vs Arena ELO Rank - Inversions");

  // all lines: gray if small gap, plasma colored if big inversion
  svg
    .selectAll("line.slope")
    .data(pts)
    .join("line")
    .attr("x1", xL)
    .attr("y1", (d) => y(d.mmlu_rank))
    .attr("x2", xR)
    .attr("y2", (d) => y(d.elo_rank))
    .attr("stroke", (d) =>
      Math.abs(d.rank_gap) >= 5 ? color(Math.abs(d.rank_gap)) : "#d1d5db"
    )
    .attr("stroke-width", (d) => (Math.abs(d.rank_gap) >= 5 ? 2 : 0.8))
    .attr("opacity", 0.85)
    .style("cursor", "pointer")
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("stroke-width", 4).attr("opacity", 1);
      tooltip.style("display", "block").html(`<strong>${d.model}</strong><br>
               MMLU rank: ${d.mmlu_rank}<br>
               ELO rank: ${d.elo_rank}<br>
               Rank gap: ${d.rank_gap > 0 ? "+" : ""}${d.rank_gap}`);
    })
    .on("mousemove", function (event) {
      const [px, py] = d3.pointer(event, container.node());
      tooltip.style("left", `${px + 12}px`).style("top", `${py - 36}px`);
    })
    .on("mouseleave", function (event, d) {
      d3.select(this)
        .attr("stroke-width", Math.abs(d.rank_gap) >= 5 ? 2 : 0.8)
        .attr("opacity", 0.85);
      tooltip.style("display", "none");
    });

  const big = pts.filter((d) => Math.abs(d.rank_gap) >= 5);

  // left labels: model name at its MMLU rank
  svg
    .selectAll("text.lbl-l")
    .data(big)
    .join("text")
    .attr("x", xL - 8)
    .attr("y", (d) => y(d.mmlu_rank))
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("fill", (d) => color(Math.abs(d.rank_gap)))
    .text((d) => d.model);

  // right labels: same model name at its ELO rank
  svg
    .selectAll("text.lbl-r")
    .data(big)
    .join("text")
    .attr("x", xR + 8)
    .attr("y", (d) => y(d.elo_rank))
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("fill", (d) => color(Math.abs(d.rank_gap)))
    .text((d) => d.model);

  // column headers
  svg
    .append("text")
    .attr("x", xL)
    .attr("y", 42)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", 12)
    .text("MMLU rank");

  svg
    .append("text")
    .attr("x", xR)
    .attr("y", 42)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", 12)
    .text("ELO rank");

  // gradient legend at bottom
  const defs = svg.append("defs");
  const grad = defs
    .append("linearGradient")
    .attr("id", "plasma-grad-h2")
    .attr("x1", "0%")
    .attr("x2", "100%");
  [0, 0.33, 0.66, 1].forEach((t) => {
    grad
      .append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", d3.interpolatePlasma(t));
  });

  svg
    .append("rect")
    .attr("x", xL)
    .attr("y", height - 30)
    .attr("width", xR - xL)
    .attr("height", 8)
    .attr("fill", "url(#plasma-grad-h2)")
    .attr("rx", 2);

  svg
    .append("text")
    .attr("x", xL)
    .attr("y", height - 14)
    .attr("font-size", 9)
    .attr("fill", "#555")
    .text("small rank gap");

  svg
    .append("text")
    .attr("x", xR)
    .attr("y", height - 14)
    .attr("font-size", 9)
    .attr("fill", "#555")
    .attr("text-anchor", "end")
    .text("large rank gap");

  // tooltip
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "4px 8px")
    .style("font-size", "11px")
    .style("white-space", "nowrap")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)");

  return container.node();
}


function _20(md){return(
md`"Rank correlation (Spearman style, n=56, full frontier field) - distinct from the r=0.666 score correlation among top-20 ELO models reported above. Ranks compress outliers and ignore score magnitude, so a strong rank relationship across the full field can coexist with a weak score relationship within the top tier."`
)}

function _21(modelScores,d3)
{
  const pts = modelScores
    .filter((d) => d.frontier_core === true || d.frontier_core === "True")
    .filter((d) => d.mmlu_rank != null && d.elo_rank != null);
  const n = pts.length;
  const mx = d3.mean(pts, (d) => d.mmlu_rank);
  const my = d3.mean(pts, (d) => d.elo_rank);
  const cov = d3.sum(pts, (d) => (d.mmlu_rank - mx) * (d.elo_rank - my));
  const sx = Math.sqrt(d3.sum(pts, (d) => (d.mmlu_rank - mx) ** 2));
  const sy = Math.sqrt(d3.sum(pts, (d) => (d.elo_rank - my) ** 2));
  const r = cov / (sx * sy);
  return `Live calculation - MMLU rank vs ELO rank correlation, full frontier field (n=${n}): r = ${r.toFixed(
    2
  )}. Measures relative ordering, not score agreement.`;
}


function _22(md){return(
md`**View 3 - Slope chart: MMLU rank vs Arena ELO rank (inversions)**

**What's informative about this view:** The slope chart makes rank inversions immediately visible. Lines that cross dramatically reveal models where benchmark rank and human-preference rank diverge sharply. The plasma color gradient, scaled to rank gap magnitude, draws the eye to the most extreme mismatches. Among the 56 frontier core models, overall MMLU-to-ELO score correlation is 0.841, dropping to 0.666 within the top 20 by ELO; the slope chart makes visible exactly where that breakdown lives. Note this is distinct from rank correlation (r=0.87, n=56), which measures whether relative ordering holds across the full field rather than whether scores move together at the top. Several models that score in the top 10 by MMLU sit outside the top 20 by ELO, and vice versa. This directly tests whether MMLU is a reliable proxy for real-world model quality.

**What could be improved:** The chart becomes visually cluttered with overlapping lines at similar rank positions. A toggle to filter by rank gap threshold would let viewers isolate only the most extreme inversions for the polished final build.

**Hypothesis 2 Conclusion:** The scatter plots and slope chart together confirm that MMLU score and Arena ELO correlate across the full frontier field (r=0.841), but that relationship weakens meaningfully at the top tier (r=0.666 among top-20 ELO models). The trend line for top-20 ELO models is nearly flat, meaning additional MMLU score does not predict additional human preference at the frontier. Several models with near-perfect MMLU scores rank surprisingly low in human preference evaluations. MMLU saturation is masking meaningful quality differences at the frontier, confirming our hypothesis that the benchmark is losing discriminative power where it matters most.The full-field rank correlation (r=0.87) is not in tension with this finding; it measures whether relative ordering holds across all 56 models, while the r=0.666 figure measures score agreement specifically among the top 20 by ELO.

---

### H3 Cost-Effect: scatter → two-panel scatter → cost bar

**Hypothesis 3:** There is no strong correlation between model output cost and real-world performance (Arena ELO), meaning higher-priced models are not always better - but cost does correlate with MMLU score, suggesting expensive models over-optimize for benchmarks.

**Initial Exploration:** We examined the cost_output_per_1m_usd field against both Arena ELO and MMLU score. Before visualizing, the cost range was striking: from under $0.01 to over $100 per million tokens. This large range suggested a log scale would be necessary to avoid the data being crushed against one end of the axis.`
)}

function _23(md){return(
md`**View 1 - Scatter: output cost (log scale) vs Arena ELO**

**What's informative about this view:** The log-scale scatter reveals that the cost-ELO relationship is essentially flat (r=0.066). Models priced at $0.10/M tokens have nearly the same ELO range as models at $10/M tokens. The dots are spread vertically across the full ELO range at every cost level, and the trend line confirms the near-zero slope. This is a striking finding - paying more does not reliably buy better conversational performance.

**What could be improved:** The single panel only shows cost vs ELO. Showing cost vs MMLU side-by-side would allow direct comparison of the two relationships and reveal whether cost tracks the benchmark better than it tracks real preference.`
)}

function _viewOfH3_1(modelScores,d3)
{
  const width = 700,
    height = 440;
  const margin = { top: 50, right: 30, bottom: 65, left: 60 };

  const pts = modelScores.filter(
    (d) =>
      d.arena_elo != null &&
      d.cost_output_per_1m_usd != null &&
      d.cost_output_per_1m_usd > 0
  );

  const x = d3
    .scaleLog()
    .domain(d3.extent(pts, (d) => d.cost_output_per_1m_usd))
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(pts, (d) => d.arena_elo))
    .nice()
    .range([height - margin.bottom, margin.top]);

  const colorScale = d3
    .scaleSequential()
    .domain(d3.extent(pts, (d) => Math.log10(d.cost_output_per_1m_usd)))
    .interpolator(d3.interpolateMagma);

  const container = d3.create("div").style("position", "relative");

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9");

  // chart title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("font-size", 15)
    .attr("font-weight", 500)
    .text("Output Cost vs Arena ELO - Frontier Models");

  // dots colored by log cost
  svg
    .selectAll("circle")
    .data(pts)
    .join("circle")
    .attr("cx", (d) => x(d.cost_output_per_1m_usd))
    .attr("cy", (d) => y(d.arena_elo))
    .attr("r", 5)
    .attr("fill", (d) => colorScale(Math.log10(d.cost_output_per_1m_usd)))
    .attr("opacity", 0.78)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.8)
    .style("cursor", "pointer")
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("r", 8).attr("opacity", 1);
      tooltip.style("display", "block").html(`<strong>${d.model}</strong><br>
               Cost: $${d.cost_output_per_1m_usd.toFixed(2)}/1M tokens<br>
               Arena ELO: ${d.arena_elo.toFixed(0)}<br>
               ${d.provider}`);
    })
    .on("mousemove", function (event) {
      const [px, py] = d3.pointer(event, container.node());
      tooltip.style("left", `${px + 12}px`).style("top", `${py - 36}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).attr("r", 5).attr("opacity", 0.78);
      tooltip.style("display", "none");
    });

  // least-squares trend line on log-transformed x
  const logPts = pts.map((d) => ({
    lx: Math.log10(d.cost_output_per_1m_usd),
    y: d.arena_elo
  }));
  const n = logPts.length;
  const mx = d3.mean(logPts, (d) => d.lx);
  const my = d3.mean(logPts, (d) => d.y);
  const slope =
    d3.sum(logPts, (d) => (d.lx - mx) * (d.y - my)) /
    d3.sum(logPts, (d) => (d.lx - mx) ** 2);
  const intercept = my - slope * mx;
  const xExtent = d3.extent(pts, (d) => d.cost_output_per_1m_usd);
  svg
    .append("line")
    .attr("x1", x(xExtent[0]))
    .attr("y1", y(slope * Math.log10(xExtent[0]) + intercept))
    .attr("x2", x(xExtent[1]))
    .attr("y2", y(slope * Math.log10(xExtent[1]) + intercept))
    .attr("stroke", "#64748b")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "5 4");

  // correlation annotation
  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", margin.top + 20)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", "#555")
    .text("Cost vs ELO: r = 0.066");

  // axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6, "~s"));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // axis labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Output cost per 1M tokens (USD, log scale)");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Arena ELO Rating");

  // gradient legend
  const defs = svg.append("defs");
  const grad = defs
    .append("linearGradient")
    .attr("id", "magma-grad-h3")
    .attr("x1", "0%")
    .attr("x2", "100%");
  [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
    grad
      .append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", d3.interpolateMagma(t));
  });

  const lgX = margin.left + 10,
    lgY = margin.top + 10;
  const lgW = 140,
    lgH = 10;

  svg
    .append("rect")
    .attr("x", lgX)
    .attr("y", lgY)
    .attr("width", lgW)
    .attr("height", lgH)
    .attr("fill", "url(#magma-grad-h3)")
    .attr("rx", 3);

  svg
    .append("text")
    .attr("x", lgX)
    .attr("y", lgY + lgH + 12)
    .attr("font-size", 10)
    .attr("fill", "#555")
    .text("low cost");

  svg
    .append("text")
    .attr("x", lgX + lgW)
    .attr("y", lgY + lgH + 12)
    .attr("font-size", 10)
    .attr("fill", "#555")
    .attr("text-anchor", "end")
    .text("high cost");

  // tooltip
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "4px 8px")
    .style("font-size", "11px")
    .style("white-space", "nowrap")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)");

  return container.node();
}


function _25(md){return(
md`**View 2 - Two-panel scatter: cost vs ELO side-by-side with cost vs MMLU**

**What's informative about this view:** Placing both panels side-by-side makes the contrast unmistakable. The left panel (cost vs ELO, r=0.066) shows an almost flat trend line - confirming that spending more doesn't meaningfully improve Arena ranking. The right panel (cost vs MMLU, r=0.31) shows a rising trend: pricier models tend to score higher on MMLU. This directly tests both parts of the hypothesis in one view: cost tracks the benchmark, not real-world preference.

**What could be improved:** The dual-panel scatter still doesn't show which specific models offer the best value. Among models with similar Arena ELO (comparable real-world quality), which are the cheapest? A horizontal bar chart sorted by cost among top-ELO models would answer this directly`
)}

function _viewOfH3_2(modelScores,d3)
{
  const panelW = 350,
    height = 410,
    gap = 30;
  const width = panelW * 2 + gap;
  const margin = { top: 50, right: 20, bottom: 65, left: 55 };

  const pts = modelScores.filter(
    (d) => d.cost_output_per_1m_usd != null && d.cost_output_per_1m_usd > 0
  );

  const x = d3
    .scaleLog()
    .domain(d3.extent(pts, (d) => d.cost_output_per_1m_usd))
    .nice()
    .range([margin.left, panelW - margin.right]);

  const panelColors = [d3.schemeTableau10[6], d3.schemeTableau10[0]];

  const container = d3.create("div").style("position", "relative");

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9");

  // overall chart title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", 15)
    .attr("font-weight", 500)
    .text("Output Cost vs ELO and MMLU - Side by Side");

  function panel(xOffset, yField, label, color, rValue) {
    const valid = pts.filter((d) => d[yField] != null);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(valid, (d) => d[yField]))
      .nice()
      .range([height - margin.bottom, margin.top]);

    const g = svg.append("g").attr("transform", `translate(${xOffset},0)`);

    // dots
    g.selectAll("circle")
      .data(valid)
      .join("circle")
      .attr("cx", (d) => x(d.cost_output_per_1m_usd))
      .attr("cy", (d) => y(d[yField]))
      .attr("r", 4)
      .attr("fill", color)
      .attr("opacity", 0.72)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("r", 7).attr("opacity", 1);
        tooltip.style("display", "block").html(`<strong>${d.model}</strong><br>
                 Cost: $${d.cost_output_per_1m_usd.toFixed(2)}/1M tokens<br>
                 ${
                   yField === "arena_elo"
                     ? `Arena ELO: ${d.arena_elo.toFixed(0)}`
                     : `MMLU: ${d.mmlu_score.toFixed(1)}%`
                 }<br>
                 ${d.provider}`);
      })
      .on("mousemove", function (event) {
        const [px, py] = d3.pointer(event, container.node());
        tooltip.style("left", `${px + 12}px`).style("top", `${py - 36}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 4).attr("opacity", 0.72);
        tooltip.style("display", "none");
      });

    // least-squares trend on log10(cost)
    const lx = valid.map((d) => Math.log10(d.cost_output_per_1m_usd));
    const ly = valid.map((d) => d[yField]);
    const n = lx.length;
    const sx = d3.sum(lx),
      sy = d3.sum(ly);
    const sxy = d3.sum(lx.map((v, i) => v * ly[i]));
    const sxx = d3.sum(lx.map((v) => v * v));
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const intercept = (sy - slope * sx) / n;
    const xd = d3.extent(valid, (d) => d.cost_output_per_1m_usd);

    g.append("line")
      .attr("x1", x(xd[0]))
      .attr("y1", y(slope * Math.log10(xd[0]) + intercept))
      .attr("x2", x(xd[1]))
      .attr("y2", y(slope * Math.log10(xd[1]) + intercept))
      .attr("stroke", color)
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "5 4");

    // axes
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(4, "~s"));

    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // panel title
    g.append("text")
      .attr("x", panelW / 2)
      .attr("y", 38)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", 12)
      .text(label);

    // x axis label
    g.append("text")
      .attr("x", panelW / 2)
      .attr("y", height - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .text("Output cost per 1M tokens (USD, log scale)");

    // correlation annotation
    g.append("text")
      .attr("x", panelW - margin.right)
      .attr("y", margin.top + 20)
      .attr("text-anchor", "end")
      .attr("font-size", 11)
      .attr("fill", color)
      .text(`r = ${rValue}`);

    // legend
    const leg = g
      .append("g")
      .attr("transform", `translate(${margin.left + 6}, ${margin.top + 25})`);
    leg
      .append("circle")
      .attr("cx", 4)
      .attr("cy", 5)
      .attr("r", 4)
      .attr("fill", color)
      .attr("opacity", 0.72);
    leg
      .append("text")
      .attr("x", 14)
      .attr("y", 9)
      .attr("font-size", 10)
      .text("Each model");
    leg
      .append("line")
      .attr("x1", 0)
      .attr("x2", 16)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5 4");
    leg
      .append("text")
      .attr("x", 20)
      .attr("y", 24)
      .attr("font-size", 10)
      .text("Trend line");
  }

  panel(0, "arena_elo", "Cost vs Arena ELO (flat)", panelColors[0], "0.066");
  panel(
    panelW + gap,
    "mmlu_score",
    "Cost vs MMLU (rising)",
    panelColors[1],
    "0.31"
  );

  // tooltip
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "4px 8px")
    .style("font-size", "11px")
    .style("white-space", "nowrap")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)");

  return container.node();
}


function _27(md){return(
md`**View 3 - Cost bar chart: models within 25 ELO of the top ranked by cost**

**What's informative about this view:** This is the most actionable view. By filtering to models within 25 ELO points of the top performer (approximately equivalent real-world quality), we can directly compare their prices. The horizontal bar chart reveals extreme price variation among near-equal performers. The YlOrRd color gradient reinforces cost visually: yellow bars are cheap, red bars are expensive. The model name, ELO score, and dollar amount make it easy to identify the best-value options.

**What could be improved:** The 25 ELO threshold is somewhat arbitrary. A slider to adjust the band width would let viewers explore how the price spread changes as the quality filter tightens or loosens.

**Conclusion - H3:** The data strongly supports Hypothesis 3. Cost and Arena ELO have nearly no relationship (r=0.066, confirmed by flat trend line across both views). However, cost does weakly correlate with MMLU score (r=0.31), meaning pricier models tend to benchmark higher but not necessarily perform better in human preference. The cost bar chart delivers the most actionable insight: among models of equivalent Arena ELO quality, prices vary dramatically, meaning cost is largely a business decision rather than a quality signal.

---

## Unexpected Finding
The most surprising discovery was the variance collapse after 2023: standard deviation peaked at σ=19.0 in 2023 then dropped to σ=0.9 by 2026. This means frontier models have all converged on the same MMLU ceiling simultaneously. Combined with the finding that top-ELO models cluster in the 85–95% MMLU range rather than at 100%, this suggests MMLU has already lost its ability to differentiate elite models - a new benchmark is needed.`
)}

function _viewOfH3_3(modelScores,d3)
{
  const pts = modelScores.filter(
    (d) =>
      d.arena_elo != null &&
      d.cost_output_per_1m_usd != null &&
      d.cost_output_per_1m_usd > 0 &&
      d.mmlu_score != null
  );

  const topElo = d3.max(pts, (d) => d.arena_elo);
  const band = pts
    .filter((d) => d.arena_elo >= topElo - 25)
    .sort((a, b) => b.cost_output_per_1m_usd - a.cost_output_per_1m_usd);

  const width = 720,
    rowH = 30;
  const margin = { top: 60, right: 80, bottom: 50, left: 180 };
  const height = margin.top + band.length * rowH + margin.bottom;

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(band, (d) => d.cost_output_per_1m_usd)])
    .nice()
    .range([margin.left, width - margin.right]);

  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(band, (d) => d.cost_output_per_1m_usd)])
    .interpolator(d3.interpolateYlOrRd);

  const container = d3.create("div").style("position", "relative");

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9");

  // titles
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", 13)
    .text("Price Differences Among Models with Similar Arena ELO");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", "#666")
    .text(
      "Filtered to models within 25 ELO of the top performer (≈ same real-world quality)"
    );

  // bars
  const rows = svg
    .selectAll("g.row")
    .data(band)
    .join("g")
    .attr("class", "row")
    .attr("transform", (d, i) => `translate(0,${margin.top + i * rowH})`);

  rows
    .append("rect")
    .attr("x", margin.left)
    .attr("y", 4)
    .attr("width", (d) => x(d.cost_output_per_1m_usd) - margin.left)
    .attr("height", rowH - 10)
    .attr("fill", (d) => colorScale(d.cost_output_per_1m_usd))
    .attr("rx", 3)
    .attr("opacity", 0.88)
    .style("cursor", "pointer")
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("opacity", 1);
      tooltip.style("display", "block").html(`<strong>${d.model}</strong><br>
               Cost: $${d.cost_output_per_1m_usd.toFixed(2)}/1M tokens<br>
               Arena ELO: ${d.arena_elo.toFixed(0)}<br>
               MMLU: ${d.mmlu_score.toFixed(1)}%<br>
               ${d.provider}`);
    })
    .on("mousemove", function (event) {
      const [px, py] = d3.pointer(event, container.node());
      tooltip.style("left", `${px + 12}px`).style("top", `${py - 36}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).attr("opacity", 0.88);
      tooltip.style("display", "none");
    });

  // model name labels on left
  rows
    .append("text")
    .attr("x", margin.left - 8)
    .attr("y", rowH / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("font-size", 11)
    .text((d) => `${d.model} (ELO ${d.arena_elo.toFixed(0)})`);

  // cost labels on right of each bar
  rows
    .append("text")
    .attr("x", (d) => x(d.cost_output_per_1m_usd) + 6)
    .attr("y", rowH / 2)
    .attr("dominant-baseline", "middle")
    .attr("font-size", 11)
    .attr("fill", "#333")
    .text((d) => `$${d.cost_output_per_1m_usd.toFixed(2)}`);

  // x axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(6)
        .tickFormat((d) => `$${d}`)
    );

  // x axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", "#555")
    .text("Output cost per 1M tokens (USD)");

  // gradient legend
  const defs = svg.append("defs");
  const grad = defs
    .append("linearGradient")
    .attr("id", "ylorrd-grad-h3")
    .attr("x1", "0%")
    .attr("x2", "100%");
  [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
    grad
      .append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", d3.interpolateYlOrRd(t));
  });

  svg
    .append("rect")
    .attr("x", width - margin.right - 100)
    .attr("y", 8)
    .attr("width", 90)
    .attr("height", 10)
    .attr("fill", "url(#ylorrd-grad-h3)")
    .attr("rx", 3);

  svg
    .append("text")
    .attr("x", width - margin.right - 100)
    .attr("y", 30)
    .attr("font-size", 9)
    .attr("fill", "#555")
    .text("cheap");

  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", 30)
    .attr("font-size", 9)
    .attr("fill", "#555")
    .attr("text-anchor", "end")
    .text("expensive");

  // tooltip
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "4px 8px")
    .style("font-size", "11px")
    .style("white-space", "nowrap")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)");

  // y axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + (band.length * rowH) / 2))
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", "#555")
    .text("Model (sorted by cost, high to low)");
  return container.node();
}


function _29(md){return(
md`**Appendix A**: An exploratory force-directed network visualization grouping models by MMLU and ELO proximity. Nodes represent individual models (size = Arena ELO, color = provider), with edges connecting models within 3% MMLU and 50 ELO points of each other. All 56 nodes are frontier models since only frontier models have Arena ELO data. This view surfaces which providers' models cluster together in the MMLU/ELO space.`
)}

function _networkVizP(modelScores,d3,invalidation)
{
  const width = 760,
    height = 560;

  const pts = modelScores
    .filter((d) => d.mmlu_score != null && d.arena_elo != null)
    .map((d) => ({ ...d }));

  const mmluThresh = 3,
    eloThresh = 50;
  const links = [];

  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dm = Math.abs(pts[i].mmlu_score - pts[j].mmlu_score);
      const de = Math.abs(pts[i].arena_elo - pts[j].arena_elo);
      if (dm <= mmluThresh && de <= eloThresh) {
        links.push({
          source: pts[i].model,
          target: pts[j].model,
          strength: 1 - (dm / mmluThresh + de / eloThresh) / 2
        });
      }
    }
  }

  const nodes = pts.map((d) => ({ ...d, id: d.model }));

  // color by provider since all nodes are frontier
  const providers = Array.from(new Set(pts.map((d) => d.provider))).sort();
  const colorProv = d3
    .scaleOrdinal()
    .domain(providers)
    .range(d3.schemeTableau10);

  const eloExtent = d3.extent(nodes, (d) => d.arena_elo);
  const nodeR = d3.scaleSqrt().domain(eloExtent).range([4, 14]);

  const container = d3.create("div").style("position", "relative");

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fafaf9")
    .style("font-family", "sans-serif");

  // titles
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", 13)
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .text("LLM Similarity Network - Models Close in MMLU & Arena ELO");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 36)
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("fill", "#888")
    .text(
      "Edges: |ΔMMLU| ≤ 3% and |ΔELO| ≤ 50  ·  Node size = Arena ELO  ·  Color = provider"
    );

  // links
  const linkSel = svg
    .append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#94a3b8")
    .attr("stroke-width", (d) => d.strength * 2)
    .attr("stroke-opacity", (d) => 0.08 + d.strength * 0.42);

  // nodes
  const nodeSel = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d) => nodeR(d.arena_elo))
    .attr("fill", (d) => colorProv(d.provider))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.2)
    .attr("opacity", 0.88)
    .style("cursor", "pointer");

  // tooltip
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "4px 8px")
    .style("font-size", "11px")
    .style("white-space", "nowrap")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)");

  nodeSel
    .on("mouseenter", function (event, d) {
      d3.select(this)
        .attr("opacity", 1)
        .attr("stroke", "#333")
        .attr("stroke-width", 2);
      tooltip.style("display", "block").html(`<strong>${d.model}</strong><br>
               ${d.provider}<br>
               MMLU: ${d.mmlu_score.toFixed(1)}%<br>
               Arena ELO: ${d.arena_elo.toFixed(0)}`);
    })
    .on("mousemove", function (event) {
      const [px, py] = d3.pointer(event, container.node());
      tooltip.style("left", `${px + 12}px`).style("top", `${py - 36}px`);
    })
    .on("mouseleave", function () {
      d3.select(this)
        .attr("opacity", 0.88)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.2);
      tooltip.style("display", "none");
    });

  // model name labels
  const labelSel = svg
    .append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("font-size", 8)
    .attr("fill", "#333")
    .attr("text-anchor", "middle")
    .attr("pointer-events", "none")
    .text((d) => (d.model.length > 16 ? d.model.slice(0, 15) + "…" : d.model));

  // force simulation
  const simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-60))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(60)
        .strength((d) => d.strength * 0.4)
    )
    .force(
      "collide",
      d3.forceCollide((d) => nodeR(d.arena_elo) + 3)
    )
    .on("tick", () => {
      linkSel
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      nodeSel.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      labelSel
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y - nodeR(d.arena_elo) - 2);
    });

  // drag
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  nodeSel.call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  );

  // provider legend
  const legend = svg.append("g").attr("transform", "translate(16,48)");
  providers.forEach((prov, i) => {
    const row = legend.append("g").attr("transform", `translate(0,${i * 16})`);
    row
      .append("circle")
      .attr("r", 5)
      .attr("fill", colorProv(prov))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);
    row
      .append("text")
      .attr("x", 12)
      .attr("y", 4)
      .attr("font-size", 9)
      .text(prov);
  });

  // size legend
  const sizeLeg = svg
    .append("g")
    .attr("transform", `translate(${width - 120}, 48)`);
  sizeLeg
    .append("text")
    .attr("font-size", 10)
    .attr("fill", "#555")
    .attr("y", 0)
    .text("Node size = ELO");
  [
    [eloExtent[0], 4, "low ELO"],
    [eloExtent[1], 14, "high ELO"]
  ].forEach(([val, r, label], i) => {
    const row = sizeLeg
      .append("g")
      .attr("transform", `translate(0,${i * 22 + 14})`);
    row
      .append("circle")
      .attr("cx", r)
      .attr("cy", 0)
      .attr("r", r)
      .attr("fill", "#94a3b8")
      .attr("opacity", 0.7);
    row
      .append("text")
      .attr("x", r * 2 + 6)
      .attr("y", 4)
      .attr("font-size", 9)
      .attr("fill", "#555")
      .text(label);
  });

  invalidation.then(() => simulation.stop());

  return container.node();
}


export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["mmlu_saturation_by_year.csv", {url: new URL("./files/mmlu_saturation_by_year.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["llm_unified.csv", {url: new URL("./files/llm_unified.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("satByYear")).define("satByYear", ["FileAttachment"], _satByYear);
  main.variable(observer("modelScores")).define("modelScores", ["FileAttachment"], _modelScores);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer("view1Line")).define("view1Line", ["satByYear","d3"], _view1Line);
  main.variable(observer()).define(["md"], _9);
  main.variable(observer("view2Band")).define("view2Band", ["satByYear","d3"], _view2Band);
  main.variable(observer()).define(["md"], _11);
  main.variable(observer("view3Beeswarm")).define("view3Beeswarm", ["modelScores","d3"], _view3Beeswarm);
  main.variable(observer()).define(["md"], _13);
  main.variable(observer()).define(["md"], _14);
  main.variable(observer("viewOfH2_1")).define("viewOfH2_1", ["modelScores","d3"], _viewOfH2_1);
  main.variable(observer()).define(["md"], _16);
  main.variable(observer("viewOfH2_2")).define("viewOfH2_2", ["modelScores","d3"], _viewOfH2_2);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer("viewOfH2_3")).define("viewOfH2_3", ["modelScores","d3"], _viewOfH2_3);
  main.variable(observer()).define(["md"], _20);
  main.variable(observer()).define(["modelScores","d3"], _21);
  main.variable(observer()).define(["md"], _22);
  main.variable(observer()).define(["md"], _23);
  main.variable(observer("viewOfH3_1")).define("viewOfH3_1", ["modelScores","d3"], _viewOfH3_1);
  main.variable(observer()).define(["md"], _25);
  main.variable(observer("viewOfH3_2")).define("viewOfH3_2", ["modelScores","d3"], _viewOfH3_2);
  main.variable(observer()).define(["md"], _27);
  main.variable(observer("viewOfH3_3")).define("viewOfH3_3", ["modelScores","d3"], _viewOfH3_3);
  main.variable(observer()).define(["md"], _29);
  main.variable(observer("networkVizP")).define("networkVizP", ["modelScores","d3","invalidation"], _networkVizP);
  return main;
}
