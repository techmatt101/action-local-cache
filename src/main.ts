import { setFailed, setOutput, info } from "@actions/core";
import { cp, mv } from "@actions/io";
import { exists } from "@actions/io/lib/io-util";

import { getOptions, Options } from "./lib/getOptions";
import { buildTargetPaths } from "./lib/pathBuilder";

async function main(): Promise<void> {
  try {
    const cacheHit = await moveCache(getOptions());
    setOutput("cache-hit", cacheHit);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

async function moveCache(options: Options): Promise<boolean> {
  if (!(await exists(options.cacheDir))) {
    info(`Skipping: no cache found for ${options.cacheKey}`);
    return false;
  }

  if (options.remoteDir !== null && !(await exists(options.cacheDir)) && (await exists(options.remoteDir))) {
    await cp(options.remoteDir, options.cacheDir);
  }

  const cacheTargets = await buildTargetPaths(options.cacheDir, options.workingDir, options.paths);

  let hitCache = false;
  for (const target of cacheTargets) {
    if (await exists(target.targetPath)) {
      await mv(target.targetPath, target.distPath, { force: true });
      info(`Cache restored: ${target.path}`);
      hitCache = true;
    } else {
      info(`Cache miss: ${target.path}`);
    }
  }

  return hitCache;
}

main();
