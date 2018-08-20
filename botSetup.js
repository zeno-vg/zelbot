/*
---------------------------------
Attempts to seperate these functions from the main class failed, and so this is a rement of that

----------------
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
	fs.writeFile("userBlacklist.json",JSON.stringify(userBlacklist,null,4));
}
function removeUserBlacklist(userid){
	userBlacklist=removeAllEntry(userBlacklist,userid);
	fs.writeFile("userBlacklist.json",JSON.stringify(userBlacklist,null,4));
}
function addUserWhitelist(userid){
	userWhitelist.push(userid);
	fs.writeFile("userWhitelist.json",JSON.stringify(userWhitelist,null,4));
	//should be unnessacary
	//whitelist = JSON.parse(fs.read("whitelist.json"));
}
function removeUserWhitelist(userid){
	userWhitelist=removeAllEntry(userWhitelist,userid);
	fs.writeFile("userWhitelist.json",JSON.stringify(userWhitelist,null,4));
}
function addChannelBlacklist(channelid){
	channelBlacklist.push(channelid);
	fs.writeFile("channelBlacklist.json",JSON.stringify(channelBlacklist,null,4));
	//should be unnessacary
	//blacklist = JSON.parse(fs.read("blacklist.json"));
}
function removeChannelBlacklist(channelid){
	channelBlacklist=removeAllEntry(channelBlacklist,channelid);
	fs.writeFile("channelBlacklist.json",JSON.stringify(channelBlacklist,null,4));
	//should be unnessacary
	//blacklist = JSON.parse(fs.read("blacklist.json"));
}
function addChannelWhitelist(channelid){
	channelWhitelist.push(channelid);
	fs.writeFile("channelBlacklist.json",JSON.stringify(channelWhitelist,null,4));
	//should be unnessacary
	//whitelist = JSON.parse(fs.read("whitelist.json"));
}
function removeChannelWhitelist(channelid){
	channelWhitelist=removeAllEntry(channelWhitelist,channelid);
	fs.writeFile("channelBlacklist.json",JSON.stringify(channelWhitelist,null,4));
	//should be unnessacary
	//whitelist = JSON.parse(fs.read("whitelist.json"));
}
function addTempOverrideUser(userid){
	overrideUsers.push(userid);
}
function removeTempOverrideUser(userid){
	overrideUsers=removeAllEntry(overrideUsers,userid);	
}
function getUserById(userid){
	return client.users.get(userid);
}
function getUserByName(username){
	return client.guilds.fetchMember(username);
}
function leaveServer(guildid){
	client.guilds.get(guildid).leave().then((g)=>{console.log(`Zelbot left server: ${g}`)});
}

module.exports = {
	addUserBlacklist,
	removeUserBlacklist,
	addUserWhitelist,
	removeUserWhitelist,
	addChannelBlacklist,
	removeChannelBlacklist,
	addChannelWhitelist,
	removeChannelWhitelist,
	addTempOverrideUser,
	removeTempOverrideUser,
	getUserById,
	getUserByName,
	leaveServer,
}