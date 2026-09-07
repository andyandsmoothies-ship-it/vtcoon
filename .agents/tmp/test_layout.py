import sys
import zlib
import urllib.request
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def encode_plantuml(text):
    zlibbed = zlib.compress(text.encode('utf-8'))[2:-4]
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
        res.append(mapping[c1] + mapping[c2] + (mapping[c3] if i+1 < len(zlibbed) else "") + (mapping[c4] if i+2 < len(zlibbed) else ""))
    return "".join(res)

with open("docs/domain/use_cases.puml", "r", encoding="utf-8") as f:
    orig = f.read()

encoded = encode_plantuml(orig)
url = f"http://www.plantuml.com/plantuml/svg/~1{encoded}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    svg = resp.read().decode('utf-8')
    width = re.search(r'width="([^"]+)"', svg)
    height = re.search(r'height="([^"]+)"', svg)
    print(f"Original layout: width={width.group(1) if width else '?'}, height={height.group(1) if height else '?'}")

# Test with left to right direction
lr_text = orig.replace("title VTCoOn", "left to right direction\ntitle VTCoOn")
encoded_lr = encode_plantuml(lr_text)
url_lr = f"http://www.plantuml.com/plantuml/svg/~1{encoded_lr}"
req = urllib.request.Request(url_lr, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    svg_lr = resp.read().decode('utf-8')
    width_lr = re.search(r'width="([^"]+)"', svg_lr)
    height_lr = re.search(r'height="([^"]+)"', svg_lr)
    print(f"Left-to-right layout: width={width_lr.group(1) if width_lr else '?'}, height={height_lr.group(1) if height_lr else '?'}")
