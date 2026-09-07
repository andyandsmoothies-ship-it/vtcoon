import os
import shutil

temp_dir = os.environ.get('TEMP', os.environ.get('TMP', 'C:\\temp'))
temp_path = os.path.join(temp_dir, 'handoff_vtcoon_20260907.md')
src_path = os.path.join('docs', 'reports', 'handoff', 'handoff_20260907_155800.md')

shutil.copyfile(src_path, temp_path)
print(f"Handoff successfully copied to: {temp_path}")
