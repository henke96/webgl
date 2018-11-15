'use strict';
window.onload = gMain;
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

function gMain() {
	const canvas = document.getElementById(HTML_CANVAS);
	if (!glTryInit(canvas)) {
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
	gInitializeArrays();
	gProjectionMatrix = mat4CreateZero();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.useProgram(gProgramInfo.program);
	gDrawScene();
}
function gDrawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const fovY = 45 * Math.PI / 180;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	mat4Perspective(gProjectionMatrix, fovY, aspect, zNear, zFar);
	gl.uniformMatrix4fv(gProgramInfo.uLocations.projectionMatrix, false, gProjectionMatrix);
	
	const mvps = new Float32Array(32);
	const mvp1 = mat4CreateTranslation(0, 0, -8);
	const mvp2 = mat4CreateTranslation(-8, 0, -20);
	mvps.set(mvp1, 0);
	mvps.set(mvp2, 16);
	
	gl.bufferData(gl.ARRAY_BUFFER, mvps, gl.DYNAMIC_DRAW);
	gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 2);
}
function gInitializeArrays() {
	const vertexArray = gl.createVertexArray();
	gl.bindVertexArray(vertexArray);
	
	const positions = new Float32Array([
		-1.0, 1.0,
		-1.0, -1.0,
		1.0, 1.0,
		1.0, -1.0
	]);
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	gl.vertexAttribPointer(gProgramInfo.aLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(gProgramInfo.aLocations.vertexPosition);
	
	const colors = new Float32Array([
		1.0, 1.0, 1.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
	]);
	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	gl.vertexAttribPointer(gProgramInfo.aLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(gProgramInfo.aLocations.vertexColor);
	
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
		positionBuffer: positionBuffer,
		colorBuffer: colorBuffer,
		mvpBuffer: mvpBuffer
	};
}
var gProjectionMatrix;
var gProgramInfo;
var gVertexArray;
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
function mat4Translation(matArray, matOffset, x, y, z) {
	mat[matOffset + 12] = x;
	mat[matOffset + 13] = y;
	mat[matOffset + 14] = z;
}
function mat4Perspective(mat, fovY, aspect, near, far) {
	let f = 1.0 / Math.tan(fovY / 2), nf;
	mat[0] = f / aspect;
	mat[1] = 0;
	mat[2] = 0;
	mat[3] = 0;
	mat[4] = 0;
	mat[5] = f;
	mat[6] = 0;
	mat[7] = 0;
	mat[8] = 0;
	mat[9] = 0;
	mat[11] = -1;
	mat[12] = 0;
	mat[13] = 0;
	mat[15] = 0;
	if (far != null && far !== Infinity) {
		nf = 1 / (near - far);
		mat[10] = (far + near) * nf;
		mat[14] = (2 * far * near) * nf;
	} else {
		mat[10] = -1;
		mat[14] = -2 * near;
	}
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