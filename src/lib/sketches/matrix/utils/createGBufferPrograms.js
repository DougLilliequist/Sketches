import {Program} from "ogl";

export const createGBufferPrograms = (gl, {vertex, uniforms}) => {

    const programs = {}

    const viewPosFragment = `

    precision highp float;
    varying vec3 vEyePos;

      void main() {
        gl_FragColor = vec4(vEyePos, 1.0);
      }

    `;

    const viewNormalFragment = `
      precision highp float;
      varying vec3 vNormal;

      void main() {
        gl_FragColor = vec4(normalize(vNormal), 1.0);
      }
    `

    programs.displayViewPosition = new Program(gl, {
        vertex,
        fragment: viewPosFragment,
        uniforms
    });

    programs.displayViewNormal = new Program(gl, {
        vertex,
        fragment: viewNormalFragment,
        uniforms
    });

    return programs;

}
