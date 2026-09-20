#!/usr/bin/env python3
import http.server, socketserver, subprocess, threading, time, pathlib, sys, os

ROOT = pathlib.Path(__file__).resolve().parents[1]
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

old = pathlib.Path.cwd()
try:
    os.chdir(ROOT)
    with socketserver.TCPServer(("127.0.0.1", 0), Quiet) as server:
        port = server.server_address[1]
        threading.Thread(target=server.serve_forever, daemon=True).start()
        time.sleep(.2)
        url = "http://127.0.0.1:%d/spades/?selftest=1" % port
        cp = subprocess.run([
            CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
            "--no-default-browser-check", "--virtual-time-budget=30000",
            "--dump-dom", url
        ], text=True, capture_output=True, timeout=30)
        dom = cp.stdout
        checks = {
            "chrome_exit": cp.returncode == 0,
            "selftest": 'data-selftest="PASS"' in dom,
            "difficulty": 'id="difficulty"' in dom and "Easy" in dom and "Pro" in dom,
            "career_stats": 'id="careerStats"' in dom,
        }
        for k, v in checks.items():
            print("%s=%s" % (k, "PASS" if v else "FAIL"))
        if not all(checks.values()):
            print(cp.stderr[-2000:])
            sys.exit(1)
        print("SPADES_BROWSER_VERIFY=PASS")
finally:
    os.chdir(old)
