import http.server
import socketserver
import threading
import subprocess
import time
import os

class FastHandler(http.server.SimpleHTTPRequestHandler):
    def address_string(self): return self.client_address[0]
    def log_message(self, *args): pass

def main():
    PORT = 9994
    httpd = socketserver.TCPServer(('', PORT), FastHandler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    time.sleep(0.5)

    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    screenshot_file = os.path.abspath('rendered_preview.png')
    
    # 1. Take a screenshot
    cmd_shot = [
        edge_path,
        '--headless',
        '--disable-gpu',
        '--window-size=1400,900',
        f'--screenshot={screenshot_file}',
        f'http://127.0.0.1:{PORT}/index.html'
    ]
    subprocess.run(cmd_shot, capture_output=True, timeout=15)
    
    # 2. Check DOM output
    cmd_dom = [
        edge_path,
        '--headless',
        '--disable-gpu',
        '--dump-dom',
        f'http://127.0.0.1:{PORT}/index.html'
    ]
    p = subprocess.run(cmd_dom, capture_output=True, text=True, timeout=15)
    dom = p.stdout

    print(f"Screenshot taken: {os.path.exists(screenshot_file)} ({os.path.getsize(screenshot_file) if os.path.exists(screenshot_file) else 0} bytes)")
    print(f"DOM length: {len(dom)}")

    checks = ['mushaf-page-frame', 'catalog-item', 'mushaf-word-unit', 'سُورَةُ', 'بِسۡمِ', 'mushaf-word-en']
    for c in checks:
        print(f"Check '{c}': {'✓ FOUND' if c in dom else '✗ NOT FOUND'}")

    httpd.shutdown()

if __name__ == '__main__':
    main()
