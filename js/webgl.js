'use strict';
window.onload = gInit;
const HTML_CANVAS = "glCanvas";

//{ Game - g

const gVERTEX_ARRAY_STATIC = 0;
const gVERTEX_ARRAY_DYNAMIC = 1;

const gMODEL_NICE_RECT = 0;
const gMODEL_NICE_TRI = 1;
const gMODEL_NICE_CUBE = 2;

function gInit() {
	const near = 0.5;
	const far = 400;
	const widthRatio = 2; // 90 degrees
	renderInit(near, far, widthRatio);
	gKeysDown = {};
	gMouseMove = {
		leftRight: 0,
		upDown: 0
	};
	gInitVertexArrays();
	gInitModels();
	gInitObjects();
	worldInit(10, 10, 10);
	gPrevFrameTimestamp = performance.now();
	window.requestAnimationFrame(gMainLoop);
	window.onkeydown = gOnKeyDown;
	window.onkeyup = gOnKeyUp;
	renderCanvas.requestPointerLock = renderCanvas.requestPointerLock || renderCanvas.mozRequestPointerLock;
	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
	document.addEventListener("pointerlockchange", gOnPointerLockChange, false);
	document.addEventListener("mozpointerlockchange", gOnPointerLockChange, false);
	renderCanvas.onclick = function() {
		renderCanvas.requestPointerLock();
	}
}
var frameCount = 0;
var frameCountStartTime = performance.now();
var avgFrameTime = 0;
function gMainLoop(timestamp) {
	if (timestamp - frameCountStartTime >= 1000) {
		console.log("FPS: " + frameCount*1000/(timestamp - frameCountStartTime));
		console.log("Frametime: " + avgFrameTime);
		frameCountStartTime = timestamp;
		frameCount = 0;
	}
	++frameCount;
	
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
	let sin = Math.sin(renderCamera.yAngle), cos = Math.cos(renderCamera.yAngle);
	let deltaZ = -frontBack*cos - leftRight*sin;
	let deltaX = leftRight*cos - frontBack*sin;
	renderCamera.z += deltaZ*deltaTime;
	renderCamera.x += deltaX*deltaTime;
	renderCamera.y += upDown*deltaTime;
	
	let sensitivity = 1 / 200;
	renderCamera.yAngle -= gMouseMove.leftRight*sensitivity;
	renderCamera.xAngle -= gMouseMove.upDown*sensitivity;
	if (renderCamera.xAngle < -Math.PI/2) renderCamera.xAngle = -Math.PI/2;
	if (renderCamera.xAngle > Math.PI/2) renderCamera.xAngle = Math.PI/2;
	gMouseMove.leftRight = 0;
	gMouseMove.upDown = 0;
	
	let cubeModel = gModels[gMODEL_NICE_CUBE];
	let len = cubeModel.instances.length;
	for (let i = 0; i < len; ++i) {
		cubeModel.instances[i].x += (Math.random() - 0.5)/8;
		cubeModel.instances[i].y += (Math.random() - 0.5)/8;
		cubeModel.instances[i].z += (Math.random() - 0.5)/8;
		cubeModel.instances[i].xAngle += (Math.random() - 0.5)/8;
		cubeModel.instances[i].yAngle += (Math.random() - 0.5)/8;
		cubeModel.instances[i].zAngle += (Math.random() - 0.5)/8;
	}
	
	gDrawScene();
	window.requestAnimationFrame(gMainLoop);
	avgFrameTime += (performance.now() - timestamp - avgFrameTime)/60;
}
function gDrawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	worldDraw();
	for (let i = 0; i < gVertexArrays.length; ++i) {
		gVertexArrays[i].drawModels();
	}
}
function gOnPointerLockChange() {
	if (document.pointerLockElement === renderCanvas || document.mozPointerLockElement === renderCanvas) {
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
	model.addInstance(new RenderInstance(0, 0, -20, 1, 0, 0, 0));
	model.addInstance(new RenderInstance(-20, 0, -40, 1, 0, 0, 0));
	model.finalizeInstances();
	
	model = gModels[gMODEL_NICE_TRI];
	model.addInstance(new RenderInstance(0, 0, -10, 1, 0, 0, 0));
	model.addInstance(new RenderInstance(10, 0, -15, 1, 0, 0, 0));
	model.finalizeInstances();
	
	model = gModels[gMODEL_NICE_CUBE];
	model.addInstance(new RenderInstance(2, -1, -5, 1, 0, 0, 0));
	model.addInstance(new RenderInstance(-2, 5, -10, 1, 0, 0, 0));
	for (let i = 0; i < 0; ++i) {
		let maxDist = 150;
		let xAngle = Math.random()*2*Math.PI, yAngle = Math.random()*2*Math.PI, zAngle = Math.random()*2*Math.PI;
		model.addInstance(new RenderInstance((Math.random() - 0.5)*maxDist, (Math.random() - 0.5)*maxDist, (Math.random() - 0.5)*maxDist, Math.random(), xAngle, yAngle, zAngle));
	}
	model.finalizeInstances();
}
function gInitModels() {
	gModels = [];
	let vertices = [
		-4, 3, 0, 1, 1, 1,
		-4, -3, 0, 1, 0, 0,
		4, 3, 0, 0, 1, 0,
		4, -3, 0, 0, 0, 1
	];
	let indices = [
		0, 1, 2, 3
	];
	gModels[gMODEL_NICE_RECT] = new RenderModel(vertices, indices, gl.TRIANGLE_STRIP);
	
	vertices = [
		0, 0.5, 0, 0, 1, 1,
		-0.5, -0.5, 1, 1, 0, 1,
		0.5, -0.5, 0, 1, 1, 0,
	];
	indices = [
		0, 1, 2
	];
	gModels[gMODEL_NICE_TRI] = new RenderModel(vertices, indices, gl.TRIANGLES);
	
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
		0, 1, 2,	2, 1, 3,
		4, 6, 5, 	5, 6, 7,
		
		8, 9, 10,	10, 9, 11,
		12, 14, 13, 	13, 14, 15,

		16, 17, 18,	18, 17, 19,
		20, 22, 21, 	21, 22, 23,	
	];
	gModels[gMODEL_NICE_CUBE] = new RenderModel(vertices, indices, gl.TRIANGLES);
	
	gVertexArrays[gVERTEX_ARRAY_STATIC].addModel(gModels[gMODEL_NICE_CUBE]);
	gVertexArrays[gVERTEX_ARRAY_STATIC].addModel(gModels[gMODEL_NICE_TRI]);
	gVertexArrays[gVERTEX_ARRAY_STATIC].addModel(gModels[gMODEL_NICE_RECT]);
	gVertexArrays[gVERTEX_ARRAY_STATIC].finalizeModels();
}
function gInitVertexArrays() {
	gVertexArrays = [];
	gVertexArrays[gVERTEX_ARRAY_STATIC] = new RenderVertexArray(gl.STATIC_DRAW, gl.UNSIGNED_BYTE);
}
var gProjectionMatrix;
var gModels;
var gVertexArrays;
var gPrevFrameTimestamp;
var gKeysDown;
var gMouseMove;
//}