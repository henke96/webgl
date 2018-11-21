'use strict';
window.onload = gInit;
const HTML_CANVAS = "glCanvas";

//{ Game - g
const gVertexShaderSource = `
	precision mediump float;
	attribute vec4 aVertexPosition;
	attribute vec4 aVertexColor;
	attribute mat4 aModelViewMatrix;
	
	uniform mat4 uProjectionMatrix;
	
	varying vec4 vColor;
	
	void main() {
		gl_Position = uProjectionMatrix * aModelViewMatrix * aVertexPosition;
		vColor = aVertexColor;
	}
`;
const gFragmentShaderSource = `
	precision mediump float;
	varying vec4 vColor;
	
	void main() {
		gl_FragColor = vColor;
	}
`;
const gMODEL_NICE_RECT = 0;
const gMODEL_NICE_TRI = 1;
const gMODEL_NICE_CUBE = 2;

function gInit() {
	gCanvas = document.getElementById(HTML_CANVAS);
	if (!glTryInit(gCanvas)) {
		alert("Couldn't initialize WebGL.");
		return;
	}
	const program = glLoadShaderProgram(gVertexShaderSource, gFragmentShaderSource)
	gProgramInfo = {
		program: program,
		aLocations: {
			vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
			vertexColor: gl.getAttribLocation(program, "aVertexColor"),
			modelViewMatrix: gl.getAttribLocation(program, "aModelViewMatrix")
		},
		uLocations: {
			projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix")
		}
	};
	gCamera = {
		x: 0,
		y: 0,
		z: 0,
		xAngle: 0,
		yAngle: 0
	};
	gKeysDown = {};
	gMouseMove = {
		leftRight: 0,
		upDown: 0
	};
	gInitModels();
	gInitArrays();
	gInitObjects();
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	//gl.enable(gl.BLEND);
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.useProgram(gProgramInfo.program);
	
	const near = 0.1;
	const far = 200;
	const widthRatio = 2; // 90 degrees
	const heightRatio = widthRatio*gl.canvas.clientHeight/gl.canvas.clientWidth;
	gProjectionMatrix = mat4CreatePerspective(near*widthRatio, near*heightRatio, near, far);
	gl.uniformMatrix4fv(gProgramInfo.uLocations.projectionMatrix, false, gProjectionMatrix);
	
	gPrevFrameTimestamp = performance.now();
	window.requestAnimationFrame(gMainLoop);
	window.onkeydown = gOnKeyDown;
	window.onkeyup = gOnKeyUp;
	gCanvas.requestPointerLock = gCanvas.requestPointerLock || gCanvas.mozRequestPointerLock;
	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
	document.addEventListener("pointerlockchange", gOnPointerLockChange, false);
	document.addEventListener("mozpointerlockchange", gOnPointerLockChange, false);
	gCanvas.onclick = function() {
		gCanvas.requestPointerLock();
	}
}
function gMainLoop(timestamp) {
	let deltaTime = timestamp - gPrevFrameTimestamp;
	gPrevFrameTimestamp = timestamp;
	let leftRight = 0, frontBack = 0, upDown = 0;
	let speed = 1/100;
	if (gKeysDown["w"]) frontBack += speed;
	if (gKeysDown["s"]) frontBack -= speed;
	if (gKeysDown["d"]) leftRight += speed;
	if (gKeysDown["a"]) leftRight -= speed;
	if (gKeysDown["shift"]) upDown -= speed;
	if (gKeysDown[" "]) upDown += speed;
	let sin = Math.sin(gCamera.yAngle), cos = Math.cos(gCamera.yAngle);
	let deltaZ = -frontBack*cos - leftRight*sin;
	let deltaX = leftRight*cos - frontBack*sin;
	gCamera.z += deltaZ*deltaTime;
	gCamera.x += deltaX*deltaTime;
	gCamera.y += upDown*deltaTime;
	
	let sensitivity = 1 / 200;
	gCamera.yAngle -= gMouseMove.leftRight*sensitivity;
	gCamera.xAngle -= gMouseMove.upDown*sensitivity;
	if (gCamera.xAngle < -Math.PI/2) gCamera.xAngle = -Math.PI/2;
	if (gCamera.xAngle > Math.PI/2) gCamera.xAngle = Math.PI/2;
	gMouseMove.leftRight = 0;
	gMouseMove.upDown = 0;
	
	gDrawScene();
	window.requestAnimationFrame(gMainLoop);
}
function gDrawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	for (let i = 0; i < gModels.length; ++i) {
		gModels[i].drawObjects();
	}
}
function gOnPointerLockChange() {
	if (document.pointerLockElement === gCanvas || document.mozPointerLockElement === gCanvas) {
		document.addEventListener("mousemove", gOnMouseMove, false);
	} else {
		document.removeEventListener("mousemove", gOnMouseMove, false);
	}
}
function gOnMouseMove(e) {
	gMouseMove.leftRight += e.movementX;
	gMouseMove.upDown += e.movementY;
}
function gOnKeyDown(e) {
	gKeysDown[e.key.toLowerCase()] = true;
}
function gOnKeyUp(e) {
	gKeysDown[e.key.toLowerCase()] = false;
}
function gInitObjects() {
	let model = gModels[gMODEL_NICE_RECT];
	model.addGameObject(new GameObject(0, 0, -20, 1, 0, 0, 0));
	model.addGameObject(new GameObject(-20, 0, -40, 1, 0, 0, 0));
	model.gameObjectsFinalized();
	
	model = gModels[gMODEL_NICE_TRI];
	model.addGameObject(new GameObject(0, 0, -10, 1, 0, 0, 0));
	model.addGameObject(new GameObject(10, 0, -15, 1, 0, 0, 0));
	model.gameObjectsFinalized();
	
	model = gModels[gMODEL_NICE_CUBE];
	model.addGameObject(new GameObject(2, -1, -5, 1, 0, 0, 0));
	model.addGameObject(new GameObject(-2, 5, -10, 1, 0, 0, 0));
	for (let i = 0; i < 100000; ++i) {
		let maxDist = 150;
		let xAngle = Math.random()*2*Math.PI, yAngle = Math.random()*2*Math.PI, zAngle = Math.random()*2*Math.PI;
		model.addGameObject(new GameObject((Math.random() - 0.5) * maxDist, (Math.random() - 0.5) * maxDist, (Math.random() - 0.5) * maxDist, Math.random(), xAngle, yAngle, zAngle));
	}
	model.gameObjectsFinalized();
}
function gInitModels() {
	gModels = [];
	let c = 0;
	let vertices = [
		-4, 3, 0, 1, 1, 1,
		-4, -3, 0, 1, 0, 0,
		4, 3, 0, 0, 1, 0,
		4, -3, 0, 0, 0, 1
	];
	let indices = [
		0, 1, 2, 3
	];
	gModels[gMODEL_NICE_RECT] = new Model(vertices, indices, gl.TRIANGLE_STRIP);
	c += vertices.length/6;
	
	vertices = [
		0, 0.5, 0, 0, 1, 1,
		-0.5, -0.5, 1, 1, 0, 1,
		0.5, -0.5, 0, 1, 1, 0,
	];
	indices = [
		c+0, c+1, c+2
	];
	gModels[gMODEL_NICE_TRI] = new Model(vertices, indices, gl.TRIANGLES);
	c += vertices.length/6;
	
	vertices = [
		// Front
		-1, 1, 1, 0, 1, 1,
		-1, -1, 1, 0, 1, 1,
		1, 1, 1, 0, 1, 1,
		1, -1, 1, 0, 1, 1,
		// Back
		-1, 1, -1, 1, 0, 1,
		-1, -1, -1, 1, 0, 1,
		1, 1, -1, 1, 0, 1,
		1, -1, -1, 1, 0, 1,
		// Top
		-1, 1, -1, 1, 1, 0,
		-1, 1, 1, 1, 1, 0,
		1, 1, -1, 1, 1, 0,
		1, 1, 1, 1, 1, 0,
		// Bottom
		-1, -1, -1, 1, 0, 0,
		-1, -1, 1, 1, 0, 0,
		1, -1, -1, 1, 0, 0,
		1, -1, 1, 1, 0, 0,
		// Right
		1, 1, 1, 0, 1, 0,
		1, -1, 1, 0, 1, 0,
		1, 1, -1, 0, 1, 0,
		1, -1, -1, 0, 1, 0,
		// Left
		-1, 1, 1, 0, 0, 1,
		-1, -1, 1, 0, 0, 1,
		-1, 1, -1, 0, 0, 1,
		-1, -1, -1, 0, 0, 1,
	];
	indices = [
		c+0, c+1, c+2,	c+2, c+1, c+3,
		c+4, c+6, c+5, 	c+5, c+6, c+7,
		
		c+8, c+9, c+10,	c+10, c+9, c+11,
		c+12, c+14, c+13, 	c+13, c+14, c+15,

		c+16, c+17, c+18,	c+18, c+17, c+19,
		c+20, c+22, c+21, 	c+21, c+22, c+23,	
	];
	gModels[gMODEL_NICE_CUBE] = new Model(vertices, indices, gl.TRIANGLES);
	c += vertices.length/6;
}
function gInitArrays() {
	const vertexArray = gl.createVertexArray();
	gl.bindVertexArray(vertexArray);
	
	let verticesLength = 0;
	let indicesLength = 0;
	for (let i = 0; i < gModels.length; ++i) {
		let model = gModels[i];
		verticesLength += model.vertices.length;
		indicesLength += model.indices.length;
	}
	
	let vertices = new Float32Array(verticesLength);
	let verticesIndex = 0;
	let indices = new Uint16Array(indicesLength);
	let indicesIndex = 0;
	for (let i = 0; i < gModels.length; ++i) {
		let model = gModels[i];
		vertices.set(model.vertices, verticesIndex);
		verticesIndex += model.vertices.length;
		indices.set(model.indices, indicesIndex);
		model.startElementIndex = indicesIndex;
		indicesIndex += model.indices.length;
	}
	
	const stride = 24;
	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(gProgramInfo.aLocations.vertexPosition, 3, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(gProgramInfo.aLocations.vertexPosition);
	
	gl.vertexAttribPointer(gProgramInfo.aLocations.vertexColor, 3, gl.FLOAT, false, stride, 12);
	gl.enableVertexAttribArray(gProgramInfo.aLocations.vertexColor);
	
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	
	const mvpBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mvpBuffer);
	for (let i = 0; i < 4; ++i) {
		let loc = gProgramInfo.aLocations.modelViewMatrix + i;
		gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, i*16);
		gl.vertexAttribDivisor(loc, 1);
		gl.enableVertexAttribArray(loc);
	}
	
	gVertexArray = {
		array: vertexArray,
		vertexBuffer: vertexBuffer,
		indexBuffer: indexBuffer,
		mvpBuffer: mvpBuffer
	};
}
var gCanvas;
var gProjectionMatrix;
var gProgramInfo;
var gVertexArray;
var gModels;
var gCamera;
var gPrevFrameTimestamp;
var gKeysDown;
var gMouseMove;
//}
//{ Model - model
function Model(vertices, indices, drawOperation) {
	this.vertices = vertices;
	this.indices = indices;
	this.startElementIndex = -1;
	this.drawOperation = drawOperation;
	this.gameObjects = [];
	this.mvps = null;
}
Model.prototype.addGameObject = function(gameObject) {
	this.gameObjects.push(gameObject);
}
Model.prototype.gameObjectsFinalized = function() {
	this.mvps = mat4ArrayCreateZero(this.gameObjects.length);
}
Model.prototype.removeGameObject = function(gameObject) {
	let index = this.gameObjects.indexOf(gameObject);
	if (index !== -1) {
		this.gameObjects.splice(index, 1);
	}
}
Model.prototype.drawObjects = function() {
	let numObjects = this.gameObjects.length;
	for (let i = 0; i < numObjects; ++i) {
		let object = this.gameObjects[i];
		mat4ArrayScaleTranslation(this.mvps, i, object.scale, object.x - gCamera.x, object.y - gCamera.y, object.z - gCamera.z);
		mat4ArrayRotateRelX(this.mvps, i, object.xAngle);
		mat4ArrayRotateRelY(this.mvps, i, object.yAngle);
		mat4ArrayRotateRelZ(this.mvps, i, object.zAngle);
		mat4ArrayRotateY(this.mvps, i, -gCamera.yAngle);
		mat4ArrayRotateX(this.mvps, i, -gCamera.xAngle);
	}
	gl.bufferData(gl.ARRAY_BUFFER, this.mvps, gl.DYNAMIC_DRAW);
	gl.drawElementsInstanced(this.drawOperation, this.indices.length, gl.UNSIGNED_SHORT, 2*this.startElementIndex, numObjects);
}
//}
//{ GameObject - go
function GameObject(x, y, z, scale, xAngle, yAngle, zAngle) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.scale = scale;
	this.xAngle = xAngle;
	this.yAngle = yAngle;
	this.zAngle = zAngle;
}
//}
//{ Matrix helper - mat
function mat4CreateZero() {
	return new Float32Array(16);
}
function mat4CreateIdentity() {
	let mat = new Float32Array(16);
	mat[0] = 1;
	mat[5] = 1;
	mat[10] = 1;
	mat[15] = 1;
	return mat;
}
function mat4CreateTranslation(x, y, z) {
	let mat = mat4CreateIdentity();
	mat[12] = x;
	mat[13] = y;
	mat[14] = z;
	return mat;
}
function mat4ArrayCreateZero(matCount) {
	return new Float32Array(matCount << 4);
}
function mat4ArrayCreateIdentities(matCount) {
	let mats = new Float32Array(matCount << 4);
	for (let i = 0; i < matCount; ++i) {
		let offset = i << 4;
		mats[offset] = 1;
		mats[offset + 5] = 1;
		mats[offset + 10] = 1;
		mats[offset + 15] = 1;
	}
	return mats;
}
function mat4ArrayScaleTranslation(matArray, matIndex, scale, x, y, z) {
	let offset = matIndex << 4;
	matArray[offset] = scale;
	matArray[offset + 1] = 0;
	matArray[offset + 2] = 0;
	matArray[offset + 4] = 0;
	matArray[offset + 5] = scale;
	matArray[offset + 6] = 0;
	matArray[offset + 8] = 0;
	matArray[offset + 9] = 0;
	matArray[offset + 10] = scale;
	matArray[offset + 15] = 1;
	matArray[offset + 12] = x;
	matArray[offset + 13] = y;
	matArray[offset + 14] = z;
}

function mat4ArrayRotateRelX(matArray, matIndex, angle) {
	//Assumes no translation
	let offset = matIndex << 4;
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	let v01 = matArray[offset + 4], v11 = matArray[offset + 5], v21 = matArray[offset + 6], v02 = matArray[offset + 8], v12 = matArray[offset + 9], v22 = matArray[offset + 10];
	matArray[offset + 4] = cos*v01 + sin*v02;
	matArray[offset + 5] = cos*v11 + sin*v12;
	matArray[offset + 6] = cos*v21 + sin*v22;
	matArray[offset + 8] = cos*v02 - sin*v01;
	matArray[offset + 9] = cos*v12 - sin*v11;
	matArray[offset + 10] = cos*v22 - sin*v21;
}
function mat4ArrayRotateRelY(matArray, matIndex, angle) {
	//Assumes no translation
	let offset = matIndex << 4;
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	let v00 = matArray[offset], v10 = matArray[offset + 1], v20 = matArray[offset + 2], v02 = matArray[offset + 8], v12 = matArray[offset + 9], v22 = matArray[offset + 10];
	matArray[offset] = cos*v00 - sin*v02;
	matArray[offset + 1] = cos*v10 - sin*v12;
	matArray[offset + 2] = cos*v20 - sin*v22;
	matArray[offset + 8] = cos*v02 + sin*v00;
	matArray[offset + 9] = cos*v12 + sin*v10;
	matArray[offset + 10] = cos*v22 + sin*v20;
}
function mat4ArrayRotateRelZ(matArray, matIndex, angle) {
	//Assumes no translation
	let offset = matIndex << 4;
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	let v00 = matArray[offset], v10 = matArray[offset + 1], v20 = matArray[offset + 2], v01 = matArray[offset + 4], v11 = matArray[offset + 5], v21 = matArray[offset + 6];
	matArray[offset] = cos*v00 + sin*v01;
	matArray[offset + 1] = cos*v10 + sin*v11;
	matArray[offset + 2] = cos*v20 + sin*v21;
	matArray[offset + 4] = cos*v01 - sin*v00;
	matArray[offset + 5] = cos*v11 - sin*v10;
	matArray[offset + 6] = cos*v21 - sin*v20;
}
function mat4ArrayRotateX(matArray, matIndex, angle) {
	let offset = matIndex << 4;
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	let v10 = matArray[offset + 1], v20 = matArray[offset + 2], v11 = matArray[offset + 5], v21 = matArray[offset + 6], v12 = matArray[offset + 9], v22 = matArray[offset + 10], v13 = matArray[offset + 13], v23 = matArray[offset + 14];
	matArray[offset + 1] = cos*v10 - sin*v20;
	matArray[offset + 2] = sin*v10 + cos*v20;
	matArray[offset + 5] = cos*v11 - sin*v21;
	matArray[offset + 6] = sin*v11 + cos*v21;
	matArray[offset + 9] = cos*v12 - sin*v22;
	matArray[offset + 10] = sin*v12 + cos*v22;
	matArray[offset + 13] = cos*v13 - sin*v23;
	matArray[offset + 14] = sin*v13 + cos*v23;
}
function mat4ArrayRotateY(matArray, matIndex, angle) {
	let offset = matIndex << 4;
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	let v00 = matArray[offset], v20 = matArray[offset + 2], v01 = matArray[offset + 4], v21 = matArray[offset + 6], v02 = matArray[offset + 8], v22 = matArray[offset + 10], v03 = matArray[offset + 12], v23 = matArray[offset + 14];
	matArray[offset] = cos*v00 + sin*v20;
	matArray[offset + 2] = -sin*v00 + cos*v20;
	matArray[offset + 4] = cos*v01 + sin*v21;
	matArray[offset + 6] = -sin*v01 + cos*v21;
	matArray[offset + 8] = cos*v02 + sin*v22;
	matArray[offset + 10] = -sin*v02 + cos*v22;
	matArray[offset + 12] = cos*v03 + sin*v23;
	matArray[offset + 14] = -sin*v03 + cos*v23;
}
function mat4ArrayRotateZ(matArray, matIndex, angle) {
	let offset = matIndex << 4;
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	let v00 = matArray[offset], v10 = matArray[offset + 1], v01 = matArray[offset + 4], v11 = matArray[offset + 5], v02 = matArray[offset + 8], v12 = matArray[offset + 9], v03 = matArray[offset + 12], v13 = matArray[offset + 13];
	matArray[offset] = cos*v00 - sin*v10;
	matArray[offset + 1] = sin*v00 + cos*v10;
	matArray[offset + 4] = cos*v01 - sin*v11;
	matArray[offset + 5] = sin*v01 + cos*v11;
	matArray[offset + 8] = cos*v02 - sin*v12;
	matArray[offset + 9] = sin*v02 + cos*v12;
	matArray[offset + 12] = cos*v03 - sin*v13;
	matArray[offset + 13] = sin*v03 + cos*v13;
}
function mat4CreatePerspective(width, height, near, far) {
	let mat = new Float32Array(16);
	mat4Perspective(mat, width, height, near, far);
	return mat;
}
function mat4Perspective(mat, width, height, near, far) {
	mat[0] = 2*near/width;
	mat[5] = 2*near/height;
	mat[10] = -(near + far)/(far - near);
	mat[11] = -1;
	mat[14] = -(2*near*far/(far - near));
}
//}
//{ WebGl helper - gl
function glTryInit(canvas) {
	gl = canvas.getContext("webgl2", {antialias: false});
	if (gl === null) {
		return false;
	}
	return true;
}
function glLoadShaderProgram(vertexShaderSource, fragmentShaderSource) {
	const vertexShader = glLoadShader(gl.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = glLoadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Couldn't link program.")
	}
	return shaderProgram;
}
function glLoadShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Couldn't compile shader: " + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}
	return shader;
}
var gl;
//}