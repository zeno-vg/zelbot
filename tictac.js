const jimp = require("jimp");

const boardURI = "./Images/board.png";

const pieceSize = {
	"width":128,
	"height":128,
};
const canvasSize = {
	"width":464,
	"heigth":464,
};
const lineSize = 20;
const gbWidth = 3;
const gbLength = 3;

const defaultAvatarURLs = ["https://png.icons8.com/ios/1600/discord-logo.png"]

class TicTacToe{
	/*
		TODO: Figure out if I can use deconstructive assignment here. I don't
		think so because I have to use my getUserFromId method outside of this
		to pass them as users, but I could always make that method take in a array
		and split one out.
	*/
	constructor([p1,p2]){
		this.resetGame(p1,p2);
	}
	resetGame(p1,p2){
		return new Promise((resolve,reject)=>{
			try{
				//controls whose turn it is and sets the game pieces
				this.turn = true;
				//resets the players if those params are provided
				if(p1&&p2){
					this.turnPlayer = {
						"id":p1.id,
						"name":p1.username,
						"virtualPiece":"x",
					};
					jimp.read(p1.avatarURL?p1.avatarURL:"https://png.icons8.com/ios/1600/discord-logo.png").then((p1AvaImg)=>{
						this.turnPlayer.avatar=p1AvaImg.resize(pieceSize.width,pieceSize.height);
					});
					this.turn2Player = {
						"id":p2.id,
						"name":p2.username,
						"virtualPiece":"o",
					};
					jimp.read(p2.avatarURL?p2.avatarURL:"https://png.icons8.com/ios/1600/discord-logo.png").then((p2AvaImg)=>{
						this.turn2Player.avatar=p2AvaImg.resize(pieceSize.width,pieceSize.height);
					});
				}
				//resets the virtual gameboard state
				//x
				this.virtualGameboard=new Array(gbLength);
				for(let x=0;x!=this.virtualGameboard.length;x++){
					//y
					this.virtualGameboard[x]=new Array(gbWidth);
					this.virtualGameboard[x].fill("-");
				}
				//resets the gameboard image
				this.boardStateImage;
				jimp.read(boardURI).then((img)=>{
					this.boardStateImage=img.clone();
				});
				//resets someone-has-one checker
				this.hasWon = false;
				resolve();
			}catch(error){
				reject(error);
			}
		});
	}
	getBoardImage(){
		return this.boardStateImage;
	}
	getVirtualBoard(){
		let temp="";
		for(let x=0;x!=gbWidth;x++){
			temp+=this.virtualGameboard[x].join(" ")+"\n";
		}
		return temp;
	}
	place(msg){
		///!(?:tictac|tictactoe)(?:$| $|( [0-2],[0-2]$))/
		let [x,y] = msg.content.match(/!(?:tictac|tictactoe) place (?: |)([0-2]),([0-2])$/).splice(1).map((entry)=>{
			return Number(entry);
		});
		//let x = Number(cords[0]);
		//let y = Number(cords[1]);
		let playerId = msg.author.id;
		if(this.checkValid(x,y,playerId)){

			this.virtualGameboard[y][x]=this.turn?this.turnPlayer.virtualPiece:this.turn2Player.virtualPiece;
			this.boardStateImage.composite((this.turn?this.turnPlayer.avatar:this.turn2Player.avatar).clone(),0+lineSize*(x+1)+pieceSize.width*x,0+lineSize*(y+1)+pieceSize.height*y);
			let testWin = this.checkWin();
			if(testWin){
				this.hasWon=true;
			}
			this.turn=!this.turn;
			return {boardImage:this.boardStateImage,win:testWin};
		}else{
			return {boardImage:null,win:null};
		}
	}
	checkValid(x,y,playerId){
		if( !(x>=0 && x<gbWidth) ){
			throw new Error(`Invalid X Coordinate (${x}), out of range (${0},${gbWidth})`);
		}
		if( !(y>=0 && y<gbLength) ){
			throw new Error(`Invalid Y Coordinate (${y}), out of range (${0},${gbLength})`);
		}
		if( !( (this.turn && playerId==this.turnPlayer.id) || (!this.turn && playerId==this.turn2Player.id) ) ) {
			throw new Error(`Wrong Player Turn (${playerId} Placed on ${this.currentPlayer().id}'s turn)`);
		}
		if( !(this.virtualGameboard[y][x]=='-') ){
			throw new Error(`Player tried to place piece (${playerId}) on a occupied space (${this.virtualGameboard[y][x]}).`);
		}
		if( this.hasWon==true ){
			throw new Error(`A player has already won.`);
		}
		//if no errors are found then it says it's valid
		return true;
	}
	currentPlayer(){
		return this.turn?this.turnPlayer:this.turn2Player;
	}
	nonCurrentPlayer(){
		return !this.turn?this.turnPlayer:this.turn2Player;
	}
	checkWin(){
		/*
			TODO: Pass something that says what type of victory was made, so that I can
			draw a line showing it on the image.
		*/

		//checks horizontal victory
		for(let x=0;x!=gbWidth;x++){
			if(this.virtualGameboard[x].every(
				(item)=>{
					return item==this.currentPlayer().virtualPiece;
				}
			)){
				return true;
			}
		}
		//checks vertical victory
		for(let x=0;x!=gbLength;x++){
			const checkCol = (col)=>{
				for(let xi=0;xi!=gbWidth;xi++){
					if(this.virtualGameboard[xi][col]!==this.currentPlayer().virtualPiece){
						return false;
					}
				}
				return true;
			}
			for(let xi=0;xi!=gbWidth;xi++){
				if(checkCol(xi)){
					return true;
				}
			}
		}
		//checks diagonal victory
		diaTestLeft:{
			for(let x=0;x!=gbWidth;x++){
				if(this.virtualGameboard[x][x]!==this.currentPlayer().virtualPiece){
					break diaTestLeft;
				}
			}	
			return true;
		}
		diaTestRight:{
			for(let x=0;x!=gbLength;x++){
				//console.log(`(${x},${gbLength-x})`)
				if(this.virtualGameboard[x][gbLength-1-x]!==this.currentPlayer().virtualPiece){
					break diaTestRight;
				}
			}
			return true;
		}
	}
}
module.exports={
	TicTacGame:TicTacToe,
};