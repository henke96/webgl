'use strict';
const blockDYNAMIC_BIT = 0x70000000;
// Static
const blockTYPE_NONE = 0;
const blockTYPE_GRASS = 1;
const blockTYPE_DIRT = 2;
const blockTYPE_WIRE = 3;
const blockTYPE_INVERTER = 4;
// Dynamic
const blockTYPE_INPUT_ON = blockDYNAMIC_BIT + 0;
const blockTYPE_INPUT_OFF = blockDYNAMIC_BIT + 1;

let blockTypes = [];

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
blockTypes[blockTYPE_WIRE] = {
	upR: 0.5,
	upG: 0.5,
	upB: 0.5,
	otherR: 0.5,
	otherG: 0.5,
	otherB: 0.5	
};
blockTypes[blockTYPE_INVERTER] = {
	upR: 0.9,
	upG: 0.9,
	upB: 0.9,
	otherR: 0.9,
	otherG: 0.9,
	otherB: 0.9	
};
blockTypes[blockTYPE_INPUT_ON] = {
	upR: 1,
	upG: 0.2,
	upB: 0.2,
	otherR: 1,
	otherG: 0.2,
	otherB: 0.2	
};
blockTypes[blockTYPE_INPUT_OFF] = {
	upR: 0.2,
	upG: 0.2,
	upB: 0.2,
	otherR: 0.2,
	otherG: 0.2,
	otherB: 0.2	
};