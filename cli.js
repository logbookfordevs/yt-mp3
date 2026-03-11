#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function die(message, code = 1) {
  process.stderr.write(`error: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { url: null, output: ".", noPlaylist: true, cookiesFromBrowser: null };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (!args.url && !arg.startsWith("-")) {
      args.url = arg;
      continue;
    }
    if (arg === "-o" || arg === "--output") {
      i += 1;
      args.output = rest[i];
      continue;
    }
    if (arg === "--playlist") {
      args.noPlaylist = false;
      continue;
    }
    if (arg === "--no-playlist") {
      args.noPlaylist = true;
      continue;
    }
    if (arg === "--cookies-from-browser") {
      i += 1;
      args.cookiesFromBrowser = rest[i];
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      args.help = true;
      continue;
    }
    die(`unknown argument: ${arg}`);
  }
  return args;
}

function hasYtDlp() {
  const res = spawnSync("yt-dlp", ["--version"], { stdio: "ignore" });
  return res.status === 0;
}

function main() {
  const args = parseArgs(process.argv);

  if (args.help || !args.url) {
    process.stdout.write(
      "Usage: ytmp3 <YouTube URL> [-o OUTPUT_DIR] [--cookies-from-browser NAME] [--playlist]\n" +
        "\n" +
        "Options:\n" +
        "  -o, --output   Output directory (default: current directory)\n" +
        "  --cookies-from-browser  Browser name for cookies (e.g., chrome)\n" +
        "  --playlist     Allow playlist downloads (default: disabled)\n" +
        "  -h, --help     Show help\n"
    );
    process.exit(args.help ? 0 : 1);
  }

  const outputDir = path.resolve(args.output);
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    die(`output directory does not exist: ${outputDir}`);
  }

  if (!hasYtDlp()) {
    die("yt-dlp not found on PATH. Install yt-dlp to continue.");
  }

  const outputTemplate = path.join(outputDir, "%(title)s.%(ext)s");
  const ytdlpArgs = [
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "0",
    "-o",
    outputTemplate,
  ];
  if (args.noPlaylist) {
    ytdlpArgs.push("--no-playlist");
  }
  if (args.cookiesFromBrowser) {
    ytdlpArgs.push("--cookies-from-browser", args.cookiesFromBrowser);
  }
  ytdlpArgs.push(args.url);
  const res = spawnSync("yt-dlp", ytdlpArgs, { stdio: "inherit" });

  if (res.status !== 0) {
    die("yt-dlp failed", res.status || 1);
  }
}

main();
