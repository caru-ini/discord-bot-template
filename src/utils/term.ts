const MAX_LINES = 1000;
const lines: string[] = [];
let partial = '';
let bar = '';

export const writeTerm = (chunk: string) => {
  const parts = (partial + chunk).split('\n');
  partial = parts.pop() ?? '';
  lines.push(...parts);
  if (lines.length > MAX_LINES) {
    lines.splice(0, lines.length - MAX_LINES);
  }
  process.stdout.write(chunk);
};

const drawBar = () => {
  const rows = process.stdout.rows;
  process.stdout.write(`\x1b7\x1b[${rows};1H\x1b[2K${bar}\x1b8`);
};

const visibleRows = (line: string, cols: number) => {
  let width = 0;
  let inEscape = false;
  for (const ch of line) {
    if (inEscape) {
      if (ch === 'm') {
        inEscape = false;
      }
    } else if (ch === '\x1b') {
      inEscape = true;
    } else {
      width += (ch.codePointAt(0) ?? 0) > 0xff ? 2 : 1;
    }
  }
  return Math.max(1, Math.ceil(width / cols));
};

const repaint = () => {
  const rows = process.stdout.rows;
  const cols = process.stdout.columns || 80;
  if (rows < 2) {
    return;
  }
  const tail: string[] = [];
  let used = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line === undefined) {
      break;
    }
    const height = visibleRows(line, cols);
    if (used + height > rows - 2) {
      break;
    }
    tail.unshift(line);
    used += height;
  }
  const startRow = rows - 1 - used;
  process.stdout.write(
    `\x1b[r\x1b[2J\x1b[${startRow};1H${tail.map((l) => `${l}\n`).join('')}\x1b[1;${rows - 1}r\x1b[${rows - 1};1H`
  );
  drawBar();
};

let resizeTimer: ReturnType<typeof setTimeout> | undefined;

const handleResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(repaint, 150);
};

export const clearTerm = () => {
  lines.length = 0;
  partial = '';
  const rows = process.stdout.rows;
  process.stdout.write(`\x1b[r\x1b[${rows};1H\x1b[2K${'\n'.repeat(rows)}`);
  repaint();
};

const teardown = () => {
  process.stdout.write(`\x1b[r\x1b[${process.stdout.rows};1H\x1b[2K`);
};

/**
 * Pins the bar to the terminal's last row; logs scroll in a region above it
 * and repaint from the line buffer on resize
 */
export const setupTerm = (barText: string) => {
  bar = barText;
  const rows = process.stdout.rows;
  if (rows >= 2) {
    process.stdout.write(`\x1b[1;${rows - 1}r\x1b[${rows - 1};1H`);
    drawBar();
  }
  process.stdout.on('resize', handleResize);
  process.on('exit', teardown);
};
