precision mediump float;
varying vec3 vposition;
void main()
{
    float a = atan(vposition.x,vposition.z);
    gl_FragColor = vec4(length(vposition)/5.0, 0.3, vposition.y/2.0, 1.0);
}