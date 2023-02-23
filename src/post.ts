import { setFailed } from "@actions/core";
import { mkdirP, mv } from "@actions/io";
import { exists } from "@actions/io/lib/io-util";

import { getVars } from "./lib/getVars";
import { isErrorLike } from "./lib/isErrorLike";
import log from "./lib/log";
import { buildCacheTargets } from "./lib/pathBuilder";

async function post(): Promise<void> {
  try {
    const vars = getVars();
    const cacheTargets = buildCacheTargets(vars.cwd, vars.rootCacheDir, vars.paths);

    for (const target of cacheTargets) {
      if (await exists(target.targetPath)) {
        await mkdirP(target.cacheDir);
        await mv(target.targetPath, target.cachePath, { force: true });
      } else {
        log.info(`Skipping: target not found for ${target.targetPath}.`);
      }
    }
  } catch (error: unknown) {
    log.trace(error);
    setFailed(isErrorLike(error) ? error.message : `unknown error: ${error}`);
  }
}

post();
