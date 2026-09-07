"""
Context Offloader Utility Script
Compresses verbose command outputs (tests, linter, builds) into concise summaries (<10 lines)
to protect model context window from token exhaustion.
"""

import os
import sys

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")


def summarize_file(filepath: str, max_lines: int = 10) -> None:
    """Reads a large log file and prints a high-density summary under max_lines."""
    if not os.path.exists(filepath):
        print(f"Error: File not found: {filepath}")
        sys.exit(1)

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        lines = [line.strip() for line in f if line.strip()]

    total_lines = len(lines)
    errors = [line for line in lines if "error" in line.lower() or "fail" in line.lower()]
    warnings = [line for line in lines if "warn" in line.lower()]

    print(f"--- CONTEXT SUMMARY: {os.path.basename(filepath)} ---")
    print(f"Total Lines: {total_lines} | Errors: {len(errors)} | Warnings: {len(warnings)}")

    if errors:
        print("Key Errors (Top 5):")
        for err in errors[:5]:
            print(f"  • {err[:120]}")
    elif lines:
        print("Tail Output (Last 5 lines):")
        for line in lines[-5:]:
            print(f"  • {line[:120]}")
    else:
        print("Output was empty.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python context_offloader.py <log_file_path> [max_summary_lines]")
        sys.exit(0)

    target = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    summarize_file(target, limit)
