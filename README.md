# token-launch-radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/primal-punks/token-launch-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/primal-punks/token-launch-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

A token launch radar ranking pre-token DeFi protocols by implied value, with farm plans for each.

## How it works

The program reads a sealed DefiLlama snapshot of the protocol universe and scores every pre-token protocol with one snapshot-derived model: TVL times growth, maturity and chain breadth. The top 200 by implied launch value form the board, the 40-protocol watchlist always included. Every row carries a concrete farm plan — steps, cost and time — researched from the protocol's own public sources, and the static dashboard reads the same board, so the page and the data can never disagree.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts --input snapshot.json
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=nma7eyn9&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
