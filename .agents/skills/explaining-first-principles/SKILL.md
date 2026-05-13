---
name: explaining-first-principles
description: Decomposes technical concepts into fundamental building blocks for complete understanding. Use when users request deeper technical clarification, say "explain first principles", ask "how does X really work", or seem confused about foundational concepts behind a topic.
---

# Explaining First Principles

Systematically breaks down technical concepts to atomic fundamentals before building back up. Inspired by the Socratic method and Feynman technique.

## When This Skill Activates

Trigger automatically when the user:
- Says "explain first principles" or "from first principles"
- Asks "how does X really work" or "what is actually happening"
- Requests deeper clarification on unfamiliar concepts
- Seems confused about fundamentals underpinning a topic

## Core Architecture: The Pyramid Protocol

Every explanation follows a 5-phase structure:

1. **Identify ask** — Determine what the user actually wants explained and their current level
2. **Map hierarchy** — Decompose the concept into prerequisite layers
3. **Establish floor** — Teach the deepest prerequisite until understood
4. **Build upward** — Layer each concept on verified foundations
5. **Synthesize** — Tie everything together to answer the original question

## The Decomposition Rule

Never introduce a concept whose prerequisites haven't been established. For each concept C:

```
C requires {A, B}
├── A requires {D, E}
│   ├── D is atomic (foundational)
│   └── E is atomic
└── B requires {F}
    └── F is atomic
```

Teach in this order: D, E, A, F, B, then C.

## When to Stop Decomposing

A concept is "atomic" (no further decomposition needed) when:
- It maps to built-in human intuition (e.g., "a container holds things")
- The user explicitly indicates they understand
- Further decomposition would add no explanatory value

## Progressive Complexity

Start with the simplest version of each concept, then refine:

1. **Initial model** — A deliberately simplified (possibly imprecise) mental model
2. **Refine** — Add nuance, edge cases, precision
3. **Generalize** — Show how it connects to broader patterns

## Verification Checkpoints

After each foundational layer, confirm comprehension before advancing:

- **Knowledge check**: Ask a short question confirming they processed the explanation
- **If uncertain**: Reframe the concept differently and re-check
- **If confident**: Proceed to the next layer
- On third failed check at same level: suggest revisiting prerequisites

## Response Template

```
## First Principles: [Concept]

### 1. The question
[Restate what they're asking]

### 2. What we need to understand first
[Prerequisite concepts listed hierarchically]

### 3. [Deepest prerequisite] → explained
[Atomic-level breakdown]

### 4. [Next layer] → built on above
...

### N. The original concept → explained
[Synthesize everything to answer the question]
```

For **simple requests** (not "first principles"), keep explanations brief — just enough to answer directly without the full pyramid protocol.

---

**Hierarchy mapping**: See [references/hierarchy-mapping.md](references/hierarchy-mapping.md)
**Question types**: See [references/question-framework.md](references/question-framework.md)
**Verification details**: See [references/verification.md](references/verification.md)
**Worked examples**: See [references/examples.md](references/examples.md)
