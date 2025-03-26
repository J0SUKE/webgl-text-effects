varying vec2 vUv;
uniform float uScrollY;
attribute vec3 aPosition;
uniform float uMaxY;

mat3 getYrotationMatrix(float angle)
{
    return mat3(
        cos(angle), 0.0, sin(angle),
        0.0, 1.0, 0.0,
        -sin(angle), 0.0, cos(angle)
    );
}

void main()
{     
    
    float PI = 3.14159265359;

    float xPoz = mod(aPosition.x + uScrollY, uMaxY) - uMaxY/2.0;
    

    vec3 newPosition = getYrotationMatrix(PI/2.)*position + vec3(xPoz, aPosition.y, aPosition.z);

    vec3 rotatedPosition =  newPosition;
    vec4 modelPosition = modelMatrix * instanceMatrix * vec4(rotatedPosition, 1.0);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;    

    vUv = uv;
}