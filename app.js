/*
Before you start reading:
1. 	the Unofficial Doom Spec being referred to throughout this code
	can be found at http://www.gamers.org/dhs/helpdocs/dmsp1666.html
	It is an EXCELLENT document and I highly suggest reading it before reading this code
	I promise it'll help you understand it better

2. 	WAD files are LITTE-ENDIAN.

3. Wherever the specs refer to a " 'tag' or 'trigger' " I have stuck to the term tag.

3. 	This is a learning project, and I welcome constructive feedback. 
	I'm only here because I love Doom and I want to learn Javascript.
	And if there is something you can teach me, I'd love for you to share :)
*/

"use strict";



const fs = require('fs');
const express = require('express');
const { promisify } = require("util");
const wadreader = require("./wadreader")

// TODO: eventually replace with command-line WAD loading
const wadPath = "./doom1.wad"; // Rip and tear! :D
const readMode = 'r'; // So we don't mess up and write over the WAD file. Easier to read than 'r'
// const dirEntrySize = 16;


// So we can use promises and async/await on file operations instead of getting into callback hell
const read = promisify(fs.read);
const openFile = promisify(fs.open);


/*
Every great game should have an awful ASCII art title header
This ASCII art for the heading "ShantyDoom" comtains both backtick ` and backslash \ characters.
Both of these have been be escaped w/ backslashes to render correctly.
*/
const titleText = `  _________.__                   __           ________                         
 /   _____/|  |__ _____    _____/  |_ ___.__. \\______ \\   ____   ____   _____  
 \\_____  \\ |  |  \\\\__  \\  /    \\   __<   |  |  |    |  \\ /  _ \\ /  _ \\ /     \\ 
 /        \\|   Y  \\/ __ \\|   |  \\  |  \\___  |  |    \`   (  <_> |  <_> )  Y Y  \\
/_______  /|___|  (____  /___|  /__|  / ____| /_______  /\\____/ \\____/|__|_|  /
        \\/      \\/     \\/     \\/      \\/              \\/                    \\/ `;



const constructLevel = async (fd, levelJSON) => {
	let levelThings = await wadreader.readTHINGS(fd, levelJSON.THINGS_entry);
	// console.log(JSON.stringify(levelThings[0]));
	let levelLinedefs = await wadreader.readLINEDEFS(fd, levelJSON.LINEDEFS_entry);
	// console.log(JSON.stringify(levelLinedefs[0]));
	let levelSidedefs = await wadreader.readSIDEDEFS(fd, levelJSON.SIDEDEFS_entry);
	// console.log(JSON.stringify(levelSidedefs[0]));
	let levelVertexes = await wadreader.readVERTEXES(fd, levelJSON.VERTEXES_entry);
	// console.log(JSON.stringify(levelVertexes[0]));
	let levelSegs = await wadreader.readSEGS(fd, levelJSON.SEGS_entry);
	// console.log(JSON.stringify(levelSegs[0]));
	let levelSsectors = await wadreader.readSSECTORS(fd, levelJSON.SSECTORS_entry);
	// console.log(JSON.stringify(levelSsectors[0]));
	let levelNodes = await wadreader.readNODES(fd, levelJSON.NODES_entry);
	// console.log(JSON.stringify(levelNodes[6]));
	let levelSectors = await wadreader.readSECTORS(fd, levelJSON.SECTORS_entry);
	// console.log(JSON.stringify(levelSectors[10]));
	let tmp = await wadreader.readREJECT(fd, levelJSON.REJECT_entry, levelJSON.SECTORS_entry);
}





// TODO: reject running if the file provided is not a WAD
const main = async () => {
	console.log(titleText);
	console.log("Doom! In Javascript! By Shanty!");
	let fd = await openFile(wadPath, readMode);
	console.log(`WAD file has been opened at fd ${fd}`);
	let doomWadHeader = await wadreader.getWadHeader(fd);
	console.log(JSON.stringify(doomWadHeader));
	let x = await wadreader.readWadDirectory(fd, doomWadHeader);
	console.log(JSON.stringify(x[2]));
	let y = wadreader.getAllMaps(x);
	let e1m2 = y[1]
	constructLevel(fd, e1m2);

}


main();