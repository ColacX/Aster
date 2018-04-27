#version 100
attribute vec3 position;
uniform mat4 mvp;

varying vec4 vertexPosition;

void main() {
  vertexPosition = vec4(position, 1);
  gl_Position = mvp * vec4(position, 1);
}