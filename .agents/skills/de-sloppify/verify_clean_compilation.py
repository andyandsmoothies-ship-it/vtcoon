"""
verify_clean_compilation.py — De-Sloppify Hard Gate
====================================================
Usage:
    python .agents/scripts/verify_clean_compilation.py [project_path]

Arguments:
    project_path  Optional. Path to the .NET solution or project to build.
                  Defaults to the current working directory.

Exit Codes:
    0  — Build succeeded with 0 errors and 0 warnings.
    1  — Build failed, or warnings were found.

Design Rules:
    - Never crashes: all subprocess calls are in try/except.
    - Parses dotnet build output via regex, never assumes line count.
    - Reports every error and warning with file + line context.
"""

import subprocess
import sys
import os
import re

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

# Patterns for .NET build output lines
ERROR_PATTERN   = re.compile(r"\s+(\d+)\s+Error\(s\)", re.IGNORECASE)
WARNING_PATTERN = re.compile(r"\s+(\d+)\s+Warning\(s\)", re.IGNORECASE)

# Inline diagnostic line: path(line,col): error/warning CSxxxx
DIAG_LINE_PATTERN = re.compile(
    r"^(?P<file>.+?)\((?P<line>\d+),(?P<col>\d+)\)\s*:\s*(?P<severity>error|warning)\s+(?P<code>\w+)\s*:\s*(?P<msg>.+)$",
    re.IGNORECASE,
)


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def find_solution_file(base_dir: str) -> str | None:
    """Finds the first .sln file in base_dir, or returns None."""
    try:
        for name in os.listdir(base_dir):
            if name.lower().endswith(".sln"):
                return os.path.join(base_dir, name)
    except OSError:
        pass
    return None


def run_build(target_path: str) -> tuple[int, str]:
    """
    Runs `dotnet build` on target_path.
    Returns (return_code, combined_stdout+stderr).
    Never raises — all errors are caught and reported.
    """
    cmd = ["dotnet", "build", target_path, "--no-incremental", "-v", "minimal"]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
        )
        combined = result.stdout + result.stderr
        return result.returncode, combined
    except FileNotFoundError:
        return 1, "FATAL: 'dotnet' command not found. Ensure .NET SDK is installed and on PATH."
    except subprocess.TimeoutExpired:
        return 1, "FATAL: 'dotnet build' timed out after 120 seconds."
    except Exception as exc:
        return 1, f"FATAL: Unexpected error running dotnet build: {exc}"


def parse_diagnostics(output: str) -> tuple[int, int, list[str]]:
    """
    Parses dotnet build output for error/warning counts and diagnostic lines.
    Returns (error_count, warning_count, list_of_diagnostic_strings).
    """
    errors = 0
    warnings = 0
    diagnostic_lines = []

    for line in output.splitlines():
        em = ERROR_PATTERN.search(line)
        if em:
            errors = max(errors, int(em.group(1)))

        wm = WARNING_PATTERN.search(line)
        if wm:
            warnings = max(warnings, int(wm.group(1)))

        dm = DIAG_LINE_PATTERN.match(line.strip())
        if dm:
            severity = dm.group("severity").upper()
            code     = dm.group("code")
            msg      = dm.group("msg").strip()
            file_    = os.path.basename(dm.group("file"))
            lineno   = dm.group("line")
            diagnostic_lines.append(f"  {severity} {code} @ {file_}:{lineno} — {msg}")

    return errors, warnings, diagnostic_lines


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    project_path = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()

    # Prefer .sln if path is a directory
    if os.path.isdir(project_path):
        sln = find_solution_file(project_path)
        if sln:
            project_path = sln

    print(f"\n{'='*60}")
    print(f"  verify_clean_compilation.py — De-Sloppify Hard Gate")
    print(f"  Target : {project_path}")
    print(f"{'='*60}\n")

    if not os.path.exists(project_path):
        print(f"❌ FATAL: Path does not exist: {project_path}")
        sys.exit(1)

    print("  Running: dotnet build (this may take a moment)...\n")
    return_code, output = run_build(project_path)

    errors, warnings, diagnostics = parse_diagnostics(output)

    # Print every diagnostic found for full transparency
    if diagnostics:
        print("  Diagnostics found:")
        for d in diagnostics:
            print(d)
        print()

    print(f"  Result  : {'PASSED' if return_code == 0 else 'FAILED'}")
    print(f"  Errors  : {errors}")
    print(f"  Warnings: {warnings}")
    print(f"\n{'='*60}")

    if return_code != 0:
        print(f"\n❌ FAILED — Build returned a non-zero exit code ({return_code}).")
        print("  Fix all build errors before declaring de-sloppify complete.\n")
        sys.exit(1)

    if errors > 0:
        print(f"\n❌ FAILED — {errors} error(s) reported.")
        print("  All errors must be resolved.\n")
        sys.exit(1)

    if warnings > 0:
        print(f"\n❌ FAILED — {warnings} warning(s) found.")
        print("  De-sloppify requires a ZERO-WARNING build.")
        print("  Fix every warning listed above, then re-run this gate.\n")
        sys.exit(1)

    print("\n✅ ALL CHECKS PASSED — Build is clean: 0 errors, 0 warnings.\n")
    sys.exit(0)


if __name__ == "__main__":
    main()
