'use strict';
const renderDefaultTestBlock = 1;

function WorldChunk(xChunk, yChunk, zChunk) {
	this.xChunk = xChunk;
	this.yChunk = yChunk;
	this.zChunk = zChunk;
	this.blocks = new Int32Array(16*16*16);
	this.model = new RenderModel([], [], gl.TRIANGLES, true);
	this.model.addInstance(new RenderInstance(xChunk*16, yChunk*16, zChunk*16, 1, 0, 0, 0));
	this.model.finalizeInstances();
	this.vertexArray = new RenderVertexArray(gl.STATIC_DRAW, gl.UNSIGNED_SHORT);
	this.vertexArray.addModel(this.model);
}
WorldChunk.prototype.updateModel = function() {
	let vertexOffset = 0, verticesIndex = 0, indicesIndex = 0;
	let blocks = this.blocks;
	let rightChunk = worldGetChunk(this.xChunk + 1, this.yChunk, this.zChunk), leftChunk = worldGetChunk(this.xChunk - 1, this.yChunk, this.zChunk);
	let upChunk = worldGetChunk(this.xChunk, this.yChunk + 1, this.zChunk), downChunk = worldGetChunk(this.xChunk, this.yChunk - 1, this.zChunk);
	let frontChunk = worldGetChunk(this.xChunk, this.yChunk, this.zChunk + 1), backChunk = worldGetChunk(this.xChunk, this.yChunk, this.zChunk - 1);
	
	for (let x = 0; x < 16; ++x) {
		let xOffset = x << 0;
		let xNeg = xOffset, xPos = xOffset + 1;
		for (let y = 0; y < 16; ++y) {
			let yOffset = y << 0;
			let yNeg = yOffset, yPos = yOffset + 1;
			for (let z = 0; z < 16; ++z) {
				let blockIndex = (x << 8) + (y << 4) + z;
				let block = blocks[blockIndex];
				if (block === 0) continue;
				let zOffset = z << 0;
				let zNeg = zOffset, zPos = zOffset + 1;
				let blockType = blockTypes[block];
				let otherR = blockType.otherR, otherG = blockType.otherG, otherB = blockType.otherB;
				let testBlock;
				if (z === 15) {
					if (frontChunk) {
						testBlock = frontChunk.blocks[blockIndex - 15];
					} else {
						testBlock = renderDefaultTestBlock;
					}
				} else {
					testBlock = blocks[blockIndex + 1];
				}
				if (testBlock === 0) {
					//z face
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR + 0.06;
					worldVertices[verticesIndex++] = otherG + 0.06;
					worldVertices[verticesIndex++] = otherB + 0.06;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldIndices[indicesIndex++] = vertexOffset + 0;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 3;
					vertexOffset += 4;
				}
				if (z === 0) {
					if (backChunk) {
						testBlock = backChunk.blocks[blockIndex + 15];
					} else {
						testBlock = renderDefaultTestBlock;
					}
				} else {
					testBlock = blocks[blockIndex - 1];
				}
				if (testBlock === 0) {
					//-z face
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR + 0.06;
					worldVertices[verticesIndex++] = otherG + 0.06;
					worldVertices[verticesIndex++] = otherB + 0.06;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldIndices[indicesIndex++] = vertexOffset + 0;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 3;
					vertexOffset += 4;
				}
				if (y === 15) {
					if (upChunk) {
						testBlock = upChunk.blocks[blockIndex - 240];
					} else {
						testBlock = renderDefaultTestBlock;
					}
				} else {
					testBlock = blocks[blockIndex + 16];
				}
				if (testBlock === 0) {
					//y face
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = blockType.upR + 0.06;
					worldVertices[verticesIndex++] = blockType.upG + 0.06;
					worldVertices[verticesIndex++] = blockType.upB + 0.06;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = blockType.upR;
					worldVertices[verticesIndex++] = blockType.upG;
					worldVertices[verticesIndex++] = blockType.upB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = blockType.upR;
					worldVertices[verticesIndex++] = blockType.upG;
					worldVertices[verticesIndex++] = blockType.upB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = blockType.upR;
					worldVertices[verticesIndex++] = blockType.upG;
					worldVertices[verticesIndex++] = blockType.upB;
					worldIndices[indicesIndex++] = vertexOffset + 0;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 3;
					vertexOffset += 4;
				}
				if (y === 0) {
					if (downChunk) {
						testBlock = downChunk.blocks[blockIndex + 240];
					} else {
						testBlock = renderDefaultTestBlock;
					}
				} else {
					testBlock = blocks[blockIndex - 16];
				}
				if (testBlock === 0) {
					//-y face
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR + 0.06;
					worldVertices[verticesIndex++] = otherG + 0.06;
					worldVertices[verticesIndex++] = otherB + 0.06;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldIndices[indicesIndex++] = vertexOffset + 0;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 3;
					vertexOffset += 4;
				}
				if (x === 15) {
					if (rightChunk) {
						testBlock = rightChunk.blocks[blockIndex - 3840];
					} else {
						testBlock = renderDefaultTestBlock;
					}
				} else {
					testBlock = blocks[blockIndex + 256];
				}
				if (testBlock === 0) {
					//x face
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR + 0.06;
					worldVertices[verticesIndex++] = otherG + 0.06;
					worldVertices[verticesIndex++] = otherB + 0.06;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldIndices[indicesIndex++] = vertexOffset + 0;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 3;
					vertexOffset += 4;
				}
				if (x === 0) {
					if (leftChunk) {
						testBlock = leftChunk.blocks[blockIndex + 3840];
					} else {
						testBlock = renderDefaultTestBlock;
					}
				} else {
					testBlock = blocks[blockIndex - 256];
				}
				if (testBlock === 0) {
					//-x face
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR + 0.06;
					worldVertices[verticesIndex++] = otherG + 0.06;
					worldVertices[verticesIndex++] = otherB + 0.06;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = otherR;
					worldVertices[verticesIndex++] = otherG;
					worldVertices[verticesIndex++] = otherB;
					worldIndices[indicesIndex++] = vertexOffset + 0;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 1;
					worldIndices[indicesIndex++] = vertexOffset + 2;
					worldIndices[indicesIndex++] = vertexOffset + 3;
					vertexOffset += 4;
				}
			}
		}
	}
	this.model.vertices = worldVertices.subarray(0, verticesIndex);
	this.model.indices = worldIndices.subarray(0, indicesIndex);
	this.vertexArray.finalizeModels();
}
function worldGetChunk(xChunk, yChunk, zChunk) {
	if (xChunk < 0 || xChunk >= worldSizeXChunks || yChunk < 0 || yChunk >= worldSizeYChunks || zChunk < 0 || zChunk >= worldSizeZChunks) {
		return null;
	}
	return worldChunks[xChunk*worldSizeYZChunks + yChunk*worldSizeZChunks + zChunk];
}
function worldSetBlock(x, y, z, value) {
	let chunk = worldGetChunk(x >> 4, y >> 4, z >> 4);
	if (chunk === null) {
		return;
	}
	chunk.blocks[((x & 0xf) << 8) + ((y & 0xf) << 4) + (z & 0xf)] = value;
}
function worldGetBlock(x, y, z) {
	let chunk = worldGetChunk(x >> 4, y >> 4, z >> 4);
	if (chunk === null) {
		return 0;
	}
	return chunk.blocks[((x & 0xf) << 8) + ((y & 0xf) << 4) + (z & 0xf)];
}
function worldDraw() {
	let len = worldChunks.length;
	for (let i = 0; i < len; ++i) {
		let chunk = worldChunks[i];
		if (chunk) {
			chunk.vertexArray.drawModels();
		}
	}
}
function worldUpdateChunksAround(xBlock, yBlock, zBlock) {
	let xChunk = xBlock >> 4, yChunk = yBlock >> 4, zChunk = zBlock >> 4;
	let relX = xBlock & 0xf, relY = yBlock & 0xf, relZ = zBlock & 0xf;
	worldGetChunk(xChunk, yChunk, zChunk).updateModel();
	if (relX === 0) {
		let chunk = worldGetChunk(xChunk - 1, yChunk, zChunk);
		if (chunk !== null) {
			chunk.updateModel();
		}
	} else if (relX === 15) {
		let chunk = worldGetChunk(xChunk + 1, yChunk, zChunk);
		if (chunk !== null) {
			chunk.updateModel();
		}
	}
	if (relY === 0) {
		let chunk = worldGetChunk(xChunk, yChunk - 1, zChunk);
		if (chunk !== null) {
			chunk.updateModel();
		}
	} else if (relY === 15) {
		let chunk = worldGetChunk(xChunk, yChunk + 1, zChunk);
		if (chunk !== null) {
			chunk.updateModel();
		}
	}
	if (relZ === 0) {
		let chunk = worldGetChunk(xChunk, yChunk, zChunk - 1);
		if (chunk !== null) {
			chunk.updateModel();
		}
	} else if (relZ === 15) {
		let chunk = worldGetChunk(xChunk, yChunk, zChunk + 1);
		if (chunk !== null) {
			chunk.updateModel();
		}
	}
}
function worldInteractWithBlock(place) {
	let xAngle = renderCamera.xAngle;
	let yAngle = renderCamera.yAngle;
	let cosXAngle = Math.cos(xAngle);
	let componentZ = -cosXAngle*Math.cos(yAngle);
	let componentX = -cosXAngle*Math.sin(yAngle);
	let componentY = Math.sin(xAngle);
	
	let x = renderCamera.x;
	let y = renderCamera.y;
	let z = renderCamera.z;
	
	const maxDistanceSquared = 10*10;
	let xBlock, yBlock, zBlock;
	let prevXBlock, prevYBlock, prevZBlock;
	let nextX, nextY, nextZ;
	while (true) {
		let deltaX = x - renderCamera.x, deltaY = y - renderCamera.y, deltaZ = z - renderCamera.z;
		if (deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ > maxDistanceSquared) {
			break;
		}
		prevXBlock = xBlock;
		prevYBlock = yBlock;
		prevZBlock = zBlock;
		xBlock = Math.floor(x), yBlock = Math.floor(y), zBlock = Math.floor(z);
		if (componentX < 0) {
			if (xBlock >= x) {
				--xBlock;
			}
			nextX = xBlock;
		} else {
			nextX = xBlock + 1;
		}
		if (componentY < 0) {
			if (yBlock >= y) {
				--yBlock;
			}
			nextY = yBlock;
		} else {
			nextY = yBlock + 1;
		}
		if (componentZ < 0) {
			if (zBlock >= z) {
				--zBlock;
			}
			nextZ = zBlock;
		} else {
			nextZ = zBlock + 1;
		}

		if (worldGetBlock(xBlock, yBlock, zBlock) !== 0) {
			let block, interactX, interactY, interactZ;
			if (place) {
				if (prevXBlock === undefined) {
					break;
				}
				block = 1;
				interactX = prevXBlock;
				interactY = prevYBlock;
				interactZ = prevZBlock;
			} else {
				block = 0;
				interactX = xBlock;
				interactY = yBlock;
				interactZ = zBlock;
			}
			worldSetBlock(interactX, interactY, interactZ, block);
			worldUpdateChunksAround(interactX, interactY, interactZ);
			break;
		}
		let timeX = (nextX - x)/componentX;
		let timeY = (nextY - y)/componentY;
		let timeZ = (nextZ - z)/componentZ;
		if (timeX < timeY) {
			if (timeX < timeZ) {
				x = nextX;
				y += timeX*componentY;
				z += timeX*componentZ;
			} else {
				z = nextZ;
				x += timeZ*componentX;
				y += timeZ*componentY;
			}
		} else {
			if (timeY < timeZ) {
				y = nextY;
				x += timeY*componentX;
				z += timeY*componentZ;
			} else {
				z = nextZ;
				x += timeZ*componentX;
				y += timeZ*componentY;
			}
		}
	}
}
function worldInit(sizeXChunks, sizeYChunks, sizeZChunks) {
	worldSizeXChunks = sizeXChunks;
	worldSizeYChunks = sizeYChunks;
	worldSizeZChunks = sizeZChunks;
	worldSizeYZChunks = sizeYChunks*sizeZChunks;
	worldChunks = [];
	for (let xChunk = 0; xChunk < worldSizeXChunks; ++xChunk) {
		for (let yChunk = 0; yChunk < worldSizeYChunks; ++yChunk) {
			for (let zChunk = 0; zChunk < worldSizeZChunks; ++zChunk) {
				worldChunks[xChunk*worldSizeYZChunks + yChunk*worldSizeZChunks + zChunk] = new WorldChunk(xChunk, yChunk, zChunk);
			}
		}
	}
	let maxVisibleQuads = 16*16*16*3;
	let maxVertices = maxVisibleQuads*4;
	let maxIndices = maxVisibleQuads*6;
	worldVertices = new Float32Array(maxVertices*renderVertexComponents);
	worldIndices = new Float32Array(maxIndices);
	
	/*let block = 0;
	for (let x = 0; x < worldSizeXChunks*16; ++x) {
		for (let y = 0; y < worldSizeYChunks*16; ++y) {
			for (let z = 0; z < worldSizeZChunks*16; ++z) {
				//if (x === 0 || y === 0 || z === 0 || x === worldSizeXChunks*16 - 1 || y === worldSizeXChunks*16 - 1 || z === worldSizeXChunks*16 - 1) {
					//worldSetBlock(x, y, z, 0);
				//} else
				worldSetBlock(x, y, z, block);
				block = !block;
			}
			block = !block;
		}
		block = !block;
	}*/
	/*for (let x = 0; x < worldSizeXChunks*16; ++x) {
		for (let y = 0; y < worldSizeYChunks*16; ++y) {
			for (let z = 0; z < worldSizeZChunks*16; ++z) {
				if (y > 64) {
					worldSetBlock(x, y, z, 0);
				} else
				worldSetBlock(x, y, z, 1);
			}
		}
	}*/
	for (let x = 0; x < worldSizeXChunks*16; ++x) {
		for (let y = 0; y < 64; ++y) {
			for (let z = 0; z < worldSizeZChunks*16; ++z) {
				//worldSetBlock(x, y, z, Math.random()*2);
				if (y === 63) {
					worldSetBlock(x, y, z, blockTYPE_GRASS);
				} else {
					worldSetBlock(x, y, z, blockTYPE_DIRT);
				}
			}
		}
	}
	for (let i = 0; i < worldChunks.length; ++i) {
		let chunk = worldChunks[i];
		if (chunk) {
			chunk.updateModel();
		}
	}
}
var worldVertices;
var worldIndices;
var worldChunks;
var worldSizeXChunks;
var worldSizeYChunks;
var worldSizeZChunks;
var worldSizeYZChunks;