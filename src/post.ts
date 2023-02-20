import { setFailed } from "@actions/core";
import { mkdirP, mv } from "@actions/io";

import { getVars } from "./lib/getVars";
import { isErrorLike } from "./lib/isErrorLike";
import log from "./lib/log";

async function post(): Promise<void> {
  try {
    const { cacheTargets } = getVars();

    for (const target of cacheTargets) {
      await mkdirP(target.cacheDir);
      await mv(target.targetPath, target.cachePath, { force: true });
    }
  } catch (error: unknown) {
    log.trace(error);
    setFailed(isErrorLike(error) ? error.message : `unknown error: ${error}`);
  }
}

post();
