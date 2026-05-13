# Question Framework

Maps question types to response strategies within the first principles approach.

## Question Type Classification

### Type A: "Explain from first principles"
Full pyramid protocol. Decompose to atomic, build up.

**Strategy**: Use the complete 5-phase structure from SKILL.md. Aim for 3-5 layers of depth.

### Type B: "How does X really work?"
Pyramid-lite. Decompose 1-2 levels, focus on the mechanism.

**Strategy**: Show the causal chain. "X works because A, which depends on B. Here's B, here's A, here's X."

### Type C: "What is X?" (definitional)
Direct explanation with minimal decomposition.

**Strategy**: Define X, give the simplest possible example, then mention one deeper layer. Offer to go deeper: "This is built on Y — want me to explain Y from first principles?"

### Type D: "Why does X behave like Y?" (debugging/causality)
Reverse pyramid. Start with the symptom, trace to root.

**Strategy**: "X behaves like Y because of Z. Z depends on A and B..." Trace back to the root cause, then rebuild forward.

### Type E: Vague confusion ("I don't get X")
Diagnostic first. Determine what exactly they don't understand.

**Strategy**: Ask 1-2 probing questions before explaining: "What part of X is confusing? Do you understand A and B (prerequisites of X)?"

## Response Templates by Type

### Type A — Full pyramid

```text
## First Principles: [Concept]

**You asked**: [quote]

**Prerequisite chain**:
[Level 1] [Concept] → needs [A], [B]
[Level 2] [A] → needs [C]
[Level 2] [B] → atomic

**Layer 1: [C]** — [3-5 sentence explanation with analogy]

→ Do you follow so far? (verification checkpoint)

**Layer 2: [A]** — built on [C]
[3-5 sentence explanation]

→ Clear? (verification checkpoint)

**Layer 3: [B]** — atomic
[3-5 sentence explanation]

**Layer 4: [Concept]** — built on [A] and [B]
[Synthesis explanation answering the original question]
```

### Type D — Reverse pyramid

```text
## Why [X] behaves like [Y]

**Root cause**: [Z]

**Causal chain**:
[Y] ← [X] ← [Z] ← [prerequisites of Z]

**Layer 1: [prerequisites of Z]**
...

**Layer 2: [Z]**
...

**Layer 3: [X] → [Y]**
Now connecting the dots...
```

### Type E — Diagnostic

```text
Let's figure out where the gap is.

1. Do you understand [prerequisite A]?
2. What about [prerequisite B]?
3. What specifically about [concept] trips you up?

[Wait for answers, then proceed with targeted explanation]
```

## Language Patterns

| Situation | Pattern |
|---|---|
| Introducing new term | "Think of it as..." (analogy before definition) |
| Connecting layers | "Now that we know X, we can understand Y because..." |
| Verification | "Does that match your understanding so far?" |
| Handling confusion | "Let me try a different angle. Another way to think about it..." |
| Moving up | "With that foundation, let's look at the next layer." |
