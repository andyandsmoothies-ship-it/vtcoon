import re

with open('docs/epics/gameplay/_epic_ledger.md', encoding='utf-8') as f:
    content = f.read()

mapped_nums = sorted(set(int(x) for x in re.findall(r'UC-GAME-(\d+)', content)))
full = set(range(1, 59))
missing = full - set(mapped_nums)
print(f'Total mapped UCs : {len(mapped_nums)}')
print(f'Mapped IDs       : UC-GAME-{mapped_nums[0]:03d} to UC-GAME-{mapped_nums[-1]:03d}')
print(f'Missing UCs      : {sorted(missing) if missing else "None - All 58 covered"}')
print(f'LOC              : {len(content.splitlines())}')

# Zone 3 keyword check
ZONE3 = ['JWT', 'SQL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'bcrypt', 'SMTP', 'regex', 'HTTP GET', 'HTTP POST', 'token']
found = [kw for kw in ZONE3 if kw.lower() in content.lower()]
print(f'Zone 3 leaks     : {found if found else "None"}')
