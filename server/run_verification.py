import subprocess
import time
import urllib.request
import os
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

SERVER_DIR = os.path.join(os.path.dirname(__file__))

def clear_port_5000():
    try:
        netstat = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
        for line in netstat.stdout.splitlines():
            if ':5000 ' in line and 'LISTENING' in line:
                parts = line.strip().split()
                pid = parts[-1]
                print(f"Clearing existing process on port 5000 (PID {pid})...")
                subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True)
    except Exception as e:
        print("Clear port exception:", e)

def wait_for_server(url='http://localhost:5000/api/health', timeout=15):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    print(f"Server is up and responding at {url}")
                    return True
        except Exception:
            pass
        time.sleep(0.5)
    return False

def main():
    clear_port_5000()
    time.sleep(1)

    print("Starting SmileCare Backend Server (node server.js)...")
    server_proc = subprocess.Popen(
        ['node', 'server.js'],
        cwd=SERVER_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding='utf-8',
        errors='replace'
    )

    try:
        if not wait_for_server():
            print("Server failed to respond within timeout. Stderr:")
            try:
                outs, errs = server_proc.communicate(timeout=2)
                print(errs)
                print(outs)
            except Exception:
                pass
            sys.exit(1)

        test_script = sys.argv[1] if len(sys.argv) > 1 else 'test_whatsapp_doctor_comm.mjs'
        print(f"\nRunning test suite (node {test_script})...")
        test_proc = subprocess.run(
            ['node', test_script],
            cwd=SERVER_DIR,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )

        print(test_proc.stdout)
        if test_proc.stderr:
            print("STDERR:\n", test_proc.stderr)

        sys.exit(test_proc.returncode)

    finally:
        print("\nStopping server process...")
        try:
            server_proc.terminate()
            server_proc.wait(timeout=3)
        except Exception:
            server_proc.kill()
        clear_port_5000()
        print("Server stopped cleanly.")

if __name__ == '__main__':
    main()
