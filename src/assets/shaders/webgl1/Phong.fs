
#ifdef X3D_LOGARITHMIC_DEPTH_BUFFER
#extension GL_EXT_frag_depth : enable
#endif

precision highp float;
precision highp int;

uniform int   x3d_GeometryType;
uniform bool  x3d_ColorMaterial; // true if a X3DColorNode is attached, otherwise false
uniform float x3d_AlphaCutoff;

uniform int x3d_NumLights;
uniform x3d_LightSourceParameters x3d_LightSource [x3d_MaxLights];
uniform bool x3d_SeparateBackColor;
uniform x3d_MaterialParameters x3d_Material;

varying float fogDepth;    // fog depth
varying vec4  color;       // color
varying vec3  normal;      // normal vector at this point on geometry
varying vec3  vertex;      // point on geometry
varying vec3  localNormal; // normal vector at this point on geometry in local coordinates
varying vec3  localVertex; // point on geometry in local coordinates

#if x3d_MaxTextures > 0
varying vec4 texCoord0; // texCoord0
#endif

#if x3d_MaxTextures > 1
varying vec4 texCoord1; // texCoord1
#endif

#ifdef X3D_LOGARITHMIC_DEPTH_BUFFER
uniform float x3d_LogarithmicFarFactor1_2;
varying float depth;
#endif

#pragma X3D include "include/Shadow.glsl"
#pragma X3D include "include/Texture.glsl"
#pragma X3D include "include/Hatch.glsl"
#pragma X3D include "include/Fog.glsl"
#pragma X3D include "include/ClipPlanes.glsl"

float
getSpotFactor (const in float cutOffAngle, const in float beamWidth, const in vec3 L, const in vec3 d)
{
	float spotAngle = acos (clamp (dot (-L, d), -1.0, 1.0));

	if (spotAngle >= cutOffAngle)
		return 0.0;
	else if (spotAngle <= beamWidth)
		return 1.0;

	return (spotAngle - cutOffAngle) / (beamWidth - cutOffAngle);
}

vec4
getMaterialColor ()
{
	vec3  N  = normalize (gl_FrontFacing ? normal : -normal);
	vec3  V  = normalize (-vertex); // normalized vector from point on geometry to viewer's position
	float dV = length (vertex);

	// Calculate diffuseFactor & alpha

	vec3  diffuseFactor = vec3 (1.0);
	float alpha         = 1.0 - x3d_Material .transparency;

	// Texture

	vec4 D = x3d_ColorMaterial ? vec4 (color .rgb, color .a * alpha) : vec4 (x3d_Material .diffuseColor, alpha);
	vec4 T = getTextureColor (D, vec4 (x3d_Material .specularColor, alpha));

	diffuseFactor = T .rgb;
	alpha         = T .a;

	// Projective texture

	vec4 P = getProjectiveTextureColor (vec4 (1.0));

	diffuseFactor *= P .rgb;
	alpha         *= P .a;

	// Ambient intensity

	vec3 ambientTerm = diffuseFactor * x3d_Material .ambientIntensity;

	// Apply light sources

	vec3 finalColor = vec3 (0.0);

	for (int i = 0; i < x3d_MaxLights; i ++)
	{
		if (i == x3d_NumLights)
			break;

		x3d_LightSourceParameters light = x3d_LightSource [i];

		vec3  vL = light .location - vertex; // Light to fragment
		float dL = length (light .matrix * vL);
		bool  di = light .type == x3d_DirectionalLight;

		if (di || dL <= light .radius)
		{
			vec3 d = light .direction;
			vec3 c = light .attenuation;
			vec3 L = di ? -d : normalize (vL);      // Normalized vector from point on geometry to light source i position.
			vec3 H = normalize (L + V);             // Specular term

			float lightAngle     = max (dot (N, L), 0.0);      // Angle between normal and light ray.
			vec3  diffuseTerm    = diffuseFactor * lightAngle;
			float specularFactor = x3d_Material .shininess > 0.0 ? pow (max (dot (N, H), 0.0), x3d_Material .shininess * 128.0) : 1.0;
			vec3  specularTerm   = x3d_Material .specularColor * specularFactor;

			float attenuationFactor     = di ? 1.0 : 1.0 / max (c [0] + c [1] * dL + c [2] * (dL * dL), 1.0);
			float spotFactor            = light .type == x3d_SpotLight ? getSpotFactor (light .cutOffAngle, light .beamWidth, L, d) : 1.0;
			float attenuationSpotFactor = attenuationFactor * spotFactor;
			vec3  ambientColor          = light .ambientIntensity * ambientTerm;
			vec3  diffuseSpecularColor  = light .intensity * (diffuseTerm + specularTerm);

			#ifdef X3D_SHADOWS
				if (lightAngle > 0.0)
					diffuseSpecularColor = mix (diffuseSpecularColor, light .shadowColor, getShadowIntensity (i, light));
			#endif

			finalColor += attenuationSpotFactor * light .color * (ambientColor + diffuseSpecularColor);
		}
	}

	finalColor += x3d_Material .emissiveColor;

	return vec4 (finalColor, alpha);
}

// DEBUG
//uniform ivec4 x3d_Viewport;

void
main ()
{
	clip ();

	vec4 finalColor = vec4 (0.0);

	finalColor      = getMaterialColor ();
	finalColor      = getHatchColor (finalColor);
	finalColor .rgb = getFogColor (finalColor .rgb);

   if (finalColor .a < x3d_AlphaCutoff)
   {
      discard;
   }

	gl_FragColor = finalColor;

	#ifdef X3D_LOGARITHMIC_DEPTH_BUFFER
	//http://outerra.blogspot.com/2013/07/logarithmic-depth-buffer-optimizations.html
	if (x3d_LogarithmicFarFactor1_2 > 0.0)
		gl_FragDepthEXT = log2 (depth) * x3d_LogarithmicFarFactor1_2;
	else
		gl_FragDepthEXT = gl_FragCoord .z;
	#endif

	// DEBUG
	#ifdef X3D_SHADOWS
	//gl_FragColor .rgb = texture2D (x3d_ShadowMap [0], gl_FragCoord .xy / vec2 (x3d_Viewport .zw)) .rgb;
	//gl_FragColor .rgb = mix (tex .rgb, gl_FragColor .rgb, 0.5);
	#endif

	#ifdef X3D_LOGARITHMIC_DEPTH_BUFFER
	//gl_FragColor .rgb = mix (vec3 (1.0, 0.0, 0.0), gl_FragColor .rgb, 0.5);
	#endif
}
