# token-launch-radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/DemonDeployer/token-launch-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/DemonDeployer/token-launch-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

A token launch radar ranking pre-token DeFi protocols by implied value, with farm plans for each.

## How it works

The program reads a sealed DefiLlama snapshot of the protocol universe and scores every standalone pre-token protocol with one snapshot-derived model: a size curve fitted on the snapshot's own traded-token comps (log-log OLS, log10(market cap) = 3.38 + 0.47 × log10(TVL)), times small bounded priors for 7-day growth, age with no token, sector, and kinship (a shared name stem halves the value — one launch, split two ways). All 197 standalone pre-token rows form the board, the 40-protocol watchlist always included, and the 758-protocol ledger accounts for every protocol in the snapshot. Sixty-four rows carry hand-researched farm plans — steps, cost and time, researched from each protocol's own public sources, with a warn note where the research found one (an exploit, a claim deadline, a closed registration, a sunset); the rest carry model-generated plans. Every row also carries farm economics at a $1,000 ticket and a 7% drop share — slice, gas fees by chain, net, net at the range low end, launch odds, and a FARM / MARGINAL / SKIP verdict — which the dashboard re-prices live when the reader changes the ticket or the drop share. The static dashboard reads the same board, so the page and the data can never disagree.

Out-of-sample check, computed at build from the snapshot's 119 traded-token comps: leave-one-out, radar-3's median miss is ×3.36 with 46% of caps within 3× of prediction, against a flat multiple's ×4.94 / 34% and radar-2's ×4.79 / 36%; older→newer time split (47 train, 40 test), radar-3 ×2.52 against flat ×4.60 and radar-2 ×4.39. The printed range is the P25–P75 band of the leave-one-out residuals by age band, and 52% of held-out caps land inside their row's range.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts --input snapshot.json
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=qamf9tkx&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
