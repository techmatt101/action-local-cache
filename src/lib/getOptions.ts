import { join } from "path";
import * as core from "@actions/core";

export interface Options {
  cacheDir: string;
  cacheKey: string;
  workingDir: string;
  paths: string[];
}

export function getOptions(): Options {
  const { GITHUB_REPOSITORY, RUNNER_TOOL_CACHE } = process.env;

  if (!RUNNER_TOOL_CACHE) {
    throw new TypeError("Expected RUNNER_TOOL_CACHE environment variable to be defined.");
  }

  if (!GITHUB_REPOSITORY) {
    throw new TypeError("Expected GITHUB_REPOSITORY environment variable to be defined.");
  }

  const keyInput = core.getInput("key");
  const pathInput = core.getInput("path", { required: true });

  const cacheKey = [...GITHUB_REPOSITORY.split("/"), keyInput].filter((x) => x !== "").join("-");

  return {
    cacheKey: cacheKey,
    cacheDir: join(RUNNER_TOOL_CACHE, "local-cache", cacheKey),
    workingDir: process.cwd(),
    paths: pathInput
      .split("\n")
      .map((s) => s.trim())
      .filter((x) => x !== "")
  };
}
