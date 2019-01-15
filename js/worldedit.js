'use strict';
const worldeditSET_POS_FIRST = "Set first pos";
const worldeditSET_POS_SECOND = "Set second pos";
function worldeditCopy() {
	if (worldeditSelection.x === -1) return;
	logicWriteBlockStates();
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
	worldeditCopyOffset = {x: minX - Math.floor(renderCamera.x), y: minY - Math.floor(renderCamera.y), z: minZ - Math.floor(renderCamera.z)};
}
function worldeditStoreVolume(startX, startY, startZ, endX, endY, endZ) {
	logicWriteBlockStates();
	worldeditStoredVolume = {startX: startX, startY: startY, startZ: startZ, endX: endX, endY: endY, endZ: endZ};
	let volume = (endX - startX)*(endY - startY)*(endZ - startZ);
	if (volume > worldeditStoredBlocks.length) {
		worldeditStoredBlocks = new Uint8Array(volume);
	}
	let index = 0;
	for (let x = startX; x < endX; ++x) {
		for (let y = startY; y < endY; ++y) {
			for (let z = startZ; z < endZ; ++z, ++index) {
				worldeditStoredBlocks[index] = worldGetBlock(x, y, z);
			}
		}
	}
}
function worldeditRestoreVolume() {
	if (worldeditStoredVolume.startX === -1) return;
	let startX = worldeditStoredVolume.startX, startY = worldeditStoredVolume.startY, startZ = worldeditStoredVolume.startZ;
	let endX = worldeditStoredVolume.endX, endY = worldeditStoredVolume.endY, endZ = worldeditStoredVolume.endZ;
	let index = 0;
	for (let x = startX; x < endX; ++x) {
		for (let y = startY; y < endY; ++y) {
			for (let z = startZ; z < endZ; ++z, ++index) {
				logicOnBlockRemoved(x, y, z, worldGetBlock(x, y, z));
				let block = worldeditStoredBlocks[index];
				worldSetBlock(x, y, z, block);
				logicOnBlockAdded(x, y, z, block);
			}
		}
	}
	worldeditStoredVolume.startX = -1;
}
function worldeditFill() {
	let fillX = worldeditSelection.x, fillY = worldeditSelection.y, fillZ = worldeditSelection.z;
	let dx = worldeditSelection.dx, dy = worldeditSelection.dy, dz = worldeditSelection.dz;
	let endX = fillX + dx, endY = fillY + dy, endZ = fillZ + dz;
	worldeditStoreVolume(fillX, fillY, fillZ, endX, endY, endZ);
	for (let x = fillX; x < endX; ++x) {
		for (let y = fillY; y < endY; ++y) {
			for (let z = fillZ; z < endZ; ++z) {
				logicOnBlockRemoved(x, y, z, worldGetBlock(x, y, z));
				worldSetBlock(x, y, z, gCurrentBlock);
				logicOnBlockAdded(x, y, z, gCurrentBlock);
			}
		}
	}
}
function worldeditPaste(pasteX, pasteY, pasteZ) {
	let dx = worldeditSelection.dx, dy = worldeditSelection.dy, dz = worldeditSelection.dz;
	let endX = pasteX + dx, endY = pasteY + dy, endZ = pasteZ + dz;
	worldeditStoreVolume(pasteX, pasteY, pasteZ, endX, endY, endZ);
	let index = 0;
	for (let x = pasteX; x < endX; ++x) {
		for (let y = pasteY; y < endY; ++y) {
			for (let z = pasteZ; z < endZ; ++z, ++index) {
				logicOnBlockRemoved(x, y, z, worldGetBlock(x, y, z));
				let block = worldeditBlocks[index];
				worldSetBlock(x, y, z, block);
				logicOnBlockAdded(x, y, z, block);
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
	worldeditCopyOffset = {x: -1};
	worldeditBlocks = new Uint8Array(0);
	worldeditStoredBlocks = new Uint8Array(0);
	worldeditStoredVolume = {startX: -1};
	worldeditSetPosButton = document.getElementById(HTML_SET_POS_BUTTON);
	worldeditSetPosButton.innerHTML = worldeditSET_POS_FIRST;
	worldeditSetPosButton.onclick = function() {
		worldeditSetPos();
		if (worldeditSelection.x !== -1 || worldeditPrevPos.x === -1) {
			worldeditSetPosButton.innerHTML = worldeditSET_POS_FIRST;
		} else {
			worldeditSetPosButton.innerHTML = worldeditSET_POS_SECOND;
		}
	};
	document.getElementById(HTML_COPY_BUTTON).onclick = function() {
		worldeditCopy();
	};
	document.getElementById(HTML_PASTE_BUTTON).onclick = function() {
		if (worldeditCopyOffset.x !== -1) {
			worldeditPaste(Math.floor(renderCamera.x) + worldeditCopyOffset.x, Math.floor(renderCamera.y) + worldeditCopyOffset.y, Math.floor(renderCamera.z) + worldeditCopyOffset.z);
		}
	};
	document.getElementById(HTML_UNDO_BUTTON).onclick = function() {
		worldeditRestoreVolume();
	};
	document.getElementById(HTML_FILL_BUTTON).onclick = function() {
		worldeditFill();
	};
}
var worldeditSetPosButton;
var worldeditSelection;
var worldeditPrevPos;
var worldeditBlocks;
var worldeditStoredBlocks;
var worldeditStoredVolume;
var worldeditCopyOffset;