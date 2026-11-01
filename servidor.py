import http.server
import socketserver

PUERTO = 8000

class HandlerSinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

with socketserver.TCPServer(("", PUERTO), HandlerSinCache) as httpd:
    print(f"Servidor en http://localhost:{PUERTO}")
    httpd.serve_forever()