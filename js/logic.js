'use strict';
const logicBASE_SPEED = 100;
const logicSPEED = 100;

const logicEAST_BIT = 0x1;
const logicWEST_BIT = 0x2;
const logicNORTH_BIT = 0x4;
const logicSOUTH_BIT = 0x8;
const logicUP_BIT = 0x10;
const logicDOWN_BIT = 0x20;
const logicBACKTRACKED_BIT = 0x40;

function LogicOutput(x, y, z, state) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.powers = state;
	this.prevPowers = state;
	this.outputs = [];
}
LogicOutput.prototype.updateState = function() {
	if (this.powers > 0) {
		if (this.prevPowers === 0) {
			for (let i = 0, len = this.outputs.length; i < len; ++i) {
				++this.outputs[i].powers;
			}
			worldUpdateBlock(this.x, this.y, this.z, blockTYPE_OUTPUT_ON);
			this.prevPowers = this.powers;
		}
	} else if (this.prevPowers > 0) {
		for (let i = 0, len = this.outputs.length; i < len; ++i) {
			--this.outputs[i].powers;
		}
		worldUpdateBlock(this.x, this.y, this.z, blockTYPE_OUTPUT_OFF);
		this.prevPowers = this.powers;
	}
}
function LogicNor(x, y, z, state) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.powers = state;
	this.prevPowers = state;
	this.outputs = [];
}
LogicNor.prototype.updateState = function() {
	if (this.powers > 0) {
		if (this.prevPowers === 0) {
			for (let i = 0, len = this.outputs.length; i < len; ++i) {
				--this.outputs[i].powers;
			}
			this.prevPowers = this.powers;
		}
	} else if (this.prevPowers > 0) {
		for (let i = 0, len = this.outputs.length; i < len; ++i) {
			++this.outputs[i].powers;
		}
		this.prevPowers = this.powers;
	}
}
function LogicOr(x, y, z, state) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.powers = state;
	this.prevPowers = state;
	this.outputs = [];
}
LogicOr.prototype.updateState = function() {
	if (this.powers > 0) {
		if (this.prevPowers === 0) {
			for (let i = 0, len = this.outputs.length; i < len; ++i) {
				++this.outputs[i].powers;
			}
			this.prevPowers = this.powers;
		}
	} else if (this.prevPowers > 0) {
		for (let i = 0, len = this.outputs.length; i < len; ++i) {
			--this.outputs[i].powers;
		}
		this.prevPowers = this.powers;
	}
}
function logicPushIfUnique(list, newEntry) {
	for (let i = 0; i < list.length; ++i) {
		let entry = list[i];
		if (newEntry.x === entry.x && newEntry.y === entry.y && newEntry.z === entry.z) {
			return;
		}
	}
	list.push(newEntry);
}
function logicCompileOutputObject(outputObject) {
	let logicBlocks = [];
	let x = outputObject.x, y = outputObject.y, z = outputObject.z;
	logicFindConnections(x + 1, y, z, worldGetBlock(x + 1, y, z), blockIsLogic, logicBlocks);
	logicFindConnections(x - 1, y, z, worldGetBlock(x - 1, y, z), blockIsLogic, logicBlocks);
	logicFindConnections(x, y + 1, z, worldGetBlock(x, y + 1, z), blockIsLogic, logicBlocks);
	logicFindConnections(x, y - 1, z, worldGetBlock(x, y - 1, z), blockIsLogic, logicBlocks);
	logicFindConnections(x, y, z + 1, worldGetBlock(x, y, z + 1), blockIsLogic, logicBlocks);
	logicFindConnections(x, y, z - 1, worldGetBlock(x, y, z - 1), blockIsLogic, logicBlocks);
	
	outputObject.outputs.length = 0;
	// TODO: Could benefit from chunk structure
	for (let i = 0; i < logicLogicObjects.length; ++i) {
		let logicObject = logicLogicObjects[i];
		for (let j = 0; j < logicBlocks.length; ++j) {
			let logic = logicBlocks[j];
			if (logicObject.x === logic.x && logicObject.y === logic.y && logicObject.z === logic.z) {
				outputObject.outputs.push(logicObject);
				break;
			}
		}
	}
}
function logicCompileConnectedOutputObjects(x, y, z, wireType) {
	let connected = [];
	if (wireType === 0) {
		logicFindConnections(x, y, z, blockTYPE_WIRE1, blockIsOutput, connected);
		logicFindConnections(x, y, z, blockTYPE_WIRE2, blockIsOutput, connected);
	} else {
		logicFindConnections(x, y, z, wireType, blockIsOutput, connected);
	}
	// TODO: Could benefit from chunk structure
	for (let i = 0; i < connected.length; ++i) {
		let pos = connected[i];
		for (let j = 0; j < logicOutputObjects.length; ++j) {
			let outputObject = logicOutputObjects[j];
			if (outputObject.x === pos.x && outputObject.y === pos.y && outputObject.z === pos.z) {
				logicCompileOutputObject(outputObject);
				break;
			}
		}
	}
}
function logicCompileLogicObject(logicObject) {
	let x = logicObject.x, y = logicObject.y, z = logicObject.z;
	let eastBlock = worldGetBlock(x + 1, y, z), westBlock = worldGetBlock(x - 1, y, z), northBlock = worldGetBlock(x, y, z + 1), southBlock = worldGetBlock(x, y, z - 1), upBlock = worldGetBlock(x, y + 1, z), downBlock = worldGetBlock(x, y - 1, z);
	logicObject.outputs.length = 0;
	// TODO: Could benefit from chunk structure
	if (blockIsOutput(eastBlock)) {
		for (let i = 0; i < logicOutputObjects.length; ++i) {
			let output = logicOutputObjects[i];
			if (output.x === x + 1 && output.y === y && output.z === z) {
				logicObject.outputs.push(output);
				break;
			}
		}
	}
	if (blockIsOutput(westBlock)) {
		for (let i = 0; i < logicOutputObjects.length; ++i) {
			let output = logicOutputObjects[i];
			if (output.x === x - 1 && output.y === y && output.z === z) {
				logicObject.outputs.push(output);
				break;
			}
		}
	}
	if (blockIsOutput(northBlock)) {
		for (let i = 0; i < logicOutputObjects.length; ++i) {
			let output = logicOutputObjects[i];
			if (output.x === x && output.y === y && output.z === z + 1) {
				logicObject.outputs.push(output);
				break;
			}
		}
	}
	if (blockIsOutput(southBlock)) {
		for (let i = 0; i < logicOutputObjects.length; ++i) {
			let output = logicOutputObjects[i];
			if (output.x === x && output.y === y && output.z === z - 1) {
				logicObject.outputs.push(output);
				break;
			}
		}
	}
	if (blockIsOutput(upBlock)) {
		for (let i = 0; i < logicOutputObjects.length; ++i) {
			let output = logicOutputObjects[i];
			if (output.x === x && output.y === y + 1 && output.z === z) {
				logicObject.outputs.push(output);
				break;
			}
		}
	}
	if (blockIsOutput(downBlock)) {
		for (let i = 0; i < logicOutputObjects.length; ++i) {
			let output = logicOutputObjects[i];
			if (output.x === x && output.y === y - 1 && output.z === z) {
				logicObject.outputs.push(output);
				break;
			}
		}
	}
}
function logicCompileConnectedLogicObjects(x, y, z) {
	// TODO: Could benefit from chunk structure
	for (let i = 0; i < logicLogicObjects.length; ++i) {
		let logicObject = logicLogicObjects[i];
		if (Math.abs(logicObject.x - x) + Math.abs(logicObject.y - y) + Math.abs(logicObject.z - z) === 1) {
			// TODO: Lazy, doesn't need to recompile whole object
			logicCompileLogicObject(logicObject);
		}
	}
}
function logicFindConnections(x, y, z, wireType, blockFunction, list) {
	if (!blockIsWire(wireType)) {
		return;
	}
	let backtrackStack = [];
	let blockEast, blockWest, blockNorth, blockSouth, blockUp, blockDown;
	let prevBranch = 0;
	let availableBranches;
	outer:
	while (true) {
		if ((prevBranch & logicBACKTRACKED_BIT) === 0) {
			availableBranches = 0;
			if ((prevBranch & logicWEST_BIT) === 0) {
				blockEast = worldGetBlock(x + 1, y, z);
				if (blockEast === wireType) {
					availableBranches |= logicEAST_BIT;
				} else if (blockFunction(blockEast)) {
					logicPushIfUnique(list, {x: x + 1, y: y, z: z});
				}
			}
			if ((prevBranch & logicEAST_BIT) === 0) {
				blockWest = worldGetBlock(x - 1, y, z);
				if (blockWest === wireType) {
					availableBranches |= logicWEST_BIT;
				} else if (blockFunction(blockWest)) {
					logicPushIfUnique(list, {x: x - 1, y: y, z: z});
				}
			}
			if ((prevBranch & logicSOUTH_BIT) === 0) {
				blockNorth = worldGetBlock(x, y, z + 1);
				if (blockNorth === wireType) {
					availableBranches |= logicNORTH_BIT;
				} else if (blockFunction(blockNorth)) {
					logicPushIfUnique(list, {x: x, y: y, z: z + 1});
				}
			}
			if ((prevBranch & logicNORTH_BIT) === 0) {
				blockSouth = worldGetBlock(x, y, z - 1);
				if (blockSouth === wireType) {
					availableBranches |= logicSOUTH_BIT;
				} else if (blockFunction(blockSouth)) {
					logicPushIfUnique(list, {x: x, y: y, z: z - 1});
				}
			}
			if ((prevBranch & logicDOWN_BIT) === 0) {
				blockUp = worldGetBlock(x, y + 1, z);
				if (blockUp === wireType) {
					availableBranches |= logicUP_BIT;
				} else if (blockFunction(blockUp)) {
					logicPushIfUnique(list, {x: x, y: y + 1, z: z});
				}
			}
			if ((prevBranch & logicUP_BIT) === 0) {
				blockDown = worldGetBlock(x, y - 1, z);
				if (blockDown === wireType) {
					availableBranches |= logicDOWN_BIT;
				} else if (blockFunction(blockDown)) {
					logicPushIfUnique(list, {x: x, y: y - 1, z: z});
				}
			}
		}
		outer1:
		while (availableBranches !== 0) {
			let newX = x, newY = y, newZ = z;
			let reverseBranch;
			if ((availableBranches & logicEAST_BIT) !== 0) {
				++newX;
				prevBranch = logicEAST_BIT;
				reverseBranch = logicWEST_BIT;
			} else if ((availableBranches & logicWEST_BIT) !== 0) {
				--newX;
				prevBranch = logicWEST_BIT;
				reverseBranch = logicEAST_BIT;
			} else if ((availableBranches & logicNORTH_BIT) !== 0) {
				++newZ;
				prevBranch = logicNORTH_BIT;
				reverseBranch = logicSOUTH_BIT;
			} else if ((availableBranches & logicSOUTH_BIT) !== 0) {
				--newZ;
				prevBranch = logicSOUTH_BIT;
				reverseBranch = logicNORTH_BIT;
			} else if ((availableBranches & logicUP_BIT) !== 0) {
				++newY;
				prevBranch = logicUP_BIT;
				reverseBranch = logicDOWN_BIT;
			} else if ((availableBranches & logicDOWN_BIT) !== 0) {
				--newY;
				prevBranch = logicDOWN_BIT;
				reverseBranch = logicUP_BIT;
			}
			availableBranches &= ~prevBranch;
			for (let i = 0; i < backtrackStack.length; ++i) {
				let entry = backtrackStack[i];
				if (newX === entry.x && newY === entry.y && newZ === entry.z) {
					entry.availableBranches &= ~reverseBranch;
					continue outer1;
				}
			}
			if (availableBranches !== 0) {
				backtrackStack.push({x: x, y: y, z: z, availableBranches: availableBranches});
			}
			x = newX;
			y = newY;
			z = newZ;
			continue outer;
		}
		if (backtrackStack.length > 0) {
			let backtrack = backtrackStack.pop();
			x = backtrack.x;
			y = backtrack.y;
			z = backtrack.z;
			availableBranches = backtrack.availableBranches;
			prevBranch = logicBACKTRACKED_BIT;
		} else {
			return;
		}
	}
}
function logicCompileAll() {
	for (let i = 0; i < logicLogicObjects.length; ++i) {
		logicCompileLogicObject(logicLogicObjects[i]);
	}
	for (let j = 0; j < logicOutputObjects.length; ++j) {
		logicCompileOutputObject(logicOutputObjects[j]);
	}
}
function logicWriteBlockStates() {
	for (let i = 0; i < logicLogicObjects.length; ++i) {
		let object = logicLogicObjects[i];
		worldSetBlockState(object.x, object.y, object.z, object.powers > 0);
	}
}
function logicUpdateLogicObjects() {
	for (let i = 0; i < logicLogicObjects.length; ++i) {
		logicLogicObjects[i].updateState();
	}
}
function logicUpdateOutputObjects() {
	for (let i = 0; i < logicOutputObjects.length; ++i) {
		logicOutputObjects[i].updateState();
	}
}
function logicUpdate() {
	logicSpeedProgress += logicSPEED;
	while (logicSpeedProgress >= logicBASE_SPEED) {
		logicUpdateLogicObjects();
		logicUpdateOutputObjects();
		logicSpeedProgress -= logicBASE_SPEED;
	}
}
function logicInit() {
	logicLogicObjects = [];
	logicOutputObjects = [];
	logicSpeedProgress = 0;
}
var logicSpeedProgress;
var logicLogicObjects;
var logicOutputObjects;