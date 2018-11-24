var compress_images = require('compress-images'), INPUT_path_to_your_images, OUTPUT_path;

	INPUT_path_to_your_images = '../base_picture/**/*.{jpg,JPG,jpeg,JPEG,png,PNG}';
	OUTPUT_path = '../compress_picture/';
	
	compress_images(INPUT_path_to_your_images, OUTPUT_path, {compress_force: false, statistic: true, autoupdate: true}, false,
				{jpg: {engine: 'mozjpeg', command: ['-quality', '85']}},
				{png: {engine: 'pngquant', command: ['--quality=80-85']}},
				{svg: {engine: false, command: false}},
				{gif: {engine: false, command: false}}, function(error, completed, statistic){
				console.log('-------------');
				console.log(error);
				console.log(completed);
				console.log(statistic);
				console.log('-------------');                                   
	});
