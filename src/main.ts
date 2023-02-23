import { setFailed, setOutput } from "@actions/core";
import { mkdirP, mv } from "@actions/io/";
import { exists } from "@actions/io/lib/io-util";

import { getOptions } from "./lib/getOptions";
import { isErrorLike } from "./lib/isErrorLike";
import log from "./lib/log";
import { buildCacheTargets } from "./lib/pathBuilder";

async function main(): Promise<void> {
  try {
    const options = getOptions();
    const cacheTargets = buildCacheTargets(options.workingDir, options.cacheDir, options.paths);

    let hitCache = false;
    for (const target of cacheTargets) {
      if (await exists(target.cachePath)) {
        await mkdirP(target.targetDir);
        await mv(target.cachePath, target.targetPath, { force: true });
        log.info(`Cache found and restored to ${target.origPath}`);
        hitCache = true;
      } else {
        log.info(`Skipping: cache not found for ${target.origPath}.`);
      }
    }
    setOutput("cache-hit", hitCache);
  } catch (error: unknown) {
    console.trace(error);
    setFailed(isErrorLike(error) ? error.message : `unknown error: ${error}`);
  }
}

main();
