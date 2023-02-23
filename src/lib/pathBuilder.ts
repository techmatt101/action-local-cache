import * as glob from "@actions/glob";
import { resolve, relative, join } from "path";

export interface CacheTarget {
  path: string;
  distPath: string;
  targetPath: string;
}

export async function buildTargetPaths(targetDir: string, distDir: string, paths: string[]): Promise<CacheTarget[]> {
  const globPaths = paths.map((x) => join(targetDir, x)).join("\n");
  const globber = await glob.create(globPaths, { implicitDescendants: false });
  const matchedPaths = await globber.glob();

  return matchedPaths.map((path) => {
    const relativePath = relative(targetDir, path);
    return {
      path: relativePath,
      distPath: resolve(distDir, relativePath),
      targetPath: resolve(targetDir, relativePath)
    };
  });
}
