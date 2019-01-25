var X_ITE_EXAMPLES = [
	{ component: "CADGeometry", test: "QuadSet" },
	{ component: "CubeMapTexturing", test: "ComposedCubeMapTexture" },
	{ component: "EnvironmentalEffects", test: "Background" },
	{ component: "EnvironmentalEffects", test: "Fog" },
	{ component: "EnvironmentalEffects", test: "LocalFog" },
	{ component: "EnvironmentalEffects", test: "TextureBackground" },
	{ component: "EnvironmentalSensor", test: "ProximitySensor" },
	{ component: "EnvironmentalSensor", test: "TransformSensor" },
	{ component: "EnvironmentalSensor", test: "VisibilitySensor" },
	{ component: "EventUtilities", test: "IntegerSequencer" },
	{ component: "Followers", test: "ColorChaser" },
	{ component: "Followers", test: "ColorDamper" },
	{ component: "Followers", test: "ScalarChaser" },
	{ component: "Geometry2D", test: "Arc2D" },
	{ component: "Geometry2D", test: "ArcClose2D" },
	{ component: "Geometry2D", test: "Circle2D" },
	{ component: "Geometry2D", test: "Disk2D" },
	{ component: "Geometry2D", test: "Polyline2D" },
	{ component: "Geometry2D", test: "Polypoint2D" },
	{ component: "Geometry2D", test: "Rectangle2D" },
	{ component: "Geometry2D", test: "TriangleSet2D" },
	{ component: "Geometry3D", test: "Box" },
	{ component: "Geometry3D", test: "Cone" },
	{ component: "Geometry3D", test: "Cylinder" },
	{ component: "Geometry3D", test: "ElevationGrid" },
	{ component: "Geometry3D", test: "Extrusion" },
	{ component: "Geometry3D", test: "IndexedFaceSet" },
	{ component: "Geometry3D", test: "Sphere" },
	{ component: "Geospatial", test: "GeoElevationGrid" },
	{ component: "Geospatial", test: "GeoViewpoint" },
	{ component: "Grouping", test: "Group" },
	{ component: "Grouping", test: "Switch" },
	{ component: "Grouping", test: "Transform" },
	{ component: "H-Anim", test: "HAnimHumanoid" },
	{ component: "Interpolation", test: "ColorInterpolator" },
	{ component: "Interpolation", test: "CoordinateInterpolator" },
	{ component: "Interpolation", test: "OrientationInterpolator" },
	{ component: "Interpolation", test: "PositionInterpolator" },
	{ component: "Interpolation", test: "PositionInterpolator2D" },
	{ component: "Interpolation", test: "ScalarInterpolator" },
	{ component: "Interpolation", test: "SplineScalarInterpolator" },
	{ component: "Interpolation", test: "SquadOrientationInterpolator" },
	{ component: "KeyDeviceSensor", test: "KeySensor" },
	{ component: "KeyDeviceSensor", test: "StringSensor" },
	{ component: "Layering", test: "LayerSet" },
	{ component: "Layering", test: "Viewport" },
	{ component: "Lighting", test: "DirectionalLight" },
	{ component: "Lighting", test: "PointLight" },
	{ component: "Lighting", test: "Shadows" },
	{ component: "Lighting", test: "SpotLight" },
	{ component: "NURBS", test: "NurbsCurve" },
	{ component: "NURBS", test: "NurbsPatchSurface" },
	{ component: "NURBS", test: "NurbsSweptSurface" },
	{ component: "Navigation", test: "Billboard" },
	{ component: "Navigation", test: "Collision" },
	{ component: "Navigation", test: "LogarithmicDepthBuffer" },
	{ component: "Navigation", test: "NavigationInfo" },
	{ component: "Navigation", test: "OrthoViewpoint" },
	{ component: "Navigation", test: "Viewpoint" },
	{ component: "Networking", test: "Anchor" },
	{ component: "Networking", test: "Inline" },
	{ component: "Networking", test: "LoadSensor" },
	{ component: "ParticleSystems", test: "ConeEmitter" },
	{ component: "ParticleSystems", test: "ExplosionEmitter" },
	{ component: "ParticleSystems", test: "ForcePhysicsModel" },
	{ component: "ParticleSystems", test: "ParticleSystem" },
	{ component: "ParticleSystems", test: "PointEmitter" },
	{ component: "ParticleSystems", test: "PolylineEmitter" },
	{ component: "ParticleSystems", test: "SurfaceEmitter" },
	{ component: "ParticleSystems", test: "VolumeEmitter" },
	{ component: "ParticleSystems", test: "WindPhysicsModel" },
	{ component: "PointingDeviceSensor", test: "CylinderSensor" },
	{ component: "PointingDeviceSensor", test: "PlaneSensor" },
	{ component: "Rendering", test: "ClipPlane" },
	{ component: "Rendering", test: "Color" },
	{ component: "Rendering", test: "ColorRGBA" },
	{ component: "Rendering", test: "Coordinate" },
	{ component: "Rendering", test: "IndexedLineSet" },
	{ component: "Rendering", test: "IndexedTriangleFanSet" },
	{ component: "Rendering", test: "IndexedTriangleSet" },
	{ component: "Rendering", test: "LineSet" },
	{ component: "Rendering", test: "PointSet" },
	{ component: "RigidBodyPhysics", test: "BallJoint" },
	{ component: "RigidBodyPhysics", test: "CollidableShape" },
	{ component: "RigidBodyPhysics", test: "CollisionCollection" },
	{ component: "RigidBodyPhysics", test: "RigidBody" },
	{ component: "RigidBodyPhysics", test: "RigidBodyCollection" },
	{ component: "RigidBodyPhysics", test: "SingleAxisHingeJoint" },
	{ component: "RigidBodyPhysics", test: "SliderJoint" },
	{ component: "Shaders", test: "ComposedShader" },
	{ component: "Shaders", test: "FloatVertexAttribute" },
	{ component: "Shaders", test: "ShaderPart" },
	{ component: "Shape", test: "Appearance" },
	{ component: "Shape", test: "Material" },
	{ component: "Shape", test: "TwoSidedMaterial" },
	{ component: "Sound", test: "AudioClip" },
	{ component: "Text", test: "FontStyle" },
	{ component: "Text", test: "Text" },
	{ component: "Texturing", test: "ImageTexture" },
	{ component: "Texturing", test: "MovieTexture" },
	{ component: "Texturing", test: "PixelTexture" },
	{ component: "Time", test: "TimeSensor" },
	{ component: "X3D", test: "Appartment" },
	{ component: "X3D", test: "Approach" },
	{ component: "X3D", test: "Arcadia" },
	{ component: "X3D", test: "Astronomy" },
	{ component: "X3D", test: "BIC" },
	{ component: "X3D", test: "BeyondGermany" },
	{ component: "X3D", test: "Chomp" },
	{ component: "X3D", test: "Circles" },
	{ component: "X3D", test: "CrazySpiral" },
	{ component: "X3D", test: "Currencies" },
	{ component: "X3D", test: "FlashingLights" },
	{ component: "X3D", test: "FoldUp" },
	{ component: "X3D", test: "LogoPieces" },
	{ component: "X3D", test: "LustForLife" },
	{ component: "X3D", test: "MagicMushrooms" },
	{ component: "X3D", test: "MilkywayAndBeyond" },
	{ component: "X3D", test: "Pong" },
	{ component: "X3D", test: "SecretLabyrinth" },
	{ component: "X3D", test: "SlidingPuzzle" },
	{ component: "X3D", test: "SmartyBubbles" },
	{ component: "X3D", test: "SmashingBoxes" },
	{ component: "X3D", test: "SugarSmack" },
	{ component: "X3D", test: "TikiWorld" },
	{ component: "X3D", test: "TreasureIsland" },
	{ component: "X3D", test: "Vattenfall" },
	{ component: "X3D", test: "WaterQuality" },
	{ component: "X_ITE", test: "BlendMode" },
];
X_ITE_EXAMPLES .server = "http://media.create3000.de/components";
