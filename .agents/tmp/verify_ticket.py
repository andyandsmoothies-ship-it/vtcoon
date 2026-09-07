import re

with open('issues/GAME-S00-walking-skeleton.md', encoding='utf-8') as f:
    content = f.read()

lines = len(content.splitlines())
print(f"Total lines: {lines}")

zone3 = ['JWT', 'SQL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'bcrypt', 'SMTP', 'regex', 'HTTP GET', 'HTTP POST']
found = [kw for kw in zone3 if kw.lower() in content.lower()]
print(f"Zone 3 violations: {found if found else 'None'}")
