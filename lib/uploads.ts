import path from "path";

function resolveUploadsRoot() {
  const envDir = process.env.UPLOADS_DIR;
  if (envDir) {
    return path.resolve(envDir);
  }

  const cwd = process.cwd();
  if (cwd.includes(".next/standalone")) {
    return path.resolve(cwd, "..", "..", "uploads");
  }

  return path.resolve(cwd, "uploads");
}

export const uploadsRoot = resolveUploadsRoot();
