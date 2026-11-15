// Researched farm plans for individual protocols, keyed by snapshot slug.
//
// Each entry is hand-researched from the protocol's own docs, site or announcements:
// a one-line blurb saying what the protocol does, and farm steps that follow how the
// protocol actually works. A step never claims a points program or an airdrop unless
// the research confirmed one; where none was confirmed the plan farms the product
// itself and says so in plain terms.
//
// Steps are kept short on purpose: the dossier text shows the dashboard source whole
// only while it fits in 65,536 bytes, and plans.js must hold all 40 watchlist plans
// inside that budget. Short does not mean vague: every step names the action, the
// asset, the chain or app, and its cost and time travel in their own fields.
//
// Protocols with no entry here fall back to the category generator in lib/model.ts.

import type { FarmStep } from './model.ts';

/** One protocol's researched plan: what it does, and how to farm it. */
export interface ResearchedPlan {
  blurb: string;
  steps: FarmStep[];
}

/** Researched plans, by snapshot slug. Filled in from protocol research. */
export const PLANS: Record<string, ResearchedPlan> = {
  'armitage-by-wintermute': {
    blurb:
      "Wintermute's vault-curation arm: ERC-4626 vaults on Morpho V2 allocating stablecoins across isolated lending markets. No points program or token.",
    steps: [
      {
        text: 'Get USDC or USDT on ETH in an EVM wallet like MetaMask or Rabby.',
        cost: '$1-5 gas per tx',
        time: '10 min',
      },
      {
        text: 'Read the Armitage docs risk page, then pick a tier: Prime is conservative, Select is balanced.',
        cost: 'free',
        time: '10 min',
      },
      {
        text: 'Open Morpho, search Wintermute, open the vault, and verify its address.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Approve the vault, then deposit; shares appear and yield compounds, no claiming needed.',
        cost: '$1-5 gas per tx',
        time: '5 min',
      },
      {
        text: 'Hold and check live APY on Morpho first; Select averaged ~4.48% APY.',
        cost: 'deposit held',
        time: 'weeks',
      },
    ],
  },
  axis: {
    blurb:
      'Institutional quant firm issuing USDx plus staked sUSDx. Coordinates Season 1 live to ~3 Dec 2026; not Axis Robotics AXIS.',
    steps: [
      {
        text: 'Get USDC or USDT on ETH; check live sUSDx APY and Coordinates Season 1 status first.',
        cost: '$1-5 gas per tx',
        time: '10 min',
      },
      {
        text: 'Acquire USDx via the Axis primary market where eligible, or secondary liquidity.',
        cost: '$1-5 gas per tx',
        time: '10 min',
      },
      {
        text: 'Stake USDx into sUSDx, the ERC-4626 vault; shares accrue value as rewards vest, no claiming.',
        cost: '$1-5 gas',
        time: '5 min',
      },
      {
        text: 'Confirm Coordinates accrue, capital-weighted with venue multipliers; referrals earn a 10% bonus.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Hold through the season; exit needs a 7-day cooldown plus a permissioned servicer queue.',
        cost: '7-day cooldown',
        time: 'weeks',
      },
    ],
  },
  b14g: {
    blurb:
      "Dual-staking layer for Bitcoin pairing BTC holders with CORE holders for higher tiers. EXPLOITED 31 Oct 2026, ~97M CORE drained.",
    steps: [
      {
        text: 'Read the security update first: confirm contracts are unpaused and the post-mortem is out, or stop here.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'BTC holders: open the Merge Marketplace and create an order setting your reward split with the CORE partner.',
        cost: 'free',
        time: '10 min',
      },
      {
        text: 'Stake BTC via Core non-custodial BTC staking; BTC stays time-locked on Bitcoin, no bridging or wrapping.',
        cost: 'Bitcoin fee only',
        time: 'minutes',
      },
      {
        text: 'CORE holders: browse Merge orders, pick one, and stake CORE to activate dual-staking for both sides.',
        cost: 'pennies of Core gas',
        time: '10 min',
      },
      {
        text: 'Monitor the position and repayment claims; unstaking follows Core timelock rules, not instant.',
        cost: 'free',
        time: 'weeks',
      },
    ],
  },
  'bittensor-dtao': {
    blurb:
      "Bittensor's native dTAO AMM pools price each subnet's alpha token against TAO. TAO already trades since 2021, ~$2.1B market cap; no token launch here.",
    steps: [
      {
        text: 'Buy TAO on a major CEX; this is a live, volatile asset near $180, not a free farm.',
        cost: 'exchange fees vary',
        time: '10 min',
      },
      {
        text: 'Set up a Bittensor wallet and transfer TAO to the Bittensor chain (Subtensor).',
        cost: 'small transfer fee',
        time: '10 min',
      },
      {
        text: 'Research subnets on taostats.io for emissions share and validator quality first.',
        cost: 'free',
        time: '20 min',
      },
      {
        text: 'Stake TAO to a validator in a subnet; TAO swaps into that subnet alpha and earns emissions every 360 blocks.',
        cost: 'small on-chain fee',
        time: '10 min',
      },
      {
        text: 'Unstake anytime to swap alpha back to TAO; alpha can fall sharply and emissions do not guarantee profit.',
        cost: 'small on-chain fee',
        time: '10 min',
      },
    ],
  },
  clearstar: {
    blurb:
      'Switzerland-based quant DeFi manager curating yield vaults, mostly Morpho, across 11 chains. Best-known product is earnXRP on Flare. No points or token found.',
    steps: [
      {
        text: 'Pick a route: earnXRP on Flare for XRP exposure, or a Clearstar Morpho vault on Base or Ethereum for USDC.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'For earnXRP: get XRP, bridge it to Flare via FAssets to mint FXRP 1:1; Flare gas costs cents.',
        cost: 'cents per tx',
        time: '10 min',
      },
      {
        text: 'Open earnXRP in the Xaman wallet Flare Yield app and deposit FXRP; it auto-compounds, no claiming.',
        cost: 'cents per tx',
        time: '10 min',
      },
      {
        text: 'For Morpho: get USDC on Base or Ethereum, find the Clearstar vault in the Morpho app, and deposit.',
        cost: 'cents on Base, $1-5 on ETH',
        time: '10 min',
      },
      {
        text: 'Hold and monitor: earnXRP targets ~4-10% depending on vault size; Morpho APYs vary by market.',
        cost: 'deposit held',
        time: 'weeks',
      },
    ],
  },
  curvance: {
    blurb:
      "Isolated-market lending on Monad: deposit MON LST collateral and borrow against it. Bytes live; eBTC frozen since May 2026, CVE NOT launched.",
    steps: [
      {
        text: 'Bridge assets to Monad and get MON for gas; Monad gas costs fractions of a cent per tx.',
        cost: 'fractions of a cent',
        time: '10 min',
      },
      {
        text: 'Get a Monad LST by staking MON for sMON via Kintsu, or gMON or aprMON, or hold USDC or wsrUSD directly.',
        cost: 'fractions of a cent',
        time: '10 min',
      },
      {
        text: 'Open the Bytes page in Curvance to confirm the program is live and check multipliers.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Deposit collateral like sMON into a lending market; this starts Bytes accrual on deposits.',
        cost: 'fractions of a cent',
        time: '5 min',
      },
      {
        text: 'Optionally borrow USDC or MON against collateral and loop via one-click looping, only with a safe health factor.',
        cost: 'fractions of a cent, plus liquidation risk',
        time: '10 min',
      },
    ],
  },
  'doppler-finance': {
    blurb:
      'CeDeFi yield protocol built around the XRP Ledger: deposit XRP or RLUSD into vaults earning ~3-4.5% APR. XDP already trades since 28 Sep 2026.',
    steps: [
      {
        text: 'Farmed DP in Season 1 or 2? Check eligibility at the airdrop page and claim before 28 Nov 2026, 12:00 UTC.',
        cost: 'a little ETH on Base',
        time: '10 min',
      },
      {
        text: 'For new yield farming: get XRP in an XRPL wallet like Xaman; no bridge needed for the native vault.',
        cost: 'free',
        time: '10 min',
      },
      {
        text: 'Connect your XRPL wallet at Doppler and deposit XRP or RLUSD into the vault; yield accrues in XRP.',
        cost: 'free',
        time: '10 min',
      },
      {
        text: 'Alternatively on Base: get cbXRP and deposit into the Base vault; Base gas costs cents per tx.',
        cost: 'cents per tx',
        time: '10 min',
      },
      {
        text: 'Hold: points are NOT accruing now, so expect none until a future season; exits take ~7 days.',
        cost: '7-day exit',
        time: 'weeks',
      },
    ],
  },
  ember: {
    blurb:
      "Tokenised-investment platform: deposit an asset, receive a receipt token like eEARN whose price rises as the strategy earns. No token or points found.",
    steps: [
      {
        text: 'Pick an open vault on ember.so: eEARN (USDC, ~10% target, 3-day withdrawal) on Sui is the flagship.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Get USDC on Sui for eEARN, or USDC on ETH or Base for EVM vaults.',
        cost: 'cents on Sui/Base, $1-5 ETH',
        time: '10 min',
      },
      {
        text: 'Connect on ember.so, open the vault, and verify its address and curator match the official listing.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Deposit USDC for receipt tokens 1:1; its rate rises as yield accrues, no claiming needed.',
        cost: 'cents on Sui, $1-5 on ETH',
        time: '10 min',
      },
      {
        text: 'To exit, redeem through the vault; eEARN redemptions take ~3 days, so plan around the lock-up.',
        cost: 'free',
        time: '3 days',
      },
    ],
  },
  firelight: {
    blurb:
      "On-chain cover on Flare: stake FXRP, receive stXRP, back cover for DeFi vaults. Phase 1 points closed; claim ends 7 Dec 2026.",
    steps: [
      {
        text: 'Earned Phase 1 points? Check the claims portal (Merkl) and claim your FXRP share before 7 Dec 2026, 10:00 ET.',
        cost: 'free',
        time: '10 min',
      },
      {
        text: 'For new farming: get XRP, bridge to Flare via FAssets to mint FXRP 1:1; Flare gas costs cents.',
        cost: 'cents per tx',
        time: '10 min',
      },
      {
        text: 'Deposit FXRP into the Firelight vault to receive stXRP, the ERC-4626 receipt, 1:1 at deposit.',
        cost: 'cents per tx',
        time: '10 min',
      },
      {
        text: 'Hold stXRP while cover premiums stream in and raise redemption value; rewards are in FXRP, not a new token.',
        cost: 'deposit held',
        time: 'weeks',
      },
      {
        text: 'Do NOT deposit funds needed within 2 months: unstaking takes 30-60 days, rewards stop at initiation, stakes can be slashed.',
        cost: '30-60 day exit',
        time: '2 months',
      },
    ],
  },
  'galaxy-curation': {
    blurb:
      "Galaxy Digital's institutional vault-curation product on Morpho. Flagship vaults institutional-only via Fireblocks Earn; retail route is Kamino.",
    steps: [
      {
        text: 'Do NOT expect a points or airdrop farm here: the only honest retail play is yield on the Kamino vaults, or nothing.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Get USDC or USDT on Solana in a wallet like Phantom or Solflare; Solana gas is fractions of a cent.',
        cost: 'fractions of a cent',
        time: '10 min',
      },
      {
        text: 'Open Kamino or Yield.xyz, find the Galaxy USDC or USDT vault, and verify it is official.',
        cost: 'free',
        time: '10 min',
      },
      {
        text: 'Deposit USDC or USDT in one tx; yield comes from Kamino borrower activity, no guaranteed APY published.',
        cost: 'fractions of a cent',
        time: '5 min',
      },
      {
        text: 'Hold and monitor risk disclosures: vaults carry market, smart-contract and liquidity risk and are NOT principal-protected.',
        cost: 'deposit held',
        time: 'weeks',
      },
    ],
  },
  'gami-labs': {
    blurb:
      'Institutional curator of yield vaults (BTC, ETH, stables, RWA) on Aave, Morpho, Curve, Pendle. No points program or token found.',
    steps: [
      {
        text: 'Buy USDC on an exchange and withdraw it to a Stellar wallet like Freighter.',
        cost: 'about $0.01 in XLM fees',
        time: '10 min',
      },
      {
        text: 'Deposit into the earnUSDC vault on Stellar, the flagship retail vault.',
        cost: 'cents in fees, no lock-up',
        time: '10 min',
      },
      {
        text: 'Or deposit USDC into the gamiUSDC vault on ETH, built on Morpho and Euler.',
        cost: '$2-10 ETH gas',
        time: '10 min',
      },
      {
        text: 'Hold the receipt token for weeks; yield accrues, vaults are non-custodial.',
        cost: 'deposit held',
        time: 'weeks',
      },
      {
        text: 'Withdraw there and track the position on DefiLlama.',
        cost: 'cents on Stellar',
        time: '10 min',
      },
    ],
  },
  gauntlet: {
    blurb:
      'Risk firm curating 60+ institutional-grade ERC-4626 yield vaults on Morpho by risk tier. No Gauntlet points program or token exists.',
    steps: [
      {
        text: 'Get USDC on Base, where gas is under $0.10, not Ethereum mainnet at $2-10 a tx.',
        cost: 'under $0.10 gas on Base',
        time: '10 min',
      },
      {
        text: 'Open Morpho or Gauntlet vaultbook and pick a vault; USDC Prime is the flagship.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Deposit USDC with approve + deposit for ERC-4626 shares; no lock-up.',
        cost: 'under $0.25 on Base',
        time: '5 min',
      },
      {
        text: 'Hold for weeks; lending interest accrues to the share price, nothing to claim.',
        cost: 'deposit held',
        time: 'weeks',
      },
      {
        text: 'Check the vault still accepts deposits: Gauntlet paused V1 allocations ~5 Nov 2026, prefer V2 and Prime.',
        cost: 'free',
        time: '5 min',
      },
    ],
  },
  'hive-protocol': {
    blurb:
      "BSquared BTC staking hub: stake BTC to secure the B2 zk-rollup and earn $B2. $B2 already trades since 30 Apr 2025, so this earns a live token.",
    steps: [
      {
        text: 'Acquire BTC on an exchange and set up a BSquared-compatible wallet, like MetaMask with B2 added.',
        cost: 'exchange fees vary',
        time: '15 min',
      },
      {
        text: 'Open the Hive app and verify it loads from your location; it returned access-restricted to one checker.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Bridge and stake BTC into Hive on screen; staking locks BTC to secure the rollup.',
        cost: 'a few dollars fees',
        time: '30 min',
      },
      {
        text: 'Hold the stake to accrue $B2 rewards over time; B2 can be sold on exchanges where it lists.',
        cost: 'BTC staked',
        time: 'weeks',
      },
      {
        text: 'Confirm the unbonding window in the app first, then unstake and withdraw there.',
        cost: 'a few dollars gas',
        time: 'per window',
      },
    ],
  },
  hyperithm: {
    blurb:
      'Tokyo and Seoul hedge-fund manager running delta-neutral yield vaults via Accountable on YieldApp. No points program or token found.',
    steps: [
      {
        text: 'Get USDC on Monad, where gas costs cents: bridge from Ethereum or Arbitrum, or withdraw from an exchange.',
        cost: 'bridge fees vary, gas cents',
        time: '10-30 min',
      },
      {
        text: 'Deposit USDC into the Hyperithm Delta Neutral Vault on YieldApp on Monad, ~$73.6M TVL and 10.4% APY.',
        cost: 'cents of Monad gas',
        time: '10 min',
      },
      {
        text: 'Hold aHYPER shares; yield comes from delta-neutral strategies, and the vault hit its $65M cap once, so check capacity.',
        cost: 'deposit held',
        time: 'weeks',
      },
      {
        text: 'Experienced users only: use aHYPER as collateral in Morpho markets on Monad to borrow USDC and loop.',
        cost: 'cents of gas, plus liquidation risk',
        time: '15 min',
      },
      {
        text: 'Before sizing up, verify leverage and transparency: Hyperithm used recursive exposure before and later withdrew it.',
        cost: 'free',
        time: '10 min',
      },
    ],
  },
  infinifi: {
    blurb:
      "Fractional-reserve banking for stablecoins: deposit USDC, get iUSD, ~8% APY. INFI points live, TGE Q4 2026, but registration closed 10 Nov 2026.",
    steps: [
      {
        text: 'Get USDC on Base or Monad, where gas costs cents, not Ethereum mainnet at $2-10 a tx.',
        cost: 'cents of gas',
        time: '10 min',
      },
      {
        text: 'Open the infiniFi app, deposit USDC to mint iUSD; the plain iUSD points multiplier rose from 3x to 15x.',
        cost: 'cents of gas',
        time: '10 min',
      },
      {
        text: 'For higher yield and points, stake iUSD for siUSD, the liquid senior tier at ~7.5x points.',
        cost: 'cents of gas',
        time: '5 min',
      },
      {
        text: 'For the maximum boost, lock iUSD into liUSD for 1-13 weeks, the junior tier at ~7.5x points.',
        cost: 'funds locked 1-13 weeks',
        time: '5 min',
      },
      {
        text: 'Check registration first: INFI registration closed 10 Nov 2026, so a new depositor may be too late for the airdrop.',
        cost: 'free',
        time: '5 min',
      },
    ],
  },
  'k3-capital': {
    blurb:
      'Institutional DeFi liquidity provider curating vaults on Euler, Morpho, IPOR and Liquity. Its FAQ states it has no publicly traded token.',
    steps: [
      {
        text: 'Open the Earn page at k3-capital.net and pick a vault: RSETH, NUSD, BOLD, EUROP, USDT or USDT0.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Cheapest entry is Monad, where gas costs cents; or use Ethereum vaults for the deepest Euler and IPOR markets.',
        cost: 'cents on Monad, $2-10 ETH',
        time: '10-30 min',
      },
      {
        text: 'Deposit the listed asset with approve + deposit; e.g. BOLD into the sBOLD vault on Liquity v2.',
        cost: 'cents on Monad, $2-10 ETH',
        time: '10 min',
      },
      {
        text: 'Hold for weeks; K3 rebalances across the underlying protocols and yield accrues to the share price.',
        cost: 'deposit held',
        time: 'weeks',
      },
      {
        text: 'Withdraw anytime through the same Earn page, subject to liquidity, and check the vault fee and underlying protocol first.',
        cost: 'cents on Monad, $2-10 ETH',
        time: '10 min',
      },
    ],
  },
  keyrock: {
    blurb:
      "Market maker curating yield vaults through Morpho, nearly all stablecoins, ~90% of TVL on Circle's Arc chain. No points or token found.",
    steps: [
      {
        text: 'Get USDC on Arc, Circle chain live since 16 Sep 2026: bridge via CCTP, or withdraw USDC directly to Arc.',
        cost: 'Arc gas paid in USDC, ~$0.01/tx',
        time: '10-30 min',
      },
      {
        text: 'Open Morpho on Arc and find a Keyrock-curated USDC vault; check APY, caps and allocation first.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Deposit USDC with approve + deposit for ERC-4626 shares; total fees on Arc are ~$0.02.',
        cost: 'about $0.02 in USDC',
        time: '5 min',
      },
      {
        text: 'Keyrock Morpho USDC v1 or v2 vault on ETH, but read the allocation first: analysts flagged recursive exposure in v1.',
        cost: '$2-10 mainnet gas',
        time: '15 min',
      },
      {
        text: 'Hold for weeks; yield is USDC lending interest, plus any MORPHO rewards the vault distributes.',
        cost: 'deposit held',
        time: 'weeks',
      },
    ],
  },
  lagoon: {
    blurb:
      "Vault infrastructure: a permissionless ERC-7540 vault factory across 18+ EVM chains, 120+ vaults live. No points, token or airdrop found.",
    steps: [
      {
        text: 'Browse live vaults at lagoon.finance or a vault aggregator and pick a curator and strategy, like a USDC lending vault at 3-8% APY.',
        cost: 'free',
        time: '20 min',
      },
      {
        text: 'Get the vault asset, usually USDC, on the vault chain; Base or Arbitrum keep gas under ~$0.10-0.50.',
        cost: 'under $0.50 gas on Base/Arbitrum',
        time: '10-30 min',
      },
      {
        text: 'Deposit through the Lagoon vault page: ERC-7540 vaults settle asynchronously, often within hours, sometimes the next day.',
        cost: 'under $0.50 gas',
        time: '1 day',
      },
      {
        text: 'Hold the shares for weeks; check the vault fee, often 0% management plus up to 10-20% performance, first.',
        cost: 'deposit held',
        time: 'weeks',
      },
      {
        text: 'To exit, request a redemption, also asynchronous, so allow hours-days for settlement, especially cross-chain.',
        cost: 'under $0.50 gas',
        time: 'hours-days',
      },
    ],
  },
  'lightning-network': {
    blurb:
      "Bitcoin's Layer-2 payment network: instant, near-free BTC payments through channels. No token, no points, no airdrop; the farm is routing fees.",
    steps: [
      {
        text: 'Decide first whether this is worth it: routing is active infrastructure work, not passive yield, near 0.10% APY.',
        cost: 'free',
        time: '10 min',
      },
      {
        text: 'Set up a Lightning node with LND, Core Lightning or Eclair on a VPS or home server with reliable uptime.',
        cost: 'a VPS at a few dollars a month',
        time: 'hours',
      },
      {
        text: 'Fund it with BTC you can lock long term, e.g. 0.05-0.5 BTC across channels; opening each channel is one on-chain tx.',
        cost: 'about $0.30 a channel at low fees',
        time: '1 hour',
      },
      {
        text: 'Open channels to well-connected, high-traffic peers like large routing nodes and exchanges; balanced liquidity matters.',
        cost: 'one on-chain fee per channel',
        time: '1 hour',
      },
      {
        text: 'Set fees near the 100-150 ppm plus ~0.5 sat base fee, keep the node online, rebalance, and close channels to reclaim BTC.',
        cost: 'rebalancing fees apply',
        time: 'weekly',
      },
    ],
  },
  lofty: {
    blurb:
      "Fractional US rental real estate on Algorand: each property is a Wyoming LLC, ownership an ASA token, rent paid daily in USDC. No token or airdrop.",
    steps: [
      {
        text: 'Create an account at lofty.ai and complete identity verification; KYC is required, you must be 18+, most countries accepted.',
        cost: 'free',
        time: '1 day',
      },
      {
        text: 'Set up Pera Wallet and fund it with a little ALGO for fees plus USDC on Algorand for purchases.',
        cost: 'fees are 0.001 ALGO, under $0.001',
        time: '10 min',
      },
      {
        text: 'Browse the marketplace and pick a property; listings show location, rent projections, expenses and reports, tokens ~$50 each.',
        cost: 'free',
        time: '30 min',
      },
      {
        text: 'Buy tokens with a 2.5% purchase fee; e.g. $500 buys ~10 tokens minus the fee, and nobody may hold over 15% of one property.',
        cost: '2.5% purchase fee',
        time: 'minutes',
      },
      {
        text: 'Hold for months+; net rent accrues daily at midnight UTC, withdrawable in USDC, and you can vote on property decisions.',
        cost: 'tokens held',
        time: 'months+',
      },
    ],
  },
  'mezo-earn': {
    blurb:
      "Bitcoin vote-escrow: locked BTC (veBTC) earns fees and votes on gauges, locked MEZO boosts weight up to 5x. MEZO already trades since 1 Apr 2026.",
    steps: [
      {
        text: 'Bridge BTC to Mezo through the mezo.org app, or buy BTC already on Mezo; bridging takes 10-30 min.',
        cost: 'bridge fees vary, $5-20',
        time: '10-30 min',
      },
      {
        text: 'Lock BTC for veBTC for 1-28 days; locks round down to weekly epochs starting Thursday 00:00 UTC.',
        cost: 'under $1 per tx',
        time: '10 min',
      },
      {
        text: 'Optional boost: buy MEZO and lock it for veMEZO, up to a 4-year lock for up to 5x on your veBTC weight.',
        cost: 'MEZO purchase, under $1 gas',
        time: '10 min',
      },
      {
        text: 'Vote every epoch, Thursday to Thursday; one vote per epoch is required for Prime Access, and skipping a week forfeits that week.',
        cost: 'under $1 gas per vote',
        time: '5 min/week',
      },
      {
        text: 'Claim BTC fee rewards weekly at epoch end and hold 4-12 weeks; voting power decays linearly, so re-lock to maintain weight.',
        cost: 'under $1 gas per claim',
        time: '4-12 weeks',
      },
    ],
  },
  noble: {
    blurb:
      "Stablecoin chain, now an EVM L1 from 18 Mar 2026; flagship USDN is a Treasury-backed yield-bearing dollar. Points from Mar 2025; live status unverified.",
    steps: [
      {
        text: 'Add the Noble EVM chain to an EVM wallet and fund it with USDC through a CCTP or IBC route.',
        cost: 'about $1-5 of gas',
        time: '10-20 min',
      },
      {
        text: 'Do not park USDC on legacy Noble Cosmos: Circle pauses the legacy USDC contract and CCTP routes on 12 Jan 2027.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Get USDN by swapping USDC to USDN on Noble EVM or through dollar.noble.xyz; yield was ~4.15% at launch.',
        cost: 'a swap fee plus a few dollars gas',
        time: '10 min',
      },
      {
        text: 'Deposit USDN into the Flexible Vault (keeps base yield plus boosted yield) or the Staking Vault (locks up to 4 months for points).',
        cost: 'a few dollars gas',
        time: '10 min',
      },
      {
        text: 'Verify the points program is still live at the official points app first; points accrue by time locked.',
        cost: 'free',
        time: 'weeks',
      },
    ],
  },
  'nonce-capital': {
    blurb:
      "DeFi risk curator designing yield strategies for third-party vaults, notably ether.fi Liquid vaults and Midas funds. No app, points or token found.",
    steps: [
      {
        text: 'Open ether.fi, go to Earn or Liquid, and pick a Nonce-curated Liquid vault: Liquid USD, Liquid ETH or Liquid BTC.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Confirm Nonce Capital is listed as curator on the vault page, then deposit USDC, USDT, weETH, WETH or eETH on ETH.',
        cost: '$2-10 gas per tx',
        time: '15 min',
      },
      {
        text: 'Receive liquid vault shares, like liquidUSD or liquidETH; yield auto-compounds as the curator rebalances.',
        cost: 'deposit held',
        time: 'minutes',
      },
      {
        text: 'Hold 1-3 months: curator vaults are slow, diversified yield, not a points sprint; check allocation monthly.',
        cost: 'deposit held',
        time: '1-3 months',
      },
      {
        text: 'Withdraw through the vault redemption or queue and plan exits days ahead: some vaults have a withdrawal queue or cooldown.',
        cost: '$2-10 of gas',
        time: 'days',
      },
    ],
  },
  onre: {
    blurb:
      "Bermuda-licensed on-chain reinsurer on Solana: ONyc earns premiums near 9-16% APY. OnRe Points live; no $ONRE TGE confirmed.",
    steps: [
      {
        text: 'Get ONyc at OnRe by connecting Phantom and buying with USDC or sUSDe on Solana; txs cost under $0.10.',
        cost: 'under $0.10 per tx',
        time: '10 min',
      },
      {
        text: 'Check the live price against NAV first: primary mint is for qualified investors, so retail usually buys on secondary markets.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Base leg at 1x: simply hold ONyc for 1 point per ONyc per day, and hold 60+ days to qualify for the Compounding Rewards Season 1.',
        cost: 'ONyc held',
        time: '60+ days',
      },
      {
        text: 'Higher multipliers: supply ONyc as collateral on Kamino or Loopscale for 3x, or LP ONyc with USDC on Orca or Raydium for 2x.',
        cost: 'under $0.10 a tx, plus liquidation and IL risk',
        time: '15 min',
      },
      {
        text: 'Track points on the leaderboard at OnRe and hold through at least one underwriting cycle of 60+ days.',
        cost: 'free',
        time: '60+ days',
      },
    ],
  },
  opentrade: {
    blurb:
      "Institutional stablecoin yield-as-a-service: ERC-4626 vaults into regulated RWA and bond-ETF strategies. No token, points or airdrop found.",
    steps: [
      {
        text: 'On WOO X, Staking or Earn, then RWA, pick the High Yield Corporate Bond vault tracking the BlackRock SHYG ETF.',
        cost: 'KYC via WOO X, no lockup',
        time: 'minutes to subscribe',
      },
      {
        text: 'Alternative: open the IXS app, go to Earn, and pick the SHYG Vault; deposit USDC on Avalanche, where gas is under $0.50.',
        cost: 'under $0.50 gas on Avalanche',
        time: '10 min',
      },
      {
        text: 'Alternative: use Plume Nest vaults powered by OpenTrade; deposit stablecoins into Nest for nTOKENS backed by WisdomTree funds.',
        cost: 'cents of gas on Plume',
        time: '10 min',
      },
      {
        text: 'Direct route, institutional only: onboard at opentrade.io with KYB, then deposit USDC, USDT or EURC into a vault like Prime+.',
        cost: 'KYB over days, then gas',
        time: 'days to onboard',
      },
      {
        text: 'Hold weeks: yield is fixed income, so expect single-digit APR, not points multiples; the farm thesis is an unconfirmed token.',
        cost: 'deposit held',
        time: 'weeks',
      },
    ],
  },
  'plume-vaults': {
    blurb:
      "Non-custodial RWA vaults (Nest): deposit stablecoins, receive yield-bearing nTOKENS. PLUME already exists; PNP Season 1 ended Mar 2026.",
    steps: [
      {
        text: 'On nest.credit, connect your wallet and pick a vault by asset: nTBILL for T-bills, nWISDOM for WisdomTree funds, nALPHA for credit.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Deposit pUSD on Plume or USDC on Solana or Ethereum; gas is cents on Plume and Solana and $2-10 on ETH.',
        cost: 'cents on Plume/Solana, $2-10 ETH',
        time: '10 min',
      },
      {
        text: 'Hold the nTOKEN: base RWA yield accrues as the token value rises, and redemption is at market value at any point, no lockup stated.',
        cost: 'deposit held',
        time: '1-3 months',
      },
      {
        text: 'Optional multiplier: deploy nTOKENS into partner DeFi, like LP on Rooster DEX on Plume, which earned up to 8x PNP in Season 1.',
        cost: 'cents of gas, plus LP risk',
        time: '15 min',
      },
      {
        text: 'Do not present PNP as currently live without checking nest.credit: Season 1 ran Nov 2025 to Mar 2026 and paid out in PLUME.',
        cost: 'free',
        time: '5 min',
      },
    ],
  },
  r25: {
    blurb:
      "Institutional RWA protocol: rcUSD plus yield-bearing rcUSDp on Sui, and vault infrastructure on Pharos. No points program, token or airdrop.",
    steps: [
      {
        text: 'Sui leg: get rcUSD, the Sui-native stablecoin backed by regulated RWAs, then stake it for rcUSDp, the yield-bearing receipt token.',
        cost: 'under $0.05 per transaction on Sui',
        time: 'minutes',
      },
      {
        text: 'Or use the Ember or TopNod R25 rcUSD Vault on Sui, a fixed-yield vault at ~12% base APY quoted at launch, with T+4 settlement.',
        cost: 'under $0.05 per transaction on Sui',
        time: 'minutes in, T+4 out',
      },
      {
        text: 'Pharos leg: deposit USDC into the pRNH Vault on Pharos, exposure to the NYLIM Anemoy high-yield bond portfolio, near 7% annualised.',
        cost: 'Pharos gas is cents',
        time: '10 min',
      },
      {
        text: 'Or use the Axil Prime Credit Vault on Pharos via Binance, OKX or Bitget wallets: USDC in, ~14.3% target annualised, 3-month lock.',
        cost: 'Pharos gas is cents, locked 3 months',
        time: '10 min',
      },
      {
        text: 'Hold for the vault term and redeem, allowing settlement time: Axil took up to ~7 days, Ember settles T+4.',
        cost: 'cents of gas',
        time: '7 days',
      },
    ],
  },
  'reti-pooling': {
    blurb:
      "Non-custodial Algorand staking pools: small holders pool ALGO to meet the 30,000 threshold and earn consensus rewards. No RETI token or points.",
    steps: [
      {
        text: 'Get ALGO in Pera Wallet: buy on an exchange and withdraw to Pera in minutes for under $1.',
        cost: 'under $1',
        time: '10 min',
      },
      {
        text: 'Open reti.nodely.io, connect Pera, browse pools, comparing commission, size and uptime; larger pools pay more consistently.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Deposit ALGO into a chosen pool in one on-chain tx at ~0.001 ALGO; minimums can be as low as 10 ALGO, some pools suggest 1,000.',
        cost: 'about 0.001 ALGO per tx',
        time: 'seconds',
      },
      {
        text: 'Hold for weeks; rewards compound and distribute pro-rata automatically, with no lockup at the base layer and no slashing.',
        cost: 'ALGO staked',
        time: 'weeks',
      },
      {
        text: 'Withdraw anytime, no unbonding period; re-check live APY first, since Foundation bonus rewards run ~24 months from Jan 2025.',
        cost: 'about 0.001 ALGO',
        time: 'seconds',
      },
    ],
  },
  rockawayx: {
    blurb:
      "Institutional firm with $2bn+ AUM curating yield vaults on Morpho, Kamino, Midas and Upshift. No token, points program or retail airdrop.",
    steps: [
      {
        text: 'Ethereum leg: on Morpho, filter by curator RockawayX and pick a vault by risk; USDC Prime is conservative at 0% fee quoted.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Deposit USDC, or wETH for the wETH vault, on ETH; gas is $2-10 per tx and you receive the vault share token.',
        cost: '$2-10 gas per tx',
        time: '15 min',
      },
      {
        text: 'Solana leg: on Kamino find the RockawayX RWA USDC vault, ~$41.9M supply and 4.8% yield, mainly OnRe and PRIME markets.',
        cost: 'under $0.10 per tx',
        time: '10 min',
      },
      {
        text: 'Hold 1-3 months; the curator rebalances across isolated Morpho and Kamino markets, with 3-7 day timelocks on Morpho changes.',
        cost: 'deposit held',
        time: '1-3 months',
      },
      {
        text: 'Redeem vault shares back to USDC or wETH through Morpho or Kamino when exiting; allow for withdrawal queues on illiquid markets.',
        cost: '$2-10 on ETH, under $0.10 on Solana',
        time: 'days',
      },
    ],
  },
  saturn: {
    blurb:
      "Bitcoin-backed credit: USDat stablecoin, sUSDat staked yield version. Season 2 Orbital Points live; register by 16 Nov 2026, 9:00 AM EST.",
    steps: [
      {
        text: 'Farmed Season 1 or 2? Register today at the claim site before 16 Nov 2026, 9:00 AM EST, with the wallet that earned the points.',
        cost: 'free',
        time: '10 min, deadline 16 Nov 9:00 AM EST',
      },
      {
        text: 'Swap USDC to USDat 1:1 on Saturn; ETH is the deepest venue, and holding USDat alone earns 5x points a day.',
        cost: '$2-10 gas per tx',
        time: '10 min',
      },
      {
        text: 'For yield plus points, stake USDat to sUSDat for yield from STRC exposure at a targeted 11% or more; unstaking takes ~7 days.',
        cost: '$2-10 of gas, 7 days to unstake',
        time: '10 min',
      },
      {
        text: 'For maximum points, experienced users only: LP USDC with USDat on Curve for 25x, or buy YT-USDat on Pendle for 30x.',
        cost: '$2-10 of gas, plus IL and expiry risk',
        time: '15 min',
      },
      {
        text: 'Hold to the snapshot at TGE or 8 Dec 2026. At TGE, claim STRN only via the Saturn X account link; no token contract exists yet.',
        cost: 'gas to claim',
        time: 'weeks',
      },
    ],
  },
  'steakhouse-financial': {
    blurb:
      "The largest Morpho vault curator: non-custodial ERC-4626 vaults in Prime, High Yield, Term and Turbo tiers. No points program exists.",
    steps: [
      {
        text: 'On Base: open Morpho, filter curator Steakhouse Financial, sort by TVL; the Base High Yield USDC vault is the flagship.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Bridge USDC to Base through the official Base bridge or any major bridge and hold a little ETH on Base for gas.',
        cost: 'about $1-5 gas and bridge fees',
        time: '10 min',
      },
      {
        text: 'Approve and deposit USDC into the chosen vault in two txs for ERC-4626 shares; yield accrues through the share price.',
        cost: 'under $0.10 gas/tx on Base',
        time: 'minutes',
      },
      {
        text: 'Robinhood angle: Steakhouse curates the USDG vault behind Robinhood Earn at $537M and 3.7% APY, but deposits are switched off.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Hold indefinitely, no lock-up; withdrawals instant subject to liquidity. Exit if the risk rating drops or a market looks stressed.',
        cost: 'deposit held',
        time: 'weeks',
      },
    ],
  },
  symbiotic: {
    blurb:
      "Permissionless restaking: deposit stETH, wstETH, weETH, wBTC or stablecoins into curator vaults. Points confirmed; airdrop unconfirmed.",
    steps: [
      {
        text: 'Get stETH or wstETH on ETH by swapping ETH on a DEX or minting through Lido; gas is $2-10 a tx, so size positions at $500 or more.',
        cost: '$2-10 gas per tx',
        time: '5-10 min',
      },
      {
        text: 'Deposit at the Symbiotic restake app and pick a vault with open capacity and a reputable curator; caps have filled before.',
        cost: '$2-10 gas per tx',
        time: '5 min',
      },
      {
        text: 'Deposit weETH into the ether.fi Super Symbiotic vault, historically 1x Symbiotic plus 3x ether.fi plus 3x Veda points.',
        cost: '$2-10 gas per tx',
        time: '10 min',
      },
      {
        text: 'Delegate to a network or operator if the vault requires it: rewards only flow when collateral is actively securing a network.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Hold months: points scale with amount, duration and networks secured; prefer veto-slashed or no-slash vaults over the highest APY.',
        cost: 'collateral held',
        time: 'months',
      },
    ],
  },
  'tori-finance': {
    blurb:
      "Synthetic-dollar protocol: deposit USDC or USDT to mint trUSD, then stake for strUSD near 12% APY. Cores confirmed, Season 1 from 23 Jun 2026.",
    steps: [
      {
        text: 'Get USDC or USDT on ETH; Tori is Ethereum-only as its hub, so budget $5-15 total gas for the full flow.',
        cost: '$5-15 of gas for the full flow',
        time: '10 min',
      },
      {
        text: 'Swap for trUSD in Tori; the docs recommend swapping over minting, since a 0.1% fee applies to mint operations.',
        cost: 'swap fee plus $2-10 gas',
        time: 'minutes',
      },
      {
        text: 'Stake trUSD to strUSD instantly there; yield accrues automatically through the strUSD to trUSD exchange rate.',
        cost: '$2-10 of gas',
        time: '5 min',
      },
      {
        text: 'Mind the 7-day unstaking cooldown: unstaking strUSD always takes 7 days, so treat this as a minimum ~2-week commitment.',
        cost: 'locked 7 days on exit',
        time: '2 weeks',
      },
      {
        text: 'Second leg: deposit strUSD or trUSD into the Tori Ecosystem Vault on Upshift or a Pendle PT or YT market maturing 26 Nov 2026.',
        cost: '$2-10 of gas, plus LP risk',
        time: '15 min',
      },
    ],
  },
  'tulipa-capital': {
    blurb:
      "Boutique risk-curation firm, active since 2019, managing Morpho lending vaults with a capital-preservation-first mandate. No points, token or airdrop.",
    steps: [
      {
        text: 'Find Tulipa vaults on Morpho (filter curator Tulipa Capital) on ETH and Base; check TVL, APY, fee and allocation.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Prefer Base for small tickets: the same vault mechanics apply, with gas under $0.10 versus several dollars on ETH.',
        cost: 'under $0.10 gas on Base',
        time: '10 min',
      },
      {
        text: 'Deposit USDC, or the vault asset, via approve + deposit for ERC-4626 shares; yield accrues in the share price.',
        cost: 'under $0.10 on Base, dollars on ETH',
        time: '5 min',
      },
      {
        text: 'Read the vault allocation on Morpho: verify it lends against blue-chip collateral like cbBTC or wstETH, not exotic markets.',
        cost: 'free',
        time: '10 min',
      },
      {
        text: 'Hold, no lock-up; withdrawals instant subject to liquidity. Only deposit if the yield justifies it: the airdrop thesis is weak.',
        cost: 'deposit held',
        time: 'weeks',
      },
    ],
  },
  tydro: {
    blurb:
      "Ink's native lending market, an Aave V3 deployment. TydroInkPoints confirmed, Season 2 live, feeding an anticipated $INK airdrop.",
    steps: [
      {
        text: 'Bridge to Ink, Kraken OP-Stack L2: Kraken users can withdraw ETH to Ink at zero fee, or use the official bridge in 10 min.',
        cost: 'zero fee from Kraken',
        time: '10 min',
      },
      {
        text: 'Supply USDC or USDT0, the largest weekly point budgets, or wETH or kBTC, since holding kBTC adds a boost, on Tydro.',
        cost: '$0.01-0.10 gas per tx',
        time: '2 min',
      },
      {
        text: 'Enable collateral and borrow modestly, e.g. USDC against wETH at a health factor above 2.0; borrowing has a weekly point budget.',
        cost: '$0.01-0.10 of gas, plus liquidation risk',
        time: '5 min',
      },
      {
        text: 'Hold for weeks: points are time-weighted by value and duration; $500 held 120 days beats $5,000 held 10 days.',
        cost: 'position held',
        time: 'weeks',
      },
      {
        text: 'Check the weekly renewal thread on the Tydro forum, since budgets rotate, and claim through Merkl via the Tydro interface.',
        cost: 'under $0.10 gas to claim',
        time: '5 min/week',
      },
    ],
  },
  upshift: {
    blurb:
      "Vault infrastructure in ERC-4626 for professional curators, on 30+ chains. Upshift points confirmed, Season 2 live; no token mentioned.",
    steps: [
      {
        text: 'Open Upshift, pick a vault by asset and chain; retail options are Ethereum USDC vaults like Sentora USD or SharpByte RWA.',
        cost: 'free',
        time: '15 min',
      },
      {
        text: 'Deposit USDC on ETH with approve + deposit for receipt tokens like upSBRWA or sentUSD; gas is $3-10.',
        cost: '$3-10 gas per tx',
        time: '5 min',
      },
      {
        text: 'Verify the 5x early-deposit boost is still live; it ends when Upshift TVL hits $750M (about $515M in Oct 2026).',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'Partner stacking: supply your receipt token as collateral on Morpho for a 5x multiplier, or LP it on Pendle for up to 7.5x.',
        cost: '$3-10 of gas, plus liquidation risk',
        time: '15 min',
      },
      {
        text: 'Hold for the season: points accrue on size and time, then decay. Withdrawals follow the vault terms, some with 25-hour to 3-day windows.',
        cost: 'deposit held',
        time: 'weeks',
      },
    ],
  },
  usdd: {
    blurb:
      "Over-collateralized USDD 2.0: lock TRX, sTRX, USDT or WBTC in CDP vaults and mint USDD; sUSDD near 4% APY. No points; JST already exists.",
    steps: [
      {
        text: 'Buy USDD and stake for sUSDD. Get USDD on Tron by swapping USDT to USDD on SunSwap or 1:1 via the Peg Stability Module.',
        cost: 'near-zero if you hold or rent TRX energy',
        time: '10 min',
      },
      {
        text: 'Or mint it yourself: open a USDD vault, deposit TRX, sTRX, USDT or WBTC, and mint USDD, keeping the ratio well above the minimum.',
        cost: 'a few TRX per tx',
        time: '10 min, then monitor ratio',
      },
      {
        text: 'Lend on JustLend, Tron largest money market: supply USDD to earn supply APY, sometimes topped up with TRON DAO Reserve incentives.',
        cost: 'a few TRX per tx',
        time: '10 min',
      },
      {
        text: 'Optional LP on SunSwap: provide USDD-USDT or USDD-TRX liquidity for trading fees plus mining rewards, only if you accept IL risk.',
        cost: 'a few TRX per tx, plus IL risk',
        time: '10 min',
      },
      {
        text: 'Monitor the peg: USDD fell to ~$0.93 in Jun 2022; the 2.0 model is over-collateralized near 148%, but the reserve is TRX-heavy.',
        cost: 'free',
        time: '5 min/week',
      },
    ],
  },
  valos: {
    blurb:
      "Institutional private-credit vault on Monad lending Agora AUSD to tier-1 market makers. No points program; institutional-only, not retail.",
    steps: [
      {
        text: 'First, the gate: the Valos credit vault, ~6.4% APY and $106M, is listed as Private; expect KYC, accreditation and a high minimum.',
        cost: 'free',
        time: '5 min',
      },
      {
        text: 'If institutional or qualified: enquire via Accountable YieldApp, prepare AUSD on Monad, expect onboarding and KYC first.',
        cost: 'onboarding over days, gas cents',
        time: 'days to onboard',
      },
      {
        text: 'Retail-adjacent, unverified: a Valos vUSD/AUSD market on Euler on Monad lists near 9.2% APY with instant withdrawals.',
        cost: 'cents of Monad gas',
        time: '15 min to verify',
      },
      {
        text: 'Cheapest real exposure: buy and hold AUSD on Monad and watch for the vault or related markets opening to wider access.',
        cost: 'cents of Monad gas',
        time: '10 min',
      },
      {
        text: 'Risk note: uncollateralized loans to market makers, backed by balance sheets, not on-chain collateral.',
        cost: 'free',
        time: '5 min',
      },
    ],
  },
  veda: {
    blurb:
      "Vault infrastructure on the BoringVault standard, powering vaults for Kraken, EtherFi, MetaMask and Plasma. Points since Oct 2024; airdrop unconfirmed.",
    steps: [
      {
        text: 'Kraken DeFi Earn: allocate USDC, or BTC and xStocks where eligible, to a Veda-powered vault; no self-custody needed.',
        cost: 'no gas paid directly',
        time: '10 min',
      },
      {
        text: 'Self-custody: EtherFi Liquid vaults. Deposit weETH or ETH into one, like the Super Symbiotic vault, on ether.fi.',
        cost: '$3-10 gas per tx',
        time: '10 min',
      },
      {
        text: 'Or use MetaMask Money Account or Plasma vaults, also Veda-powered, if you hold assets there; the same points accrual applies.',
        cost: 'gas depends on the chain',
        time: '10 min',
      },
      {
        text: 'Hold: points equal USD balance x 0.01 x days held, with per-vault multipliers; duration matters more than hopping vaults.',
        cost: 'deposit held',
        time: 'months',
      },
      {
        text: 'Check your points on the Veda dashboard and track multipliers; withdrawals are non-custodial, but each vault has its own timing.',
        cost: 'free',
        time: '5 min/week',
      },
    ],
  },
  'yuzu-money': {
    blurb:
      "Protocol issuing yzUSD, an over-collateralized stablecoin backed by leveraged DeFi strategies. Juice confirmed, converts to $YUZU at TGE.",
    steps: [
      {
        text: 'Retail entry: buy yzUSD on secondary markets; primary mint is restricted to accredited investors with a $100k minimum.',
        cost: 'Plasma gas is cents; a swap fee applies',
        time: 'minutes',
      },
      {
        text: 'Stake yzUSD to syzUSD in Yuzu; near-instant unstake, yield decided weekly on Fridays; this is the core Juice hold.',
        cost: 'cents of gas on Plasma',
        time: '5 min',
      },
      {
        text: 'Optional LP boost: provide yzUSD liquidity on Curve on Plasma or Pendle YT or LP pools, some carrying 2x-10x Juice multipliers.',
        cost: 'cents of gas, plus LP risk',
        time: '15 min',
      },
      {
        text: 'Upshift vault: deposit into the Yuzu Money USDT0 Vault on Upshift on Plasma, which earns points from both Yuzu and Upshift.',
        cost: 'cents of gas on Plasma',
        time: '10 min',
      },
      {
        text: 'Hold long-term and verify backing on the Accountable proof-of-reserves dashboard; backing was ~110.8% in the Jul 2026 snapshot.',
        cost: 'free',
        time: '10 min/week',
      },
    ],
  },
};
