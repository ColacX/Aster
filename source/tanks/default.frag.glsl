#version 100
precision mediump float;

varying vec4 vertexPosition;

void main() {
  vec4 surfaceColor = vec4(0.18, 0.54, 0.34, 1.0);
  vec4 lightPosition = vec4(10.0, 10.0, 10.0, 1.0);
  vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);
  float d = distance(lightPosition, vertexPosition);
  
  gl_FragColor = vertexPosition;
}