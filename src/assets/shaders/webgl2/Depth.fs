#version 300 es

precision highp float;
precision highp int;

in vec3 vertex; // point on geometry

out vec4 x3d_FragColor;

#pragma X3D include "include/Pack.glsl"
#pragma X3D include "include/ClipPlanes.glsl"

void
main ()
{
   clip ();

   x3d_FragColor = pack (gl_FragCoord .z);
}
