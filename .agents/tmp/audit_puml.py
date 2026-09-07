import re
import sys
import zlib
import urllib.request
import urllib.parse

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def encode_plantuml(plantuml_text):
    """Encode PlantUML text into plantuml url format."""
    zlibbed = zlib.compress(plantuml_text.encode('utf-8'))[2:-4]
    mapping = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
    res = []
    for i in range(0, len(zlibbed), 3):
        b1 = zlibbed[i]
        b2 = zlibbed[i+1] if i+1 < len(zlibbed) else 0
        b3 = zlibbed[i+2] if i+2 < len(zlibbed) else 0
        
        c1 = b1 >> 2
        c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
        c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
        c4 = b3 & 0x3F
        
        res.append(mapping[c1])
        res.append(mapping[c2])
        if i + 1 < len(zlibbed):
            res.append(mapping[c3])
        if i + 2 < len(zlibbed):
            res.append(mapping[c4])
    return "".join(res)

def audit_puml(file_path):
    print(f"--- Auditing: {file_path} ---")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        lines = content.splitlines()

    print(f"Total lines: {len(lines)}")
    if len(lines) > 400:
        print(f"WARNING: File exceeds 400 lines limit! ({len(lines)})")
    else:
        print(f"Budget check PASSED ({len(lines)} <= 400 lines)")

    has_start = any(line.strip().startswith("@startuml") for line in lines)
    has_end = any(line.strip().startswith("@enduml") for line in lines)
    print(f"@startuml found: {has_start}, @enduml found: {has_end}")

    # Check UC IDs
    uc_defs = re.findall(r'usecase\s+"(UC-GAME-\d+):\s+([^"]+)"\s+as\s+(\w+)', content)
    print(f"Total use cases defined: {len(uc_defs)}")
    
    uc_ids = [m[0] for m in uc_defs]
    uc_names = [m[1] for m in uc_defs]
    uc_aliases = {m[2]: (m[0], m[1]) for m in uc_defs}

    # Check for duplicate IDs
    seen = set()
    duplicates = [x for x in uc_ids if x in seen or seen.add(x)]
    if duplicates:
        print(f"Duplicate UC IDs found: {duplicates}")
    else:
        print("No duplicate UC IDs.")

    # Check sequential numbering
    nums = [int(re.search(r'\d+', x).group(0)) for x in uc_ids]
    expected_nums = list(range(1, len(uc_ids) + 1))
    if nums == expected_nums:
        print(f"Sequential ID check PASSED: UC-GAME-001 to UC-GAME-{len(uc_ids):03d}")
    else:
        print(f"ID sequencing discrepancy: {nums}")

    # Check for UI forbidden words
    forbidden_ui = ["bấm", "nút", "click", "modal", "popup", "màn hình", "nhấn"]
    violations = 0
    for ucid, name in zip(uc_ids, uc_names):
        lower_name = name.lower()
        for fword in forbidden_ui:
            if fword in lower_name:
                print(f"FORBIDDEN UI WORD '{fword}' in {ucid}: {name}")
                violations += 1
    if violations == 0:
        print("Forbidden UI word check PASSED (0 violations)")

    # Check packages
    packages = re.findall(r'package\s+"([^"]+)"\s+as\s+(\w+)\s+\{([^}]+)\}', content, re.DOTALL)
    print(f"Packages found: {len(packages)}")
    for pkg_name, pkg_alias, pkg_body in packages:
        pkg_ucs = re.findall(r'usecase\s+"(UC-GAME-\d+)', pkg_body)
        print(f"  Package '{pkg_name}': {len(pkg_ucs)} use cases ({pkg_ucs[0]} - {pkg_ucs[-1]})")

    # Check actors
    actors = re.findall(r'actor\s+"([^"]+)"\s+as\s+(\w+)', content)
    print(f"Actors found: {len(actors)}")
    for aname, aalias in actors:
        clean_name = aname.split('\n')[0].strip()
        print(f"  Actor: '{clean_name}' as {aalias}")

    # Check undefined aliases used in relations
    arrows = re.findall(r'(\w+)\s*([.-]+>|<-[.-]+)\s*(\w+)', content)
    all_defined = set(uc_aliases.keys()) | {aalias for aname, aalias in actors}
    undefined = []
    for src, arr, dst in arrows:
        if src not in all_defined:
            undefined.append(src)
        if dst not in all_defined:
            undefined.append(dst)
    if undefined:
        print(f"Undefined aliases in relationships: {set(undefined)}")
    else:
        print("All relationship aliases are defined.")

    # Check extends and includes
    extends = re.findall(r'(\w+)\s*\.\.>\s*(\w+)\s*:\s*<<extend>>', content)
    includes = re.findall(r'(\w+)\s*\.\.>\s*(\w+)\s*:\s*<<include>>', content)
    print(f"Total <<extend>> relations: {len(extends)}")
    print(f"Total <<include>> relations: {len(includes)}")

    # Test server compilation
    encoded = encode_plantuml(content)
    test_url = f"http://www.plantuml.com/plantuml/svg/~1{encoded}"
    try:
        req = urllib.request.Request(test_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            svg_content = response.read().decode('utf-8', errors='ignore')
            if "<svg" in svg_content:
                if "Syntax Error" in svg_content or "Error line" in svg_content:
                    print("PLANTUML SYNTAX ERROR in online render!")
                else:
                    width = re.search(r'width="([^"]+)"', svg_content)
                    height = re.search(r'height="([^"]+)"', svg_content)
                    print(f"SUCCESS: PlantUML compiled and rendered SVG successfully! ({width.group(1)} x {height.group(1)})")
            else:
                print(f"Response received but SVG tag not found.")
    except Exception as e:
        print(f"Online server check note: {e}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "docs/domain/use_cases.puml"
    audit_puml(target)
