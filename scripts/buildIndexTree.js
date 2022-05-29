const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const BASE_URL = process.argv[2] || '';
const ROOT = process.cwd();

const readDirStat = (dir) => {
  const filePath = join(ROOT, dir)
  const uriPath = join(BASE_URL, dir)
  const subDirList = readdirSync(filePath)
  return subDirList.map((subDir) => {
    const subFilePath = join(filePath, subDir);
    const subUriPath = join(uriPath, subDir);
    const stat = statSync(subFilePath);
    const deepIn = () => {
      if (stat.isFile()) { return false }
      return readDirStat(subUriPath)
    }
    return {
      webUri: subUriPath,
      name: subDir,
      fullPath: subFilePath,
      stat,
      deepIn
    }
  })
}

const INDEX_HTML_NAME = 'index.html';
const ignores = ['node_modules', '.git', 'Dockerfile', '.vscode', '__MACOSX'];

const fileTree = readDirStat(BASE_URL)
  .filter((item) => item.stat.isDirectory() && !ignores.includes(item.name));

function genTree(tree, root) {
  tree.forEach((treeItem) => {
    const { fullPath, deepIn, name, stat , ...restInfo } = treeItem;
    if (ignores.includes(name)) { return }
    let subTree = deepIn();
    root[name] = { ...restInfo, stat, name, children: {} };
    if (!subTree) { return }
    const indexhtml = subTree.find((sutTreeItem) => sutTreeItem.name === 'index.html');
    if (indexhtml) {
      const { fullPath, deepIn , ...rest } = indexhtml;
      root[name] = { ...rest, name };
      return;
    }
    genTree(subTree, root[name].children);
  });
  return root;
}

module.exports = function buildIndexTree() {
  const rootTree = {};
  genTree(fileTree, rootTree);
  return rootTree;
}
