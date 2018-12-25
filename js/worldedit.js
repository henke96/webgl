'use strict';
function worldeditCopy() {
	let minX = worldeditSelection.x, minY = worldeditSelection.y, minZ = worldeditSelection.z;
	let dx = worldeditSelection.dx, dy = worldeditSelection.dy, dz = worldeditSelection.dz;
	if (worldeditBlocks.length < dx*dy*dz) {
		worldeditBlocks = new Uint8Array(dx*dy*dz);
	}
	let endX = minX + dx, endY = minY + dy, endZ = minZ + dz;
	let i = 0;
	for (let x = minX; x < endX; ++x) {
		for (let y = minY; y < endY; ++y) {
			for (let z = minZ; z < endZ; ++z, ++i) {
				worldeditBlocks[i] = worldGetBlock(x, y, z);
			}
		}
	}
}
function worldeditPaste(pasteX, pasteY, pasteZ) {
	let dx = worldeditSelection.dx, dy = worldeditSelection.dy, dz = worldeditSelection.dz;
	let endX = pasteX + dx, endY = pasteY + dy, endZ = pasteZ + dz;
	let i = 0;
	for (let x = pasteX; x < endX; ++x) {
		for (let y = pasteY; y < endY; ++y) {
			for (let z = pasteZ; z < endZ; ++z, ++i) {
				worldSetBlock(x, y, z, worldeditBlocks[i]);
			}
		}
	}
}
function worldeditSetPos() {
	if (worldeditSelection.x !== -1 || worldeditPrevPos.x === -1) {
		worldeditPrevPos = {x: Math.floor(renderCamera.x), y: Math.floor(renderCamera.y), z: Math.floor(renderCamera.z)};
		worldeditSelection.x = -1;
	} else {
		let x = Math.floor(renderCamera.x), y = Math.floor(renderCamera.y), z = Math.floor(renderCamera.z);
		let minX, minY, minZ;
		let dx, dy, dz;
		if (x < worldeditPrevPos.x) {
			minX = x;
			dx = worldeditPrevPos.x - x;
		} else {
			minX = worldeditPrevPos.x;
			dx = x - worldeditPrevPos.x;
		}
		if (y < worldeditPrevPos.y) {
			minY = y;
			dy = worldeditPrevPos.y - y;
		} else {
			minY = worldeditPrevPos.y;
			dy = y - worldeditPrevPos.y;
		}
		if (z < worldeditPrevPos.z) {
			minZ = z;
			dz = worldeditPrevPos.z - z;
		} else {
			minZ = worldeditPrevPos.z;
			dz = z - worldeditPrevPos.z;
		}
		worldeditSelection = {x: minX, y: minY, z: minZ, dx: dx + 1, dy: dy + 1, dz: dz + 1};
	}
}
function worldeditInit() {
	worldeditPrevPos = {x: -1};
	worldeditSelection = {x: -1};
	worldeditBlocks = new Uint8Array(0);
}
var worldeditSelection;
var worldeditBlocks;
var worldeditPrevPos;
var worldeditSecondPos;