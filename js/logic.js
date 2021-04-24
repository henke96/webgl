'use strict';
const logicBASE_SPEED = 1;
const logicSPEED = 100;

const logicEAST_BIT = 0x1;
const logicWEST_BIT = 0x2;
const logicNORTH_BIT = 0x4;
const logicSOUTH_BIT = 0x8;
const logicUP_BIT = 0x10;
const logicDOWN_BIT = 0x20;
const logicBACKTRACKED_BIT = 0x40;

function LogicNor(x, y, z, state) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.state = state;
	this.nextState = undefined;
	this.inputs = [];
}

LogicNor.prototype.updateState = function() {
	this.nextState = 1;
	for (let i = 0; i < this.inputs.length; ++i) {
		if (this.inputs[i].state === 1) {
			this.nextState = 0;
			break;
		}
	}
	
}

LogicNor.prototype.finalize = function() {
	if (this.nextState !== this.state) {
		this.state = this.nextState;
		let blockType = blockTYPE_NOR_OFF;
		if (this.state === 1) {
			blockType = blockTYPE_NOR_ON;
		}
		worldUpdateBlock(this.x, this.y, this.z, blockType);
	}
}

function LogicOr(x, y, z, state) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.state = state;
	this.nextState = undefined;
	this.inputs = [];
}

LogicOr.prototype.updateState = function() {
	this.nextState = 0;
	for (let i = 0; i < this.inputs.length; ++i) {
		if (this.inputs[i].state === 1) {
			this.nextState = 1;
			break;
		}
	}
	
}
LogicOr.prototype.finalize = function() {
	if (this.nextState !== this.state) {
		this.state = this.nextState;
		let blockType = blockTYPE_OR_OFF;
		if (this.state === 1) {
			blockType = blockTYPE_OR_ON;
		}
		worldUpdateBlock(this.x, this.y, this.z, blockType);
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

function logicInputFindConnections(x, y, z, block, connections) {
	if (block !== blockTYPE_INPUT) return;
	logicFindConnections(x + 1, y, z, worldGetBlock(x + 1, y, z), connections);
	logicFindConnections(x - 1, y, z, worldGetBlock(x - 1, y, z), connections);
	logicFindConnections(x, y + 1, z, worldGetBlock(x, y + 1, z), connections);
	logicFindConnections(x, y - 1, z, worldGetBlock(x, y - 1, z), connections);
	logicFindConnections(x, y, z + 1, worldGetBlock(x, y, z + 1), connections);
	logicFindConnections(x, y, z - 1, worldGetBlock(x, y, z - 1), connections);
}

function logicCompileLogicObject(logicObject) {
	let connections = [];
	let x = logicObject.x, y = logicObject.y, z = logicObject.z;
	logicInputFindConnections(x + 1, y, z, worldGetBlock(x + 1, y, z), connections);
	logicInputFindConnections(x - 1, y, z, worldGetBlock(x - 1, y, z), connections);
	logicInputFindConnections(x, y + 1, z, worldGetBlock(x, y + 1, z), connections);
	logicInputFindConnections(x, y - 1, z, worldGetBlock(x, y - 1, z), connections);
	logicInputFindConnections(x, y, z + 1, worldGetBlock(x, y, z + 1), connections);
	logicInputFindConnections(x, y, z - 1, worldGetBlock(x, y, z - 1), connections);
	
	logicObject.inputs.length = 0;
	// TODO: Could benefit from chunk structure
	for (let i = 0; i < logicObjects.length; ++i) {
		let object = logicObjects[i];
		for (let j = 0; j < connections.length; ++j) {
			let connection = connections[j];
			if (object.x === connection.x && object.y === connection.y && object.z === connection.z) {
				logicObject.inputs.push(object);
				break;
			}
		}
	}
}

function logicFindConnections(x, y, z, wireType, list) {
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
				} else if (blockIsLogic(blockEast)) {
					logicPushIfUnique(list, {x: x + 1, y: y, z: z});
				}
			}
			if ((prevBranch & logicEAST_BIT) === 0) {
				blockWest = worldGetBlock(x - 1, y, z);
				if (blockWest === wireType) {
					availableBranches |= logicWEST_BIT;
				} else if (blockIsLogic(blockWest)) {
					logicPushIfUnique(list, {x: x - 1, y: y, z: z});
				}
			}
			if ((prevBranch & logicSOUTH_BIT) === 0) {
				blockNorth = worldGetBlock(x, y, z + 1);
				if (blockNorth === wireType) {
					availableBranches |= logicNORTH_BIT;
				} else if (blockIsLogic(blockNorth)) {
					logicPushIfUnique(list, {x: x, y: y, z: z + 1});
				}
			}
			if ((prevBranch & logicNORTH_BIT) === 0) {
				blockSouth = worldGetBlock(x, y, z - 1);
				if (blockSouth === wireType) {
					availableBranches |= logicSOUTH_BIT;
				} else if (blockIsLogic(blockSouth)) {
					logicPushIfUnique(list, {x: x, y: y, z: z - 1});
				}
			}
			if ((prevBranch & logicDOWN_BIT) === 0) {
				blockUp = worldGetBlock(x, y + 1, z);
				if (blockUp === wireType) {
					availableBranches |= logicUP_BIT;
				} else if (blockIsLogic(blockUp)) {
					logicPushIfUnique(list, {x: x, y: y + 1, z: z});
				}
			}
			if ((prevBranch & logicUP_BIT) === 0) {
				blockDown = worldGetBlock(x, y - 1, z);
				if (blockDown === wireType) {
					availableBranches |= logicDOWN_BIT;
				} else if (blockIsLogic(blockDown)) {
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
	for (let i = 0; i < logicObjects.length; ++i) {
		logicCompileLogicObject(logicObjects[i]);
	}
}

function logicUpdate() {
	logicSpeedProgress += logicSPEED;
	while (logicSpeedProgress >= logicBASE_SPEED) {
		for (let i = 0; i < logicObjects.length; ++i) {
			logicObjects[i].updateState();
		}
		for (let i = 0; i < logicObjects.length; ++i) {
			logicObjects[i].finalize();
		}
		logicSpeedProgress -= logicBASE_SPEED;
	}
}
function logicInit() {
	logicObjects = [];
	logicSpeedProgress = 0;
}
var logicSpeedProgress;
var logicObjects;