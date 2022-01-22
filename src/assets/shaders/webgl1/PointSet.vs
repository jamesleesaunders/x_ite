
precision highp float;
precision highp int;

uniform x3d_PointPropertiesParameters x3d_PointProperties;

uniform bool  x3d_ColorMaterial;   // true if a X3DColorNode is attached, otherwise false
uniform x3d_MaterialParameters x3d_Material;
uniform int x3d_NumTextures;

uniform mat4 x3d_ProjectionMatrix;
uniform mat4 x3d_ModelViewMatrix;

attribute float x3d_FogDepth;
attribute vec4  x3d_Color;
attribute vec4  x3d_Vertex;

varying float pointSize; // point size
varying float fogDepth;  // fog depth
varying vec4  color;     // color
varying vec3  vertex;    // point on geometry

#ifdef X3D_LOGARITHMIC_DEPTH_BUFFER
varying float depth;
#endif

void
main ()
{
	// Determine varyings.

	vec4 position = x3d_ModelViewMatrix * x3d_Vertex;

	fogDepth = x3d_FogDepth;
	vertex   = position .xyz;

	gl_Position = x3d_ProjectionMatrix * position;

	#ifdef X3D_LOGARITHMIC_DEPTH_BUFFER
	depth = 1.0 + gl_Position .w;
	#endif

	// Determine point size.

	float pointSizeMinValue    = x3d_PointProperties .pointSizeMinValue;
	float pointSizeMaxValue    = x3d_PointProperties .pointSizeMaxValue;
	vec3  pointSizeAttenuation = x3d_PointProperties .pointSizeAttenuation;
	float dL                   = length (vertex);

	pointSize  = x3d_PointProperties .pointSizeScaleFactor;
	pointSize *= 1.0 / (pointSizeAttenuation [0] + pointSizeAttenuation [1] * dL + pointSizeAttenuation [2] * (dL * dL));
	pointSize  = clamp (pointSize, pointSizeMinValue, pointSizeMaxValue);

	gl_PointSize = pointSize + (x3d_NumTextures > 0 ? 0.0 : 1.0);

	// Determine color.

	float alpha = 1.0 - x3d_Material .transparency;

	if (x3d_ColorMaterial)
	{
		color .rgb = x3d_Color .rgb;
		color .a   = x3d_Color .a * alpha;
	}
	else
	{
		color .rgb = x3d_Material .emissiveColor;
		color .a   = alpha;
	}
}
