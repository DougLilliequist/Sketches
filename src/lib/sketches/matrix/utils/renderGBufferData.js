export const renderGBufferData = ({scene, obj, camera, program, target}) => {

    console.log(obj);
    const prevProgram = obj.program;
    obj.program = program;

    if(scene) {
        gl.renderer.render({scene, camera, target, clear: false});
    } else {
        gl.renderer.render({scene: obj, camera, target, clear: false});
    }

    obj.program = prevProgram;

}
