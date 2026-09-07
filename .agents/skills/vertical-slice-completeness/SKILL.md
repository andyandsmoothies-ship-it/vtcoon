---
name: vertical-slice-completeness
description: >
  Verify that when a field or entity is added to a multi-layer architecture, ALL
  layers are updated. Prevents the "silent drop" bug class where a field exists
  in one layer but is missing from DTOs, projections, sync pipelines, or client
  models. Stack-agnostic — works for .NET+Flutter, Node+React, Django+Swift, etc.
  Load this skill when: "new field", "add column", "add property", "entity change",
  "DTO", "sync pipeline", "fromJson", "projection", "schema change", "migration",
  "vertical slice completeness", "field propagation", or when the /preflight
  workflow detects entity/DTO file modifications.
---

# Vertical Slice Completeness

## Core Principle

In any multi-layer architecture, a single field addition touches **every layer** from database to UI. Missing even one layer causes the field to silently drop — no compilation error, no runtime crash, just missing data that the user discovers days later.

This skill provides a **Layer Propagation Checklist** that the AI must fill out whenever it adds or modifies a field on an entity, DTO, or model.

## Patterns

### Layer Propagation Checklist

When adding a field `[X]` to entity `[Y]`, verify it exists in ALL applicable layers:

```
LAYER PROPAGATION CHECKLIST for [Entity].[Field]:

1. [ ] Domain/Entity Layer
       - The field exists on the domain entity class/struct.
       - File: ___

2. [ ] Database Mapping Layer
       - The field has an explicit column mapping (e.g., HasColumnName, @Column, Drift column).
       - A migration has been created if the schema changed.
       - File: ___

3. [ ] DTO / API Contract Layer
       - The field exists on the server-side DTO/record used in API responses.
       - File: ___

4. [ ] Query Projections (ALL of them)
       - Every LINQ Select, SQL projection, or query that touches this entity
         includes the new field.
       - Search pattern: grep for the entity name in query/handler files.
       - Files: ___

5. [ ] Sync/Replication Pipeline (if applicable)
       - If the project has an offline sync, the sync endpoint projection
         includes the new field.
       - File: ___

6. [ ] Client-Side Model + Deserialization
       - The field exists on the client model (Flutter DTO, TypeScript interface, etc.)
       - The fromJson/fromMap/deserializer handles the field.
       - File: ___
```

### How to Use

**Step 1: Identify the trigger.**
When any of these patterns appear in the current task:
- A new property is added to a C# entity, Dart model, or TypeScript interface.
- A database migration adds a new column.
- A DTO record gains a new field.

**Step 2: Fill out the checklist.**
For each new field, the AI MUST explicitly fill out all 6 layers above with file paths. Mark N/A where a layer doesn't apply.

**Step 3: Search for missing layers.**
Use `grep_search` to find ALL files that reference the entity name. For each file:
- Does it project/select the entity's fields? → Verify the new field is included.
- Does it serialize/deserialize the entity? → Verify the new field is handled.

### Verification Pattern

```
SEARCH STRATEGY:
1. grep_search for the entity class name across the codebase
2. For each hit, classify the file:
   - Entity definition → Already covered (Layer 1)
   - DbContext/Configuration → Check Layer 2
   - DTO/Record → Check Layer 3
   - Handler/Query/Endpoint → Check Layer 4
   - Sync endpoint → Check Layer 5
   - Client model/fromJson → Check Layer 6
3. Any layer with 0 hits after search → FAIL
```

## Anti-patterns

### Trusting Compilation

```
# BAD — "it compiles, so the field must be everywhere"
*C# compiles fine because projections use anonymous types*
*The field is silently null in the API response*
*Nobody notices for 3 weeks*

# GOOD — explicit layer-by-layer verification
*Fill out the 6-layer checklist with file paths*
*grep_search confirms the field appears in all projections*
```

### Partial Propagation

```
# BAD — adding the field to Entity + DTO but forgetting the sync projection
*Offline users never see the new field*
*Online users see it fine*
*Bug is environment-specific and hard to reproduce*

# GOOD — checklist catches the gap before commit
Layer 5 (Sync Pipeline): ❌ MISSING in SyncEndpoint.cs projection
→ Fix before proceeding
```

## Decision Guide

| Scenario | Action |
|----------|--------|
| Adding a new property to an entity | Run full 6-layer checklist |
| Renaming a property | Run full 6-layer checklist (rename must propagate) |
| Changing a property type | Run full 6-layer checklist (type change must propagate) |
| Removing a property | Run full 6-layer checklist (removal must propagate, check for compile errors) |
| Adding a computed/derived property | Layers 3-6 only (no DB column) |
| Adding a DB-only metadata column | Layers 1-2 only (not exposed in API) |
