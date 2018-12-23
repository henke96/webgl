'use strict';
const blockDYNAMIC_BIT = 0x80;
const blockSTATE_BIT_DIGIT = 7;
const blockSTATE_BIT = 0x40;
const blockNO_STATE_MASK = 0xBF;
// Static
const blockTYPE_NONE = 0;
const blockTYPE_GRASS = 1;
const blockTYPE_DIRT = 2;
const blockTYPE_WIRE1 = 3;
const blockTYPE_WIRE2 = 4;
const blockTYPE_NOR = 5;
const blockTYPE_OR = 6;
// Dynamic
const blockTYPE_OUTPUT_OFF = blockDYNAMIC_BIT | 0;
const blockTYPE_OUTPUT_ON = blockDYNAMIC_BIT | 1;

function blockIsOutput(block) {
	return block === blockTYPE_OUTPUT_ON || block === blockTYPE_OUTPUT_OFF;
}
function blockIsWire(block) {
	return block === blockTYPE_WIRE1 || block === blockTYPE_WIRE2;
}
function blockIsLogic(block) {
	let noStateBlock = block & blockNO_STATE_MASK;
	return (noStateBlock === blockTYPE_NOR || noStateBlock === blockTYPE_OR);
}

var blockTypes = [];
blockTypes[blockTYPE_GRASS] = {
	upR: 0.3,
	upG: 0.73,
	upB: 0.09,
	otherR: 0.35,
	otherG: 0.23,
	otherB: 0.05		
};
blockTypes[blockTYPE_DIRT] = {
	upR: 0.35,
	upG: 0.23,
	upB: 0.05,
	otherR: 0.35,
	otherG: 0.23,
	otherB: 0.05		
};
blockTypes[blockTYPE_WIRE1] = {
	upR: 0.5,
	upG: 0.5,
	upB: 0.5,
	otherR: 0.5,
	otherG: 0.5,
	otherB: 0.5	
};
blockTypes[blockTYPE_WIRE2] = {
	upR: 0.2,
	upG: 0.2,
	upB: 0.5,
	otherR: 0.2,
	otherG: 0.2,
	otherB: 0.5	
};
blockTypes[blockTYPE_NOR] = {
	upR: 0.9,
	upG: 0.9,
	upB: 0.9,
	otherR: 0.9,
	otherG: 0.9,
	otherB: 0.9	
};
blockTypes[blockTYPE_OR] = {
	upR: 0.9,
	upG: 0.9,
	upB: 0.5,
	otherR: 0.9,
	otherG: 0.9,
	otherB: 0.5	
};
blockTypes[blockTYPE_OUTPUT_ON] = {
	upR: 1,
	upG: 0.2,
	upB: 0.2,
	otherR: 1,
	otherG: 0.2,
	otherB: 0.2	
};
blockTypes[blockTYPE_OUTPUT_OFF] = {
	upR: 0.2,
	upG: 0.2,
	upB: 0.2,
	otherR: 0.2,
	otherG: 0.2,
	otherB: 0.2	
};