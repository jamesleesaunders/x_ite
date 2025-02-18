export default /* glsl */ `
vec4
pack (const in float value)
{
   const vec3 bitShifts = vec3 (255.0,
                                255.0 * 255.0,
                                255.0 * 255.0 * 255.0);

   return vec4 (value, fract (value * bitShifts));
}

#if defined (X3D_DEPTH_TEXTURE)

float
unpack (const in vec4 color)
{
   return color .r;
}

#else

float
unpack (const vec4 color)
{
   const vec3 bitShifts = vec3 (1.0 / 255.0,
                                1.0 / (255.0 * 255.0),
                                1.0 / (255.0 * 255.0 * 255.0));

   return color .x + dot (color .gba, bitShifts);
}

#endif
`;
