import { setFailed, setOutput, debug } from "@actions/core";
import { mv } from "@actions/io";
import { exists } from "@actions/io/lib/io-util";

import { getOptions, Options } from "./lib/getOptions";
import { buildTargetPaths } from "./lib/pathBuilder";

async function main(): Promise<void> {
  try {
    const cacheHit = await moveCache(getOptions());
    setOutput("cache-hit", cacheHit);
  } catch (error: unknown) {
    console.trace(error);
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

async function moveCache(options: Options): Promise<boolean> {
  if (!(await exists(options.cacheDir))) {
    debug(`Skipping: no cache found for ${options.cacheKey}`);
    return false;
  }

  const cacheTargets = await buildTargetPaths(options.cacheDir, options.workingDir, options.paths);

  let hitCache = false;
  for (const target of cacheTargets) {
    if (await exists(target.targetPath)) {
      await mv(target.targetPath, target.distPath, { force: true });
      debug(`Cache restored: ${target.path}`);
      hitCache = true;
    } else {
      debug(`Cache miss: ${target.path}`);
    }
  }

  return hitCache;
}

main();
