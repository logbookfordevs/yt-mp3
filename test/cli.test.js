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
  });
});

test("parseArgs supports explicit interactive mode", () => {
  const args = parseArgs(["node", "cli.js", "--interactive"]);

  assert.equal(args.interactive, true);
  assert.equal(args.url, null);
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
