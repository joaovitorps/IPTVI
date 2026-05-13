# Hierarchy Mapping

Systematic method for decomposing any technical concept into its prerequisite tree.

## The Decomposition Algorithm

Given a target concept C, recursively identify what must be understood first.

### Step 1: Identify the concept

State the concept as a single sentence: "I need to understand X."

### Step 2: Ask "What does X depend on?"

For each dependency, ask: "Can someone understand X without knowing Y?"
- If yes: Y is not a prerequisite
- If no: Y is a prerequisite

### Step 3: Recurse on each prerequisite

Repeat step 2 for each prerequisite until you reach atomic concepts.

### Step 4: Topological sort

Order all concepts such that prerequisites appear before dependents.

## Mapping Rules

**Rule 1: One concept per node**
Do not bundle multiple ideas into one node.

**Rule 2: Distinguish "nice to know" from "need to know"**
Prerequisites are strictly required. Ancillary context is optional.
- When optional: mention after the core path, not before
- Label clearly: "Background (optional): ..."

**Rule 3: Label atomicity**
Mark each node: `[atomic]`, `[needs decomposition]`, or `[verified understood]`

**Rule 4: Max depth = 4 levels**
If a concept requires >4 levels of prerequisites, group intermediate concepts. Beyond 4 levels produces diminishing returns.

## Hierarchy Notation

```text
TARGET: [Concept name]
├── DEPENDS ON:
│   ├── Prerequisite A
│   │   ├── Sub-prerequisite A1 [atomic]
│   │   └── Sub-prerequisite A2
│   │       └── Sub-sub A2a [atomic]
│   └── Prerequisite B [atomic]
└── VERIFIED: [yes/no]
```

## Identifying Atomic Concepts

A concept is atomic when:

| Criterion | Example |
|---|---|
| Maps to physical intuition | "A variable stores a value" → like a labeled box |
| Universally experienced | "Time passes" → no further decomposition needed |
| Mathematical primitive | "Addition combines quantities" |
| User confirms understanding | "Got it" or equivalent |
| Domain primitive | In Python: "a function takes inputs and returns outputs" |

## Adaptive Depth Adjustment

- **Novice user**: Decompose to 3-4 levels, use analogies at every level
- **Intermediate user**: Decompose to 1-2 levels, focus on missing links
- **Expert user**: Decompose only if they explicitly ask for fundamentals

Infer user level from: vocabulary used, specificity of question, domain context.
