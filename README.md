# ytmp3

Friendly CLI wrapper around `yt-dlp` to extract MP3 or download videos from YouTube, X, and other sites supported by yt-dlp.

Run it with a URL when you already know what you want, or run it with no
arguments for a guided flow.

## Requirements

- Node 18+
- `yt-dlp` on PATH
- `ffmpeg` on PATH (required for audio extraction and merging separate video/audio streams)

## Install

Install dependencies:

```
npm install
```

Then run:

```
node cli.js
```

The interactive flow asks for the URL, audio or video format, output folder, playlist behavior,
browser cookies, and confirmation before starting the download.

If you already have the URL:

```
node cli.js "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Make the CLI available from any directory

Run this once from the project folder:

```
npm link
```

You can then use `ytmp3` from any directory in your terminal:

```bash
ytmp3                         # Guided flow
ytmp3 "https://www.youtube.com/watch?v=VIDEO_ID"  # MP3
ytmp3 "https://x.com/jh3yy/status/2102885700979048558/video/1" --video
ytmp3 "URL" --video -o .       # Save to the current directory instead
```

Downloads save to `~/Downloads` by default. Use `-o` to choose another existing
directory.

`npm link` links the command to this checkout, so code changes apply immediately.
Keep the project folder in place. If you use NVM and switch Node versions, run
`npm link` again from the project folder for that version.

## Usage

Options:

- `-o, --output` Output directory (default: `~/Downloads`)
- `-i, --interactive` Start the guided flow
- `-h, --help` Show help
- `--video` Download video with yt-dlp's default best-available selection instead of extracting MP3
- `--no-playlist` Skip playlist download (default)
- `--playlist` Allow playlist download
- `--cookies-from-browser` Use browser cookies to fix 403 (e.g., `chrome`)

Examples:

```
node cli.js "https://youtu.be/0FImV3UALP4" --cookies-from-browser chrome
```

Download an X video:

```
node cli.js "https://x.com/jh3yy/status/2102885700979048558/video/1" --video
```

Without `--video`, downloads still produce MP3. Video output uses the container
selected by yt-dlp (such as MP4 or WebM), without forced conversion. Use
`--interactive --video` to preselect video in the guided flow.

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
