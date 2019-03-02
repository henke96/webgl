'use strict';
const logicSPEED_THRESHOLD = 100;
const logicSPEED = 100;

const logicEAST_BIT = 0x1;
const logicWEST_BIT = 0x2;
const logicNORTH_BIT = 0x4;
const logicSOUTH_BIT = 0x8;
const logicUP_BIT = 0x10;
const logicDOWN_BIT = 0x20;
const logicBACKTRACKED_BIT = 0x40;

function LogicOutput(x, y, z, powered) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.powers = powered ? 1 : 0;
	this.nextPowers = 0;
	this.dirty = false;
	this.outputs = [];
}
function Logic(x, y, z, inverts, powered) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.inverts = inverts;
	this.powers = powered ? 1 : 0;
	this.nextPowers = 0;
	this.dirty = false;
	this.outputs = [];
}
function logicOnBlockAdded(x, y, z, block) {
	if (blockIsOutput(block)) {
		logicOnOutputBlockAdded(x, y, z, block);
	} else if (blockIsLogic(block)) {
		logicOnLogicBlockAdded(x, y, z, block);
	} else if (blockIsWire(block)) {
		logicOnWireAdded(x, y, z, block);
	}
}
function logicOnBlockRemoved(x, y, z, block) {
	if (blockIsOutput(block)) {
		logicOnOutputBlockRemoved(x, y, z, block);
	} else if (blockIsLogic(block)) {
		logicOnLogicBlockRemoved(x, y, z, block);
	} else if (blockIsWire(block)) {
		logicOnWireRemoved(x, y, z, block);
	}
}
function logicOnWireAdded(x, y, z, block) {
	let outputBlocks = [];
	let logicBlocks = [];
	logicFindConnections(x, y, z, block, blockIsOutput, outputBlocks);
	logicFindConnections(x, y, z, block, blockIsLogic, logicBlocks);
	
	let logicObjects = [];
	for (let i = 0; i < logicBlocks.length; ++i) {
		let pos = logicBlocks[i];
		for (let j = 0; j < logicLogicObjects.length; ++j) {
			let logicObject = logicLogicObjects[j];
			if (logicObject.x === pos.x && logicObject.y === pos.y && logicObject.z === pos.z) {
				logicObjects.push(logicObject);
				break;
			}
		}
	}	
	
	for (let i = 0; i < outputBlocks.length; ++i) {
		let pos = outputBlocks[i];
		for (let j = 0; j < logicOutputObjects.length; ++j) {
			let outputObject = logicOutputObjects[j];
			if (outputObject.x === pos.x && outputObject.y === pos.y && outputObject.z === pos.z) {
				let outputs = outputObject.outputs;
				for (let k = 0; k < logicObjects.length; ++k) {
					let logicObject = logicObjects[k];
					if (outputs.indexOf(logicObject) === -1) {
						outputs.push(logicObject);
						if (outputObject.powers > 0) {
							++logicObject.nextPowers;
							if (!logicObject.dirty) {
								logicObject.dirty = true;
								logicDirtyLogic[logicDirtyLogicSize++] = logicObject;
							}
						}
					}
				}
				break;
			}
		}
	}
}
function logicOnWireRemoved(x, y, z, block) {
	let outputBlocks = [];
	logicFindConnections(x, y, z, block, blockIsOutput, outputBlocks);
	
	for (let i = 0; i < outputBlocks.length; ++i) {
		let pos = outputBlocks[i];
		for (let j = 0; j < logicOutputObjects.length; ++j) {
			let outputObject = logicOutputObjects[j];
			if (outputObject.x === pos.x && outputObject.y === pos.y && outputObject.z === pos.z) {
				let newOutputs = [];
				let logicBlocks = [];
				let ox = outputObject.x, oy = outputObject.y, oz = outputObject.z;
				logicFindConnections(ox + 1, oy, oz, worldGetBlock(ox + 1, oy, oz), blockIsLogic, logicBlocks);
				logicFindConnections(ox - 1, oy, oz, worldGetBlock(ox - 1, oy, oz), blockIsLogic, logicBlocks);
				logicFindConnections(ox, oy + 1, oz, worldGetBlock(ox, oy + 1, oz), blockIsLogic, logicBlocks);
				logicFindConnections(ox, oy - 1, oz, worldGetBlock(ox, oy - 1, oz), blockIsLogic, logicBlocks);
				logicFindConnections(ox, oy, oz + 1, worldGetBlock(ox, oy, oz + 1), blockIsLogic, logicBlocks);
				logicFindConnections(ox, oy, oz - 1, worldGetBlock(ox, oy, oz - 1), blockIsLogic, logicBlocks);
				for (let k = 0; k < logicLogicObjects.length; ++k) {
					let logicObject = logicLogicObjects[k];
					for (let l = 0; l < logicBlocks.length; ++l) {
						let logic = logicBlocks[l];
						if (logicObject.x === logic.x && logicObject.y === logic.y && logicObject.z === logic.z) {
							newOutputs.push(logicObject);
							break;
						}
					}
				}
				let k = outputObject.outputs.length;
				while (k--) {
					let output = outputObject.outputs[k];
					if (newOutputs.indexOf(output) === -1) {
						if (outputObject.powers > 0) {
							--output.nextPowers;
							if (!output.dirty) {
								output.dirty = true;
								logicDirtyLogic[logicDirtyLogicSize++] = output;
							}
						}
						outputObject.outputs.splice(k, 1);
					}
				}
				break;
			}
		}
	}
}
function logicOnOutputBlockAdded(x, y, z, block) {
	let powered = (block === blockTYPE_OUTPUT_ON);
	let outputObject = new LogicOutput(x, y, z, powered);
	logicOutputObjects.push(outputObject);
	outputObject.dirty = true;
	logicDirtyOutputs[logicDirtyOutputsSize++] = outputObject;
	
	let logicBlocks = [];
	logicFindConnections(x + 1, y, z, worldGetBlock(x + 1, y, z), blockIsLogic, logicBlocks);
	logicFindConnections(x - 1, y, z, worldGetBlock(x - 1, y, z), blockIsLogic, logicBlocks);
	logicFindConnections(x, y + 1, z, worldGetBlock(x, y + 1, z), blockIsLogic, logicBlocks);
	logicFindConnections(x, y - 1, z, worldGetBlock(x, y - 1, z), blockIsLogic, logicBlocks);
	logicFindConnections(x, y, z + 1, worldGetBlock(x, y, z + 1), blockIsLogic, logicBlocks);
	logicFindConnections(x, y, z - 1, worldGetBlock(x, y, z - 1), blockIsLogic, logicBlocks);
	
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
	
	if (powered) {
		for (let i = 0, len = outputObject.outputs.length; i < len; ++i) {
			let output = outputObject.outputs[i];
			++output.nextPowers;
			if (!output.dirty) {
				output.dirty = true;
				logicDirtyLogic[logicDirtyLogicSize++] = output;
			}	
		}
	}
	
	for (let i = 0; i < logicLogicObjects.length; ++i) {
		let logicObject = logicLogicObjects[i];
		if (Math.abs(logicObject.x - x) + Math.abs(logicObject.y - y) + Math.abs(logicObject.z - z) === 1) {
			logicObject.outputs.push(outputObject);
			if (logicObject.inverts) {
				if (logicObject.powers === 0) {
					++outputObject.nextPowers;
				}
			} else if (logicObject.powers > 0) {
				++outputObject.nextPowers;
			}
		}
	}
}
function logicOnOutputBlockRemoved(x, y, z, block) {
	let powered = (block === blockTYPE_OUTPUT_ON);
	let outputObject;
	
	for (let i = 0; i < logicOutputObjects.length; ++i) {
		let output = logicOutputObjects[i];
		if (x === output.x && y === output.y && z === output.z) {
			outputObject = output;
			logicOutputObjects.splice(i, 1);
			break;
		}
	}
	if (outputObject.dirty) {
		let index = logicDirtyOutputs.indexOf(outputObject);
		logicDirtyOutputs.splice(index, 1);
		--logicDirtyOutputsSize;
	}

	if (powered) {
		for (let i = 0, len = outputObject.outputs.length; i < len; ++i) {
			let output = outputObject.outputs[i];
			--output.nextPowers;
			if (!output.dirty) {
				output.dirty = true;
				logicDirtyLogic[logicDirtyLogicSize++] = output;
			}	
		}
	}
	
	for (let i = 0; i < logicLogicObjects.length; ++i) {
		let logicObject = logicLogicObjects[i];
		if (Math.abs(logicObject.x - x) + Math.abs(logicObject.y - y) + Math.abs(logicObject.z - z) === 1) {
			logicObject.outputs.splice(logicObject.outputs.indexOf(outputObject), 1);
		}
	}
}
function logicOnLogicBlockAdded(x, y, z, block) {
	let powered = (block & blockSTATE_BIT) !== 0;
	let inverts = ((block & blockNO_STATE_MASK) === blockTYPE_NOR);
	let logicObject = new Logic(x, y, z, inverts, powered);
	logicLogicObjects.push(logicObject);
	logicObject.dirty = true;
	logicDirtyLogic[logicDirtyLogicSize++] = logicObject;
	
	for (let i = 0; i < logicOutputObjects.length; ++i) {
		let outputObject = logicOutputObjects[i];
		if (Math.abs(outputObject.x - x) + Math.abs(outputObject.y - y) + Math.abs(outputObject.z - z) === 1) {
			logicObject.outputs.push(outputObject);
		}
	}
	if (powered !== inverts) {
		for (let i = 0, len = logicObject.outputs.length; i < len; ++i) {
			let output = logicObject.outputs[i];
			++output.nextPowers;
			if (!output.dirty) {
				output.dirty = true;
				logicDirtyOutputs[logicDirtyOutputsSize++] = output;
			}	
		}
	}
	let outputBlocks = [];
	logicFindConnections(x + 1, y, z, worldGetBlock(x + 1, y, z), blockIsOutput, outputBlocks);
	logicFindConnections(x - 1, y, z, worldGetBlock(x - 1, y, z), blockIsOutput, outputBlocks);
	logicFindConnections(x, y + 1, z, worldGetBlock(x, y + 1, z), blockIsOutput, outputBlocks);
	logicFindConnections(x, y - 1, z, worldGetBlock(x, y - 1, z), blockIsOutput, outputBlocks);
	logicFindConnections(x, y, z + 1, worldGetBlock(x, y, z + 1), blockIsOutput, outputBlocks);
	logicFindConnections(x, y, z - 1, worldGetBlock(x, y, z - 1), blockIsOutput, outputBlocks);
	
	for (let i = 0; i < logicOutputObjects.length; ++i) {
		let outputObject = logicOutputObjects[i];
		for (let j = 0; j < outputBlocks.length; ++j) {
			let output = outputBlocks[j];
			if (outputObject.x === output.x && outputObject.y === output.y && outputObject.z === output.z) {
				outputObject.outputs.push(logicObject);
				if (outputObject.powers > 0) {
					++logicObject.nextPowers;
				}
				break;
			}
		}
	}
}
function logicOnLogicBlockRemoved(x, y, z, block) {
	let inverts = ((block & blockNO_STATE_MASK) === blockTYPE_NOR);
	let logicObject;
	
	for (let i = 0; i < logicLogicObjects.length; ++i) {
		let logic = logicLogicObjects[i];
		if (x === logic.x && y === logic.y && z === logic.z) {
			logicObject = logic;
			logicLogicObjects.splice(i, 1);
			break;
		}
	}
	if (logicObject.dirty) {
		let index = logicDirtyLogic.indexOf(logicObject);
		logicDirtyLogic.splice(index, 1);
		--logicDirtyLogicSize;
	}
	if (logicObject.powers > 0 !== inverts) {
		for (let i = 0, len = logicObject.outputs.length; i < len; ++i) {
			let output = logicObject.outputs[i];
			--output.nextPowers;
			if (!output.dirty) {
				output.dirty = true;
				logicDirtyOutputs[logicDirtyOutputsSize++] = output;
			}	
		}
	}
	let outputBlocks = [];
	logicFindConnections(x + 1, y, z, worldGetBlock(x + 1, y, z), blockIsOutput, outputBlocks);
	logicFindConnections(x - 1, y, z, worldGetBlock(x - 1, y, z), blockIsOutput, outputBlocks);
	logicFindConnections(x, y + 1, z, worldGetBlock(x, y + 1, z), blockIsOutput, outputBlocks);
	logicFindConnections(x, y - 1, z, worldGetBlock(x, y - 1, z), blockIsOutput, outputBlocks);
	logicFindConnections(x, y, z + 1, worldGetBlock(x, y, z + 1), blockIsOutput, outputBlocks);
	logicFindConnections(x, y, z - 1, worldGetBlock(x, y, z - 1), blockIsOutput, outputBlocks);
	
	for (let i = 0; i < logicOutputObjects.length; ++i) {
		let outputObject = logicOutputObjects[i];
		for (let j = 0; j < outputBlocks.length; ++j) {
			let output = outputBlocks[j];
			if (outputObject.x === output.x && outputObject.y === output.y && outputObject.z === output.z) {
				outputObject.outputs.splice(outputObject.outputs.indexOf(logicObject), 1);
				break;
			}
		}
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
	for (let i = 0; i < logicDirtyLogicSize; ++i) {
		let logicObject = logicDirtyLogic[i];
		let powerDelta = logicObject.inverts ? -1 : 1;
		logicObject.dirty = false;
		if (logicObject.nextPowers > 0) {
			if (logicObject.powers === 0) {
				for (let i = 0, len = logicObject.outputs.length; i < len; ++i) {
					let output = logicObject.outputs[i];
					output.nextPowers += powerDelta;
					if (!output.dirty) {
						output.dirty = true;
						logicDirtyOutputs[logicDirtyOutputsSize++] = output;
					}
				}
				logicObject.powers = logicObject.nextPowers;
			}
		} else if (logicObject.powers > 0) {
			for (let i = 0, len = logicObject.outputs.length; i < len; ++i) {
				let output = logicObject.outputs[i];
				output.nextPowers -= powerDelta;
				if (!output.dirty) {
					output.dirty = true;
					logicDirtyOutputs[logicDirtyOutputsSize++] = output;
				}	
			}
			logicObject.powers = logicObject.nextPowers;
		}
	}
	logicDirtyLogicSize = 0;
}
function logicUpdateOutputObjects() {
	for (let i = 0; i < logicDirtyOutputsSize; ++i) {
		let outputObject = logicDirtyOutputs[i];
		outputObject.dirty = false;
		if (outputObject.nextPowers > 0) {
			if (outputObject.powers === 0) {
				for (let i = 0, len = outputObject.outputs.length; i < len; ++i) {
					let output = outputObject.outputs[i];
					++output.nextPowers;
					if (!output.dirty && output.nextPowers === 1) { // TODO 2nd check worth?
						output.dirty = true;
						logicDirtyLogic[logicDirtyLogicSize++] = output;
					}				
				}
				worldUpdateBlock(outputObject.x, outputObject.y, outputObject.z, blockTYPE_OUTPUT_ON);
				outputObject.powers = outputObject.nextPowers;
			}
		} else if (outputObject.powers > 0) {
			for (let i = 0, len = outputObject.outputs.length; i < len; ++i) {
				let output = outputObject.outputs[i];
				--output.nextPowers;
				if (!output.dirty && output.nextPowers === 0) {
					output.dirty = true;
					logicDirtyLogic[logicDirtyLogicSize++] = output;
				}
			}
			worldUpdateBlock(outputObject.x, outputObject.y, outputObject.z, blockTYPE_OUTPUT_OFF);
			outputObject.powers = outputObject.nextPowers;
		}
	}
	logicDirtyOutputsSize = 0;
}
function logicUpdate() {
	logicSpeedProgress += logicSPEED;
	while (logicSpeedProgress >= logicSPEED_THRESHOLD) {
		logicUpdateLogicObjects();
		logicUpdateOutputObjects();
		logicSpeedProgress -= logicSPEED_THRESHOLD;
	}
}
function logicInit() {
	logicLogicObjects = [];
	logicOutputObjects = [];
	logicDirtyLogic = [];
	logicDirtyLogicSize = 0;
	logicDirtyOutputs = [];
	logicDirtyOutputsSize = 0;
	logicSpeedProgress = 0;
}
var logicSpeedProgress;
var logicLogicObjects;
var logicOutputObjects;
var logicDirtyLogic;
var logicDirtyLogicSize;
var logicDirtyOutputs;
var logicDirtyOutputsSize;