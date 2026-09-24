const assert = require("node:assert/strict");
const test = require("node:test");

const { buildYtDlpArgs, formatSummary, parseArgs, theme } = require("../cli");

test("parseArgs keeps the existing direct URL flow", () => {
  const args = parseArgs([
    "node",
    "cli.js",
    "https://youtu.be/example",
    "-o",
    "downloads",
    "--cookies-from-browser",
    "chrome",
    "--playlist",
  ]);

  assert.deepEqual(args, {
    url: "https://youtu.be/example",
    output: "downloads",
    noPlaylist: false,
    cookiesFromBrowser: "chrome",
    help: false,
    interactive: false,
    video: false,
  });
});

test("parseArgs supports explicit interactive mode", () => {
  const args = parseArgs(["node", "cli.js", "--interactive"]);

  assert.equal(args.interactive, true);
  assert.equal(args.url, null);
});

test("--video works before or after an X URL and in guided mode", () => {
  const url = "https://x.com/jh3yy/status/2102885700979048558/video/1";

  for (const flags of [["--video", url], [url, "--video"]]) {
    const args = parseArgs(["node", "cli.js", ...flags]);
    assert.equal(args.video, true);
    assert.equal(args.url, url);
  }

  const args = parseArgs(["node", "cli.js", "--interactive", "--video"]);
  assert.equal(args.video, true);
  assert.equal(args.interactive, true);
});

test("video downloads preserve the URL and options without audio extraction", () => {
  const url = "https://x.com/jh3yy/status/2102885700979048558/video/1";
  const args = buildYtDlpArgs({
    url,
    outputDir: "/tmp/videos",
    noPlaylist: true,
    cookiesFromBrowser: "chrome",
    video: true,
  });

  assert.deepEqual(args, [
    "-o", "/tmp/videos/%(title)s.%(ext)s",
    "--no-playlist", "--cookies-from-browser", "chrome", url,
  ]);
});

test("summary displays the selected download format", () => {
  const download = { url: "https://x.com/example/status/123", outputDir: "/tmp" };
  assert.match(formatSummary(download, { color: false }), /Format: Audio \(MP3\)/);
  assert.match(formatSummary({ ...download, video: true }, { color: false }), /Format: Video \(best available\)/);
});

test("buildYtDlpArgs converts a prompt result into yt-dlp arguments", () => {
  const args = buildYtDlpArgs({
    url: "https://youtu.be/example",
    outputDir: "/tmp/music",
    noPlaylist: true,
    cookiesFromBrowser: "chrome",
  });

  assert.deepEqual(args, [
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "0",
    "-o",
    "/tmp/music/%(title)s.%(ext)s",
    "--no-playlist",
    "--cookies-from-browser",
    "chrome",
    "https://youtu.be/example",
  ]);
});

test("formatSummary uses the Logbook-inspired CLI theme", () => {
  const summary = formatSummary(
    {
      url: "https://youtu.be/example",
      outputDir: "/tmp/music",
      createOutput: true,
      allowPlaylist: false,
      cookieBrowser: "chrome",
    },
    { color: true }
  );

  assert.match(summary, /\x1b\[38;5;180m/);
  assert.match(summary, /Voyage plan/);
  assert.match(summary, /single video only/);
  assert.match(summary, /chrome/);
});

test("theme can render plain output when color is disabled", () => {
  assert.equal(theme.label("URL", { color: false }), "URL");
  assert.equal(theme.value("https://youtu.be/example", { color: false }), "https://youtu.be/example");
});
