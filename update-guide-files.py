#!/usr/bin/env python3
"""Copy the current files into GUIDE.html.

Every <pre data-file="deploy/..."> block in the guide shows one file of this
repository. After changing a file, run this so the guide shows the same text:

  python3 update-guide-files.py
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
guide = ROOT / "GUIDE.html"


def fill(match):
    text = (ROOT / match.group(2)).read_text().rstrip("\n")
    return f"{match.group(1)}<code>{html.escape(text, quote=False)}</code></pre>"


old = guide.read_text()
new, count = re.subn(r'(<pre data-file="([^"]+)">)<code>.*?</code></pre>', fill, old, flags=re.S)
guide.write_text(new)
print(f"{count} file blocks, {'updated' if new != old else 'already up to date'}")
