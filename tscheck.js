#!/usr/bin/env node
"use strict";

/*
 * tscheck - scan directory tree for .ts files that need recompiling
 *
 * Usage: tscheck [-s] [-r <search> <replace>] [dir [...]]
 *
 * -s                     silent mode, supress output
 *                        (default is to print changed files) 
 * -r <search> <replace>  replace in path to .ts to get path to .js
 *                        (default is to look in same dir as .ts)
 *
 * Exit status is the number of changed files.
 *
 * Example -- invoke tsc only if some source files had changed:
 *
 * $ tscheck -s -r /src/ /dist/ src/ || tsc
 */

const fs = require("fs");
const path = require("path");

function readDirRecursive(startQueue) {

  const readDirQueue = startQueue;
  const fileList = [];

  function readDir(dir) {
    function getItemList(readDir) {
      return new Promise((resolve,reject) => {
        fs.readdir(readDir,(err,itemList) => {
          if (err) {
            return reject();
          }
          // resolve with parent path added to each item
          resolve(itemList.map((item) => path.resolve(readDir,item)));
        });
      });
    }

    function getItemListStat(itemList) {
      function getStat(itemPath) {
        return new Promise((resolve,reject) => {
          fs.stat(itemPath,(err,stat) => {
            if (err) {
              return reject();
            }
            // resolve with item path and if directory
            resolve({itemPath,isDirectory: stat.isDirectory()});
          });
        });
      }
      // stat all items in list
      return Promise.all(itemList.map(getStat));
    }

    function processItemList(itemList) {
      for (let {itemPath,isDirectory} of itemList) {
        // if directory add to queue
        if (isDirectory) {
          readDirQueue.push(itemPath);
          continue;
        }
        // add file to list
        fileList.push(itemPath);
      }

      // if queue, process next item recursive
      if (readDirQueue.length > 0) {
        return readDir(readDirQueue.shift());
      }
      // finished - return file list
      return fileList;
    }

    // read item list from directory, stat each item then walk result
    return getItemList(dir)
      .then(getItemListStat)
      .then(processItemList)
      .catch(err => {
        return([]);
      });
  }

  // commence reading at the top
  return readDir(readDirQueue.shift());
}

function statFile(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        return reject();
      }
      resolve(stats);
    });
  });
}

function hasChanged(file) {
  if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
    const tsfile = file;
    const jsfile = file
      .replace(/\.ts$/, ".js")
      .replace(searchString, replacementString);
    if (fs.existsSync(jsfile)) {
      return Promise.all([statFile(tsfile), statFile(jsfile)]).then(results => {
        const tsmtime = results[0].mtime;
        const jsmtime = results[1].mtime;
        if (jsmtime < tsmtime) {
          return Promise.resolve(tsfile);
        } else {
          return Promise.resolve();
        }
      });
    } else {
      return Promise.resolve(tsfile); // no matching .js file
    }
  } else {
    return Promise.resolve(); // not a .ts file
  }
}

const progName = path.basename(process.argv[1]);
const args = process.argv.slice(2);

const silentIndex = args.indexOf("-s");
const silent = silentIndex > -1;
if (silent) {
  args.splice(silentIndex, 1);
}

const replaceIndex = args.indexOf("-r");
const replace = replaceIndex > -1;
const searchString = replace ? args[replaceIndex + 1] : undefined;
const replacementString = replace ? args[replaceIndex + 2] : undefined;
if (replace) {
  args.splice(replaceIndex, 3);
}

args.map(maybeDir => {
  if (!fs.existsSync(maybeDir) || !fs.lstatSync(maybeDir).isDirectory()) {
    console.error(progName + ":", maybeDir + ":", "No such directory");
    process.exit(-1);
  }
});

const startDirs = args.length > 0 ? args : ["."];

readDirRecursive(startDirs).then(fileList => {
  Promise.all(fileList.map(hasChanged)).then(results => {
    const changedFiles = results.filter(n => { return n != undefined });
    if (!silent && changedFiles.length > 0) {
      changedFiles.map(file => console.log(file));
    }
    process.exit(changedFiles.length);
  });
});
