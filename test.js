// require modules
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const jimp = require("jimp");


// declare function
const getRecursiveFileList = async (dir) => {
	return new Promise(async (resolve, reject) => {
		let filePaths = [];
		fsp.readdir(dir).then(async (dirs) => {
			for (const subPath of dirs) {
				switch (await isFileOrDir(getResolvePath(dir, subPath))) {
					case "directory":
						const subPaths = await getRecursiveFileList(getResolvePath(dir, subPath));
						filePaths = filePaths.concat(subPaths);
						break;
				
					case "file":
						filePaths.unshift(getResolvePath(dir, subPath));
						break;
				}
			}
			resolve(filePaths);
		})
	});
}

const getRecursiveDirList = async (dir) => {
	return new Promise(async (resolve, reject) => {
		let directoryPaths = [];
		fsp.readdir(dir).then(async (dirs) => {
			for (const subPath of dirs) {
				switch (await isFileOrDir(getResolvePath(dir, subPath))) {
					case "directory":
						directoryPaths.push(getResolvePath(dir, subPath));
						const subPaths = await getRecursiveDirList(getResolvePath(dir, subPath));
						subPaths.length !==0 ? directoryPaths.push(...subPaths) : ""
						break;
				}
			}
			resolve(directoryPaths);
		})
	});
}

const createDir = async (baseSrcPath, srcPath, dstPath) => {
	return new Promise ((resolve, reject) => {
		let newDstPath = createDstPath(baseSrcPath, srcPath, dstPath);
		fsp.mkdir(newDstPath, {recursive: true})
		.then(() => {
			resolve(`make copy directory:\n  ${srcPath}\n→ ${newDstPath}`);
		});
	})
}

const createDstPath = (baseSrcPath, srcPath, dstPath) => {
	return `${dstPath}${srcPath.replace(baseSrcPath, "")}`
}

const existFile = async (path) => {
	return new Promise(async (resolve, reject) => {
		fsp.access(path, fs.constants.R_OK)
		.then(resolve(true))
		.catch(reject(false));
	});
}

const convertPicture = async (baseSrcPath, srcPath, dstPath) => {
	return new Promise(async (resolve, reject) => {
		let filetype = path.extname(srcPath);
		if (filetype === ".jpg" || filetype === ".jpeg" || filetype === ".JPG" || filetype === ".JPEG" || filetype === ".png" || filetype === ".PNG") {
			let dstFolderPath = createDstPath(baseSrcPath, srcPath, dstPath);
			jimp.read(srcPath)
				.then((image) => {
					image
						.quality(85)
						.write(dstFolderPath);
				})
				.then(() => {
					resolve(`convert 85% quality:\n  ${srcPath}\n→ ${dstFolderPath}`);
				})
				.catch((err) => {
					console.error(err);
				});
		}	
	});
}

const isFileOrDir = async (path) => {
	return new Promise(async (resolve, reject) => {
		fsp.stat(path)
		.then((stats) => {
			if (stats.isDirectory()) {
				resolve("directory");
			} else if (stats.isFile()) {
				resolve("file");
			}
		})
	});
}

const getResolvePath = (dir, subPath) => {
	return path.resolve(dir, subPath);
}

// main logic
const arg = process.argv;

if (arg.length != 4) {
	console.error("not match arg count");
}

const srcPath = path.resolve(arg[2]);
const dstPath = path.resolve(arg[3]);

if (!existFile(srcPath) || !fs.existsSync(dstPath)) {
	console.error("not find some path");
}

(async () => {
	const dirPaths = await getRecursiveDirList(srcPath);
	const filePaths = await getRecursiveFileList(srcPath);
	for (const path of dirPaths) {
		let result = await createDir(srcPath, path, dstPath);
		console.log(result);
	}
	filePaths.forEach(async (path) => {
		let result = convertPicture(srcPath, path, dstPath);
		console.log(result);
	})
})();
