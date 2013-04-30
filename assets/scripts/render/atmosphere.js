
var render_atmosphere_vertex_sky=
"//\n\
// Atmospheric scattering vertex shader\n\
//\n\
// Author: Sean O'Neil\n\
//\n\
// Copyright (c) 2004 Sean O'Neil\n\
//\n\
\n\
uniform vec3 v3LightPosition;// The direction vector to the light source\n\
uniform vec3 v3InvWavelength;// 1 / pow(wavelength, 4) for the red, green, and blue channels\n\
uniform float fCameraHeight;// The camera's current height\n\
uniform float fCameraHeight2;// fCameraHeight^2\n\
uniform float fOuterRadius;// The outer (atmosphere) radius\n\
uniform float fOuterRadius2;// fOuterRadius^2\n\
uniform float fInnerRadius;// The inner (planetary) radius\n\
uniform float fInnerRadius2;// fInnerRadius^2\n\
uniform float fKrESun;// Kr * ESun\n\
uniform float fKmESun;// Km * ESun\n\
uniform float fKr4PI;// Kr * 4 * PI\n\
uniform float fKm4PI;// Km * 4 * PI\n\
uniform float fScale;// 1 / (fOuterRadius - fInnerRadius)\n\
uniform float fScaleDepth;// The scale depth (i.e. the altitude at which the atmosphere's average density is found)\n\
uniform float fScaleOverScaleDepth;// fScale / fScaleDepth\n\
\n\
const int nSamples = 3;\n\
const float fSamples = 3.0;\n\
\n\
varying vec3 v3Direction;\n\
varying vec3 c0;\n\
varying vec3 c1;\n\
\n\
\n\
float scale(float fCos)\n\
{\n\
float x = 1.0 - fCos;\n\
return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));\n\
}\n\
\n\
void main(void)\n\
{\n\
// Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)\n\
vec3 v3Ray = position - cameraPosition;\n\
float fFar = length(v3Ray);\n\
v3Ray /= fFar;\n\
\n\
// Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)\n\
float B = 2.0 * dot(cameraPosition, v3Ray);\n\
float C = fCameraHeight2 - fOuterRadius2;\n\
float fDet = max(0.0, B*B - 4.0 * C);\n\
float fNear = 0.5 * (-B - sqrt(fDet));\n\
\n\
// Calculate the ray's starting position, then calculate its scattering offset\n\
vec3 v3Start = cameraPosition + v3Ray * fNear;\n\
fFar -= fNear;\n\
float fStartAngle = dot(v3Ray, v3Start) / fOuterRadius;\n\
float fStartDepth = exp(-1.0 / fScaleDepth);\n\
float fStartOffset = fStartDepth * scale(fStartAngle);\n\
//c0 = vec3(1.0, 0, 0) * fStartAngle;\n\
\n\
// Initialize the scattering loop variables\n\
float fSampleLength = fFar / fSamples;\n\
float fScaledLength = fSampleLength * fScale;\n\
vec3 v3SampleRay = v3Ray * fSampleLength;\n\
vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;\n\
\n\
//gl_FrontColor = vec4(0.0, 0.0, 0.0, 0.0);\n\
\n\
// Now loop through the sample rays\n\
vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);\n\
for(int i=0; i<nSamples; i++)\n\
{\n\
float fHeight = length(v3SamplePoint);\n\
float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));\n\
float fLightAngle = dot(v3LightPosition, v3SamplePoint) / fHeight;\n\
float fCameraAngle = dot(v3Ray, v3SamplePoint) / fHeight;\n\
float fScatter = (fStartOffset + fDepth * (scale(fLightAngle) - scale(fCameraAngle)));\n\
vec3 v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));\n\
\n\
v3FrontColor += v3Attenuate * (fDepth * fScaledLength);\n\
v3SamplePoint += v3SampleRay;\n\
}\n\
\n\
// Finally, scale the Mie and Rayleigh colors and set up the varying variables for the pixel shader\n\
gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
c0 = v3FrontColor * (v3InvWavelength * fKrESun);\n\
c1 = v3FrontColor * fKmESun;\n\
v3Direction = cameraPosition - position;\n\
}\n\
"

var render_atmosphere_fragment_sky=
"//\n\
// Atmospheric scattering fragment shader\n\
//\n\
// Author: Sean O'Neil\n\
//\n\
// Copyright (c) 2004 Sean O'Neil\n\
//\n\
\n\
uniform vec3 v3LightPos;\n\
uniform float g;\n\
uniform float g2;\n\
\n\
varying vec3 v3Direction;\n\
varying vec3 c0;\n\
varying vec3 c1;\n\
\n\
// Calculates the Mie phase function\n\
float getMiePhase(float fCos, float fCos2, float g, float g2)\n\
{\n\
return 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + fCos2) / pow(1.0 + g2 - 2.0 * g * fCos, 1.5);\n\
}\n\
\n\
// Calculates the Rayleigh phase function\n\
float getRayleighPhase(float fCos2)\n\
{\n\
return 0.75 + 0.75 * fCos2;\n\
}\n\
\n\
void main (void)\n\
{\n\
float fCos = dot(v3LightPos, v3Direction) / length(v3Direction);\n\
float fCos2 = fCos * fCos;\n\
\n\
vec3 color =getRayleighPhase(fCos2) * c0 +\n\
getMiePhase(fCos, fCos2, g, g2) * c1;\n\
\n\
gl_FragColor = vec4(color, 1.0);\n\
gl_FragColor.a = gl_FragColor.b;\n\
}\n\
"

var render_atmosphere_vertex_ground=
"//\n\
// Atmospheric scattering vertex shader\n\
//\n\
// Author: Sean O'Neil\n\
//\n\
// Copyright (c) 2004 Sean O'Neil\n\
//\n\
// Ported for use with three.js/WebGL by James Baicoianu\n\
\n\
uniform vec3 v3LightPosition;// The direction vector to the light source\n\
uniform vec3 v3InvWavelength;// 1 / pow(wavelength, 4) for the red, green, and blue channels\n\
uniform float fCameraHeight;// The camera's current height\n\
uniform float fCameraHeight2;// fCameraHeight^2\n\
uniform float fOuterRadius;// The outer (atmosphere) radius\n\
uniform float fOuterRadius2;// fOuterRadius^2\n\
uniform float fInnerRadius;// The inner (planetary) radius\n\
uniform float fInnerRadius2;// fInnerRadius^2\n\
uniform float fKrESun;// Kr * ESun\n\
uniform float fKmESun;// Km * ESun\n\
uniform float fKr4PI;// Kr * 4 * PI\n\
uniform float fKm4PI;// Km * 4 * PI\n\
uniform float fScale;// 1 / (fOuterRadius - fInnerRadius)\n\
uniform float fScaleDepth;// The scale depth (i.e. the altitude at which the atmosphere's average density is found)\n\
uniform float fScaleOverScaleDepth;// fScale / fScaleDepth\n\
uniform sampler2D tDiffuse;\n\
\n\
varying vec3 v3Direction;\n\
varying vec3 c0;\n\
varying vec3 c1;\n\
varying vec3 vNormal;\n\
varying vec2 vUv;\n\
\n\
const int nSamples = 3;\n\
const float fSamples = 3.0;\n\
\n\
float scale(float fCos)\n\
{\n\
float x = 1.0 - fCos;\n\
return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));\n\
}\n\
\n\
void main(void)\n\
{\n\
// Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)\n\
vec3 v3Ray = position - cameraPosition;\n\
float fFar = length(v3Ray);\n\
v3Ray /= fFar;\n\
\n\
// Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)\n\
float B = 2.0 * dot(cameraPosition, v3Ray);\n\
float C = fCameraHeight2 - fOuterRadius2;\n\
float fDet = max(0.0, B*B - 4.0 * C);\n\
float fNear = 0.5 * (-B - sqrt(fDet));\n\
\n\
// Calculate the ray's starting position, then calculate its scattering offset\n\
vec3 v3Start = cameraPosition + v3Ray * fNear;\n\
fFar -= fNear;\n\
float fDepth = exp((fInnerRadius - fOuterRadius) / fScaleDepth);\n\
float fCameraAngle = dot(-v3Ray, position) / length(position);\n\
float fLightAngle = dot(v3LightPosition, position) / length(position);\n\
float fCameraScale = scale(fCameraAngle);\n\
float fLightScale = scale(fLightAngle);\n\
float fCameraOffset = fDepth*fCameraScale;\n\
float fTemp = (fLightScale + fCameraScale);\n\
\n\
// Initialize the scattering loop variables\n\
float fSampleLength = fFar / fSamples;\n\
float fScaledLength = fSampleLength * fScale;\n\
vec3 v3SampleRay = v3Ray * fSampleLength;\n\
vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;\n\
\n\
// Now loop through the sample rays\n\
vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);\n\
vec3 v3Attenuate;\n\
for(int i=0; i<nSamples; i++)\n\
{\n\
float fHeight = length(v3SamplePoint);\n\
float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));\n\
float fScatter = fDepth*fTemp - fCameraOffset;\n\
v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));\n\
v3FrontColor += v3Attenuate * (fDepth * fScaledLength);\n\
v3SamplePoint += v3SampleRay;\n\
}\n\
\n\
// Calculate the attenuation factor for the ground\n\
c0 = v3Attenuate;\n\
c1 = v3FrontColor * (v3InvWavelength * fKrESun + fKmESun);\n\
\n\
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
//gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;\n\
//gl_TexCoord[1] = gl_TextureMatrix[1] * gl_MultiTexCoord1;\n\
  vUv = uv;\n\
  vNormal = normal;\n\
}\n\
"

var render_atmosphere_fragment_ground=
"//\n\
// Atmospheric scattering fragment shader\n\
//\n\
// Author: Sean O'Neil\n\
//\n\
// Copyright (c) 2004 Sean O'Neil\n\
//\n\
// Ported for use with three.js/WebGL by James Baicoianu\n\
\n\
//uniform sampler2D s2Tex1;\n\
//uniform sampler2D s2Tex2;\n\
\n\
uniform float fNightScale;\n\
uniform vec3 v3LightPosition;\n\
uniform sampler2D tDiffuse;\n\
uniform sampler2D tDiffuseNight;\n\
\n\
varying vec3 c0;\n\
varying vec3 c1;\n\
varying vec3 vNormal;\n\
varying vec2 vUv;\n\
\n\
void main (void)\n\
{\n\
//gl_FragColor = vec4(c0, 1.0);\n\
//gl_FragColor = vec4(0.25 * c0, 1.0);\n\
//gl_FragColor = gl_Color + texture2D(s2Tex1, gl_TexCoord[0].st) * texture2D(s2Tex2, gl_TexCoord[1].st) * gl_SecondaryColor;\n\
\n\
\n\
vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;\n\
vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;\n\
\n\
vec3 day = diffuseTex * c0;\n\
vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);\n\
\n\
gl_FragColor = vec4(c1, 1.0) + vec4(day + night, 1.0);\n\
\n\
}\n\
"
