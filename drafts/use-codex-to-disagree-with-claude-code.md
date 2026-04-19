---
title: "Use Codex to Disagree With Claude Code"
published: false
description: Pair Codex CLI as an adversarial second opinion inside Claude Code so your agent loop stops rubber-stamping itself.
tags: [claude, codex, ai, productivity]
date: 2026-04-19
cover_image:
canonical_url: https://github.com/sadjow/articles/blob/main/drafts/use-codex-to-disagree-with-claude-code.md
---

I was five minutes from squash-merging when Codex stopped me.

The change was one line. Swap a GCS bucket URL in a Nix flake for `downloads.claude.ai`, the Anthropic-branded CDN. Both hosts served identical bytes, the sha256 was pinned, the build passed. A community contributor had suggested it weeks earlier and I was finally carrying it across the finish line.

Before hitting merge, I piped the diff to Codex CLI (OpenAI's coding agent, similar shape to Claude Code) with one instruction: *push back if I am wrong*.

It pushed back.

> The CDN is the availability risk, not the integrity risk. If downloads.claude.ai has an outage, every Nix user on this flake is blocked from rebuilds until it comes back. Use both URLs. The pinned sha256 keeps them interchangeable. Two hosts mean you survive one going down.

I would not have thought of it. Claude Code had reviewed the diff, asked a couple of clarifying questions, approved the swap. Of course it did. It was *my* swap. A model in a loop with its own output converges on agreement. The way to break that is a fresh agent prompted to disagree.

## Why not just ask Claude to critique itself?

The obvious objection. You can prompt Claude to play devil's advocate, and it will try. But the problem is not the prompt, it is the context. By the time you are ready to ship, the session is full of the reasoning you used to get here. Asking the same agent to disagree with itself means asking it to disagree inside that frame.

The fix is a clean context. An agent that sees only the diff and the question, with no ramp-up of "yes, and" behind it. A fresh Claude session would do much of that work. I reach for Codex for a second reason on top: different training, different priors, different blind spots. Freshness breaks the conversational lock-in. A different model hedges against the shared-blindspot failure mode where the same biases agree with themselves.

## Builder plus skeptic, not a review pair

A normal review pair looks for bugs in the code you wrote. The builder-skeptic split is different. The skeptic reviews the *decision*, not the diff. It assumes the first model is wrong and hunts for the hidden tradeoff.

Two roles, asymmetric. The first model drives. The second one fights it.

In the URL example I rewrote `package.nix` to pass a `urls = [ cdn, gcs ]` list to `fetchurl`, updated the version-bump script to iterate both hosts, pushed, merged. The shipped PR was tighter than the one I had been about to ship.

## When the skeptic agrees, it still pays

Another PR wanted to add a configurable "bundle these extra packages into the Claude Code wrapper" option. I leaned toward rejection. The tools were already on PATH through the user's normal package manager. The feature duplicated machinery that already existed one layer up.

Codex agreed, but only after steelmanning the case I had dismissed. Someone shipping a portable "Claude plus these tools" closure to CI or Docker had a real reproducibility need. That angle was not in my original rejection.

It still did not argue for the feature on the package itself. It pointed at `symlinkJoin`, a composition primitive already in the ecosystem. My closing PR comment ended up naming the use case and linking to the right solution, instead of a flat rejection. The contributor got a better answer.

Even when the skeptic agrees with your call, the adversarial prompt forces it to articulate the strongest opposing case. Your reasoning gets sharper because of it.

## Wiring it up

Two commands cover most of what I need.

**Design calls.** Whenever I am deciding, not implementing:

```
codex exec --skip-git-repo-check '<prompt>'
```

**Code review.** Before a non-trivial commit, and again before opening or merging a PR:

```
codex review --base main --commit HEAD --title 'short title'
```

`codex review` ingests the diff itself instead of requiring you to embed it in the prompt, which keeps the conversation context clean. For scoped reviews (*only the retry logic, flag races and unbounded loops*), add a prompt argument. When a prompt is passed, `--commit` and `--title` are required.

The prompt shape that matters is not "review this". It is this template:

```
I'm about to <do thing>. My reasoning: <one or two sentences>.

Push back if I am wrong. Steelman the strongest case against this
decision before you agree or disagree. I want the hidden tradeoff,
not a rubber stamp.
```

The "push back if I am wrong" line is load-bearing. Without it, every model including Codex defaults to helpful agreement and you are back in a consensus loop.

To make the habit automatic, I added a `Pairing with Codex` section to `~/.claude/CLAUDE.md` (Claude Code's per-user instruction file, read at every session start). Every non-trivial task now routes through the skeptic before I ship. The rules that matter:

- Always run `codex review` before committing or opening a PR. Mandatory, not optional.
- In prompts, instruct Codex to push back explicitly.
- Never post the skeptic's review as GitHub comments without authorization.
- Do not rubber-stamp Codex either. Cross-check specific claims against the code. When the skeptic contradicts the repo, trust the repo.

One config detail matters. Codex runs at `model_reasoning_effort = xhigh` and `service_tier = fast` by default in `~/.codex/config.toml`. A cheap skeptic is not sharp enough. A slow one disrupts flow. Pay for the good one.

**When to pull the skeptic in.** Concrete triggers: any design decision with more than one defensible answer, any PR close or rejection whose reasoning will live in the issue tracker, any architectural trade-off, any non-trivial commit. The softer trigger, "that went suspiciously smoothly", also counts, but the list above catches it before the feeling does.

## Caveats

Do not rubber-stamp the skeptic. Codex will sometimes confabulate flag names, misread a repository, or push back on something that was actually correct. Cross-check specific claims against the code before you act on them.

The skeptic is not a fact-checker. It is a bias-breaker. That is the whole point.

Skip the pair for mechanical edits. Renaming a variable, rewriting a conditional, fixing a typo. Clear bug fixes with reproducible failures and obvious patches also do not need the detour. Use the pair for architectural decisions, API shape, anything the first model was suspiciously happy about, and PR closes whose reasoning will live in the issue tracker for years.

Cost: one extra round trip per decision. For the URL example, maybe three minutes and two model invocations. The dual-URL version has been serving traffic without incident since.

## The operational rule

Single-agent loops feel fast because they agree. A fresh adversarial pass is slower per exchange and sharper per decision.

Use Claude to build. Use Codex to attack the decision. Trust neither blindly.
