import { join, resolve, parse } from "path";

import * as core from "@actions/core";
import { getInputAsArray } from "./actionUtils";

const { GITHUB_REPOSITORY, RUNNER_TOOL_CACHE } = process.env;
const CWD = process.cwd();

enum Inputs {
  Key = "key",
  Path = "path",
}

interface InputOptions {
  key: string;
  paths: string[];
}

interface CacheTarget {
  origPath: string;
  cachePath: string;
  targetPath: string;
  targetDir: string;
  cacheDir: string;
}

interface Vars {
  rootCacheDir: string;
  options: InputOptions;
  cacheTargets: CacheTarget[];
}

function buildCacheTargets(rootCacheDir: string, paths: string[]): CacheTarget[] {
  return paths.map((path): CacheTarget => {
    const targetPath = resolve(CWD, path);
    const cachePath = join(rootCacheDir, path);
    return {
      origPath: path,
      cacheDir: parse(cachePath).dir,
      cachePath: cachePath,
      targetPath: targetPath,
      targetDir: parse(targetPath).dir,
    };
  });
}

export const getVars = (): Vars => {
  if (!RUNNER_TOOL_CACHE) {
    throw new TypeError("Expected RUNNER_TOOL_CACHE environment variable to be defined.");
  }

  if (!GITHUB_REPOSITORY) {
    throw new TypeError("Expected GITHUB_REPOSITORY environment variable to be defined.");
  }

  const options: InputOptions = {
    key: core.getInput(Inputs.Key) || "no-key",
    paths: getInputAsArray(Inputs.Path, { required: true }),
  };

  const rootCacheDir = join(RUNNER_TOOL_CACHE, GITHUB_REPOSITORY, options.key);
  const cacheTargets = buildCacheTargets(rootCacheDir, options.paths);

  return {
    rootCacheDir,
    options,
    cacheTargets,
  };
};
