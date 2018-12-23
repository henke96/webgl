'use strict';
const logicBASE_SPEED = 100;
const logicSPEED = 1;

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
	this.state = state;
	this.inputs = [];
}
LogicOutput.prototype.updateState = function() {
	let prevState = this.state;
	this.state = 0;
	for (let i = 0; i < this.inputs.length; ++i) {
		if (this.inputs[i].state === 1) {
			this.state = 1;
			break;
		}
	}
	if (this.state !== prevState) {
		let blockType = blockTYPE_OUTPUT_OFF;
		if (this.state === 1) {
			blockType = blockTYPE_OUTPUT_ON;
		}
		worldUpdateBlock(this.x, this.y, this.z, blockType);
	}
}
function LogicNor(x, y, z, state) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.state = state;
	this.inputs = [];
}
LogicNor.prototype.updateState = function() {
	let prevState = this.state;
	this.state = 1;
	for (let i = 0; i < this.inputs.length; ++i) {
		if (this.inputs[i].state === 1) {
			this.state = 0;
			break;
		}
	}
	if (this.state !== prevState) {
		worldFlipBlockState(this.x, this.y, this.z);
	}
}
function LogicOr(x, y, z, state) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.state = state;
	this.inputs = [];
}
LogicOr.prototype.updateState = function() {
	let prevState = this.state;
	this.state = 0;
	for (let i = 0; i < this.inputs.length; ++i) {
		if (this.inputs[i].state === 1) {
			this.state = 1;
			break;
		}
	}
	if (this.state !== prevState) {
		worldFlipBlockState(this.x, this.y, this.z);
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
function logicCompileLogicObject(logicObject) {
	let outputBlocks = [];
	let x = logicObject.x, y = logicObject.y, z = logicObject.z;
	logicFindConnections(x + 1, y, z, worldGetBlock(x + 1, y, z), blockIsOutput, outputBlocks);
	logicFindConnections(x - 1, y, z, worldGetBlock(x - 1, y, z), blockIsOutput, outputBlocks);
	logicFindConnections(x, y + 1, z, worldGetBlock(x, y + 1, z), blockIsOutput, outputBlocks);
	logicFindConnections(x, y - 1, z, worldGetBlock(x, y - 1, z), blockIsOutput, outputBlocks);
	logicFindConnections(x, y, z + 1, worldGetBlock(x, y, z + 1), blockIsOutput, outputBlocks);
	logicFindConnections(x, y, z - 1, worldGetBlock(x, y, z - 1), blockIsOutput, outputBlocks);
	
	logicObject.inputs.length = 0;
	// TODO: Could benefit from chunk structure
	for (let i = 0; i < logicOutputObjects.length; ++i) {
		let outputObject = logicOutputObjects[i];
		for (let j = 0; j < outputBlocks.length; ++j) {
			let output = outputBlocks[j];
			if (outputObject.x === output.x && outputObject.y === output.y && outputObject.z === output.z) {
				logicObject.inputs.push(outputObject);
				break;
			}
		}
	}
}
function logicCompileConnectedLogicObjects(x, y, z, wireType) {
	let connected = [];
	if (wireType === 0) {
		logicFindConnections(x, y, z, blockTYPE_WIRE1, blockIsLogic, connected);
		logicFindConnections(x, y, z, blockTYPE_WIRE2, blockIsLogic, connected);
	} else {
		logicFindConnections(x, y, z, wireType, blockIsLogic, connected);
	}
	// TODO: Could benefit from chunk structure
	for (let i = 0; i < connected.length; ++i) {
		let pos = connected[i];
		for (let j = 0; j < logicLogicObjects.length; ++j) {
			let logicObject = logicLogicObjects[j];
			if (logicObject.x === pos.x && logicObject.y === pos.y && logicObject.z === pos.z) {
				logicCompileLogicObject(logicObject);
				break;
			}
		}
	}
}
function logicCompileOutputObject(outputObject) {
	let x = outputObject.x, y = outputObject.y, z = outputObject.z;
	let eastBlock = worldGetBlock(x + 1, y, z), westBlock = worldGetBlock(x - 1, y, z), northBlock = worldGetBlock(x, y, z + 1), southBlock = worldGetBlock(x, y, z - 1), upBlock = worldGetBlock(x, y + 1, z), downBlock = worldGetBlock(x, y - 1, z);
	outputObject.inputs.length = 0;
	// TODO: Could benefit from chunk structure
	if (blockIsLogic(eastBlock)) {
		for (let i = 0; i < logicLogicObjects.length; ++i) {
			let logicObject = logicLogicObjects[i];
			if (logicObject.x === x + 1 && logicObject.y === y && logicObject.z === z) {
				outputObject.inputs.push(logicObject);
				break;
			}
		}
	}
	if (blockIsLogic(westBlock)) {
		for (let i = 0; i < logicLogicObjects.length; ++i) {
			let logicObject = logicLogicObjects[i];
			if (logicObject.x === x - 1 && logicObject.y === y && logicObject.z === z) {
				outputObject.inputs.push(logicObject);
				break;
			}
		}
	}
	if (blockIsLogic(northBlock)) {
		for (let i = 0; i < logicLogicObjects.length; ++i) {
			let logicObject = logicLogicObjects[i];
			if (logicObject.x === x && logicObject.y === y && logicObject.z === z + 1) {
				outputObject.inputs.push(logicObject);
				break;
			}
		}
	}
	if (blockIsLogic(southBlock)) {
		for (let i = 0; i < logicLogicObjects.length; ++i) {
			let logicObject = logicLogicObjects[i];
			if (logicObject.x === x && logicObject.y === y && logicObject.z === z - 1) {
				outputObject.inputs.push(logicObject);
				break;
			}
		}
	}
	if (blockIsLogic(upBlock)) {
		for (let i = 0; i < logicLogicObjects.length; ++i) {
			let logicObject = logicLogicObjects[i];
			if (logicObject.x === x && logicObject.y === y + 1 && logicObject.z === z) {
				outputObject.inputs.push(logicObject);
				break;
			}
		}
	}
	if (blockIsLogic(downBlock)) {
		for (let i = 0; i < logicLogicObjects.length; ++i) {
			let logicObject = logicLogicObjects[i];
			if (logicObject.x === x && logicObject.y === y - 1 && logicObject.z === z) {
				outputObject.inputs.push(logicObject);
				break;
			}
		}
	}
}
function logicCompileConnectedOutputObjects(x, y, z) {
	// TODO: Could benefit from chunk structure
	for (let i = 0; i < logicOutputObjects.length; ++i) {
		let outputObject = logicOutputObjects[i];
		if (Math.abs(outputObject.x - x) + Math.abs(outputObject.y - y) + Math.abs(outputObject.z - z) === 1) {
			// TODO: Lazy, doesn't need to recompile whole object
			logicCompileOutputObject(outputObject);
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