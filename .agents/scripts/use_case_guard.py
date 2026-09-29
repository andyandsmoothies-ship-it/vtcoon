"""
Use Case & Safety Quality Gate Script (Antigravity 2.0 Hook IPC Conforming)
Enforces deterministic mechanical guardrails:
1. Blocks forbidden Git mutation commands (AI must never commit/push/merge).
2. Blocks shell redirection (AI must use native write/replace tools).
3. Enforces subagent role-based file sandboxes (qa-tester vs implementer).
4. Audits file line count budgets (warns if file > 400 lines).
5. Detects Zone 3 technical implementation leaks in Use Case specs.
6. Detects vague delegated decision words (The Blank Check) in specs.
7. Verifies traceability tags in test files.
8. Stop Gate: Prevents completion if modified UI files violate Impeccable craft rules.
"""

import json
import os
import re
import subprocess
import sys

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def find_repo_root():
    curr = os.path.abspath(os.path.dirname(__file__))
    while curr and os.path.dirname(curr) != curr:
        if os.path.exists(os.path.join(curr, "package.json")) and os.path.exists(os.path.join(curr, "scripts")):
            return curr
        curr = os.path.dirname(curr)
    return os.getcwd()

REPO_ROOT = find_repo_root()
TOUCHED_FILES_LOG = os.path.join(REPO_ROOT, ".agents", "tmp", "touched_files.txt")
LAST_TARGET_FILE_LOG = os.path.join(REPO_ROOT, ".agents", "tmp", "last_target_file.txt")
LEGACY_TOUCHED_LOG = os.path.join(REPO_ROOT, ".agents", ".agents", "tmp", "touched_files.txt")

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

FORBIDDEN_SHELL_REDIRECTS = [
    r">\s*[\w\.\/\\]+",
    r">>\s*[\w\.\/\\]+",
    r"\bOut-File\b",
    r"\bSet-Content\b",
]

TEST_DIR_PATTERNS = ["/tests/", "/test/", "/spec/", "/__tests__/", ".test.", ".spec.", "_test."]
SRC_DIR_PATTERNS = ["/src/", "/lib/", "/app/", "/internal/", "/pkg/", "/core/"]


def read_hook_payload() -> dict:
    """Reads JSON hook context from stdin (AG 2.0 protojson IPC) without hanging."""
    if sys.stdin.isatty():
        return {}

    # Check if data is available on stdin to prevent indefinite blocking
    if sys.platform == "win32":
        try:
            import msvcrt
            import ctypes
            import time
            handle = msvcrt.get_osfhandle(sys.stdin.fileno())
            avail = ctypes.c_ulong()
            has_data = False
            for _ in range(5):
                res = ctypes.windll.kernel32.PeekNamedPipe(
                    handle, None, 0, None, ctypes.byref(avail), None
                )
                if res and avail.value > 0:
                    has_data = True
                    break
                time.sleep(0.02)
            if not has_data:
                return {}
        except Exception:
            return {}
    else:
        try:
            import select
            r, _, _ = select.select([sys.stdin], [], [], 0.1)
            if not r:
                return {}
        except Exception:
            return {}

    try:
        raw = sys.stdin.read().strip()
        if raw:
            return json.loads(raw)
    except Exception:
        pass
    return {}


def record_target_file(target_file: str) -> None:
    """Tracks target file path for post-tool and stop-gate verification."""
    if not target_file:
        return
    try:
        os.makedirs(os.path.dirname(TOUCHED_FILES_LOG), exist_ok=True)
        with open(LAST_TARGET_FILE_LOG, "w", encoding="utf-8") as f:
            f.write(target_file)
        with open(TOUCHED_FILES_LOG, "a", encoding="utf-8") as f:
            f.write(target_file + "\n")
    except Exception:
        pass


def check_command(payload: dict) -> None:
    """PreToolUse: Inspects CLI commands to block Git mutations and shell redirection."""
    cmd = ""
    if payload:
        tool_call = payload.get("toolCall", {})
        cmd = tool_call.get("args", {}).get("CommandLine", "")

    if not cmd:
        cmd = os.environ.get("AG_TOOL_COMMAND", "") or (
            " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
        )

    # Rule 5 Source Control Safety: Block ALL Git executions unconditionally
    if re.search(r"\bgit(\.exe)?(\s+|$)", cmd, re.IGNORECASE):
        reason = (
            "ERROR [Safety Gate]: Prohibited command detected: 'git'. "
            "AI is strictly forbidden from executing any Git commands. Source control is strictly human-controlled."
        )
        print(json.dumps({"decision": "deny", "reason": reason}))
        sys.exit(0)

    for pattern in FORBIDDEN_SHELL_REDIRECTS:
        if re.search(pattern, cmd, re.IGNORECASE):
            reason = (
                "ERROR [Safety Gate]: Shell redirection detected. "
                "AI must use native write_to_file or replace_file_content instead of shell redirects."
            )
            print(json.dumps({"decision": "deny", "reason": reason}))
            sys.exit(0)

    print(json.dumps({"decision": "allow"}))
    sys.exit(0)


def pre_tool_file_gate(payload: dict, role: str = "") -> None:
    """PreToolUse: Enforces role sandbox and registers target file before edit."""
    target_file = ""
    if payload:
        tool_call = payload.get("toolCall", {})
        target_file = tool_call.get("args", {}).get("TargetFile", "")

    if not target_file:
        target_file = os.environ.get("AG_TOOL_TARGET_FILE", "") or (
            sys.argv[3] if len(sys.argv) > 3 else (sys.argv[2] if len(sys.argv) > 2 else "")
        )

    record_target_file(target_file)

    if role and target_file:
        norm_path = "/" + target_file.replace("\\", "/").lstrip("/")
        if role in ("qa-tester", "chaos-sentinel") and any(p in norm_path for p in SRC_DIR_PATTERNS):
            reason = (
                f"ERROR [Role Gate]: {role} is strictly forbidden from modifying production code: '{target_file}'. "
                "Only test files or probe artifacts in tests/** or .agents/** are permitted."
            )
            print(json.dumps({"decision": "deny", "reason": reason}))
            sys.exit(0)

        if role == "implementer" and any(p in norm_path for p in TEST_DIR_PATTERNS):
            reason = (
                f"ERROR [Role Gate]: implementer is forbidden from modifying test contracts: '{target_file}'. "
                "Test contracts are authoritatively locked by qa-tester."
            )
            print(json.dumps({"decision": "deny", "reason": reason}))
            sys.exit(0)

    print(json.dumps({"decision": "allow"}))
    sys.exit(0)


def get_tier_budget(file_path: str) -> dict:
    norm = file_path.replace("\\", "/")
    if "/tests/" in norm or ".test." in norm or ".spec." in norm:
        return {"name": "Contract / Unit Tests", "ceiling": 600, "warn": 500}
    if norm.endswith(".md") or "/docs/" in norm:
        return {"name": "Documentation / Meta", "ceiling": 9999, "warn": 1000}
    if any(k in norm for k in ["tile_icons.ts", "property_manager_data.ts", "board_config.ts", "property_data.ts"]):
        return {"name": "Tier 3 (Static Data/Config)", "ceiling": 800, "warn": 650}
    if "/src/client/ui/" in norm or "/src/client/3d/" in norm or norm.endswith(".tsx"):
        return {"name": "Tier 2 (UI/3D/Views)", "ceiling": 500, "warn": 400}
    return {"name": "Tier 1 (Domain/Server/Logic)", "ceiling": 400, "warn": 300}


def audit_file(payload: dict) -> None:
    """PostToolUse: Audits file modifications for budget, zone leaks, and traceability tags."""
    target_file = ""
    if payload:
        tool_call = payload.get("toolCall", {})
        target_file = tool_call.get("args", {}).get("TargetFile", "")

    if not target_file and os.path.exists(LAST_TARGET_FILE_LOG):
        try:
            with open(LAST_TARGET_FILE_LOG, "r", encoding="utf-8") as f:
                target_file = f.read().strip()
        except Exception:
            pass

    if not target_file:
        target_file = os.environ.get("AG_TOOL_TARGET_FILE", "") or (
            sys.argv[2] if len(sys.argv) > 2 else ""
        )

    if target_file and os.path.exists(target_file):
        with open(target_file, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()

        line_count = len(lines)
        norm_path = target_file.replace("\\", "/")

        # 1. Tier-aware file line budget check (GEMINI.md alignment)
        budget = get_tier_budget(norm_path)
        if line_count > budget["ceiling"]:
            print(
                f"ERROR [Budget Overflow]: '{target_file}' has {line_count} lines (ceiling for {budget['name']} is {budget['ceiling']} lines). "
                "Task MUST extract submodules to comply with GEMINI.md.",
                file=sys.stderr,
            )
        elif line_count >= budget["warn"]:
            print(
                f"WARNING [Budget Warning]: '{target_file}' has {line_count} lines (approaching {budget['name']} ceiling {budget['ceiling']} lines, warn threshold is {budget['warn']}).",
                file=sys.stderr,
            )

        # 2. Spec file checks for Zone 3 leaks and Vague words
        if "/docs/epics/" in norm_path and norm_path.endswith(".md") and ("UC-" in norm_path or "spec_" in norm_path):
            content = "".join(lines)
            for pattern in ZONE_3_BLOCKLIST:
                match = re.search(pattern, content, re.IGNORECASE)
                if match:
                    print(f"ERROR [Zone 3 Leak]: Detected forbidden technical mechanism: '{match.group(0)}'", file=sys.stderr)

            for pattern in VAGUE_WORDS_BLOCKLIST:
                match = re.search(pattern, content, re.IGNORECASE)
                if match:
                    print(f"ERROR [The Blank Check]: Detected vague decision word: '{match.group(0)}'", file=sys.stderr)

        # 3. Test file traceability tag check
        if "/tests/" in norm_path or norm_path.endswith(".test.ts") or norm_path.endswith("_test.py") or norm_path.endswith(".spec.ts"):
            content = "".join(lines)
            if not re.search(r"\[UC-[A-Z0-9]+-\d+", content):
                print(f"WARNING [Traceability]: Test file '{target_file}' lacks required traceability tag [UC-[EPIC]-NNN].", file=sys.stderr)

        # 4. Source code micro-guards for src/
        if "/src/" in norm_path or "/lib/" in norm_path or "/app/" in norm_path:
            content = "".join(lines)
            if re.search(r"catch\s*\([^)]*\)\s*\{\s*\}", content) or re.search(r"except\s*:\s*pass\b", content):
                print(
                    f"WARNING [Lean Observability]: Empty catch/except block detected in '{target_file}'. "
                    "Forbidden silent error swallowing.",
                    file=sys.stderr,
                )
            if re.search(r"\bdebugger\s*;", content):
                print(f"WARNING [Slop]: 'debugger;' statement detected in '{target_file}'. Remove before commit.", file=sys.stderr)
            if re.search(r"\bconsole\.log\(", content) and not norm_path.endswith((".test.ts", ".spec.ts")):
                print(f"INFO [Slop]: Raw 'console.log' detected in '{target_file}'. Prefer structured logging for state transitions.", file=sys.stderr)

    # PostToolUse expects empty JSON on stdout
    print(json.dumps({}))
    sys.exit(0)


def stop_gate(payload: dict) -> None:
    """Stop Hook: Verifies modified UI files conform to Impeccable craft rules before concluding."""
    touched = []
    for log_path in [TOUCHED_FILES_LOG, LEGACY_TOUCHED_LOG]:
        if os.path.exists(log_path):
            try:
                with open(log_path, "r", encoding="utf-8") as f:
                    touched.extend([line.strip() for line in f if line.strip()])
            except Exception:
                pass

    if not touched:
        print(json.dumps({}))
        sys.exit(0)

    ui_touched = any(
        ("src/client/" in p.replace("\\", "/") or "src\\client\\" in p)
        for p in touched
    )

    if ui_touched:
        try:
            lint_script = os.path.join(REPO_ROOT, "scripts", "lint_ui.mjs")
            res = subprocess.run(
                ["node", lint_script],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                cwd=REPO_ROOT,
                stdin=subprocess.DEVNULL,
            )
            if res.returncode != 0:
                reason = (
                    "Quality Gate Check Failed: Impeccable UI craft violations detected. "
                    f"Please fix all anti-patterns before stopping.\n{res.stdout}\n{res.stderr}"
                )
                print(json.dumps({"decision": "continue", "reason": reason}))
                sys.exit(0)
        except Exception as e:
            print(f"WARNING [Stop Gate]: Failed to execute lint_ui: {e}", file=sys.stderr)

    # Clean up touched files log once stop gate passes
    for log_path in [TOUCHED_FILES_LOG, LAST_TARGET_FILE_LOG, LEGACY_TOUCHED_LOG]:
        try:
            if os.path.exists(log_path):
                os.remove(log_path)
        except Exception:
            pass

    print(json.dumps({}))
    sys.exit(0)


if __name__ == "__main__":
    if len(sys.argv) <= 1 or sys.argv[1] in ("--status", "--self-check", "-h", "--help"):
        print("🛡️ [use_case_guard] Antigravity 2.0 Quality Gate Hook is ACTIVE.")
        print(f"📁 Repository Root: {REPO_ROOT}")
        print(f"📝 Touched Log: {TOUCHED_FILES_LOG}")
        print("✅ Guardrails: Git Command Blocker, Shell Redirect Blocker, Tier-Aware LOC Budget, Impeccable UI Stop Gate.")
        sys.exit(0)

    payload = read_hook_payload()
    mode = sys.argv[1]

    if mode == "--check-command":
        check_command(payload)
    elif mode == "--pre-tool-file":
        role_arg = sys.argv[2] if len(sys.argv) > 2 else ""
        pre_tool_file_gate(payload, role=role_arg)
    elif mode == "--audit-file":
        audit_file(payload)
    elif mode == "--role":
        role_arg = sys.argv[2] if len(sys.argv) > 2 else ""
        pre_tool_file_gate(payload, role=role_arg)
    elif mode == "--stop-gate":
        stop_gate(payload)
    else:
        # Fallback allow
        print(json.dumps({"decision": "allow"}))
        sys.exit(0)
