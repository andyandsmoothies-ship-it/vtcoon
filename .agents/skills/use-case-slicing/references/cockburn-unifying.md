# Unifying User Stories, Use Cases, and Story Maps

This document summarizes key concepts from Alistair Cockburn's presentation on unifying requirements artifacts. It should be used to provide deeper context on how to slice use cases down into implementable user stories.

## Core Definitions
1. **User Story**: A tag for what a user considers a "sign of progress" on system development. Not a complete spec; lives in conversation. Great for tracking work.
2. **Use Case**: An enumeration of all the ways for a user to achieve a goal (with failures). A full spec of behavior. Great for discovering oddball/edge cases.
3. **Story Map**: A 2D card layout showing processes Left-to-Right (The Backbone/Main Scenario) and priorities vertically down (The Details/Extensions). Great as a conversation-holder showing both large-scale context and fine-grained stories.

## The 8 Concepts for Unification
To unify these practices successfully, you must understand:
1. **Verbs imply durations**: "Place an order" is a bigger verb than "Enter payment details."
2. **Decompose verbs into 'smaller' (shorter duration) verbs**: 
    - *Sea-level*: The main user goal (e.g., "Register for Courses").
    - *Fish-level*: Subfunctions (e.g., "Identify customer").
    - *Clam-level*: Tiny data-entry tasks.
3. **Manage precision**: Do not over-specify data, UI, or performance inside a behavioral use case.
4. **Decompose everything, not just the verbs**: Break down the UI, the data models, and the security rules outside of the Use Case narrative itself.
5. **Write jointly**: Business & Dev must collaborate.
6. **Write from the user's perspective**.
7. **Write just the needs, not the encyclopedia**: Avoid bloat.
8. **Sacrifice perfection for readability**: The goal is shared understanding, not a perfect legal contract.

## How to Decompose a Use Case into User Stories
- **For Use Cases**: Do NOT decompose below the "Fish level" (subfunctions). Keep the Use Case shape intact (Main scenario + Extensions).
- **For User Stories**: Decompose down to the "Clam level" as needed for Jira/iteration planning.

**The Slicing Rule for User Stories:**
1. Choose the *thinnest full transaction* (the shortest path through the Main Scenario) as Slice 1. (This creates the "walking skeleton").
2. Choose any action/extension that fits an iteration as subsequent slices.
3. Subset any action/extension until it's small enough.

## The Story Map as the Bridge
A Story Map is the physical intersection of Use Cases and User Stories:
- The **Top Row (Backbone)** shows the overall process (This IS the Use Case's Main Success Scenario).
- Each **Column** has all the user stories needed to deliver the epics (This IS the slicing of the Use Case Extensions, failures, data variations, and sub-tasks).
