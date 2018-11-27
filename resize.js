// require modules
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const sharp = require("sharp");

// constant value
const FILE_TYPE = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG"];

// let value
let counter = 0;

// declare function
/**
 * 指定したディレクトリ以下のファイルを再帰的に取得する。
 * @param {*} dir 
 */
const getRecursiveFileList = async (dir) => {
	return new Promise(async (resolve, reject) => {
		let filePaths = [];
		fsp.readdir(dir).then(async (dirs) => {
			for (const subPath of dirs) {
				switch (await isFileOrDir(path.resolve(dir, subPath))) {
					case "directory":
						const recursivePaths = await getRecursiveFileList(path.resolve(dir, subPath));
						filePaths = filePaths.concat(recursivePaths);
						break;
				
					case "file":
						filePaths.unshift(path.resolve(dir, subPath));
						break;
				}
			}
			resolve(filePaths);
		})
	});
}

/**
 * 指定したディレクトリ以下のディレクトリを再帰的に取得する。
 * @param {*} dir 
 */
const getRecursiveDirList = async (dir) => {
	return new Promise(async (resolve, reject) => {
		let directoryPaths = [];
		fsp.readdir(dir).then(async (dirs) => {
			for (const subPath of dirs) {
				switch (await isFileOrDir(path.resolve(dir, subPath))) {
					case "directory":
						directoryPaths.push(path.resolve(dir, subPath));
						const subPaths = await getRecursiveDirList(path.resolve(dir, subPath));
						subPaths.length !==0 ? directoryPaths.push(...subPaths) : false
						break;
				}
			}
			resolve(directoryPaths);
		})
	});
}

/**
 * 指定したパスのディレクトリを作成する。
 * 途中のディレクトリが存在しない場合、途中のディレクトリも作成する
 * @param {*} targetPath 
 */
const createDirectory = async (targetPath) => {
	return new Promise ((resolve, reject) => {
		fsp.mkdir(targetPath, {recursive: true})
		.then(() => {
			index = getCount();
			resolve(`${index} : create directory: ${targetPath}`);
		});
	})
}

/**
 * srcPathのうち、baseSrcPathに一致するpathをdstPathに置き換える
 * @param {*} baseSrcPath 
 * @param {*} srcPath 
 * @param {*} dstPath 
 */
const createDstPath = (baseSrcPath, srcPath, dstPath) => {
	return `${dstPath}${srcPath.replace(baseSrcPath, "")}`
}

const getCount = () => {
	counter += 1;
	return counter;
}

/**
 * 指定されたパスの画像を比を保ったまま長辺が1280pxになるようにリサイズし、指定したパスに保存する。
 * @param {*} srcPath 
 * @param {*} dstPath 
 */
const resizePicture = async (srcPath, dstPath, maxSize) => {
	return new Promise(async (resolve, reject) => {
		const MAX_LENGTH = maxSize;
		let fileType = path.extname(srcPath).replace(".", "");
		if (FILE_TYPE.includes(fileType)) {
			let image = sharp(srcPath);
			image.metadata()
			.then(async (metadata) => {
				const originalWidth = metadata.width;
				const originalHeight = metadata.height;
				let aspectRatio;
				let sizeOption;

				if (originalWidth > MAX_LENGTH || originalHeight > MAX_LENGTH) {
					if (originalWidth > originalHeight) {
						aspectRatio = MAX_LENGTH / originalWidth;
						sizeOption = [MAX_LENGTH, null];
					} else {
						aspectRatio = MAX_LENGTH / originalHeight;
						sizeOption = [null, MAX_LENGTH];
					}

					image
					.resize(sizeOption[0], sizeOption[1])
					.toFile(dstPath)
					.then(() => {
						let index = getCount();
						console.log(`${index} : resize ${(aspectRatio * 100).toFixed(2)}%:\n  ${srcPath}\n→ ${dstPath}`);
						resolve("success");
					});
				} else {
					fsp.copyFile(srcPath, dstPath)
						.then(() => {
							let index = getCount();
							console.log(`${index} : not need resize. copy file:\n  ${srcPath}\n→ ${dstPath}`);
							resolve("success");
						})
				}
			});
		} else {
			let index = getCount();
			console.log(`${index} : not picture. skipped.`)
			resolve("success");
		}
	});
}

/**
 * 指定されたパスがファイルかディレクトリかを返却する。
 * @param {*} _path 
 */
const isFileOrDir = async (_path) => {
	return new Promise(async (resolve, reject) => {
		fsp.stat(_path)
		.then((stats) => {
			if (stats.isDirectory()) {
				resolve("directory");
			} else if (stats.isFile()) {
				resolve("file");
			}
		})
	});
}

const resize = (srcPath, dstPath, maxSize) => {
	return new Promise(async (resolve, reject) => {
		let fileType = path.extname(srcPath).replace(".", "");
		if (await isFileOrDir(srcPath) === "file" && FILE_TYPE.includes(fileType)) {
			await fsp.mkdir(path.dirname(dstPath), {recursive: true});
			resizePicture(srcPath, dstPath, maxSize)
				.then(() => {
					console.log("resized");
					resolve("success resize");
				});
		} else if (isFileOrDir(srcPath) === "directory") {
			const dirPaths = await getRecursiveDirList(srcPath);
			const filePaths = await getRecursiveFileList(srcPath);
			console.log(`start copy directory`);
			for (const path of dirPaths) {
				let result = await createDirectory(createDstPath(srcPath, path, dstPath));
			}
			counter = 0;
			console.log("start resize file");
			Promise.all(filePaths.map((filePath) => {
				return resizePicture(filePath, createDstPath(srcPath, filePath, dstPath), maxSize);
			}))
			.then(() => {
				resolve("success");
			});	
		}
	});
}

module.exports = resize;
