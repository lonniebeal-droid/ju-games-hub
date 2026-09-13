#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from hashlib import sha256
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os, threading, urllib.request, sys

ROOT = Path.home() / "Documents/JU-Games-Hub"
LIL_SOURCE = Path.home() / "Documents/JU-Lil-Steppers/app/dist/index.html"
REQUIRED = [
    ROOT / "index.html",
    ROOT / "spades/index.html",
    ROOT / "lil-steppers/index.html",
    ROOT / "hustlebound/index.html",
    ROOT / "downloads/HUSTLEBOUND-JU-ATL-Pixel.apk",
]

errors = []
for path in REQUIRED:
    if not path.is_file():
        errors.append(f"missing required file: {path}")

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.hrefs = []
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            href = dict(attrs).get("href")
            if href: self.hrefs.append(href)
if not errors:
    html = (ROOT / "index.html").read_text(errors="ignore")
    parser = LinkParser(); parser.feed(html)
    for href in parser.hrefs:
        if href.startswith(("http", "#", "mailto:", "tel:")):
            continue
        target = ROOT / href.lstrip("./")
        if target.is_dir(): target = target / "index.html"
        if not target.exists(): errors.append(f"broken local link: {href}")

spades = ROOT / "spades/index.html"
if spades.is_file():
    st = spades.read_text(errors="ignore")
    if "location.search.includes('selftest=1')" not in st or "document.body.dataset.selftest" not in st:
        errors.append("Spades automated self-test hook missing")

lil = ROOT / "lil-steppers/index.html"
if lil.is_file():
    lt = lil.read_text(errors="ignore")
    for marker in ["Blessing", "function confetti", "class=\"road\"", "cloud c1"]:
        if marker not in lt:
            errors.append(f"Lil Steppers current graphics marker missing: {marker}")
else:
    errors.append("Lil Steppers hub build missing")

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_): pass

class QuietServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        pass
cwd = os.getcwd()
try:
    os.chdir(ROOT)
    server = QuietServer(("127.0.0.1", 0), Quiet)
    thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
    port = server.server_port
    for route in ["/", "/spades/", "/lil-steppers/", "/hustlebound/", "/downloads/HUSTLEBOUND-JU-ATL-Pixel.apk"]:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}{route}", timeout=5) as response:
                if response.status != 200:
                    errors.append(f"HTTP {response.status}: {route}")
        except Exception as exc:
            errors.append(f"HTTP failure {route}: {exc}")
finally:
    if 'server' in locals(): server.shutdown(); server.server_close()
    os.chdir(cwd)

if errors:
    print("JU_GAMES_HUB_VERIFY=FAIL")
    for err in errors: print("-", err)
    sys.exit(1)
print("JU_GAMES_HUB_VERIFY=PASS")
print("required_files=PASS local_links=PASS spades_marker=PASS")
print("lil_steppers_current_markers=PASS http_routes=PASS")
