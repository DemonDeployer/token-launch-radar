# token-launch-radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/primal-punks/token-launch-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/primal-punks/token-launch-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

A token launch radar ranking pre-token DeFi protocols by implied value, with farm plans for each.

## How it works

The program reads a sealed DefiLlama snapshot of the protocol universe and scores every pre-token protocol with one snapshot-derived model: TVL times growth, maturity and chain breadth. The top 200 by implied launch value form the board, the 40-protocol watchlist always included. Sixty rows carry hand-researched farm plans — steps, cost and time, researched from each protocol's own public sources, with a warn note where the research found one (an exploit, a claim deadline, a closed registration, a sunset); the rest carry model-generated plans. The static dashboard reads the same board, so the page and the data can never disagree.

Out-of-sample check, computed at build from the snapshot's 119 traded-token comps (split by slug hash): the fit half (n=58) has median mcap/TVL 0.22; on the test half (n=61) radar-2's median implied/actual is 0.88, within 2× for 23% and within 3× for 38%, against a fitted-flat baseline (same model, base 0.22) of 0.64, 28% and 36%. The 0.30 base lands closer to the market's own multiple than the fitted 0.22; both are noisy — mcap/TVL is widely dispersed.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts --input snapshot.json
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=nma7eyn9&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
