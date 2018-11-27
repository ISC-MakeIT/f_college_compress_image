// require modules
const compress_images = require('compress-images');

// constant value
const FILE_TYPE = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG"];

// declare function 
const createSrcPath = (path) => {
	const regex = new RegExp(`\.${FILE_TYPE.join("|")}`);
	if (!regex.test(path)) {
		path = `${path}/**/*.{${FILE_TYPE.join(",")}}`;
	}
	return path;
}

const compress = async (srcPath, dstPath) => {
	return new Promise((resolve, reject) => {
		srcPath = createSrcPath(srcPath);
		dstPath = `${dstPath}/`;
		compress_images(srcPath, dstPath, {compress_force: false, statistic: true, autoupdate: true}, false,
			{jpg: {engine: 'mozjpeg', command: ['-quality', '85']}},
			{png: {engine: 'pngquant', command: ['--quality=80-85']}},
			{svg: {engine: false, command: false}},
			{gif: {engine: false, command: false}}, (error, completed, statistic) => {
			
			if (statistic) {
				console.log(statistic);
			} else if (completed === true) {
				resolve("complete");
			} else if (error === null) {
				resolve("nothing compressed");
			}
		});
	});
}

module.exports = compress;
