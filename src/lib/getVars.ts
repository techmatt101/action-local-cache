import { join } from "path";
import * as core from "@actions/core";

import { buildCacheTargets, CacheTarget } from "./pathBuilder";

enum Inputs {
  Key = "key",
  Path = "path"
}

interface InputOptions {
  key: string;
  paths: string[];
}

interface Vars {
  rootCacheDir: string;
  options: InputOptions;
  cacheTargets: CacheTarget[];
}

function getInputAsArray(name: string, options?: core.InputOptions): string[] {
  return core
    .getInput(name, options)
    .split("\n")
    .map((s) => s.trim())
    .filter((x) => x !== "");
}

export function getVars(): Vars {
  const { GITHUB_REPOSITORY, RUNNER_TOOL_CACHE } = process.env;
  const CWD = process.cwd();

  if (!RUNNER_TOOL_CACHE) {
    throw new TypeError("Expected RUNNER_TOOL_CACHE environment variable to be defined.");
  }

  if (!GITHUB_REPOSITORY) {
    throw new TypeError("Expected GITHUB_REPOSITORY environment variable to be defined.");
  }

  const options: InputOptions = {
    key: core.getInput(Inputs.Key) || "",
    paths: getInputAsArray(Inputs.Path, { required: true })
  };

  const cacheKey = [...GITHUB_REPOSITORY.split('/'), options.key].filter(x => x !== "").join('-');
  const rootCacheDir = join(RUNNER_TOOL_CACHE, "local-cache", cacheKey);
  const cacheTargets = buildCacheTargets(CWD, rootCacheDir, options.paths);

  return {
    rootCacheDir,
    options,
    cacheTargets
  };
};
