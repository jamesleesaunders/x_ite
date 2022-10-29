precision highp float;
precision highp int;
precision highp sampler2D;
precision highp samplerCube;
uniform float x3d_AlphaCutoff;
varying vec3 vertex; 
varying vec3 localVertex; 
#if defined (X3D_FOG)
#if defined (X3D_FOG_COORDS)
varying float fogDepth;
#endif
#endif
#if defined (X3D_COLOR_MATERIAL)
varying vec4 color;
#endif
#if ! defined (X3D_GEOMETRY_0D) && ! defined (X3D_GEOMETRY_1D)
#if x3d_MaxTextures > 0
varying vec4 texCoord0;
#endif
#if x3d_MaxTextures > 1
varying vec4 texCoord1;
#endif
#else
#if x3d_MaxTextures > 0
vec4 texCoord0 = vec4 (0.0);
#endif
#if x3d_MaxTextures > 1
vec4 texCoord1 = vec4 (0.0);
#endif
#endif
#if defined (X3D_NORMALS)
varying vec3 normal;
varying vec3 localNormal;
#else
vec3 normal = vec3 (0.0, 0.0, 1.0);
vec3 localNormal = vec3 (0.0, 0.0, 1.0);
#endif
#if defined (X3D_LOGARITHMIC_DEPTH_BUFFER)
uniform float x3d_LogarithmicFarFactor1_2;
varying float depth;
#endif
#if defined (X3D_STYLE_PROPERTIES) && defined (X3D_GEOMETRY_0D)
varying float pointSize;
void
setTexCoords ()
{
vec4 texCoord = vec4 (gl_PointCoord .x, 1.0 - gl_PointCoord .y, 0.0, 1.0);
#if x3d_MaxTextures > 0
texCoord0 = texCoord;
#endif
#if x3d_MaxTextures > 1
texCoord1 = texCoord;
#endif
}
vec4
getPointColor (in vec4 color)
{
if (pointSize > 1.0)
{
float t = max (distance (vec2 (0.5), gl_PointCoord) * pointSize - max (pointSize / 2.0 - 1.0, 0.0), 0.0);
color .a = mix (color .a, 0.0, t);
}
else
{
color .a *= pointSize;
}
return color;
}
#endif
#if defined (X3D_STYLE_PROPERTIES) && (defined (X3D_GEOMETRY_2D) || defined (X3D_GEOMETRY_3D))
uniform x3d_FillPropertiesParameters x3d_FillProperties;
vec4
getHatchColor (vec4 color)
{
vec4 finalColor = x3d_FillProperties .filled ? color : vec4 (0.0);
if (x3d_FillProperties .hatched)
{
vec4 hatch = texture2D (x3d_FillProperties .texture, gl_FragCoord .xy / 32.0);
hatch .rgb *= x3d_FillProperties .hatchColor;
finalColor = mix (finalColor, hatch, hatch .a);
}
return finalColor;
}
#endif
#if defined (X3D_FOG)
uniform x3d_FogParameters x3d_Fog;
float
getFogInterpolant ()
{
#if defined (X3D_FOG_COORDS)
return clamp (1.0 - fogDepth, 0.0, 1.0);
#else
float visibilityRange = x3d_Fog .visibilityRange;
float dV = length (x3d_Fog .matrix * vertex);
if (x3d_Fog .type == x3d_LinearFog)
return max (0.0, visibilityRange - dV) / visibilityRange;
if (x3d_Fog .type == x3d_ExponentialFog)
return exp (-dV / max (0.001, visibilityRange - dV));
return 1.0;
#endif
}
vec3
getFogColor (const in vec3 color)
{
return mix (x3d_Fog .color, color, getFogInterpolant ());
}
#endif
uniform int x3d_NumClipPlanes;
uniform vec4 x3d_ClipPlane [x3d_MaxClipPlanes];
void
clip ()
{
for (int i = 0; i < x3d_MaxClipPlanes; ++ i)
{
if (i == x3d_NumClipPlanes)
break;
if (dot (vertex, x3d_ClipPlane [i] .xyz) - x3d_ClipPlane [i] .w < 0.0)
discard;
}
}
uniform mat4 x3d_TextureMatrix [x3d_MaxTextures];
uniform int x3d_NumTextures;
uniform int x3d_TextureType [x3d_MaxTextures]; 
uniform sampler2D x3d_Texture2D [x3d_MaxTextures];
uniform samplerCube x3d_TextureCube [x3d_MaxTextures];
#if defined (X3D_MULTI_TEXTURING)
float rand (vec2 co) { return fract (sin (dot (co.xy, vec2 (12.9898,78.233))) * 43758.5453); }
float rand (vec2 co, float l) { return rand (vec2 (rand (co), l)); }
float rand (vec2 co, float l, float t) { return rand (vec2 (rand (co, l), t)); }
float
perlin (vec2 p, float dim, float time)
{
const float M_PI = 3.14159265358979323846;
vec2 pos = floor (p * dim);
vec2 posx = pos + vec2 (1.0, 0.0);
vec2 posy = pos + vec2 (0.0, 1.0);
vec2 posxy = pos + vec2 (1.0);
float c = rand (pos, dim, time);
float cx = rand (posx, dim, time);
float cy = rand (posy, dim, time);
float cxy = rand (posxy, dim, time);
vec2 d = fract (p * dim);
d = -0.5 * cos (d * M_PI) + 0.5;
float ccx = mix (c, cx, d.x);
float cycxy = mix (cy, cxy, d.x);
float center = mix (ccx, cycxy, d.y);
return center * 2.0 - 1.0;
}
vec3
perlin (vec3 p)
{
return vec3 (perlin (p.xy, 1.0, 0.0),
perlin (p.yz, 1.0, 0.0),
perlin (p.zx, 1.0, 0.0));
}
#if defined (X3D_PROJECTIVE_TEXTURE_MAPPING)
uniform int x3d_NumProjectiveTextures;
uniform sampler2D x3d_ProjectiveTexture [x3d_MaxTextures];
uniform mat4 x3d_ProjectiveTextureMatrix [x3d_MaxTextures];
uniform vec3 x3d_ProjectiveTextureLocation [x3d_MaxTextures];
#endif
uniform vec4 x3d_MultiTextureColor;
uniform x3d_MultiTextureParameters x3d_MultiTexture [x3d_MaxTextures];
uniform x3d_TextureCoordinateGeneratorParameters x3d_TextureCoordinateGenerator [x3d_MaxTextures];
mat4
getTextureMatrix (const in int i)
{
mat4 textureMatrix = mat4 (0.0);
#if x3d_MaxTextures > 0
if (i == 0)
textureMatrix = x3d_TextureMatrix [0];
#endif
#if x3d_MaxTextures > 1
else if (i == 1)
textureMatrix = x3d_TextureMatrix [1];
#endif
return textureMatrix;
}
vec4
getTexCoord (const in int i)
{
vec4 texCoord = vec4 (0.0);
#if x3d_MaxTextures > 0
if (i == 0)
texCoord = texCoord0;
#endif
#if x3d_MaxTextures > 1
else if (i == 1)
texCoord = texCoord1;
#endif
return texCoord;
}
vec4
getTexCoord (const in x3d_TextureCoordinateGeneratorParameters textureCoordinateGenerator, const in int textureTransformMapping, const in int textureCoordinateMapping)
{
int mode = textureCoordinateGenerator .mode;
if (mode == x3d_None)
{
return getTextureMatrix (textureTransformMapping) * getTexCoord (textureCoordinateMapping);
}
else if (mode == x3d_Sphere)
{
vec2 N = normalize (gl_FrontFacing ? normal : -normal) .xy;
return vec4 (N / 2.0 + 0.5, 0.0, 1.0);
}
else if (mode == x3d_CameraSpaceNormal)
{
vec3 N = normalize (gl_FrontFacing ? normal : -normal);
return vec4 (N, 1.0);
}
else if (mode == x3d_CameraSpacePosition)
{
return vec4 (vertex, 1.0);
}
else if (mode == x3d_CameraSpaceReflectionVector)
{
vec3 N = normalize (gl_FrontFacing ? normal : -normal);
return vec4 (reflect (normalize (vertex), -N), 1.0);
}
else if (mode == x3d_SphereLocal)
{
vec2 N = normalize (gl_FrontFacing ? localNormal : -localNormal) .xy;
return vec4 (N / 2.0 + 0.5, 0.0, 1.0);
}
else if (mode == x3d_Coord)
{
return vec4 (localVertex, 1.0);
}
else if (mode == x3d_CoordEye)
{
return vec4 (vertex, 1.0);
}
else if (mode == x3d_Noise)
{
vec3 scale = vec3 (textureCoordinateGenerator .parameter [0], textureCoordinateGenerator .parameter [1], textureCoordinateGenerator .parameter [2]);
vec3 translation = vec3 (textureCoordinateGenerator .parameter [3], textureCoordinateGenerator .parameter [4], textureCoordinateGenerator .parameter [5]);
return vec4 (perlin (localVertex * scale + translation), 1.0);
}
else if (mode == x3d_NoiseEye)
{
vec3 scale = vec3 (textureCoordinateGenerator .parameter [0], textureCoordinateGenerator .parameter [1], textureCoordinateGenerator .parameter [2]);
vec3 translation = vec3 (textureCoordinateGenerator .parameter [3], textureCoordinateGenerator .parameter [4], textureCoordinateGenerator .parameter [5]);
return vec4 (perlin (vertex * scale + translation), 1.0);
}
else if (mode == x3d_SphereReflect)
{
vec3 N = normalize (gl_FrontFacing ? normal : -normal);
float eta = textureCoordinateGenerator .parameter [0];
return vec4 (refract (normalize (vertex), -N, eta), 1.0);
}
else if (mode == x3d_SphereReflectLocal)
{
vec3 N = normalize (gl_FrontFacing ? localNormal : -localNormal);
float eta = textureCoordinateGenerator .parameter [0];
vec3 eye = vec3 (textureCoordinateGenerator .parameter [1], textureCoordinateGenerator .parameter [2], textureCoordinateGenerator .parameter [3]);
return vec4 (refract (normalize (localVertex - eye), -N, eta), 1.0);
}
return getTextureMatrix (textureTransformMapping) * getTexCoord (textureCoordinateMapping);
}
vec3
getTexCoord (const in int textureTransformMapping, const in int textureCoordinateMapping)
{
vec4 texCoord;
#if x3d_MaxTextures > 0
if (textureCoordinateMapping == 0)
texCoord = getTexCoord (x3d_TextureCoordinateGenerator [0], textureTransformMapping, textureCoordinateMapping);
#endif
#if x3d_MaxTextures > 1
else if (textureCoordinateMapping == 1)
texCoord = getTexCoord (x3d_TextureCoordinateGenerator [1], textureTransformMapping, textureCoordinateMapping);
#endif
texCoord .stp /= texCoord .q;
#if defined (X3D_GEOMETRY_2D)
if (gl_FrontFacing == false)
texCoord .s = 1.0 - texCoord .s;
#endif
return texCoord .stp;
}
vec4
getTexture2D (const in int i, const in vec2 texCoord)
{
vec4 color = vec4 (0.0);
#if x3d_MaxTextures > 0
if (i == 0)
color = texture2D (x3d_Texture2D [0], texCoord);
#endif
#if x3d_MaxTextures > 1
else if (i == 1)
color = texture2D (x3d_Texture2D [1], texCoord);
#endif
return color;
}
vec4
getTextureCube (const in int i, const in vec3 texCoord)
{
vec4 color = vec4 (0.0);
#if x3d_MaxTextures > 0
if (i == 0)
color = textureCube (x3d_TextureCube [0], texCoord);
#endif
#if x3d_MaxTextures > 1
else if (i == 1)
color = textureCube (x3d_TextureCube [1], texCoord);
#endif
return color;
}
vec4
getTextureColor (const in vec4 diffuseColor, const in vec4 specularColor)
{
vec4 currentColor = diffuseColor;
for (int i = 0; i < x3d_MaxTextures; ++ i)
{
if (i == x3d_NumTextures)
break;
vec3 texCoord = getTexCoord (i, i);
vec4 textureColor = vec4 (1.0);
if (x3d_TextureType [i] == x3d_TextureType2D)
{
textureColor = getTexture2D (i, texCoord .st);
}
else if (x3d_TextureType [i] == x3d_TextureTypeCube)
{
textureColor = getTextureCube (i, texCoord .stp);
}
x3d_MultiTextureParameters multiTexture = x3d_MultiTexture [i];
vec4 arg1 = textureColor;
vec4 arg2 = currentColor;
int source = multiTexture .source;
if (source == x3d_Diffuse)
{
arg1 = diffuseColor;
}
else if (source == x3d_Specular)
{
arg1 = specularColor;
}
else if (source == x3d_Factor)
{
arg1 = x3d_MultiTextureColor;
}
int function = multiTexture .function;
if (function == x3d_Complement)
{
arg1 = 1.0 - arg1;
}
else if (function == x3d_AlphaReplicate)
{
arg1 .a = arg2 .a;
}
int mode = multiTexture .mode;
int alphaMode = multiTexture .alphaMode;
if (mode == x3d_Replace)
{
currentColor .rgb = arg1 .rgb;
}
else if (mode == x3d_Modulate)
{
currentColor .rgb = arg1 .rgb * arg2 .rgb;
}
else if (mode == x3d_Modulate2X)
{
currentColor .rgb = (arg1 .rgb * arg2 .rgb) * 2.0;
}
else if (mode == x3d_Modulate4X)
{
currentColor .rgb = (arg1 .rgb * arg2 .rgb) * 4.0;
}
else if (mode == x3d_Add)
{
currentColor .rgb = arg1 .rgb + arg2 .rgb;
}
else if (mode == x3d_AddSigned)
{
currentColor .rgb = arg1 .rgb + arg2 .rgb - 0.5;
}
else if (mode == x3d_AddSigned2X)
{
currentColor .rgb = (arg1 .rgb + arg2 .rgb - 0.5) * 2.0;
}
else if (mode == x3d_AddSmooth)
{
currentColor .rgb = arg1 .rgb + (1.0 - arg1 .rgb) * arg2 .rgb;
}
else if (mode == x3d_Subtract)
{
currentColor .rgb = arg1 .rgb - arg2 .rgb;
}
else if (mode == x3d_BlendDiffuseAlpha)
{
currentColor .rgb = arg1 .rgb * diffuseColor .a + arg2 .rgb * (1.0 - diffuseColor .a);
}
else if (mode == x3d_BlendTextureAlpha)
{
currentColor .rgb = arg1 .rgb * arg1 .a + arg2 .rgb * (1.0 - arg1 .a);
}
else if (mode == x3d_BlendFactorAlpha)
{
currentColor .rgb = arg1 .rgb * x3d_MultiTextureColor .a + arg2 .rgb * (1.0 - x3d_MultiTextureColor .a);
}
else if (mode == x3d_BlendCurrentAlpha)
{
currentColor .rgb = arg1 .rgb * arg2 .a + arg2 .rgb * (1.0 - arg2 .a);
}
else if (mode == x3d_ModulateAlphaAddColor)
{
currentColor .rgb = arg1 .rgb + arg1 .a * arg2 .rgb;
}
else if (mode == x3d_ModulateInvAlphaAddColor)
{
currentColor .rgb = (1.0 - arg1 .a) * arg2 .rgb + arg1 .rgb;
}
else if (mode == x3d_ModulateInvColorAddAlpha)
{
currentColor .rgb = (1.0 - arg1 .rgb) * arg2 .rgb + arg1 .a;
}
else if (mode == x3d_DotProduct3)
{
currentColor .rgb = vec3 (dot (arg1 .rgb * 2.0 - 1.0, arg2 .rgb * 2.0 - 1.0));
}
else if (mode == x3d_SelectArg1)
{
currentColor .rgb = arg1 .rgb;
}
else if (mode == x3d_SelectArg2)
{
currentColor .rgb = arg2 .rgb;
}
else if (mode == x3d_Off)
;
if (alphaMode == x3d_Replace)
{
currentColor .a = arg1 .a;
}
else if (alphaMode == x3d_Modulate)
{
currentColor .a = arg1 .a * arg2 .a;
}
else if (alphaMode == x3d_Modulate2X)
{
currentColor .a = (arg1 .a * arg2 .a) * 2.0;
}
else if (alphaMode == x3d_Modulate4X)
{
currentColor .a = (arg1 .a * arg2 .a) * 4.0;
}
else if (alphaMode == x3d_Add)
{
currentColor .a = arg1 .a + arg2 .a;
}
else if (alphaMode == x3d_AddSigned)
{
currentColor .a = arg1 .a + arg2 .a - 0.5;
}
else if (alphaMode == x3d_AddSigned2X)
{
currentColor .a = (arg1 .a + arg2 .a - 0.5) * 2.0;
}
else if (alphaMode == x3d_AddSmooth)
{
currentColor .a = arg1 .a + (1.0 - arg1 .a) * arg2 .a;
}
else if (alphaMode == x3d_Subtract)
{
currentColor .a = arg1 .a - arg2 .a;
}
else if (alphaMode == x3d_BlendDiffuseAlpha)
{
currentColor .a = arg1 .a * diffuseColor .a + arg2 .a * (1.0 - diffuseColor .a);
}
else if (alphaMode == x3d_BlendTextureAlpha)
{
currentColor .a = arg1 .a * arg1 .a + arg2 .a * (1.0 - arg1 .a);
}
else if (alphaMode == x3d_BlendFactorAlpha)
{
currentColor .a = arg1 .a * x3d_MultiTextureColor .a + arg2 .a * (1.0 - x3d_MultiTextureColor .a);
}
else if (alphaMode == x3d_BlendCurrentAlpha)
{
currentColor .a = arg1 .a * arg2 .a + arg2 .a * (1.0 - arg2 .a);
}
else if (alphaMode == x3d_ModulateAlphaAddColor)
{
currentColor .a = arg1 .a + arg1 .a * arg2 .a;
}
else if (alphaMode == x3d_ModulateInvAlphaAddColor)
{
currentColor .a = (1.0 - arg1 .a) * arg2 .a + arg1 .a;
}
else if (alphaMode == x3d_ModulateInvColorAddAlpha)
{
currentColor .a = (1.0 - arg1 .a) * arg2 .a + arg1 .a;
}
else if (alphaMode == x3d_DotProduct3)
{
currentColor .a = dot (arg1 .rgb * 2.0 - 1.0, arg2 .rgb * 2.0 - 1.0);
}
else if (alphaMode == x3d_SelectArg1)
{
currentColor .a = arg1 .a;
}
else if (alphaMode == x3d_SelectArg2)
{
currentColor .a = arg2 .a;
}
else if (alphaMode == x3d_Off)
;
}
return currentColor;
}
#if defined (X3D_PROJECTIVE_TEXTURE_MAPPING)
vec4
getProjectiveTexture (const in int i, const in vec2 texCoord)
{
vec4 color = vec4 (0.0);
#if x3d_MaxTextures > 0
if (i == 0)
color = texture2D (x3d_ProjectiveTexture [0], texCoord);
#endif
#if x3d_MaxTextures > 1
else if (i == 1)
color = texture2D (x3d_ProjectiveTexture [1], texCoord);
#endif
return color;
}
vec4
getProjectiveTextureColor (in vec4 currentColor)
{
if (x3d_NumProjectiveTextures > 0)
{
vec3 N = gl_FrontFacing ? normal : -normal;
for (int i = 0; i < x3d_MaxTextures; ++ i)
{
if (i == x3d_NumProjectiveTextures)
break;
vec4 texCoord = x3d_ProjectiveTextureMatrix [i] * vec4 (vertex, 1.0);
texCoord .stp /= texCoord .q;
if (texCoord .s < 0.0 || texCoord .s > 1.0)
continue;
if (texCoord .t < 0.0 || texCoord .t > 1.0)
continue;
if (texCoord .p < 0.0 || texCoord .p > 1.0)
continue;
vec3 p = x3d_ProjectiveTextureLocation [i] - vertex;
if (dot (N, p) < 0.0)
continue;
currentColor *= getProjectiveTexture (i, texCoord .st);
}
}
return currentColor;
}
#else 
vec4
getProjectiveTextureColor (in vec4 currentColor)
{
return currentColor;
}
#endif 
#else 
vec4
getTexCoord (const in int textureTransformMapping, const in int textureCoordinateMapping)
{
return texCoord0;
}
vec4
getTextureColor (const in vec4 diffuseColor, const in vec4 specularColor)
{
vec4 texCoord = texCoord0;
vec4 textureColor = vec4 (1.0);
texCoord .stp /= texCoord .q;
#if defined (X3D_GEOMETRY_2D)
if (gl_FrontFacing == false)
texCoord .s = 1.0 - texCoord .s;
#endif
if (x3d_TextureType [0] == x3d_TextureType2D)
{
textureColor = texture2D (x3d_Texture2D [0], texCoord .st);
}
else if (x3d_TextureType [0] == x3d_TextureTypeCube)
{
textureColor = textureCube (x3d_TextureCube [0], texCoord .stp);
}
return diffuseColor * textureColor;
}
vec4
getProjectiveTextureColor (in vec4 currentColor)
{
return currentColor;
}
#endif 
vec4
getMaterialColor ();
vec4
getFinalColor ()
{
#if defined (X3D_STYLE_PROPERTIES) && defined (X3D_GEOMETRY_0D)
setTexCoords ();
#if ! defined (X3D_MATERIAL_TEXTURES)
if (x3d_NumTextures == 0)
return getPointColor (getMaterialColor ());
#endif
#endif
return getMaterialColor ();
}
void
fragment_main ()
{
clip ();
vec4 finalColor = getFinalColor ();
#if defined (X3D_STYLE_PROPERTIES) && (defined (X3D_GEOMETRY_2D) || defined (X3D_GEOMETRY_3D))
finalColor = getHatchColor (finalColor);
#endif
#if defined (X3D_FOG)
finalColor .rgb = getFogColor (finalColor .rgb);
#endif
if (finalColor .a < x3d_AlphaCutoff)
discard;
gl_FragColor = finalColor;
#if defined (X3D_LOGARITHMIC_DEPTH_BUFFER)
if (x3d_LogarithmicFarFactor1_2 > 0.0)
gl_FragDepth = log2 (depth) * x3d_LogarithmicFarFactor1_2;
else
gl_FragDepth = gl_FragCoord .z;
#endif
}
uniform x3d_UnlitMaterialParameters x3d_Material;
#if defined (X3D_EMISSIVE_TEXTURE)
uniform x3d_EmissiveTextureParameters x3d_EmissiveTexture;
#endif
vec4
getEmissiveColor ()
{
float alpha = 1.0 - x3d_Material .transparency;
#if defined (X3D_COLOR_MATERIAL)
vec4 emissiveParameter = vec4 (color .rgb, color .a * alpha);
#else
vec4 emissiveParameter = vec4 (x3d_Material .emissiveColor, alpha);
#endif
#if defined (X3D_EMISSIVE_TEXTURE)
vec3 texCoord = getTexCoord (x3d_EmissiveTexture .textureTransformMapping, x3d_EmissiveTexture .textureCoordinateMapping);
#if defined (X3D_EMISSIVE_TEXTURE_2D)
return emissiveParameter * texture2D (x3d_EmissiveTexture .texture2D, texCoord .st);
#elif defined (X3D_EMISSIVE_TEXTURE_CUBE)
return emissiveParameter * textureCube (x3d_EmissiveTexture .textureCube, texCoord);
#endif
#else
return getTextureColor (emissiveParameter, vec4 (vec3 (1.0), alpha));
#endif
}
vec4
getMaterialColor ()
{
return getEmissiveColor ();
}
void
main ()
{
fragment_main ();
}
