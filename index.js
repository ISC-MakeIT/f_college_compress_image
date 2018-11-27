const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const compress = require("./compress");
const resize = require("./resize");

// const head_shot = require("./head_shot");
const profile_photo = require("./profile_photo");

// let value
let counter = 0;

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

const getCount = () => {
	counter += 1;
	return counter;
}

const arg = process.argv;

if (arg.length != 5) {
	throw new Error("not match arg count");
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
		const result = await resize(srcPath, dstPath, 1280);
		compressSrcPath = dstPath;
		compressDstPath = `${dstPath}_compress`;
	}
	if (mode === "compress" || mode === "both") {
		console.log("compress");
		if (mode === "compress") {
			compressSrcPath = srcPath;
			compressDstPath = dstPath;
		}
		const result = await compress(compressSrcPath, compressDstPath);
	}
	for (const photoPath of profile_photo) {
		profileSrcPath = `${compressDstPath}${photoPath}`;
		profileDstPath = `${compressDstPath}_profile${photoPath}`;
		resize(profileSrcPath, profileDstPath, 480)
		.then(() => {
			let index = getCount();
			console.log(`${index} : success resize profile_photo\n  ${compressDstPath}/${photoPath}`);
		});
	}
})();
