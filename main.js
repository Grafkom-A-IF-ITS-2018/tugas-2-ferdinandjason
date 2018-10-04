/** @type {WebGLRenderingContext} */
let gl

const initGL = (canvas) => {
    try{
        gl = canvas.getContext('webgl')
        gl.viewportWidth = canvas.width
        gl.viewportHeight = canvas.height
    } catch (error) {
        if(!gl){
            alert('Tidak bisa menginisialisasi WebGL!')
        }
    }
}

const getShader = (gl, id) => {
    let shaderScript = document.getElementById(id)
    if(!shaderScript) {
        return null
    }
    let str = ''
    let k = shaderScript.firstChild
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent
        }
        k = k.nextSibling
    }

    let shader

    if (shaderScript.type == 'x-shader/x-fragment') {
        shader = gl.createShader(gl.FRAGMENT_SHADER)
    } else if (shaderScript.type == 'x-shader/x-vertex') {
        shader = gl.createShader(gl.VERTEX_SHADER)
    } else {
        return null
    }

    gl.shaderSource(shader, str)
    gl.compileShader(shader)

    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader))
        return null
    }

    return shader
}

let shaderProgram

const initShaders = () => {
    let vertexShader = getShader(gl, 'shader-vs')
    let fragmentShader = getShader(gl, 'shader-fs')

    shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, fragmentShader)
    gl.attachShader(shaderProgram, vertexShader)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Tidak bisa menghubungkan shader-shader')
    }

    gl.useProgram(shaderProgram)

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor')
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix')
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix')
}

let mvMatrix = mat4.create()
let mvMatrixStack = []
let pMatrix = mat4.create()

const mvPushMatrix = () => {
    let duplicate = mat4.create()
    mat4.copy(duplicate, mvMatrix)
    mvMatrixStack.push(duplicate)
}

const mvPopMatrix = () => {
    if (mvMatrixStack.length == 0) {
        throw 'mvMatrixStack kosong'
    }
    mvMatrix = mvMatrixStack.pop()
}

const setMatrixUniform = () => {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)
}

let RPositionBuffer
let RVertexIndexBuffer
let RColorBuffer
let RColorBuffer2

let CubePositionBuffer
let CubeColorBuffer
let CubeVertexIndexBuffer

let RVertices = []
let CubeVertices = []

let RHeight = 6.0
let RWidth = 3.0
let RThick = 1.0

const initBuffers = () => {
    // R Position
    RPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, RPositionBuffer)
    let vertices = [
        // Front
        0.0,    RHeight, RThick,
        RWidth, RHeight, RThick,
        0.0,    RHeight-(RHeight/6), RThick,
        RWidth, RHeight-(RHeight/6), RThick,

        RWidth-(RWidth/3.0),RHeight-(RHeight/6), RThick,
        RWidth,             RHeight-(2*RHeight/6), RThick,
        RWidth-(RWidth/3.0),RHeight-(2*RHeight/6), RThick,

        RWidth-(2*RWidth/3.0),RHeight-(RHeight/6), RThick,
        0.0,                RHeight-(2*RHeight/6), RThick,
        RWidth-(2*RWidth/3.0),RHeight-(2*RHeight/6), RThick,

        0.0,    RHeight-(3*RHeight/6), RThick,
        RWidth, RHeight-(3*RHeight/6), RThick,

        RWidth-(2*RWidth/3.0),RHeight-(3*RHeight/6),  RThick,
        0.0,                0.0,                    RThick,
        RWidth-(2*RWidth/3.0),0.0,                    RThick,

        RWidth-(RWidth/3.0),0.0,                    RThick,
        RWidth             ,0.0,                    RThick,
        RWidth-(RWidth/3.0),RHeight-(3*RHeight/6),  RThick,

        // Back
        0.0,    RHeight,                0.0, 
        RWidth, RHeight,                0.0, 
        0.0,    RHeight-(RHeight/6),  0.0, 
        RWidth, RHeight-(RHeight/6),  0.0, 

        RWidth-(RWidth/3.0),RHeight-(RHeight/6), 0.0, 
        RWidth,             RHeight-(2*RHeight/6), 0.0, 
        RWidth-(RWidth/3.0),RHeight-(2*RHeight/6), 0.0, 

        RWidth-(2*RWidth/3.0), RHeight-(RHeight/6), 0.0, 
        0.0,                 RHeight-(2*RHeight/6), 0.0, 
        RWidth-(2*RWidth/3.0), RHeight-(2*RHeight/6), 0.0, 

        0.0,    RHeight-(3*RHeight/6), 0.0, 
        RWidth, RHeight-(3*RHeight/6), 0.0, 

        RWidth-(2*RWidth/3.0),RHeight-(3*RHeight/6), 0.0, 
        0.0,                0.0,                   0.0, 
        RWidth-(2*RWidth/3.0),0.0,                   0.0, 

        RWidth-(RWidth/3.0),0.0, 0.0, 
        RWidth,             0.0, 0.0, 
        RWidth-(RWidth/3.0),RHeight-(3*RHeight/6), 0.0, 
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    RPositionBuffer.itemSize = 3
    RPositionBuffer.numItems = vertices.length / 3

    // R Color
    RColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, RColorBuffer)
    colors = []
    for (let i = 0; i < 6*3; i++) {
        colors = colors.concat([0.5, 0.5,1.0,1.0])
    }
    for (let i = 0; i < 6*3; i++) {
        colors = colors.concat([0.5,1.0,0.5, 1.0])
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
    RColorBuffer.itemSize = 4
    RColorBuffer.numItems = colors.length / 4

    RVertexIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, RVertexIndexBuffer)    
    let vertexIndices = [
        // FRONT
        0,1,2, 2,1,3,
        3,4,5, 6,4,5,

        2,7,8, 8,9,7,
        8,5,10,  10,5,11,

        10,12,13,  13,12,14,
        12,15,16,  16,17,12,

        // BACK
        18,19,20,  20,19,21,
        21,22,23,  24,22,23,

        20,25,26,  26,27,25,
        26,23,28,  28,23,29,

        28,30,31,  31,30,32,
        30,33,34,  34,35,30,

        // SAMPING KANAN
        1,19,29,  29,11,1,
        11,29,35,  35,17,11,
        17,35,34,  34,16,17,

        // SAMPING KIRI
        0,18,31,  31,13,0,

        // BAWAH
        13,31,14,  14,32,31,
        15,33,16,  16,34,33,

        // ATAS
        0,18,1,  1,19,18,

        // BOLONG
        14,32,30,  30,12,14,
        15,33,30,  30,12,15,

        // BOLONG KOTAK
        7,25,9,  9,27,25,
        4,22,6,  6,24,22,

        7,25,4,  4,22,25,
        9,27,6,  6,24,27,
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW)
    RVertexIndexBuffer.itemSize = 1
    RVertexIndexBuffer.numItems = vertexIndices.length;


     // TO detech Collision
    // Front
    RVertices.push([0.0,    RHeight,               RThick,1.0]) // 1
    RVertices.push([RWidth, RHeight,               RThick,1.0]) // 2
    RVertices.push([0.0,    RHeight-(RHeight/6), RThick,1.0]) // 3
    RVertices.push([RWidth, RHeight-(RHeight/6), RThick,1.0]) // 4
    
    RVertices.push([RWidth-(RWidth/3.0), RHeight-(RHeight/6), RThick,1.0]) // 5
    RVertices.push([RWidth,              RHeight-(2*RHeight/6), RThick,1.0]) // 6
    RVertices.push([RWidth-(RWidth/3.0), RHeight-(2*RHeight/6), RThick,1.0]) // 7

    RVertices.push([RWidth-(2*RWidth/3.0), RHeight-(RHeight/6), RThick,1.0]) // 8
    RVertices.push([0.0,                 RHeight-(2*RHeight/6), RThick,1.0]) // 9
    RVertices.push([RWidth-(2*RWidth/3.0), RHeight-(2*RHeight/6), RThick,1.0]) // 10

    RVertices.push([0.0,    RHeight-(3*RHeight/6), RThick,1.0]) // 11
    RVertices.push([RWidth, RHeight-(3*RHeight/6), RThick,1.0]) // 12

    RVertices.push([RWidth-(2*RWidth/3.0), RHeight-(3*RHeight/6), RThick,1.0]) // 13
    RVertices.push([0.0,                 0.0, RThick,1.0]) // 14
    RVertices.push([RWidth-(2*RWidth/3.0), 0.0, RThick,1.0]) // 15

    RVertices.push([RWidth-(RWidth/3.0), 0.0, RThick,1.0]) // 16
    RVertices.push([RWidth,              0.0, RThick,1.0]) // 17
    RVertices.push([RWidth-(RWidth/3.0), RHeight-(3*RHeight/6), RThick,1.0]) // 18
    // Back
    RVertices.push([0.0,    RHeight,               0.0, 1.0]) // 19
    RVertices.push([RWidth, 6.0,                   0.0, 1.0]) // 20
    RVertices.push([0.0,    RHeight-(RHeight/6), 0.0, 1.0]) // 21
    RVertices.push([RWidth, RHeight-(RHeight/6), 0.0, 1.0]) // 22
    
    RVertices.push([RWidth-(RWidth/3.0), RHeight-(RHeight/6), 0.0, 1.0]) // 23
    RVertices.push([RWidth,              RHeight-(2*RHeight/6), 0.0, 1.0]) // 24
    RVertices.push([RWidth-(RWidth/3.0), RHeight-(2*RHeight/6), 0.0, 1.0]) // 25

    RVertices.push([RWidth-(2*RWidth/3.0), RHeight-(RHeight/6), 0.0, 1.0]) // 26
    RVertices.push([0.0,                 RHeight-(2*RHeight/6), 0.0, 1.0]) // 27
    RVertices.push([RWidth-(2*RWidth/3.0), RHeight-(2*RHeight/6), 0.0, 1.0]) // 28

    RVertices.push([0.0,    RHeight-(3*RHeight/6), 0.0, 1.0]) // 29
    RVertices.push([RWidth, RHeight-(3*RHeight/6), 0.0, 1.0]) // 30

    RVertices.push([RWidth-(2*RWidth/3.0), RHeight-(3*RHeight/6), 0.0, 1.0]) // 31
    RVertices.push([0.0,                 0.0, 0.0, 1.0]) // 32
    RVertices.push([RWidth-(2*RWidth/3.0), 0.0, 0.0, 1.0]) // 33

    RVertices.push([RWidth-(RWidth/3.0), 0.0, 0.0, 1.0]) // 34
    RVertices.push([RWidth,              0.0, 0.0, 1.0]) // 35
    RVertices.push([RWidth-(RWidth/3.0), RHeight-(3*RHeight/6), 0.0, 1.0]) // 36

    // Cube skeleton
    //      H             G
    // E            F
    // 
    //
    // 
    //      D             C
    // A            B

    CubePositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, CubePositionBuffer)
    vertices = [
        -12.0, -12.0,  12.0, // A 0
         12.0, -12.0,  12.0, // B 1
         12.0, -12.0, -12.0, // C 2
        -12.0, -12.0, -12.0, // D 3
        -12.0,  12.0,  12.0, // E 4
         12.0,  12.0,  12.0, // F 5
         12.0,  12.0, -12.0, // G 6
        -12.0,  12.0, -12.0, // H 7
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    CubePositionBuffer.itemSize = 3
    CubePositionBuffer.numItems = vertices.length / 3

    CubeColorBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, CubeColorBuffer)
    colors = []
    for (let i = 0; i < vertices.length / 3; i++) {
        colors = colors.concat([1.0,1.0,1.0,1.0])        
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
    CubeColorBuffer.itemSize = 4
    CubeColorBuffer.numItems = colors.length / 3

    CubeVertexIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CubeVertexIndexBuffer)    
    let cubeVertexIndices = [
       0, 1,    1, 2,   2, 3,   3, 0, // AB, BC, CD, DA 
       4, 5,    5, 6,   6, 7,   4, 7, // EF, FG, GH, EH
       1, 5,    0, 4,   2, 6,   3, 7, // BF, AE, CG, DH
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW)
    CubeVertexIndexBuffer.itemSize = 1
    CubeVertexIndexBuffer.numItems = cubeVertexIndices.length

    CubeVertices.push([-12.0, -12.0,  12.0, 1.0]) // A 0
    CubeVertices.push([ 12.0, -12.0,  12.0, 1.0]) // B 1
    CubeVertices.push([ 12.0,  12.0,  12.0, 1.0]) // F 5
    CubeVertices.push([-12.0,  12.0,  12.0, 1.0]) // E 4
    CubeVertices.push([-12.0, -12.0, -12.0, 1.0]) // D 3
    CubeVertices.push([ 12.0, -12.0, -12.0, 1.0]) // C 2
    CubeVertices.push([ 12.0,  12.0, -12.0, 1.0]) // G 6
    CubeVertices.push([-12.0,  12.0, -12.0, 1.0]) // H 7
}

const plane_from_point = (A ,B, C) => {
    let n = [], temp = [], temp2 = []
    temp = vec3.subtract(temp,B,A)
    temp2= vec3.subtract(temp2,C,B)
    n = vec3.cross(n,temp,temp2)

    let D = 0;
    D = vec3.dot(n.map(x =>-x), A)
    // Equation = n_x X + n_y Y + n_z Z - D = 0
    return n.concat(D)
}

const distance_point_to_plane = (plane_equation, point) => {
    let new_point = point.slice(0,3)
    let num = Math.abs(plane_equation[0]*new_point[0] + 
        plane_equation[1]*new_point[1] + 
        plane_equation[2]*new_point[2] + plane_equation[3])
    let denum = Math.sqrt(plane_equation.slice(0,3).map(x => x*x).reduce((a,b) => a+b, 0))
    // console.log(num,denum,num/denum);
    return num/denum
}

let rR = 0
let rSquare = 0
let movementXR = 0.01
let movementYR = 0.01
let movementZR = 0.01

let arahX = 1.0;
let arahY = 1.0;
let arahZ = 1.0;
let rotater = 1.0;

let KUBUS = {
    TOP : null,
    BOTTOM : null,
    FRONT : null,
    BACK : null,
    RIGHT : null,
    LEFT : null,
}

const drawScene = () => {
    gl.viewport(0,0,gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    mat4.perspective(pMatrix, glMatrix.toRadian(45), gl.viewportWidth/gl.viewportHeight, 0.1, 100.0)

    mat4.identity(mvMatrix)

    mat4.translate(mvMatrix, mvMatrix, [-1.0, 5.0,-50.0])

    mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(rSquare), [0.0, 0.01, 0.0])

    mvPushMatrix()
    mat4.translate(mvMatrix, mvMatrix, [movementXR, movementYR, movementZR])
    mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(rR), [0.0, 1.0, 0.0])
    mat4.translate(mvMatrix, mvMatrix, [-RWidth/2.0, -RHeight/2.0, -RThick/2.0])
    
    gl.bindBuffer(gl.ARRAY_BUFFER, RPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, RPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, RVertexIndexBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, RColorBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, RColorBuffer.itemSize, gl.FLOAT, false, 0, 0)

    let current_position_r = []
    for(v = 0; v < RVertices.length; v++){
        let temp = matrix_multiplication(mvMatrix,RVertices[v]);
        current_position_r.push(temp);
    }
    setMatrixUniform()
    gl.drawElements(gl.TRIANGLES, RVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
    mvPopMatrix()

    mat4.translate(mvMatrix, mvMatrix, [1.5, -5.0, 0.0])
    mvPushMatrix()
    //mat4.translate(mvMatrix, mvMatrix, [-0.5, 0.0, -0.5])
    
    gl.bindBuffer(gl.ARRAY_BUFFER, CubePositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, CubePositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, CubeColorBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, CubeColorBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CubeVertexIndexBuffer)

    let current_position_cube = []
    for(v = 0; v < CubeVertices.length; v++){
        let temp = matrix_multiplication(mvMatrix,CubeVertices[v]);
        current_position_cube.push(temp);
    }

    // Cube skeleton
    //      H(7)             G(6)
    // E(3)            F(2)
    // 
    // 
    // 
    // 
    //      D(4)             C(5)
    // A(0)            B(1)
    
    KUBUS.TOP = plane_from_point(current_position_cube[3], current_position_cube[2], current_position_cube[6])
    KUBUS.BOTTOM = plane_from_point(current_position_cube[0], current_position_cube[1], current_position_cube[4])
    KUBUS.RIGHT = plane_from_point(current_position_cube[1], current_position_cube[2], current_position_cube[5])
    KUBUS.LEFT = plane_from_point(current_position_cube[0], current_position_cube[3], current_position_cube[4])
    KUBUS.FRONT = plane_from_point(current_position_cube[0], current_position_cube[1], current_position_cube[2])
    KUBUS.BACK = plane_from_point(current_position_cube[4], current_position_cube[5], current_position_cube[6])

    setMatrixUniform()
    gl.drawElements(gl.LINES, CubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
    mvPopMatrix()

    a = detect_collision(current_position_r, KUBUS, current_position_cube)
}

let lastTime = 0

const updateRPos = () => {
    movementXR += (arahX * 0.1)
    movementYR += (arahY * 0.1)
    movementZR += (arahZ * 0.1)
}

const animate = () => {
    let timeNow = new Date().getTime()
    if(lastTime != 0){
        let elapsed = timeNow - lastTime
        rR += (rotater)*(100 * elapsed) / 1000.0
        rSquare += (10 * elapsed) / 1000.0
        updateRPos()
    }
    lastTime = timeNow
}

const tick = () => {
    requestAnimationFrame(tick)
    drawScene()
    animate()
}

const WebGLStart = () => {
    let canvas = document.getElementById('canvas-ku')
    initGL(canvas)
    initShaders()
    initBuffers()
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)
    tick()
}


const matrix_multiplication = (a,b) => {
    let c1,c2,c3,c4;
    c1 = a[0]*b[0] + a[4]*b[1] + a[8]*b[2] + a[12]*b[3]
    c2 = a[1]*b[0] + a[5]*b[1] + a[9]*b[2] + a[13]*b[3]
    c3 = a[2]*b[0] + a[6]*b[1] + a[10]*b[2] + a[14]*b[3]
    c4 = a[3]*b[0] + a[7]*b[1] + a[11]*b[2] + a[15]*b[3]
    return [c1,c2,c3,c4]
}

const detect_collision = (current_position_r, KUBUS, current_position_cube) => {
    nabrak = false
    // TOP
    for(i = 0; i < current_position_r.length; i++){
        // console.log(current_position_r[i])
        // console.log(current_position_cube)
        // console.log(KUBUS.TOP)
        if(
            distance_point_to_plane(KUBUS.TOP, current_position_r[i]) < 0.1
        ){
            if(arahY > 0){
                arahY *= -1.0
                rotater *= -1.0
                updateRPos()
            }
            return false
        }
    }
    // BOTTOM
    for(i = 0; i < current_position_r.length; i++){
        if(
            distance_point_to_plane(KUBUS.BOTTOM, current_position_r[i]) < 0.1
        ){
            if(arahY < 0){
                arahY *= -1.0
                rotater *= -1.0
                updateRPos()
            }
            return false
        }
    }
    // FRONT
    for(i = 0; i < current_position_r.length; i++){
        if(
            distance_point_to_plane(KUBUS.FRONT, current_position_r[i]) < 0.1
        ){
            if(arahZ > 0) {
                arahZ *= -1.0
                rotater *= -1.0
                updateRPos()
            }
            return false
        }
    }
    // BACK
    for(i = 0; i < current_position_r.length; i++){
        if(
            distance_point_to_plane(KUBUS.BACK, current_position_r[i]) < 0.1
        ){
            if(arahZ < 0) {
                arahZ *= -1.0
                rotater *= -1.0
                updateRPos()
            }
            return false
        }
    }
    // Right
    for(i = 0; i < current_position_r.length; i++){
        if(
            distance_point_to_plane(KUBUS.RIGHT, current_position_r[i]) < 0.1
        ){
            if(arahX > 0){
                arahX *= -1.0
                rotater *= -1.0
                updateRPos()
            }
            return false
        }
    }
    // Left
    for(i = 0; i < current_position_r.length; i++){
        if(
            distance_point_to_plane(KUBUS.LEFT, current_position_r[i]) < 0.1
        ){
            if(arahX < 0){
                arahX *= -1.0
                rotater *= -1.0
                updateRPos()
            }
            return false
        }
    }
}