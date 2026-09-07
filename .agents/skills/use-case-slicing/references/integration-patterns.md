# Integration of Use Cases and User Stories

This document outlines 5 proven patterns for combining Use Cases (vision/structure) with User Stories (sprint execution), drawing from the "Reframing Use Cases" working group (Mike Cohn, Ivar Jacobson, etc.).

## Why Combine Them?
- **Use Cases** convey the "big picture" and structure the desired behavior, but do not make good backlog items because they vary wildly in implementation effort.
- **User Stories** are perfect for timeboxed iterations (sprints), but representing only fragments of a system, they struggle to convey the big picture. 

Combining them gives you the structure of Use Cases with the agility of User Stories.

## 5 Patterns for Integration

### Pattern 1: Brainstorm user stories directly from a use case
*Use when: You have a use case model (the goal and actors) but NO detailed narrative written.*
1. Agree on the Use Case (Name, System, Primary Actor, Goal).
2. Stakeholders brainstorm all user stories required to achieve the goal (including error handling).
3. Review, prioritize, and split stories (e.g., using SPIDR) to fit an iteration.
*Benefit: Fast, lightweight, keeps people focused on the high-level goal rather than getting lost in disjointed Jira tickets.*

### Pattern 2: Follow the extensions
*Use when: You already have a written Use-Case Narrative (Basic Scenario + Numbered Extensions).*
1. Create a user story to implement the **Basic Scenario**. If too large, create one story *per step* of the Basic Scenario.
2. For each **Extension** (alternate flow or error), create one or more candidate user stories.
3. Create stories to enforce any relaxed constraints (e.g., "handle negative numbers").
*Benefit: Traceability. Every user story traces back to a specific path in the business-approved Use Case.*

### Pattern 3: Slice my use case (Use-Case 3.0 Standard)
*Use when: You are practicing agile delivery with Use-Case 3.0.*
1. Identify the simplest path through the Basic Scenario.
2. Identify the **Test Cases** that confirm this functionality. This Scope + Tests = the first "Use-Case Slice".
3. Brainstorm User Stories to fulfill this Slice, using the Test Cases as Acceptance Criteria.
4. Repeat for enhancements to the Basic Scenario, and then for the Extensions.
*Benefit: True behavior-driven development. Slices group extensions into meaningful chunks for release planning, rather than treating them as 100 isolated stories.*

### Pattern 4: My use-case model emerges
*Use when: You have an existing system built only with User Stories, and you've lost the "Big Picture".*
1. Examine the software, tests, and old user stories.
2. Collaborate with product experts to reverse-engineer the high-level Use Cases.
3. Map existing system tests to these Use Cases to find missing test coverage or orphan code.
*Benefit: Regain architectural control and establish a permanent record of what the system actually does.*

### Pattern 5: Understand Your Epic
*Use when: You have a massive User Story ("Epic") that needs breaking down.*
1. Translate the Epic into a Use Case (Define the Goal, System, and Actors).
2. Write the Basic Scenario (the sequence of steps).
3. Brainstorm the alternate paths and failures (the Extensions).
4. Apply Pattern 2 or Pattern 3 to split this newly structured Use Case into digestible User Stories.
*Benefit: Gives vague Epics a rigorous structure before they hit the sprint backlog.*
