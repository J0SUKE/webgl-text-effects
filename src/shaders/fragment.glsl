varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uGridSize;
uniform float uScreenAspectRatio;
uniform float uProgress;

void main()
{
    
    float horizontalGrid = floor(vUv.x * ceil(uGridSize*uScreenAspectRatio)) / ceil(uGridSize*uScreenAspectRatio);
    float verticalGrid = floor(vUv.y * uGridSize) / uGridSize;
    
    vec2 gridUvs = vec2(horizontalGrid, verticalGrid);

    float progess = uProgress * 1./ceil(uGridSize*uScreenAspectRatio);

    vec3 color1 = vec3(1., 0., 0.);
    vec3 color2 = vec3(0., 1., 0.);


    vec3 final = (vUv.x - gridUvs.x) < progess ? color1 : color2;

    gl_FragColor = vec4(final, 1.0);
}