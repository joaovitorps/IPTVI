import { execFile } from "node:child_process";

function execFileAsync(
  file: string,
  args: string[],
  options: { timeout?: number },
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(file, args, options, (err, stdout, stderr) => {
      if (err) {
        const nodeErr = err as NodeJS.ErrnoException & { signal?: string; killed?: boolean };
        const parts: string[] = [];
        if (nodeErr.message) parts.push(nodeErr.message);
        if (nodeErr.code) parts.push(`code=${nodeErr.code}`);
        if (nodeErr.signal) parts.push(`signal=${nodeErr.signal}`);
        if (nodeErr.killed) parts.push("killed=true");
        if (stderr) parts.push(`stderr=${stderr}`);
        const enhanced = new Error(parts.join(" | ") || "Unknown execFile error");
        Object.assign(enhanced, { code: nodeErr.code, signal: nodeErr.signal, killed: nodeErr.killed, stderr });
        reject(enhanced);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function getFfprobeVerbosity(): string {
  return process.env.NODE_ENV === "production" ? "error" : "debug";
}

export async function resolveRedirect(url: string): Promise<string> {
  const controller = new AbortController();
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    signal: controller.signal,
  });
  controller.abort();
  return response.url;
}

export interface FFprobeStream {
  index: number;
  codec_type: string;
  codec_name: string;
  width?: number;
  height?: number;
  tags?: {
    language?: string;
    title?: string;
  };
}

export interface FFprobeResult {
  streams: FFprobeStream[];
}

export class FFprobeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly stderr?: string,
  ) {
    super(message);
    this.name = "FFprobeError";
  }
}

export async function probeStream(
  ffprobePath: string,
  url: string,
  timeout = 30000,
): Promise<FFprobeResult> {
  try {
    const verbosity = getFfprobeVerbosity();
    const { stdout, stderr } = await execFileAsync(
      ffprobePath,
      ["-v", verbosity, "-print_format", "json", "-show_streams", url],
      { timeout },
    );

    const parsed: FFprobeResult = JSON.parse(stdout) as FFprobeResult;

    if (!parsed.streams || !Array.isArray(parsed.streams)) {
      throw new FFprobeError(
        "Invalid ffprobe output: missing streams array",
        "INVALID_OUTPUT",
        stderr,
      );
    }

    return parsed;
  } catch (err) {
    if (err instanceof FFprobeError) throw err;

    const error = err as NodeJS.ErrnoException & { stderr?: string; code?: string };

    if (error.code === "ENOENT") {
      throw new FFprobeError(
        `ffprobe not found at path: ${ffprobePath}`,
        "FFPROBE_NOT_FOUND",
      );
    }

    if (error.code === "ETIMEDOUT" || error.killed) {
      throw new FFprobeError(
        `ffprobe timed out after ${timeout}ms`,
        "TIMEOUT",
      );
    }

    if (error.signal) {
      const stderrMsg = error.stderr ? `: ${error.stderr}` : "";
      throw new FFprobeError(
        `ffprobe crashed with signal ${error.signal}${stderrMsg}`,
        "CRASHED",
        error.stderr,
      );
    }

    if (error.message?.includes("SyntaxError") || error.message?.includes("JSON")) {
      throw new FFprobeError(
        `Invalid ffprobe JSON output: ${error.message}`,
        "PARSE_ERROR",
        (err as { stderr?: string }).stderr,
      );
    }

    throw new FFprobeError(
      error.message || "Unknown ffprobe error",
      "UNKNOWN",
      (err as { stderr?: string }).stderr,
    );
  }
}
