# ytmp3

Friendly CLI wrapper around `yt-dlp` to extract MP3 from YouTube links.

Run it with a URL when you already know what you want, or run it with no
arguments for a guided flow.

## Requirements

- Node 18+
- `yt-dlp` on PATH
- `ffmpeg` on PATH (required by yt-dlp for audio extraction)

## Install

Install dependencies:

```
npm install
```

Then run:

```
node cli.js
```

The interactive flow asks for the YouTube URL, output folder, playlist behavior,
browser cookies, and confirmation before starting the download.

If you already have the URL:

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
- `-i, --interactive` Start the guided flow
- `-h, --help` Show help
- `--no-playlist` Skip playlist download (default)
- `--playlist` Allow playlist download
- `--cookies-from-browser` Use browser cookies to fix 403 (e.g., `chrome`)

Examples:

```
node cli.js "https://youtu.be/0FImV3UALP4" --cookies-from-browser chrome
```

Run tests:

```
npm test
```

## Install yt-dlp

macOS (Homebrew):

```
brew install yt-dlp ffmpeg
```

If you prefer a standalone binary (no Python), you can download the yt-dlp release binary and put it on PATH.

## Logbook for Devs

A tool from the [Logbook for Devs](https://logbookfordevs.com/)

Charting the technical seas, one commit at a time.

Support the work:

- [Buy me a coffee on Ko-fi](https://ko-fi.com/logbookfordevs?amount=5)
- [Buy me lunch on Ko-fi](https://ko-fi.com/logbookfordevs?amount=15)
- [Buy me dinner on Ko-fi](https://ko-fi.com/logbookfordevs?amount=30)
- [Ko-fi](https://ko-fi.com/logbookfordevs)
- [Buy Me a Coffee](https://buymeacoffee.com/logbookfordevs)
