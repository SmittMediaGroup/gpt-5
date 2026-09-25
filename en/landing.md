# Landing page copy (EN)

> Status: draft, 2026-09-25. Copy is written in first person singular. Placeholders are in [square brackets].

---

## Headline

**See what Yandex's AI tells Russian-speaking buyers about your brand.**

## Subheadline

I measure how often "Search with Alice", GigaChat, YandexGPT, ChatGPT and Perplexity name your client's brand and its competitors when people ask Russian-language questions. You get shares with confidence intervals, a list of false claims, and a re-measurement 7–14 days later. Western AI-visibility tools don't query these Russian systems. I do.

**[Button: Order a Snapshot]**  **[Link: See a sample report]**

---

## The problem

If you sell to Russian-speaking audiences, most of your buyers search on Yandex. StatCounter puts Yandex at roughly 70–73% of search in Russia in 2026 (StatCounter, https://gs.statcounter.com/search-engine-market-share/all/russian-federation, checked 2026-09-25 via search snippets; confirm the latest monthly figure before publishing). Yandex Search now answers many queries with an AI summary ("Search with Alice"), and that summary names a handful of companies.

The AI-visibility dashboards your agency already uses (Profound, Peec AI, Otterly, Semrush's AI toolkit, Ahrefs Brand Radar, Scrunch) track ChatGPT, Google AI Overviews, Perplexity, Gemini and Copilot. From their published engine lists, none of them queries Alice or GigaChat. So a brand can look fine in ChatGPT and still be missing from the AI answer that most Russian searchers actually see. It can also go the other way.

On 25 September 2026 I measured seven local companies in Irkutsk (Russia) and Bishkek (Kyrgyzstan). Some findings:

- **YandexGPT and GigaChat, queried through their APIs without web search, didn't name any company at all.** On these queries the "plain" models are silent. The surface that does name brands is Search with Alice.
- **Search with Alice and ChatGPT did not always agree.** In this pilot the gap in share of mentions between the two looked large for some companies (the largest was for a car-rental company). [Before publishing: insert the per-company gaps only if they are statistically significant, with n answers per system and the 95% interval, from `metodika/tri-cifry.md`.]
- This was a small pilot on one date, so treat it as a preliminary observation, not a finding. That's why every number in my reports comes with its sample size and an interval, and differences inside the margin of error are reported as such.

The takeaway: you can't infer Russian-language AI visibility from ChatGPT data. It has to be measured separately.

---

## What I do (in plain words)

1. **Agree on the questions.** With you, I write 40–50 questions a real buyer would ask in Russian, e.g. "best car rental in Almaty with delivery to the airport" or "reliable frame-house builders near Irkutsk". Local and category questions come first, and your brand name is kept out of them.
2. **Run a technical zero step.** I check that the site doesn't block the crawlers these systems use (e.g. `YandexAdditional` in robots.txt), that key pages aren't set to noindex or nosnippet, and whether they rank in Yandex's top 10. Alice mostly cites pages that already rank high in Yandex.
3. **Ask each AI system every question, twice, in clean sessions.** Surfaces: Search with Alice, GigaChat, YandexGPT, ChatGPT (with search) and Perplexity. Clean sessions matter because Alice and GigaChat now keep a memory of past conversations, and that skews results.
4. **Count and qualify.** For each system I record who is named (you and 3–5 competitors), in what order, with what tone (positive / neutral / negative), and which sources are cited.
5. **Fact-check.** I compare every factual claim about your client against their own sources (prices, address, opening hours, services, years in business) and list what's wrong or outdated, and where the wrong claim probably comes from.
6. **Report with intervals.** Shares of mentions come with 95% Wilson confidence intervals, so you can see which differences are real and which are noise.
7. **Re-measure (in the relevant package).** After you fix the easy things, I repeat the same questions 7–14 days later with the same protocol and show before/after with intervals.

I work as a one-person studio in Irkutsk, Russia, and use AI agents for data collection and first-pass coding of answers. I review and fact-check every conclusion myself.

---

## Sample report: what you receive

The report is a PDF (English, or Russian on request) plus a spreadsheet with every raw answer, so you can check my work.

**Sections:**

1. **Summary on one page.** Where the brand stands per AI system, the three biggest gaps against competitors, and the three most important false claims.
2. **Method.** Questions, systems, dates, number of answers, session settings, and the smallest difference this sample can detect.
3. **Share of mentions by system,** for the brand and competitors, with intervals (example below).
4. **Sentiment and position.** How the brand is described when it is named, and whether it is named first, in the middle, or last.
5. **Sources AI relies on.** Which domains are cited (the client's site, aggregators, maps, directories, media) and which of them feed wrong facts.
6. **False and outdated claims.** A table with the claim, the correct fact, the system, the likely source and the fix.
7. **Technical zero step.** Robots.txt, indexing, snippet settings, Yandex top-10 presence for key pages.
8. **Priorities.** A short list of actions, ordered by expected effort and impact. These are recommendations, not promises.
9. **Re-measurement (if included).** Before/after table and whether the change is larger than the noise.

**Example table: ILLUSTRATIVE NUMBERS, NOT REAL CLIENT DATA**

Share of answers that named the brand, 45 questions × 2 runs = 90 answers per system:

| AI system | Your client | 95% interval | Top competitor | 95% interval |
|---|---|---|---|---|
| Search with Alice (Yandex) | 20% | 13–29% | 45% | 35–55% |
| ChatGPT (search) | 10% | 5–18% | 20% | 13–29% |
| Perplexity | 15% | 9–24% | 35% | 26–45% |
| YandexGPT (API, no search) | 0% | 0–4% | 0% | 0–4% |
| GigaChat (API, no search) | 0% | 0–4% | 0% | 0–4% |

*How to read it (illustrative):* in Alice the competitor clearly leads, because the intervals don't overlap. Between Alice and ChatGPT the client's own intervals overlap, so this sample can't separate the two. With about 90 answers per system, the report can reliably detect differences of roughly 20 percentage points or more, not 5.

**Example of a false-claim row (illustrative):**

| Claim in AI answer | Correct fact | System | Likely source | Fix |
|---|---|---|---|---|
| "Prices start at 1,500 per day" | From 2,300 per day since March | Search with Alice | Old price on a listing aggregator | Update the aggregator card and the site's price block |

---

## Pricing

Fixed prices, paid in advance, by invoice via [placeholder: payment method]. Prices are in USD. Local taxes and bank fees, if any, are [placeholder: who pays].

| | **Snapshot** | **Audit** | **Audit + Re-measure** |
|---|---|---|---|
| Price | **$190** | **$490** | **$690** |
| Questions | 10 | 40–50 | 40–50 |
| Runs per question | 2 | 2 | 2 + a second full measurement |
| AI systems | Search with Alice, ChatGPT, Perplexity | All five | All five |
| Competitors | Up to 3 | Up to 5 | Up to 5 |
| Confidence intervals | Yes (wide: indicative only) | Yes | Yes, plus before/after comparison |
| False-claims list | Top 3 | Full | Full + recheck |
| Technical zero step | Robots.txt only | Full | Full |
| Report | 3–5 pages + raw data | Full report + raw data | Full report + re-measurement annex |
| Delivery | 3 business days | 7 business days | 7 business days + 7–14 days to re-measure |

**For agencies:** white-label reports (your logo, no mention of me) come at no extra cost. After the first project I offer volume pricing, [placeholder: agency discount] for 3+ audits per quarter.

---

## FAQ

**1. Why not just use Profound, Peec AI or Otterly?**
They're good tools for ChatGPT, Google AI Overviews and Perplexity, and I'd recommend them for those. But their published engine lists don't include Yandex's Alice or GigaChat, which matter most for Russian-speaking searchers. My audit covers that gap. It can sit alongside the dashboard you already pay for.

**2. Aren't there Russian tools that already do this?**
Yes. Some Russian services, such as Brandometr and GEO Scout, also query Alice and GigaChat, and Brandometr also reports Wilson intervals. What I add is a one-off audit rather than a dashboard: questions written together with you, clean-session protocol, manual fact-checking against the client's sources, an English report you can hand to your client, and a re-measurement built into the price.

**3. How reliable are the numbers?**
AI answers are probabilistic: the same question can get different answers from one minute to the next. That's why I ask each question several times, report intervals rather than single numbers, and state the smallest difference the sample can detect. A Snapshot (about 20 answers per system) is indicative only. An Audit (about 90 answers per system) can separate differences of roughly 20 points.

**4. Can you guarantee my client will appear in Alice's answers?**
No. Nobody controls what these systems say. I show where the brand stands, what's wrong, and what's most likely to help. The re-measurement shows whether anything changed, and I report it honestly either way.

**5. Which markets and languages do you cover?**
Russian-language queries for Russia and the Russian-speaking CIS: Kazakhstan, Kyrgyzstan and Uzbekistan, among others. Note that in Kazakhstan Google leads search (Yandex had roughly a quarter per StatCounter in 2026), so there I put more weight on ChatGPT and Perplexity. Queries in Kazakh or Uzbek: [placeholder: yes / on request / no].

**6. Who can order, and how do I pay?**
Agencies and companies that market to Russian-speaking audiences. Payment is by invoice via [placeholder: payment method], agreed before work starts. I don't work with sanctioned persons or entities, or on their behalf. Each buyer is responsible for checking that the engagement complies with the sanctions and export rules that apply to them.

---

## Disclaimer (short, for the footer)

AI systems generate answers probabilistically, and their outputs change over time, by location, by account and by session. My measurements describe the answers collected on the stated dates under the stated protocol. They aren't a forecast or a guarantee of future visibility, traffic or sales. Differences smaller than the reported intervals shouldn't be treated as real. Recommendations are advisory. I don't serve sanctioned persons or entities, and each buyer checks their own compliance obligations.
