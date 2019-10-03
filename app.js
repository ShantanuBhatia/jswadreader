const fs = require('fs');
const { promisify } = require("util");

// TODO: replace with something a bit more substantial later
const wadPath = "./doom1.wad"; // Rip and tear! :D


const readMode = 'r'; // So we don't fuck up and write over the WAD file. Just easier to read than 'r'
const dirEntrySize = 16;
const headerSize = 12;
// So we can use async/await
const read = promisify(fs.read);
const openFile = promisify(fs.open);

// let wad_header = {
// 	"wad_type": "",
// 	"no_of_lumps": 0,
// 	"dir_offset": 0
// };

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
// const readLump = async (fd, entryOffset){
// 	let buf = Buffer.alloc(dirEntrySize);
// 	let headerInfo = await read(fd, buf, entryOffset, dirEntrySize, 0);

// }


// /*
// Returns a list of JSON objects for all entries in the WAD directory. 
// */
// const readWadDirectory = async (fd, wadHeader) {
// 	console.log("TODO");
// }



/*
Returns JSON of the WAD's header data

The first twelve bytes of the WAD file contain:
four bytes of ASCII text saying if this is an IWAD or a PWAD
four bytes of a little-endian long int telling how many lumps there are
four bytes of a little-endian long int telling the offset from the start of the file to the beginning of the directory
*/
async function getWadHeader(fd) {
	let buf = Buffer.alloc(headerSize);
	let headerInfo = await read(fd, buf, 0, headerSize, 0);
	//TODO: error if the file doesn't start with IWAD or PWAD
	return ({
		"wad_type": headerInfo.buffer.toString('utf8', 0, 4),
		"no_of_lumps": headerInfo.buffer.readUInt32LE(4),
		"dir_offset": headerInfo.buffer.readUInt32LE(8)
	});
}

async function main() {
	let fd = await openFile(wadPath, readMode);
	console.log(`WAD file has been opened at fd ${fd}`);
	let doomWadHeader = await getWadHeader(fd);
	console.log(JSON.stringify(doomWadHeader));
}


main();