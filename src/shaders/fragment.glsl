varying vec2 vUv;
varying vec4 vTextureCoords;
uniform sampler2D uAtlas;


varying float vIndex;
uniform float uIntroProgress;

void main()
{        
    
    // Get UV coordinates for this image from the uniform array
    float xStart = vTextureCoords.x;
    float xEnd = vTextureCoords.y;
    float yStart = vTextureCoords.z;
    float yEnd = vTextureCoords.w;
    
    // Transform the default UV coordinates to sample from the correct part of the atlas
    vec2 atlasUV = vec2(
        mix(xStart, xEnd, 1.-vUv.x),
        mix(yStart, yEnd, 1.-vUv.y)
    );
    
    // Sample the texture
    vec4 color = texture2D(uAtlas, atlasUV);

     // Calculate staggered intro progress
    float instanceProgress = uIntroProgress * float(50.0); // 50 is meshCount
    float localProgress = clamp(instanceProgress - vIndex, 0.0, 1.0);
    
    color.a = localProgress;
    
    gl_FragColor = color;    
}