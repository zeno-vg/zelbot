/*
	Reference Pages:
	https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/frequently-asked-questions.md
	https://discord.js.org/#/docs/main/stable/general/welcome
	Zelbot Invite Link:
	https://discordapp.com/oauth2/authorize?client_id=474031539932495882&scope=bot&permissions=67225601
*/

//starts a timer that can track how long the program has been running for.
//use console.timeLog to print how long the timer has been running for,
//and console.timeEnd to end the timer. Both print out the time it's been running for.
console.time('Program Uptime');
console.time('Zelbot Startup');
console.time('Dependency Loading');


//ENV options | console | testing | release
var ENV = "testing";
const fs = require("fs");

//loads config files
let config = JSON.parse(fs.readFileSync("config.json"));

let userBlacklist = JSON.parse(fs.readFileSync("userBlacklist.json"));
let userWhitelist = JSON.parse(fs.readFileSync("userWhitelist.json"));

let channelBlacklist = JSON.parse(fs.readFileSync("channelBlacklist.json"));
let channelWhitelist = JSON.parse(fs.readFileSync("channelWhitelist.json"));

/*
	Override users are specifically meant for temperary testing / demo purposes, and should 
	not normally be used. They are imported here for special accounts and can be temperarily
	added using the addTempOverrideUser(userid) function.
*/
let overrideUsers = config.overrideUsers;

//loads info files
let quoteList = JSON.parse(fs.readFileSync("quoteList.json"));

const Discord = require("discord.js");

const client = new Discord.Client();
const token = require("./token.json").secret;

//loads dynamic responses
let responses;
if(this.env=="release"){
	responses = JSON.parse(fs.readFileSync("./responses.json"));
}else{
	responses = JSON.parse(fs.readFileSync("./testingresponses.json"));
}

//loads bot setup, bringing the needed methods
//DEPRECATED TILL THIS CAN BE FIGURED OUT
/*
const {addUserBlacklist,removeUserBlacklist,
	addUserWhitelist,removeUserWhitelist,
	addChannelBlacklist,removeChannelBlacklist,
	addChannelWhitelist,removeChannelWhitelist,
	addTempOverrideUser,removeTempOverrideUser,
	getUserById,getUserByName,leaveServer,test1} = require("./botSetup.js")(this);
*/

//loads things to handle commands
const cHandle = require("./commandHandler.js");
let commands = new Array(0);

//loads my simple time class, mostly used for time stamping things.
//DEPRECATED. Because of some discoveries inside of the time class 
//this will no longer be used. I may bring it back in the future 
//for more advanced timers.
//const time = require("./time.js")

//loads tictactoe related things
const {TicTacGame} = require("./tictac.js");
/*
	TODO: Add sessioning support to allow for multiple games to be running at a time.
*/
let tictacSession;

/*
-----------------------------------
| Adds process and bot listeners. |
|                                 |
-----------------------------------
*/

//currently unused
(function miscStartUp(){
	/*
		TODO: Setup the console.counter method for counting things like the amount of commands
		called and the amount of messages processed. (If the messages part is done then the 
		check for bots should be moved so that it doesn't count itself if we're excluding bots)
	*/	
})();
//

//at this point dependency loading has ended, so we can report the time it took.
console.timeEnd('Dependency Loading');
console.time('Process Listener Loading');

/*
	Adds process listeners.

	TODO: Add some logging functionality, maybe adding uptime logging
	if possible with the console.time() module.
	TODO: Find a way to make the process wait for the client.destroy() and cleanUp()
	commands. They are currently being ignored because they are async.
*/
//this is called right before the program exits, either from a error or by manually being exited.
process.on('exit',(exitCode)=>{
	//error code breakdown for nodejs
	//https://github.com/nodejs/node-v0.x-archive/blob/master/doc/api/process.markdown#exit-codes

	//0 is standard for normal exits,
	if(exitCode!==0){
		console.log(`Unexcepted Exit Code: ${exitCode}`);
	}
	console.timeEnd('Program Uptime');
	console.timeEnd('Zel Uptime');
	/*
		TODO: Find out how to make this promise resolve before the main thread continues. 
		Currently it just glosses over this as the promise does not resolve before the 
		thread terminates.
	*/
	client.destroy().then((p)=>{
		console.log(`Zel has been logged out ${p}`);
	});
	//this is called the logout the bot and to cleanup temperary files, as well as potentially 
	//writing information to disk in the future.
	cleanUp().then((err)=>{
		console.log(`${err?err:"Cleanup Finished Successfully"}`);
	});
});
//intercepts ctrl c and makes it so that it uses my on exit function, by explicitly calling process.exit()
process.on('SIGINT',()=>{
	//logs the bot out
	//0 means that everything is fine, and we're just exiting because we feel like it
	process.exit(0);
});
//
console.timeEnd('Process Listener Loading');


console.time('Client Listener Loading');
/*
	Adds listeners for bot events, pretty short for now.
	TODO: Add logging / notification for guild joins and new users.
*/
client.on('ready',()=>{
	//unneeded because of my timers
	//console.log("Zel Bot is Ready");
});
client.on('message',(msg)=>{
	console.log(`(${new Date().toLocaleTimeString('en-US',{hour12:false})}) ${msg.author.tag}: ${msg.content}`);
	/*
	TODO: Make a chat logger
	*/
	processMsg(msg);
	//logMessage(msg);
});
//occurs when the bot joins a new server
client.on('guildCreate',()=>{
});
//occurs when a memeber joins the server
client.on('guildMemberAdd',(member)=>{

});
//
console.timeEnd('Client Listener Loading');


console.time('Main method Function Loading');
/*
	TODO: Find a way to move this to it's own file. The big problem right now is figuring out 
	how to pass this the temperary override users. Other than that this may be moved to another
	file if I pass it the config file, and figure out a way to update that config when the main
	config update is called.

	TODO: Make a way to check commands and text responses differently, so that it evaluates if
	it's a command (if not it'll skip the checks that look for a command) and then will check text
	responses.
*/
function processMsg(msg){
	//checks if we should ignore the user's message
	if(overrideUsers.includes(msg.author.id)){
		console.log("Override User Found");
		//do nothing, because this is a override user meaning that they can bypass normal limits
	}else if( 
		(msg.author.bot==true && config.blacklistBots==true && msg.author.id!==client.id) || 
		(msg.author.id==client.id && config.blacklistSelf==true) ||
		(config.blacklistUsers==true && userBlacklist.includes(msg.author.id)==true ) || 
		(config.blacklistChannels==true && channelBlacklist.includes(msg.channel.id)==true )
	){
		console.log("Fail 2");
		return;
	}else if( 
		(config.whitelistUsers==true && userWhitelist.includes(msg.author.id)==false ) ||
		(config.whitelistChannels==true && channelWhitelist.includes(msg.channel.id)==false )
	){
		console.log("Fail 3");	
		return;
	}
	//special command schemes are | %r for running commands | %p for printing | %sp for special printing
	let tempDone = false;
	for(let x=0;x!=responses.length;x++){
		//pipes the result of the REGEXP into the function. Makes it easier to extract params
		((schemeResults)=>{
			//console.log(`TESTING: ${responses[x].scheme} ${schemeResults}`);
			//value on fail is null, so if it's null then the command was not a match
			if(schemeResults!==null){
				for(let xi=0;xi!=commands.length;xi++){
					if(commands[xi].identify(responses[x].resp)==true){
						if(responses[x].disabled!==true){
							//passes in the response, the msg, and the matches from the command, ignoring the global match.
							commands[xi].run(responses[x].resp,msg,schemeResults.slice(1));
						}else{
							console.log(`Command ${responses[x].name} is currently disabled.`);
						}
						tempDone=true;
					}
				}
			}else{
				//continue
			}
		})(testScheme(msg.content,responses[x].scheme));
		//because I can't break within a anonymous function.
		if(tempDone==true){
			break;
		}
	}
}
	
function testScheme(msg,scheme){
	return new RegExp(scheme).exec(msg);
}
//

/*
		------------------------------------
		 I want to someday move all of these
		 misc methods to another file, but
		 for now they're here as problems
		 were encountered when trying to
		 bind the this variable (which
		 would have allowed the functions 
		 to access outside variables).
		------------------------------------
*/
/*
	Misc methods that are not exported
*/

//helper method to remove things from arrays
function removeAllEntry(arr,search){
	return arr.filter((entry)=>{
		return entry!==search;
	});
}

/*
	Bot Utility Methods that are exported
*/
//I could make some sort of thing that resolves what happens if their is a conflict between the white and blacklist, but that could use 
//a bunch of resources.
function addUserBlacklist(userid){
	userBlacklist.push(userid);
	fs.writeFile("userBlacklist.json",JSON.stringify(userBlacklist,null,4),(error)=>{
		if(error){
			console.log(`Error writing to file, ${error.stack}`);
		}else{
			console.log(`Successfully wrote ${userid} to UserBlacklist.`);
		}
	});
}
function removeUserBlacklist(userid){
	userBlacklist=removeAllEntry(userBlacklist,userid);
	fs.writeFile("userBlacklist.json",JSON.stringify(userBlacklist,null,4),(error)=>{
		if(error){
			console.log(`Error writing to file, ${error.stack}`);
		}else{
			console.log(`Successfully removed ${userid} from UserBlacklist.`);
		}
	});
}
function addUserWhitelist(userid){
	userWhitelist.push(userid);
	fs.writeFile("userWhitelist.json",JSON.stringify(userWhitelist,null,4),(error)=>{
		if(error){
			console.log(`Error writing to file, ${error.stack}`);
		}else{
			console.log(`Successfully wrote ${userid} to UserWhitelist.`);
		}
	});
	//should be unnessacary
	//whitelist = JSON.parse(fs.read("whitelist.json"));
}
function removeUserWhitelist(userid){
	userWhitelist=removeAllEntry(userWhitelist,userid);
	fs.writeFile("userWhitelist.json",JSON.stringify(userWhitelist,null,4),(error)=>{
		if(error){
			console.log(`Error writing to file, ${error.stack}`);
		}else{
			console.log(`Successfully removed ${userid} from UserWhitelist.`);
		}
	});
}
function addChannelBlacklist(channelid){
	channelBlacklist.push(channelid);
	fs.writeFile("channelBlacklist.json",JSON.stringify(channelBlacklist,null,4),(error)=>{
		if(error){
			console.log(`Error writing to file, ${error.stack}`);
		}else{
			console.log(`Successfully wrote ${channelid} to ChannelBlacklist.`);
		}
	});
	//should be unnessacary
	//blacklist = JSON.parse(fs.read("blacklist.json"));
}
function removeChannelBlacklist(channelid){
	channelBlacklist=removeAllEntry(channelBlacklist,channelid);
	fs.writeFile("channelBlacklist.json",JSON.stringify(channelBlacklist,null,4),(error)=>{
		if(error){
			console.log(`Error writing to file, ${error.stack}`);
		}else{
			console.log(`Successfully removed ${channelid} from ChannelBlacklist.`);
		}
	});
	//should be unnessacary
	//blacklist = JSON.parse(fs.read("blacklist.json"));
}
function addChannelWhitelist(channelid){
	channelWhitelist.push(channelid);
	fs.writeFile("channelBlacklist.json",JSON.stringify(channelWhitelist,null,4),(error)=>{
		if(error){
			console.log(`Error writing to file, ${error.stack}`);
		}else{
			console.log(`Successfully wrote ${channelid} to ChannelWhitelist.`);
		}
	});
	//should be unnessacary
	//whitelist = JSON.parse(fs.read("whitelist.json"));
}
function removeChannelWhitelist(channelid){
	channelWhitelist=removeAllEntry(channelWhitelist,channelid);
	fs.writeFile("channelBlacklist.json",JSON.stringify(channelWhitelist,null,4),(error)=>{
		if(error){
			console.log(`Error writing to file, ${error.stack}`);
		}else{
			console.log(`Successfully removed ${channelid} from ChannelWhitelist.`);
		}
	});
	//should be unnessacary
	//whitelist = JSON.parse(fs.read("whitelist.json"));
}
function addTempOverrideUser(userid){
	overrideUsers.push(userid);
}
function removeTempOverrideUser(userid){
	overrideUsers=removeAllEntry(overrideUsers,userid);	
}
//this method either accepts a single id, or a array of ids and provides the user object 
//in a format corresponding to the input.
function getUserById(userid){
	return Array.isArray(userid)?userid.map((entry)=>client.users.get(entry)):client.users.get(userid);
}
function getUserByName(username){
	return client.guilds.fetchMember(username);
}
function leaveServer(guildid){
	client.guilds.get(guildid).leave().then((g)=>{console.log(`Zelbot left server: ${g}`)});
}
//this function deletes a message when provided the message id. It either deletes the message
//be looking in the channel provided by the channelid for the message, or does so by looping
//through all channels and trying to delete the message that way. It is not recommended to 
//delete using the sweeping-through-all-channels approach, as I do not know if ALL discord
//messages across all servers have unique ids, or if ids may be shared.
function deleteMessage(messageid,channelid){
	if(typeof channelid=='undefined'){
		chanSearch:{
			for(let chan of client.channels){
				console.log(chan);
				
				if(chan.fetchMessage(messageid).then(m=>typeof m!=='undefined').catch(e=>console.error(e))){
					channelid=chan.id;
					break chanSearch;
				}else{
					console.log(`Channel ${chan.id} doesn't have msg ${messageid}`);
				}
			}
			throw new Error(`No channel containing ${messageid} was found.`);
		}
	}
	client.channels.get(channelid).fetchMessage(messageid).then((message)=>{
		message.delete().then((msg)=>{
			console.log(`Message ${msg.id} has been deleted.`);
		}).catch((err)=>{
			console.error(err)
		});
	}).catch((err)=>{
		console.error(err);
	});
}
//


/*
	TODO: Make this actually work. Currently the async functions here just get ignored and nothing
	happens.
*/
//this function cleans up things like temperary files. you can pass it either a string, array, or nothing
//depending on if you want to clean up a single item, list of items, or everything
function cleanUp(cleanUpInfo){
	return new Promise((resolve,reject)=>{
		try{
			const all = typeof cleanUpInfo == 'undefined';
			const checkCleanType = (cleanUpInfo,search)=>{
				return Array.isArray(cleanUpInfo)?cleanUpInfo.includes(search):
					(typeof cleanUpInfo)=='string'?(cleanUpInfo==search):'';
			};
			if(all||checkCleanType(cleanUpInfo,"tempUploadFiles")){
				//fs.unlink is used to delete files
				fs.readdir(config.tempFileUpladDir,(err,files)=>{
					for(let file of files){
						fs.unlink(`${config.tempFileUpladDir}/${file}`,(err)=>{
							//maybe put something in here later talking about a temp file was deleted
						});
					}
				});
			}
			fs.readdir(config.tempFileUpladDir,(err,files)=>{
				if(files.length==0){
					resolve();
				}else{
					reject("Files not properly removed");
				}
			});
		}catch(error){
			reject(error);
		}
	});
}
//
console.timeEnd('Main method Function Loading');

/*
	Readline Debugging Stuff
	---
	Allows for admins to access specific run-time commands with the bot, such as reloading / redirecting files
	and for running emergency scripts during runtime.
*/

console.time('Command Line Loading');

const readline = require("readline");
const rl = readline.createInterface({
	input:process.stdin,
	output:process.stdout,
});
rl.on('line',(input)=>{
	//console.log(`Recieved: ${input}`);
	if(input.startsWith("!eval")){
		try{
			eval(input.slice(input.indexOf(" ")));
		}catch(err){
			console.log(err);
		}
		/*
			TODO: Find a way to do this check in such a way that I can use:
			/!reload ([a-zA-Z]+) (\b\w+?\.\w+?$)/
			instead, so that I can pass info to the args easier.
		*/
		//this allows for me to reload files that we use for configs and stuff while the bot is running
	}else if(/!reload [a-zA-Z]+ \b\w+?\.\w+?$/.test(input)){
		/*
			TODO: Find a way to make this more compact and have less repetitive code.
				I think that if I used something that works like pointers and lets me change the outside variable I could do it,
				maybe using this: https://stackoverflow.com/questions/17382427/are-there-pointers-in-javascript
		*/
		switch(input.split(" ")[1]){
			case "responses":
				try{
					fs.readFile(input.split(" ")[2],
						(err,data)=>{
							console.log(`${!err?`Responses were successfully reloaded.`:`Error in Reloading Responses '${input.split(" ")[1]}'`}`);
							responses=JSON.parse(data);
						}
					);
				}catch(err){
					console.log(err);
				}
				break;
			case "quoteList":
				try{
					fs.readFile(input.split(" ")[2],
						(err,data)=>{
							console.log(`${!err?`QuoteList was successfully reloaded.`:`Error in Reloading QuoteList '${input.split(" ")[1]}'`}`);
							quoteList=JSON.parse(data);
						}
					);
				}catch(err){
					console.log(err);
				}
				break;
			case "config":
				try{
					fs.readFile(input.split(" ")[2],
						(err,data)=>{
							console.log(`${!err?`Config was successfully reloaded.`:`Error in Reloading Config '${input.split(" ")[1]}'`}`);
							config=JSON.parse(data);
						}
					);
				}catch(err){
					console.log(err);
				}
				break;
			default:
				console(`Reload Target Not Recognised.`);
		}
		/*
			TODO: Figure out how to properly handle this check in such a way that we can use:
			!(?:message|msg|sendMessage|sendMsg) (\d{18}) (.*)/
			for both the test command and for matching the arguments, rather than sticking it into
			a pipe function like I'm doing.
		*/
	}else if(/!(message|msg|sendMessage|sendMsg) \d{18} .*/.test(input)){
		client.channels.get(input.split(" ")[1]).send(input.match(/!(?:message|msg|sendMessage|sendMsg) \d{18} (.*)/)[1]);
		//this command has no real purpose except being used as a place to put test code and to run quickly.
	}else if(/!testcall/.test(input)){
		const jimp = require("jimp");
		jimp.read(client.users.get("120992865999388676").avatarURL).then((img)=>{
			console.log(img);
			img.getBuffer(jimp.MIME_PNG,(buffer)=>{
				client.channels.get("120993000783478784").send({files:new Discord.Attachment(buffer,"test")});
			})
		})
	}else if(/!clear/.test(input)){
		console.clear();
		console.log(`The console has been cleared.`);
	}else{
		console.log(`Unknown Command ${input}`);
	}
});
//

console.timeEnd('Command Line Loading');

console.time('Bot Command Phraser Loading');
/*
	Adds the command handlers to the bot.
	------------------------------------
	Basically these are used to process the responses to
	commands that the BOT recieves.
*/
//runs the string that is stored in the response
commands.push(new cHandle.Command("%r",
	(cmd,msg,params)=>{
		try{
			//console.log(`CMD: ${cmd}`);
			eval(cmd);
		}catch(error){
			console.error(`Error in Run CMD: ${error.stack}`);
		}
	}));
//runs then prints what is returned by the response
commands.push(new cHandle.Command("%sp",
	(cmd,msg,params)=>{
		try{
			console.log(eval(cmd));
		}catch(error){
			console.error(`Error in SP CMD: ${error.stack}`);
		}
	}));
//prints the response to the console
commands.push(new cHandle.Command("%p",
	(cmd,msg,params)=>{
		console.log(cmd);
	}));
//prints the response as a message
commands.push(new cHandle.Command("%m",
	(cmd,msg,params)=>{
		msg.channel.send(cmd);
	}));
//runs then prints as a message what is returned by the response
commands.push(new cHandle.Command("%sm",
	(cmd,msg,params)=>{
		try{
			msg.channel.send(eval(cmd));
		}catch(error){
			console.log(`Error in SM CMD: ${error.stack}`);
		}
	}));
//
console.timeEnd('Bot Command Phraser Loading');

console.time('Client Login Loading');
/*
	Logs the bot in with the secret, and starts the uptime counter
*/
client.login(token).then(()=>{
	console.timeEnd('Client Login Loading');
	//starts tracking how long zelbot is online.
	console.time('Zel Uptime');
	//at this point the bot has completed it's startup so we can report that.
	console.timeEnd('Zelbot Startup')
});

/*
	TODO: Look into the console class from node for both logging and 
	sending messages for the bot.
	https://nodejs.org/api/console.html
*/