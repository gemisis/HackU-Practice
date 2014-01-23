var gl;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var shaderProgram;
var squareVertexPositionBuffer;
var triangleVertexPositionBuffer;

function drawScene() {
	gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45,gl.viewportWidth / gl.viewportHeight,0.1,100.0,pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix,[-1.5,0.0,-7.0]);

	gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,triangleVertexPositionBuffer.sizeOfItems,gl.FLOAT,false,0,0);

	setMatrixUniforms();

	gl.drawArrays(gl.TRIANGKES,0,triangleVertexPositionBuffer.amountOfItems);

	mat4.translate(mvMatrix,[0.0,1.5,-10.0]);

	gl.bindBuffer(gl.ARRAY_BUFFER,squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,squareVertexPositionBuffer.sizeOfItems,gl.FLOAT,false,0,0);	

	setMatrixUniforms();

	gl.drawArrays(gl.TRIANGLE_STRIP,0,squareVertexPositionBuffer.amountOfItems);
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if(!shaderScript) {
		return null;
	}

	var string = '';
	var k = shaderScript.firstChild;
	while(k) {
		if(k.nodeType == 3) {
			string += k.textContent;
		}

		k = k.nextSibling;
	}

	var shader;
	if(shaderScript.type == 'x-shader/x-fragment') {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if(shaderScript.type == 'x-shader/x-vertex') {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader,string);
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function initBuffers() {
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexPositionBuffer);

	var vertices = [
		 0.0,  0.1,  0.0,
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0
	];

	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);

	triangleVertexPositionBuffer.sizeOfItems = 3;
	triangleVertexPositionBuffer.amountOfItems = 3;

	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,squareVertexPositionBuffer);

	vertices = [
		 1.0,  0.1,  0.0,
		-1.0,  1.0,  0.0,
		 1.0, -1.0,  0.0,
		-1.0, -1.0,  0.0
	];

	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);

	squareVertexPositionBuffer.sizeOfItems = 3;
	squareVertexPositionBuffer.amountOfItems = 4;
}

function initGL(canvas) {
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch(e) {
		console.log(e);
	}

	if(!gl) {
		console.log('ERROR: Could not initialize WebGl');
	}
}

function initShaders() {
	var fragmentShader = getShader(gl,'shader-fs');
	var vertexShader = getShader(gl,'shader-vs');

	shaderProgram = gl.createProgram();

	gl.attachShader(shaderProgram,vertexShader);
	gl.attachShader(shaderProgram,fragmentShader);

	gl.linkProgram(shaderProgram);

	if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)) {
		console.log('ERROR: Could not initialize shaders.');
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,'aVertexPosition');

	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,'uPMatrix')
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,'uMVMatrix')
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,false,pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform,false,mvMatrix);
}

function webGLStart() {
	var canvas = document.getElementById('canvas');

	initGL(canvas);
	initShaders();
	initBuffers();

	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.enable(gl.DEPTH_TEST);

	drawScene();
}