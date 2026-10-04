---
name: pr
description: "Write concise, high-signal Pull Request bodies or ticket completion summaries."
metadata:
  credits:
    skill: show-me
    author: Dex Horthy
    organisation: Humanlayer
    url: "https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md"
---

# Concise PR & Ticket Completion Specification

Write concise, high-signal Pull Request descriptions and ticket completion summaries for the user. Skip verbose preambles. Use ubiquitous domain language from `docs/domain/entity_model.md` and `docs/requirements.md`.

## Core Template

```markdown
## Summary

<call-tree, component-tree, sequence diagram, or diff-sketch>

## Evidence

- **Before:** <screenshot / failing test run / physical baseline metric>
- **After:** <screenshot / passing test run / post-implementation metric>

## Merge Danger

- **Door:** <One-Way Door or Two-Way Door>
  <brief justification: reversible via CSS/isolated logic, or breaking contract/schema>
- **Blast Radius:** <Target domain / consumer files / subsystems affected>
  <potential ramifications or dependencies>
```

## Section Guidelines

### 1. Summary
Pick the smallest visual representation that makes the architectural change crystal clear:
- **Runtime control flow:** Use an indented call tree.
- **UI structure:** Use a component hierarchy with state boundaries.
- **Broad refactoring:** Use a shallow file tree showing moved responsibilities.
- **Component or subsystem interaction:** Use a minimal Mermaid sequence or flowchart diagram.
- **Targeted code change:** Use a concise markdown diff block.

### 2. Evidence
Always provide concrete, verifiable physical proof:
- Before/After test outputs (`vitest` exit status and test counts).
- Before/After dual-viewport UI screenshots (`.agents/tmp/...png`).
- Before/After LOC measurements (`node scripts/check_loc.mjs`).

### 3. Merge Danger
Classify risk according to `GEMINI.md` and Global Rules §6:
- **Two-Way Door:** Pure visual/CSS, spacing, isolated helper logic, or fully encapsulated internal refactor with 100% parity. Can be safely merged or reverted autonomously.
- **One-Way Door:** DB schemas, wire protocols, breaking public contracts, auth/security changes, or irreversible data mutations. Mandates human review sign-off.
- **Blast Radius:** Explicitly list downstream consumer modules and verify that zero consumer breakages occurred.
