class CommandStructure{
	constructor(identifier,dataHandler){
		this.identifier=identifier;
		this.dataHandler=dataHandler;
	}
	identify(cmd){
		return cmd.startsWith(this.identifier);
	}
	run(cmd,msg,params){
		this.dataHandler(cmd.substring(this.identifier.length),msg,params);
	}
}
module.exports={
	"Command":CommandStructure,
}