"""
Use Case & Safety Quality Gate Script
Enforces deterministic mechanical guardrails:
1. Blocks forbidden Git mutation commands (AI must never commit/push/merge).
2. Audits file line count budgets (warns if file > 400 lines).
3. Detects Zone 3 technical implementation leaks in Use Case specs.
4. Detects vague delegated decision words (The Blank Check) in specs.
5. Verifies traceability tags in test files.
"""

import os
import re
import sys

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

ZONE_3_BLOCKLIST = [
    r"\bJWT\b",
    r"\bSQL\b",
    r"\bSELECT\b",
    r"\bINSERT\b",
    r"\bUPDATE\b",
    r"\bDELETE\s+FROM\b",
    r"\bbcrypt\b",
    r"\bsalt\b",
    r"\bSMTP\b",
    r"\bHTTP\s+(GET|POST|PUT|DELETE)\b",
    r"\bregex\b",
    r"\bException\b",
]

VAGUE_WORDS_BLOCKLIST = [
    r"\bappropriately\b",
    r"\bhandles\s+the\s+error\b",
    r"\betc\.?\b",
    r"\band\s+so\s+on\b",
    r"\bshows?\s+the\s+relevant\s+data\b",
    r"\bas\s+needed\b",
]

FORBIDDEN_GIT_COMMANDS = [
    "git commit",
    "git push",
    "git merge",
    "git rebase",
    "git cherry-pick",
]


def check_command() -> None:
    """Inspects CLI commands before execution to prevent source control mutation."""
    cmd = os.environ.get("AG_TOOL_COMMAND", "") or (
        " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
    )
    cmd_lower = cmd.lower()
    for forbidden in FORBIDDEN_GIT_COMMANDS:
        if forbidden in cmd_lower:
            print(
                f"ERROR [Safety Gate]: Prohibited command detected: '{forbidden}'. "
                "AI is forbidden from modifying Git history directly. The human user controls Git."
            )
            sys.exit(1)


def audit_file() -> None:
    """Audits file modifications for budget, zone leaks, and traceability tags."""
    target_file = os.environ.get("AG_TOOL_TARGET_FILE", "") or (
        sys.argv[2] if len(sys.argv) > 2 else ""
    )
    if not target_file or not os.path.exists(target_file):
        return

    with open(target_file, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    line_count = len(lines)
    norm_path = target_file.replace("\\", "/")

    # 1. File line budget check (>400 lines)
    if line_count > 400:
        print(
            f"WARNING [Budget]: {target_file} has {line_count} lines (budget limit is 400 lines). "
            "Extract logic into smaller modular files."
        )

    # 2. Spec file checks for Zone 3 leaks and Vague words
    if "/docs/epics/" in norm_path and norm_path.endswith(".md") and ("UC-" in norm_path or "spec_" in norm_path):
        content = "".join(lines)
        for pattern in ZONE_3_BLOCKLIST:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                print(f"ERROR [Zone 3 Leak]: Detected forbidden technical mechanism: '{match.group(0)}'")
                print("ACTION: Rewrite spec using observable behavior or reference docs/domain/entity_model.md.")
                sys.exit(1)

        for pattern in VAGUE_WORDS_BLOCKLIST:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                print(f"ERROR [The Blank Check]: Detected vague decision word: '{match.group(0)}'")
                print("ACTION: Specify exact concrete outcomes (state exact error message, field, or quantity).")
                sys.exit(1)

    # 3. Test file traceability tag check
    if "/tests/" in norm_path or norm_path.endswith(".test.ts") or norm_path.endswith("_test.py") or norm_path.endswith(".spec.ts"):
        content = "".join(lines)
        if not re.search(r"\[UC-[A-Z0-9]+-\d+", content):
            print(f"WARNING [Traceability]: Test file '{target_file}' lacks required traceability tag [UC-[EPIC]-NNN].")

    # 4. Source code micro-guards for src/ (Anti-Debug Slop & Anti-Silent Catch)
    if "/src/" in norm_path or "/lib/" in norm_path or "/app/" in norm_path:
        content = "".join(lines)
        # 4a. Anti-Silent Catch (Lean Observability)
        if re.search(r"catch\s*\([^)]*\)\s*\{\s*\}", content) or re.search(r"except\s*:\s*pass\b", content):
            print(
                f"WARNING [Lean Observability]: Empty catch/except block detected in '{target_file}'. "
                "Forbidden silent error swallowing. Rejections must emit structured logs or explicit reason codes."
            )
        # 4b. Anti-Debug Slop (console.log, debugger)
        if re.search(r"\bdebugger\s*;", content):
            print(f"WARNING [Slop]: 'debugger;' statement detected in '{target_file}'. Remove before commit.")
        if re.search(r"\bconsole\.log\(", content) and not norm_path.endswith((".test.ts", ".spec.ts")):
            print(f"INFO [Slop]: Raw 'console.log' detected in '{target_file}'. Prefer structured logging for state transitions.")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "--check-command":
        check_command()
    elif mode == "--audit-file":
        audit_file()
    else:
        print("Usage: python use_case_guard.py [--check-command <cmd>] | [--audit-file <filepath>]")
