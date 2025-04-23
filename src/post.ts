import { setFailed, info } from "@actions/core";
import { cp, mkdirP, mv } from "@actions/io";
import { exists } from "@actions/io/lib/io-util";

import { getOptions } from "./lib/getOptions";
import { buildTargetPaths } from "./lib/pathBuilder";

async function post(): Promise<void> {
  try {
    const options = getOptions();
    const cacheTargets = await buildTargetPaths(options.workingDir, options.cacheDir, options.paths);

    await mkdirP(options.cacheDir);

    for (const target of cacheTargets) {
      if (await exists(target.targetPath)) {
        await mv(target.targetPath, target.distPath, { force: true });
        info(`Caching: ${target.targetPath}`);
      } else {
        info(`Skipping: no matches found for ${target.targetPath}`);
      }
    }

    if (options.remoteDir !== null && !(await exists(options.remoteDir))) {
      await cp(options.cacheDir, options.remoteDir);
    }
  } catch (error: unknown) {
    console.trace(error);
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

post();
