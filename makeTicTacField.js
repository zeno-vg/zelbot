const jimp = require("jimp");

//const fieldURI = "./Images/transparentCanvas.png";

const pieceSize = {
	"width":128,
	"height":128,
};
const canvasSize = {
	"width":464,
	"height":464,
};
const lineSize = (canvasSize.width-pieceSize.width*3)/4;
const lineCount = 4;

const blackHex = 000000;

new jimp(canvasSize.width,canvasSize.height,16777215,function (err,img){
	if(err){
		throw err;
	}
	img=img.clone();
	//draw horizontal lines
	for(let line=0;line!=lineCount;line++){
		for(let pixelPos=0;pixelPos!=canvasSize.width;pixelPos++){
			for(let lineHeight=0;lineHeight!=lineSize;lineHeight++){
				img.setPixelColor(blackHex,pixelPos,lineHeight+pieceSize.height*line+lineSize*line);
			}
		}
	}
	//draw vertical lines
	for(let line=0;line!=lineCount;line++){
		for(let pixelPos=0;pixelPos!=canvasSize.height;pixelPos++){
			for(let lineWidth=0;lineWidth!=lineSize;lineWidth++){
				img.setPixelColor(blackHex,lineWidth+pieceSize.width*line+lineSize*line,pixelPos);
			}
		}
	}
	img.write(`./Images/Board${Date.now()}.png`);
});