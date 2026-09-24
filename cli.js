#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline/promises");
const { spawnSync } = require("child_process");

const DEFAULT_ARGS = {
  url: null,
  output: path.join(os.homedir(), "Downloads"),
  noPlaylist: true,
  cookiesFromBrowser: null,
  help: false,
  interactive: false,
  video: false,
};

const supportsColor = !process.env.NO_COLOR;
const ansi = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  ink: "\x1b[38;5;223m",
  brass: "\x1b[38;5;180m",
  sea: "\x1b[38;5;73m",
  rose: "\x1b[38;5;174m",
  slate: "\x1b[38;5;244m",
};

function paint(value, codes, options = {}) {
  const color = options.color ?? supportsColor;
  if (!color) {
    return value;
  }
  return `${codes.join("")}${value}${ansi.reset}`;
}

const theme = {
  title: (value, options) => paint(value, [ansi.bold, ansi.brass], options),
  caption: (value, options) => paint(value, [ansi.dim, ansi.slate], options),
  label: (value, options) => paint(value, [ansi.brass], options),
  value: (value, options) => paint(value, [ansi.ink], options),
  accent: (value, options) => paint(value, [ansi.sea], options),
  warning: (value, options) => paint(value, [ansi.rose], options),
};

function die(message, code = 1) {
  process.stderr.write(`${theme.warning("error")}: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { ...DEFAULT_ARGS };
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
    if (arg === "--video") {
      args.video = true;
      continue;
    }
    if (arg === "--no-playlist") {
      args.noPlaylist = true;
      continue;
    }
    if (arg === "--cookies-from-browser") {
      i += 1;
      if (!rest[i]) {
        die("--cookies-from-browser requires a browser name");
      }
      args.cookiesFromBrowser = rest[i];
      continue;
    }
    if (arg === "-i" || arg === "--interactive") {
      args.interactive = true;
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

function buildYtDlpArgs({ url, outputDir, noPlaylist, cookiesFromBrowser, video = false }) {
  const outputTemplate = path.join(outputDir, "%(title)s.%(ext)s");
  const ytdlpArgs = video
    ? []
    : ["-x", "--audio-format", "mp3", "--audio-quality", "0"];

  ytdlpArgs.push("-o", outputTemplate);
  if (noPlaylist) {
    ytdlpArgs.push("--no-playlist");
  }
  if (cookiesFromBrowser) {
    ytdlpArgs.push("--cookies-from-browser", cookiesFromBrowser);
  }
  ytdlpArgs.push(url);
  return ytdlpArgs;
}

function hasYtDlp() {
  const res = spawnSync("yt-dlp", ["--version"], { stdio: "ignore" });
  return res.status === 0;
}

function printHelp() {
  process.stdout.write(
    `${theme.title("ytmp3")}\n` +
      `${theme.caption("A tiny Logbook-flavored deckhand for yt-dlp.")}\n\n` +
      "Usage: ytmp3 <URL> [--video] [-o OUTPUT_DIR] [--cookies-from-browser NAME] [--playlist]\n" +
      "       ytmp3 --interactive\n" +
      "\n" +
      "Options:\n" +
      "  -i, --interactive  Start a guided download flow\n" +
      "  --video           Download video instead of extracting MP3\n" +
      "  -o, --output       Output directory (default: ~/Downloads)\n" +
      "  --cookies-from-browser  Browser name for cookies (e.g., chrome)\n" +
      "  --playlist         Allow playlist downloads (default: disabled)\n" +
      "  -h, --help         Show help\n"
  );
}

function formatPrompt(message, initial = "") {
  const suffix = initial ? ` ${theme.caption(`(${initial})`)}` : "";
  return `${theme.label(message)}${suffix}: `;
}

function formatSummary({ url, outputDir, createOutput, allowPlaylist, cookieBrowser, video = false }, options = {}) {
  const rows = [
    ["URL", url],
    ["Format", video ? "Video (best available)" : "Audio (MP3)"],
    ["Output", `${outputDir}${createOutput ? " (will create)" : ""}`],
    ["Playlist", allowPlaylist ? "allowed" : "single video only"],
    ["Cookies", cookieBrowser || "none"],
  ];
  const body = rows
    .map(([label, value]) => `${theme.label(label, options)}: ${theme.value(value, options)}`)
    .join("\n");

  return `${theme.title("Voyage plan", options)}\n${body}`;
}

async function promptForDownload(args) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function ask(message, initial = "") {
    const answer = await rl.question(formatPrompt(message, initial));
    return answer.trim() || initial;
  }

  async function askRequired(message, initial = "") {
    while (true) {
      const answer = await ask(message, initial);
      if (answer.trim()) {
        return answer.trim();
      }
      process.stdout.write("Please enter a value.\n");
    }
  }

  async function confirm(message, initial = true) {
    const hint = initial ? "Y/n" : "y/N";
    while (true) {
      const answer = (await rl.question(formatPrompt(message, hint))).trim().toLowerCase();
      if (!answer) {
        return initial;
      }
      if (answer === "y" || answer === "yes") {
        return true;
      }
      if (answer === "n" || answer === "no") {
        return false;
      }
      process.stdout.write("Please answer yes or no.\n");
    }
  }

  async function select(message, choices, initialIndex = 0) {
    process.stdout.write(`${theme.label(message)}\n`);
    choices.forEach((choice, index) => {
      const marker = index === initialIndex ? theme.accent("*") : " ";
      process.stdout.write(` ${marker} ${index + 1}. ${choice.title}\n`);
    });

    while (true) {
      const answer = await rl.question(formatPrompt(`Choose 1-${choices.length}`, String(initialIndex + 1)));
      const selected = answer.trim() ? Number(answer) - 1 : initialIndex;
      if (Number.isInteger(selected) && choices[selected]) {
        return choices[selected].value;
      }
      process.stdout.write("Please choose one of the listed options.\n");
    }
  }

  process.stdout.write(
    `\n${theme.title("ytmp3 guided setup")}\n` +
      `${theme.caption("Charting the cleanest path from link to audio or video.")}\n\n`
  );

  try {
    const url = await askRequired("Video URL (YouTube, X, or another supported site)", args.url || "");
    const video = await select("Download format", [
      { title: "Audio (MP3)", value: false },
      { title: "Video (best available)", value: true },
    ], args.video ? 1 : 0);
    const output = await askRequired("Save files to", args.output || DEFAULT_ARGS.output);
    const allowPlaylist = await confirm("Allow playlist downloads?", !args.noPlaylist);
    const cookieChoices = [
      { title: "No cookies", value: "" },
      { title: "Chrome", value: "chrome" },
      { title: "Firefox", value: "firefox" },
      { title: "Brave", value: "brave" },
      { title: "Edge", value: "edge" },
      { title: "Safari", value: "safari" },
      { title: "Custom browser name", value: "custom" },
    ];
    const initialCookieIndex = Math.max(
      0,
      cookieChoices.findIndex((choice) => choice.value === args.cookiesFromBrowser)
    );
    const cookieChoice = await select("Use browser cookies?", cookieChoices, initialCookieIndex);
    const cookieBrowser =
      cookieChoice === "custom"
        ? await askRequired("Browser name for yt-dlp")
        : cookieChoice || null;
    const outputDir = path.resolve(output);
    const exists = fs.existsSync(outputDir);
    let createOutput = false;

    if (!exists) {
      createOutput = await confirm(`Create output folder ${outputDir}?`, true);
      if (!createOutput) {
        process.stdout.write("Canceled.\n");
        process.exit(0);
      }
    } else if (!fs.statSync(outputDir).isDirectory()) {
      die(`output path is not a directory: ${outputDir}`);
    }

    process.stdout.write(
      `\n${formatSummary({ url, outputDir, createOutput, allowPlaylist, cookieBrowser, video })}\n\n`
    );

    const ready = await confirm("Start download?", true);
    if (!ready) {
      process.stdout.write("Canceled.\n");
      process.exit(0);
    }

    if (createOutput) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    return {
      url,
      output: outputDir,
      noPlaylist: !allowPlaylist,
      cookiesFromBrowser: cookieBrowser,
      video,
    };
  } finally {
    rl.close();
  }
}

async function main(argv = process.argv) {
  const args = parseArgs(argv);

  if (args.interactive && !process.stdin.isTTY) {
    die("interactive mode requires a terminal");
  }

  if (args.help || !args.url) {
    if (args.help) {
      printHelp();
      process.exit(0);
    }
    if (!args.interactive && !process.stdin.isTTY) {
      printHelp();
      process.exit(1);
    }
  }

  const download = args.interactive || !args.url ? await promptForDownload(args) : args;
  const outputDir = path.resolve(download.output);
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    die(`output directory does not exist: ${outputDir}`);
  }

  if (!hasYtDlp()) {
    die("yt-dlp not found on PATH. Install yt-dlp to continue.");
  }

  const ytdlpArgs = buildYtDlpArgs({
    url: download.url,
    outputDir,
    noPlaylist: download.noPlaylist,
    cookiesFromBrowser: download.cookiesFromBrowser,
    video: download.video,
  });
  const res = spawnSync("yt-dlp", ytdlpArgs, { stdio: "inherit" });

  if (res.status !== 0) {
    die("yt-dlp failed", res.status || 1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    die(error.message || String(error));
  });
}

module.exports = {
  buildYtDlpArgs,
  formatSummary,
  main,
  parseArgs,
  theme,
};
