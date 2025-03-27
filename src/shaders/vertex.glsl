varying vec2 vUv;
uniform float uScrollY;
attribute vec3 aPosition;
uniform float uMaxY;
uniform float uSpeedY;
attribute vec4 aTextureCoords;
attribute float aIndex;

varying vec4 vTextureCoords;
varying float vIndex;

mat3 getYrotationMatrix(float angle)
{
    return mat3(
        cos(angle), 0.0, sin(angle),
        0.0, 1.0, 0.0,
        -sin(angle), 0.0, cos(angle)
    );
}

float getXwave(float x)
{
    return sin(x*2.) * 0.4;
}

void main()
{     
    
    float PI = 3.14159265359;

    float maxWave = 0.5;
    //float scale = 1. - abs(uSpeedY)*0.1;
    float scale = 1.;

    vec3 rotatedPosition = getYrotationMatrix(PI/2.)*position;
    
    // Calculate xProgress without the wave first
    float baseProgress = aPosition.x + uScrollY;
    // Add wave after modulo to prevent wrapping issues
    float xPoz = mod(baseProgress, uMaxY) - uMaxY/2.0 + getXwave(uv.y)*clamp(uSpeedY*2.,-2.,1.3);

    vec3 newPosition = rotatedPosition + vec3(xPoz, aPosition.y, aPosition.z);

    newPosition.xyz *= scale;

    vec4 modelPosition = modelMatrix * instanceMatrix * vec4(newPosition, 1.0);    

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;    

    vUv = uv;
    vTextureCoords=aTextureCoords;
    vIndex=aIndex;
}