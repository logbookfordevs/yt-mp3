# ytmp3 (Node)

Lightweight Node CLI wrapper around `yt-dlp` to extract MP3 from YouTube links.

## Requirements

- Node 18+
- `yt-dlp` on PATH
- `ffmpeg` on PATH (required by yt-dlp for audio extraction)

## Install

No npm dependencies. Just run:

```
node cli.js "https://www.youtube.com/watch?v=VIDEO_ID"
```

Or install the bin locally:

```
npm link
ytmp3 "https://www.youtube.com/watch?v=VIDEO_ID"
```

## Usage

Options:

- `-o, --output` Output directory
- `-h, --help` Show help
- `--no-playlist` Skip playlist download (default)
- `--playlist` Allow playlist download
- `--cookies-from-browser` Use browser cookies to fix 403 (e.g., `chrome`)

Examples:

```
node cli.js "https://youtu.be/0FImV3UALP4" --cookies-from-browser chrome
```

## Install yt-dlp

macOS (Homebrew):

```
brew install yt-dlp ffmpeg
```

If you prefer a standalone binary (no Python), you can download the yt-dlp release binary and put it on PATH.
