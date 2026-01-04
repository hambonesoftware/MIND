# MIND V9 Runtime Model

## Overview
The V9 runtime executes a directed graph via a token model. Tokens are scheduled and quantized to bar boundaries by default.

## Token execution rules
- **Token arrival:** a node is eligible to execute when it receives a token (or tokens for Join).
- **Quantization:** node activation is **quantized to the next bar boundary** unless the node overrides timing.
- **Fan-out:** a node may emit tokens on multiple outgoing edges in parallel.
- **Merge:** any incoming token activates the node (OR semantics).
- **Join:** explicit AND barrier; waits for all required inputs before releasing.

## Safety caps
- **Max depth:** a bounded traversal limit (e.g., 256 nodes) prevents infinite loops from locking the runtime.
- **Max schedule steps:** a bounded event schedule (e.g., 2048) prevents runaway scheduling.

## Canonical example: Loop N times then exit
**Goal:** loop a Thought N times using Counter + Switch.

```
Start → Counter → Switch → Thought → Counter (loop back)
                      └──────→ Exit
```

- Counter starts at 0.
- On first hit, Counter increments to 1, Switch evaluates `Counter <= N` and routes to Thought.
- After Thought finishes, token loops back to Counter.
- When Counter becomes N+1, Switch takes the Default branch to Exit.

## Canonical example: Parallel fan-out + Join barrier
**Goal:** play two Thoughts in parallel then continue once both complete.

```
Start → Fan-out
        ├→ Thought A ─┐
        └→ Thought B ─┤→ Join → Next
```

- Fan-out emits tokens to both Thoughts.
- Join waits until both Thought A and Thought B complete, then releases a single token to `Next`.
