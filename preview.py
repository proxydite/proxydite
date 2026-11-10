"""Serve this private portfolio preview locally, including video seeking."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import os
import re

ROOT = Path(__file__).resolve().parent

class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def list_directory(self, path):
        self.send_error(404, "Page not found")
        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        self.byte_range = None
        path = self.translate_path(self.path)
        requested = self.headers.get("Range")
        if requested and os.path.isfile(path):
            size = os.path.getsize(path)
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", requested.strip())
            if not match:
                self.send_error(416, "Unsupported byte range")
                return None
            first, last = match.groups()
            if not first and not last:
                self.send_error(416, "Empty byte range")
                return None
            start = int(first) if first else max(0, size-int(last))
            end = min(int(last), size-1) if last and first else size-1
            if start >= size or start < 0 or end < start:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return None
            stream = open(path, "rb")
            stream.seek(start)
            self.byte_range = (start, end)
            self.send_response(206)
            self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Content-Length", str(end-start+1))
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            self.send_header("Accept-Ranges", "bytes")
            self.end_headers()
            return stream
        return super().send_head()

    def copyfile(self, source, outputfile):
        try:
            if self.byte_range:
                remaining = self.byte_range[1]-self.byte_range[0]+1
                while remaining:
                    chunk = source.read(min(65536, remaining))
                    if not chunk:
                        break
                    outputfile.write(chunk)
                    remaining -= len(chunk)
            else:
                super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    options = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", options.port), PreviewHandler)
    print(f"Local preview: http://127.0.0.1:{options.port}/", flush=True)
    print("This does not publish or change proxydite.net. Press Ctrl+C to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
