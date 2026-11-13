from html.parser import HTMLParser
from pathlib import Path


class StrongBoundaryParser(HTMLParser):
    def __init__(self, source, filename):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.filename = filename
        self.line_offsets = [0]
        self.line_offsets.extend(
            index + 1 for index, character in enumerate(source) if character == "\n"
        )
        self.open_strong = []
        self.reported = False

    def handle_starttag(self, tag, attrs):
        line, column = self.getpos()
        offset = self.line_offsets[line - 1] + column

        if tag == "strong":
            self.open_strong.append((line, offset))
        elif tag in {"section", "table"} and self.open_strong and not self.reported:
            strong_line, strong_offset = self.open_strong[-1]
            snippet = self.source[strong_offset : strong_offset + 200]
            print(f"{self.filename}:{strong_line}: {snippet!r}")
            self.reported = True

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag == "strong" and self.open_strong:
            self.open_strong.pop()


def main():
    root = Path(".vercel/output/static")
    findings = 0

    for path in sorted(root.rglob("*.html")):
        parser = StrongBoundaryParser(
            path.read_text(encoding="utf-8"), str(path)
        )
        parser.feed(parser.source)
        if parser.reported:
            findings += 1

    if not findings:
        print("No <strong> remains open when a <section> or <table> starts.")


if __name__ == "__main__":
    main()
