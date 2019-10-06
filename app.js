/*
Note: the Unofficial Doom Spec being referred to throughout my code
can be found at http://www.gamers.org/dhs/helpdocs/dmsp1666.html
*/

const fs = require('fs');
const { promisify } = require("util");

// TODO: replace with command-line WAD loading
const wadPath = "./doom1.wad"; // Rip and tear! :D
const readMode = 'r'; // So we don't fuck up and write over the WAD file. Easier to read than 'r'
const dirEntrySize = 16;
const headerSize = 12;


// So we can use promises and async/await on file operations instead of getting into callback hell
const read = promisify(fs.read);
const openFile = promisify(fs.open);


/*
Returns JSON of the WAD's header data
fd: file descriptor of wad file

The first twelve bytes of the WAD file contain:
four bytes of ASCII text saying if this is an IWAD or a PWAD
four bytes of a little-endian long int telling how many lumps there are
four bytes of a little-endian long int telling the offset from 
	the start of the file to the beginning of the directory
*/
const getWadHeader = async (fd) => {
	let buf = Buffer.alloc(headerSize);
	let headerInfo = await read(fd, buf, 0, headerSize, 0);
	//TODO: error if the file doesn't start with IWAD or PWAD
	return ({
		"wadType": headerInfo.buffer.toString('utf8', 0, 4),
		"noOfLumps": headerInfo.buffer.readUInt32LE(4),
		"dirOffset": headerInfo.buffer.readUInt32LE(8)
	});
}


/*
Returns JSON of a single lump's entry in the WAD directory. 
fd: file descriptor of wad file
offset: offset from start of file at which this directory entry starts

From the unofficial Doom Specs:
The directory has one 16-byte entry for every lump. Each entry consists
of three parts:
    (a) a long integer, the file offset to the start of the lump
    (b) a long integer, the size of the lump in bytes
    (c) an 8-byte ASCII string, the name of the lump, padded with zeros.
	  	For example, the "DEMO1" entry in hexadecimal would be
	  	(44 45 4D 4F 31 00 00 00)
*/
const readDirEntry = async (fd, entryOffset) => {
	let buf = Buffer.alloc(dirEntrySize);
	let dirEntryObj = await read(fd, buf, 0, dirEntrySize, entryOffset);
	let dirEntry = {
		"lumpStartOffset": dirEntryObj.buffer.readUInt32LE(0),
		"lumpSize": dirEntryObj.buffer.readUInt32LE(4),
		// the name string is zero-padded, and JS wants to show the zeroes as the \u0000 character
		// but we don't want that, and trim() doesn't get rid of them, so we regex them away
		"lumpName": dirEntryObj.buffer.toString('utf8', 8, 16).replace(/\0/g, '')
	}
	return dirEntry;
}


/*
Returns a array of JSON objects for all entries in the WAD directory. 
fd: file descriptor of wad file
wadHeader: JSON object created by getWadHeader() describing wad type, lump count, and directory offset.

Starting at the directory starting offset, create entries for each 16-byte directory item. 
List them and return the list.
*/
const readWadDirectory = async (fd, wadHeader) =>  {
	let indices = [...Array(wadHeader.noOfLumps).keys()];
	return Promise.all(
		indices.map( async (x) => { 
			const entry = await readDirEntry(fd, wadHeader.dirOffset+(x*dirEntrySize));
			return entry;
		})
	);
}


/*
From the Unofficial Doom Spec Each level has eleven directory entries and ten lumps: 
	E[x]M[y] (orMAPxy in a DOOM 2 wad), THINGS, LINEDEFS, SIDEDEFS, VERTEXES, SEGS,
	SSECTORS, NODES, SECTORS, REJECT, and BLOCKMAP.
*/
 const 





// TODO: reject running if the file provided is not a WAD
const main = async () => {
	let fd = await openFile(wadPath, readMode);
	console.log(`WAD file has been opened at fd ${fd}`);
	let doomWadHeader = await getWadHeader(fd);
	console.log(JSON.stringify(doomWadHeader));
	let firstDirEntry = await readDirEntry(fd, (doomWadHeader.dirOffset));
	console.log(JSON.stringify(firstDirEntry));
	let x = await readWadDirectory(fd, doomWadHeader);
	// console.log(x.length);

}


main();