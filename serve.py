import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class FastHandler(http.server.SimpleHTTPRequestHandler):
    # Disable reverse DNS lookup to ensure sub-millisecond response on Windows
    def address_string(self):
        return self.client_address[0]

    def end_headers(self):
        # Enable CORS and disable cache during local dev so edits reload immediately
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"===============================================================")
    print(f"  AL-QURAN AL-KARIM | Word-by-Word & Tajweed (McMaster Speed)")
    print(f"  Server URL: http://localhost:{PORT}")
    print(f"  Status: All 114 Surahs pre-bundled for 100% Offline Access")
    print(f"  Press Ctrl+C to stop.")
    print(f"===============================================================")

    # Open default browser
    try:
        webbrowser.open(f'http://localhost:{PORT}')
    except Exception:
        pass

    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), FastHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    main()
