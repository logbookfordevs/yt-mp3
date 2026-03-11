#!/usr/bin/env python3
"""Download audio from a YouTube URL and extract to MP3."""

import argparse
import os
import shutil
import subprocess
import sys


def die(message: str, code: int = 1) -> None:
    print(f"error: {message}", file=sys.stderr)
    sys.exit(code)


def run(cmd: list[str]) -> int:
    try:
        return subprocess.call(cmd)
    except FileNotFoundError:
        return 127


def main() -> int:
    parser = argparse.ArgumentParser(
        prog="ytmp3",
        description="Download audio from a YouTube link and extract MP3 using yt-dlp.",
    )
    parser.add_argument("url", help="YouTube video URL")
    parser.add_argument(
        "-o",
        "--output",
        default=".",
        help="Output directory (default: current directory)",
    )
    parser.add_argument(
        "--filename",
        default="%(title)s.%(ext)s",
        help="Output filename template (default: %(title)s.%(ext)s)",
    )
    args = parser.parse_args()

    if not shutil.which("yt-dlp"):
        die("yt-dlp not found. Install with: pip install yt-dlp")

    output_dir = os.path.abspath(args.output)
    if not os.path.isdir(output_dir):
        die(f"output directory does not exist: {output_dir}")

    output_template = os.path.join(output_dir, args.filename)

    cmd = [
        "yt-dlp",
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",
        "-o",
        output_template,
        args.url,
    ]

    code = run(cmd)
    if code == 127:
        die("failed to run yt-dlp. Is it installed and on PATH?")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
