---
name: skill-dispatcher
description: Coordinates and dispatches specialized domain skills from the local backup warehouse into the project workspace on demand.
---
# LOCAL SKILL DISPATCHER

When specialized technical skills are required (Docker, PostgreSQL, React, TypeScript, TDD, Slicing):
1. Check if `.agents/skills/<skill-name>` already exists in the project workspace.
2. If absent, copy the skill directory from `%USERPROFILE%\Documents\GitHub\backup\skills_backup\<skill-name>` into `.agents/skills/<skill-name>`.
3. If the skill is an official Google Cloud skill, fetch via `npx skills add google/skills <skill-name>`.
4. Immediately load and apply the skill instructions to the active session.
