/**
 * Matches patterns against one line while remembering which characters an
 * earlier extractor already used, so the same text is never read twice
 * (e.g. "512" as both storage and price). Patterns run on an upper-cased
 * copy by default; results are cut from the original so casing is kept.
 */
export class LineScanner {
  readonly original: string;
  private readonly upper: string;
  private readonly used: boolean[];

  constructor(line: string) {
    const upper = line.toUpperCase();
    // A few characters change length when upper-cased (e.g. "ß"); fall back
    // to the original so indexes stay aligned.
    this.upper = upper.length === line.length ? upper : line;
    this.original = line;
    this.used = new Array(line.length).fill(false);
  }

  /** The unused text, with used characters blanked out. */
  private view(caseSensitive: boolean): string {
    const source = caseSensitive ? this.original : this.upper;
    let out = "";
    for (let i = 0; i < source.length; i++) {
      out += this.used[i] ? " " : source[i];
    }
    return out;
  }

  /** Finds the first match in the unused text without claiming it. */
  find(pattern: RegExp, caseSensitive = false): RegExpExecArray | null {
    return pattern.exec(this.view(caseSensitive));
  }

  /** Every match in the unused text, without claiming any. */
  findAll(pattern: RegExp, caseSensitive = false): RegExpExecArray[] {
    const global = new RegExp(
      pattern.source,
      pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
    );
    return [...this.view(caseSensitive).matchAll(global)];
  }

  /** Marks a match's characters as used. */
  claim(match: RegExpExecArray | RegExpMatchArray): void {
    const start = match.index ?? 0;
    for (let i = start; i < start + match[0].length; i++) this.used[i] = true;
  }

  /** `find` then `claim`. */
  take(pattern: RegExp, caseSensitive = false): RegExpExecArray | null {
    const match = this.find(pattern, caseSensitive);
    if (match) this.claim(match);
    return match;
  }

  has(pattern: RegExp): boolean {
    return pattern.test(this.view(false));
  }

  /** What no extractor claimed, in original casing. */
  remainder(): string {
    return this.view(true);
  }
}
