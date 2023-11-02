"use strict";

function main() {
  var image = new Image();
  image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
  image.crossOrigin = "Anonymous";
  image.onload = function () {
    render(image);
  };
}

function render(image) {
  // 캔버스 가져오고 크기 맞춰주기
  var canvas = document.getElementById("game-surface");
  canvas.width = image.width;
  canvas.height = image.height;

  // 웹지엘 불러오기
  var gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("WebGL not supported, falling back on experimental-webgl");
    gl = canvas.getContext("experimental-webgl");
  }

  if (!gl) {
    alert("Your browser does not support WebGL");
  }

  // bring glsl text source, glsl 텍스트 소스 가져오기
  var vertexShaderSource = document.getElementById("vertex-shader-2d").text;
  var fragmentShaderSource = document.getElementById("fragment-shader-2d").text;

  // create and compile shaders and check vaildations, 쉐이더 생성과 컴파일 검증까지
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  // 프로그램 만들고 실행
  var program = createProgram(gl, vertexShader, fragmentShader);

  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // 포지션 설정
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  var x1 = 0;
  var x2 = 0 + image.width;
  var y1 = 0;
  var y2 = 0 + image.height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // 텍스쳐 기본 좌표 설정
  var texcoorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    ]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(texcoordLocation);
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

  // 텍스쳐 만들기
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 어떤 사이즈의 이미지든 그릴 수 있게 설정
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // 텍스쳐 데이터
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // 캔버스의 어디에 얼마의 크기로 그릴 것인지, 0,0 좌표에 이미지 넓이 높이대로 그린다.
  gl.viewport(0, 0, image.width, image.height);
  gl.clearColor(Math.random(), Math.random(), Math.random(), 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 0~1로 이미지 사이즈 변환하기 위한 값
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR linking program", gl.getProgramInfoLog(program));
    return;
  }

  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program", gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);
  return program;
}

main();
