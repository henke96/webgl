'use strict';
const renderDefaultTestBlock = 0;

function WorldChunk(xChunk, yChunk, zChunk) {
	this.xChunk = xChunk;
	this.yChunk = yChunk;
	this.zChunk = zChunk;
	this.blocks = new Int32Array(16*16*16);
	this.model = new RenderModel([], [], gl.TRIANGLES);
	this.model.addInstance(new RenderInstance(xChunk*32, yChunk*32, zChunk*32, 1, 0, 0, 0));
	this.model.finalizeInstances();
	this.vertexArray = new RenderVertexArray(gl.STATIC_DRAW);
	this.vertexArray.addModel(this.model);
}
WorldChunk.prototype.updateModel = function() {
	let vertexOffset = 0, verticesIndex = 0, indicesIndex = 0;
	let blocks = this.blocks;
	let rightChunk = worldGetChunk(this.xChunk + 1, this.yChunk, this.zChunk), leftChunk = worldGetChunk(this.xChunk - 1, this.yChunk, this.zChunk);
	let upChunk = worldGetChunk(this.xChunk, this.yChunk + 1, this.zChunk), downChunk = worldGetChunk(this.xChunk, this.yChunk - 1, this.zChunk);
	let frontChunk = worldGetChunk(this.xChunk, this.yChunk, this.zChunk + 1), backChunk = worldGetChunk(this.xChunk, this.yChunk, this.zChunk - 1);
	
	for (let x = 0; x < 16; ++x) {
		let xOffset = x << 1;
		let xNeg = xOffset - 1, xPos = xOffset + 1;
		for (let y = 0; y < 16; ++y) {
			let yOffset = y << 1;
			let yNeg = yOffset - 1, yPos = yOffset + 1;
			for (let z = 0; z < 16; ++z) {
				let blockIndex = (x << 8) + (y << 4) + z;
				let block = blocks[blockIndex];
				if (block === 0) continue;
				let zOffset = z << 1;
				let zNeg = zOffset - 1, zPos = zOffset + 1;
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
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
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
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
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
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
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
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
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
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = xPos;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = 0;
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
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zPos;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yPos;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
					worldVertices[verticesIndex++] = xNeg;
					worldVertices[verticesIndex++] = yNeg;
					worldVertices[verticesIndex++] = zNeg;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 0;
					worldVertices[verticesIndex++] = 1;
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
	return worldChunks[xChunk*worldSizeYZChunks + yChunk*worldSizeYChunks + zChunk];
}
function worldSetBlock(x, y, z, value) {
	let chunk = worldGetChunk(x >> 4, y >> 4, z >> 4);
	chunk.blocks[(x & 0xf)*256 + (y & 0xf)*16 + (z & 0xf)] = value;
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
function worldInit(sizeXChunks, sizeYChunks, sizeZChunks) {
	worldSizeXChunks = sizeXChunks;
	worldSizeYChunks = sizeYChunks;
	worldSizeZChunks = sizeZChunks;
	worldSizeYZChunks = sizeYChunks*sizeZChunks;
	worldChunks = [];
	for (let xChunk = 0; xChunk < worldSizeXChunks; ++xChunk) {
		for (let yChunk = 0; yChunk < worldSizeYChunks; ++yChunk) {
			for (let zChunk = 0; zChunk < worldSizeZChunks; ++zChunk) {
				worldChunks[xChunk*worldSizeYZChunks + yChunk*worldSizeYChunks + zChunk] = new WorldChunk(xChunk, yChunk, zChunk);
			}
		}
	}
	let maxVisibleQuads = 16*16*16*3;
	let maxVertices = maxVisibleQuads*4;
	let maxIndices = maxVisibleQuads*6;
	worldVertices = new Float32Array(maxVertices*renderVertexComponents);
	worldIndices = new Float32Array(maxIndices);
	
	let block = 0;
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
	}
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
	for (let i = 0; i < worldChunks.length; ++i) {
		let chunk = worldChunks[i];
		if (chunk) {
			chunk.updateModel();
		}
	}
}
var worldVertices;
var worldIndices;
var worldBlocks;
var worldChunks;
var worldSizeXChunks;
var worldSizeYChunks;
var worldSizeZChunks;
var worldSizeYZChunks;