#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;
precision highp samplerCube;

#pragma X3D include "include/Fragment.glsl"
#pragma X3D include "include/ShadowColor.glsl"

in vec4 frontColor;
in vec4 backColor;

vec4
getMaterialColor ()
{
   #if defined (X3D_GEOMETRY_0D) || defined (X3D_GEOMETRY_1D)
      vec4 finalColor = frontColor;
   #else
      vec4 finalColor = gl_FrontFacing ? frontColor : backColor;
   #endif

   finalColor = getTextureColor (finalColor, vec4 (1.0));
   finalColor = getProjectiveTextureColor (finalColor);

   #if defined (X3D_SHADOWS)
   finalColor .rgb = getShadowColor (normal, finalColor .rgb);
   #endif

   return finalColor;
}

void
main ()
{
   fragment_main ();
}
