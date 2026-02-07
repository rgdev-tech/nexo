const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Que Metro resuelva módulos desde el client y la raíz del monorepo (Bun + workspaces)
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// Forzar que paquetes usados por expo-router (desde .bun) se resuelvan desde el client
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@expo/metro-runtime": path.resolve(projectRoot, "node_modules/@expo/metro-runtime"),
};
module.exports = config;
