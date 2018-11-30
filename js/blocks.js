'use strict';

const blockTYPE_NONE = 0;
const blockTYPE_GRASS = 1;
const blockTYPE_DIRT = 2;

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