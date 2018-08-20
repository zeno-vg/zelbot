const fs = require("fs");
const jimp = require("jimp");
const https = require("https");
const testImageURI = "./Images/board.png";
const avatarURI = "./Images/testAvatar.png";
const img1URL = "https://cdn.discordapp.com/avatars/120992865999388676/fb1e29421bfd4b8e25b1a42a270a513e.png?size=2048";
const img2URL = "https://cdn.discordapp.com/avatars/249743534331133952/04bb98820ca77d88b49124f65cdf437c.png?size=2048";
const rl = require("readline");

const pieceSize = {
	"width":128,
	"height":128,
};
const canvasSize = {
	"width":464,
	"heigth":464,
};
const lineSize = 20;

//let testImage;
//let avatar;
let turn = false;

let board;
jimp.read(testImageURI).then((imgRead)=>{
	board=imgRead.clone();
});
function place(x,y,turn){
	return new Promise(function(res,rej){
		jimp.read(turn?img1URL:img2URL).then((overImg)=>{
			try{
				board.composite(overImg.clone().resize(pieceSize.width,pieceSize.height)
					,0+lineSize*(x+1)+pieceSize.width*x,0+lineSize*(y+1)+pieceSize.height*y);
				//composite(overImg.resize(pieceSize.width,pieceSize.height),0+lineSize*2+pieceSize.width*1,0+lineSize*1+pieceSize.height*0);
				board.write(`./Images/${Date.now()}.png`);
				res(board);
			}catch(error){
				rej(error);
			}
		})
	});
}
setTimeout(()=>{
	place(0,0,true).then(()=>
		place(1,0,false).then(()=>
			place(1,1,true).then(()=>
				place(2,2,false).then(()=>console.log("all resolved in order")))));
},3*1000);
const checkCleanType = (cleanUpInfo,search)=>{
		return Array.isArray(cleanUpInfo)?cleanUpInfo.includes(search):
			(typeof cleanUpInfo)=='string'?cleanUpInfo==search:
				true;
	};
console.log(checkCleanType("",))
/*
jimp.read(testImageURIBB).then((underImg)=>{
	underImg=underImg.clone();
	jimp.read(turn?img1URL:img2URL).then((overImg)=>{
		overImg=overImg.clone();
		image=underImg.composite(overImg.resize(pieceSize.width,pieceSize.height),0+lineSize*(x+1)+pieceSize.width*x,0+lineSize*(y+1)+pieceSize.height*y);
		//composite(overImg.resize(pieceSize.width,pieceSize.height),0+lineSize*2+pieceSize.width*1,0+lineSize*1+pieceSize.height*0);
		image.write(`./Images/${Date.now()}.png`);
	})
});
*/
/*
rl.on('line',()=>{
	image.write(`./Images/${Date.now()}.png`);
});
*/
//console.log(test);
/*
jimp.read(testImageURI,(testImg)=>{
	jimp.read(avatarURI,(overImg)=>{
		testImg.composite(overImg,0,0).write(`./Images/${Date.now()}.png`);
	});
});

/*
let testImage = jimp.read("./Images/zblackCanvasTest.png").then((img)=>{return img.clone()});
let avatar = jimp.read("./Images/testAvatar.png");

testImage=testImage.composite(avatar,0,0);
testImage.write(`./Images/${Date.now()}.png`,()=>{console.log("Done")});
/*
avatar.png().toBuffer().then((val)=>{
	//testImage=testImage.overlayWith(val);
	testImage.overlayWith(val).png().toBuffer().then((val)=>{testImage=val;});
});
*/
/*
testImage.metadata((err,data)=>{
	canvasSize.width = data.width;
	canvasSize.height = data.height;
});

avatar.resize(pieceSize["width"],pieceSize["height"]).toBuffer().then((imgOver)=>{
	testImage.overlayWith(imgOver,{top:Math.round(.33*canvasSize.height),left:0*canvasSize.width}).toBuffer().then((imgDone)=>{
		sharp(imgDone).toFile(`./Images/${Date.now()}.png`);
		//imgDone.toFile(`./Images/${Date.now()}.png`);
	});
});
console.log("Starting Request");
https.get("https://cdn.discordapp.com/avatars/120992865999388676/b3c5f2c675aa2404b71aed33b47ed167.png?size=2048",(resp)=>{
	console.log("request recieved");
	if(resp.statusCode==200){
		console.log("Response code "+resp.statusCode);
		console.log(`${resp.body}`)
		resp.on('end',()=>{
			console.log("End");
			console.log(Buffer.isBuffer(resp.body));
		});
		
	}else{
		console.log(resp.statusCode);
	}
});
//sharp("https://cdn.discordapp.com/avatars/120992865999388676/b3c5f2c675aa2404b71aed33b47ed167.png?size=2048").png().toFile("test.png");
*/