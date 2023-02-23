import { setFailed } from "@actions/core";
import { mkdirP, mv } from "@actions/io";
import { exists } from "@actions/io/lib/io-util";

import { getOptions } from "./lib/getOptions";
import { isErrorLike } from "./lib/isErrorLike";
import { buildTargetPaths } from "./lib/pathBuilder";
import log from "./lib/log";

async function post(): Promise<void> {
  try {
    const options = getOptions();
    const cacheTargets = await buildTargetPaths(options.workingDir, options.cacheDir, options.paths);

    await mkdirP(options.cacheDir);

    for (const target of cacheTargets) {
      if (await exists(target.targetPath)) {
        await mv(target.targetPath, target.distPath, { force: true });
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