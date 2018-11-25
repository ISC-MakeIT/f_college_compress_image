const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const compress = require("./compress");
const resize = require("./resize");

/**
 * 指定したファイルが存在するかを確認する
 * @param {*} filePath 
 */
const existFile = async (filePath) => {
	return new Promise(async (resolve, reject) => {
		fsp.access(filePath, fs.constants.R_OK)
		.then(resolve(true))
		.catch(reject(false));
	});
}

const arg = process.argv;

if (arg.length != 5) {
	console.log("not match arg count");
}

const srcPath = path.resolve(arg[2]);
const dstPath = path.resolve(arg[3]);
let compressSrcPath;
let compressDstPath;
const mode = arg[4];

if (!existFile(srcPath)) {
	throw new Error("not find some path");
}
if (!(mode === "resize" || mode === "compress" || mode === "both")) {
	throw new Error("not defined mode");
}

(async () => {
	if (mode === "resize" || mode === "both") {
		console.log(srcPath);
		console.log(dstPath)
		const result = await resize(srcPath, dstPath);
		console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
		compressSrcPath = dstPath;
		compressDstPath = `${dstPath}_compress`
	}
	if (mode === "compress" || mode === "both") {
		console.log("compress");
		if (mode === "compress") {
			compressSrcPath = srcPath;
			compressDstPath = dstPath;
		}
		console.log(compressSrcPath);
		console.log(compressDstPath);
		const result = await compress(compressSrcPath, compressDstPath);
	}
})();
