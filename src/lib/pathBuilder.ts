import { join, resolve, parse } from "path";

export interface CacheTarget {
  origPath: string;
  cachePath: string;
  targetPath: string;
  targetDir: string;
  cacheDir: string;
}

export function buildCacheTargets(cwd: string, rootCacheDir: string, paths: string[]): CacheTarget[] {
  return paths.map((path): CacheTarget => {
    const targetPath = resolve(cwd, path);
    const cachePath = join(rootCacheDir, path);
    
    return {
      origPath: path,
      cacheDir: parse(cachePath).dir,
      cachePath: cachePath,
      targetPath: targetPath,
      targetDir: parse(targetPath).dir
    };
  });
}