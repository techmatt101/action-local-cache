import { setFailed, setOutput } from "@actions/core";
import { mv } from "@actions/io";
import { exists } from "@actions/io/lib/io-util";

import { getOptions, Options } from "./lib/getOptions";
import { isErrorLike } from "./lib/isErrorLike";
import { buildTargetPaths } from "./lib/pathBuilder";
import log from "./lib/log";

async function main(): Promise<void> {
  try {
    const cacheHit = await moveCache(getOptions());
    setOutput("cache-hit", cacheHit);
  } catch (error: unknown) {
    console.trace(error);
    setFailed(isErrorLike(error) ? error.message : `unknown error: ${error}`);
  }
}

async function moveCache(options: Options): Promise<boolean> {
  if (!await exists(options.cacheDir)) {
    log.info(`Skipping: no cache found for ${options.cacheKey}`);
    return false;
  }

  const cacheTargets = await buildTargetPaths(options.cacheDir, options.workingDir, options.paths);

  let hitCache = false;
  for (const target of cacheTargets) {
    if (await exists(target.targetPath)) {
      await mv(target.targetPath, target.distPath, { force: true });
      log.info(`Cache restored: ${target.path}`);
      hitCache = true;
    } else {
      log.info(`Cache missing: ${target.path}`);
    }
  }

  return hitCache;
}

main();