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
let RColorBuffer

let CubePositionBuffer

let RVertices = []
let CubeVertices = []

const initBuffers = () => {
    // R Position
    RPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, RPositionBuffer)
    let vertices = [
        // FRONT
        0.0, 6.0, 1.0,
        3.0, 6.0, 1.0,
        0.0, 5.0, 1.0,
        0.0, 5.0, 1.0,
        3.0, 6.0, 1.0,
        3.0, 5.0, 1.0,

        3.0, 5.0, 1.0,
        2.0, 5.0, 1.0,
        3.0, 4.0, 1.0,
        2.0, 4.0, 1.0,
        2.0, 5.0, 1.0,
        3.0, 4.0, 1.0,

        0.0, 5.0, 1.0,
        1.0, 5.0, 1.0,
        0.0, 4.0, 1.0,
        0.0, 4.0, 1.0,
        1.0, 4.0, 1.0,
        1.0, 5.0, 1.0,

        0.0, 4.0, 1.0,
        3.0, 4.0, 1.0,
        0.0, 3.0, 1.0,
        0.0, 3.0, 1.0,
        3.0, 4.0, 1.0,
        3.0, 3.0, 1.0,

        0.0, 3.0, 1.0,
        1.0, 3.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        1.0, 3.0, 1.0,
        1.0, 0.0, 1.0,

        1.0, 3.0, 1.0,
        2.0, 0.0, 1.0,
        3.0, 0.0, 1.0,
        3.0, 0.0, 1.0,
        2.0, 3.0, 1.0,
        1.0, 3.0, 1.0,

        // BACK
        0.0, 6.0, 0.0,
        3.0, 6.0, 0.0,
        0.0, 5.0, 0.0,
        0.0, 5.0, 0.0,
        3.0, 6.0, 0.0,
        3.0, 5.0, 0.0,

        3.0, 5.0, 0.0,
        2.0, 5.0, 0.0,
        3.0, 4.0, 0.0,
        2.0, 4.0, 0.0,
        2.0, 5.0, 0.0,
        3.0, 4.0, 0.0,

        0.0, 5.0, 0.0,
        1.0, 5.0, 0.0,
        0.0, 4.0, 0.0,
        0.0, 4.0, 0.0,
        1.0, 4.0, 0.0,
        1.0, 5.0, 0.0,

        0.0, 4.0, 0.0,
        3.0, 4.0, 0.0,
        0.0, 3.0, 0.0,
        0.0, 3.0, 0.0,
        3.0, 4.0, 0.0,
        3.0, 3.0, 0.0,

        0.0, 3.0, 0.0,
        1.0, 3.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        1.0, 3.0, 0.0,
        1.0, 0.0, 0.0,

        1.0, 3.0, 0.0,
        2.0, 0.0, 0.0,
        3.0, 0.0, 0.0,
        3.0, 0.0, 0.0,
        2.0, 3.0, 0.0,
        1.0, 3.0, 0.0,

        // SAMPING KANAN
        3.0, 6.0, 1.0,
        3.0, 6.0, 0.0,
        3.0, 3.0, 0.0,
        3.0, 3.0, 0.0,
        3.0, 3.0, 1.0,
        3.0, 6.0, 1.0,

        3.0, 3.0, 1.0,
        3.0, 3.0, 0.0,
        2.0, 3.0, 0.0,
        2.0, 3.0, 0.0,
        2.0, 3.0, 1.0,
        3.0, 3.0, 1.0,

        2.0, 3.0, 1.0,
        2.0, 3.0, 0.0,
        3.0, 0.0, 0.0,
        3.0, 0.0, 0.0,
        3.0, 0.0, 1.0,
        2.0, 3.0, 1.0,

        // SAMPING KIRI
        0.0, 6.0, 1.0,
        0.0, 6.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 1.0,
        0.0, 6.0, 1.0,

        // BAWAH
        0.0, 0.0, 1.0,
        0.0, 0.0, 0.0,
        1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,
        1.0, 0.0, 0.0,
        0.0, 0.0, 0.0,

        2.0, 0.0, 1.0,
        2.0, 0.0, 0.0,
        3.0, 0.0, 1.0,
        3.0, 0.0, 1.0,
        3.0, 0.0, 0.0,
        2.0, 0.0, 0.0,

        // ATAS
        0.0, 6.0, 1.0,
        0.0, 6.0, 0.0,
        3.0, 6.0, 1.0,
        3.0, 6.0, 1.0,
        3.0, 6.0, 0.0,
        0.0, 6.0, 0.0,

        // BOLONG
        1.0, 0.0, 1.0,
        1.0, 0.0, 0.0,
        1.0, 3.0, 0.0,
        1.0, 3.0, 0.0,
        1.0, 3.0, 1.0,
        1.0, 0.0, 1.0,

        2.0, 0.0, 1.0,
        2.0, 0.0, 0.0,
        1.0, 3.0, 0.0,
        1.0, 3.0, 0.0,
        1.0, 3.0, 1.0,
        2.0, 0.0, 1.0,
        
        // BOLONG KOTAK
        1.0, 5.0, 1.0,
        1.0, 5.0, 0.0,
        1.0, 4.0, 1.0,
        1.0, 4.0, 1.0,
        1.0, 4.0, 0.0,
        1.0, 5.0, 0.0,

        2.0, 5.0, 1.0,
        2.0, 5.0, 0.0,
        2.0, 4.0, 1.0,
        2.0, 4.0, 1.0,
        2.0, 4.0, 0.0,
        2.0, 5.0, 0.0,

        1.0, 5.0, 1.0,
        1.0, 5.0, 0.0,
        2.0, 5.0, 1.0,
        2.0, 5.0, 1.0,
        2.0, 5.0, 0.0,
        1.0, 5.0, 0.0,

        1.0, 4.0, 1.0,
        1.0, 4.0, 0.0,
        2.0, 4.0, 1.0,
        2.0, 4.0, 1.0,
        2.0, 4.0, 0.0,
        1.0, 4.0, 0.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    RPositionBuffer.itemSize = 3
    RPositionBuffer.numItems = vertices.length / 3

    // TO detech Collision
    // Front
    RVertices.push([0.0, 6.0, 1.0, 1.0])
    RVertices.push([3.0, 6.0, 1.0, 1.0])
    RVertices.push([0.0, 5.0, 1.0, 1.0])
    RVertices.push([3.0, 5.0, 1.0, 1.0])
    
    RVertices.push([2.0, 5.0, 1.0, 1.0])
    RVertices.push([3.0, 4.0, 1.0, 1.0])
    RVertices.push([2.0, 4.0, 1.0, 1.0])

    RVertices.push([1.0, 5.0, 1.0, 1.0])
    RVertices.push([0.0, 4.0, 1.0, 1.0])
    RVertices.push([1.0, 4.0, 1.0, 1.0])

    RVertices.push([3.0, 4.0, 1.0, 1.0])
    RVertices.push([0.0, 3.0, 1.0, 1.0])
    RVertices.push([3.0, 3.0, 1.0, 1.0])

    RVertices.push([1.0, 3.0, 1.0, 1.0])
    RVertices.push([0.0, 0.0, 1.0, 1.0])
    RVertices.push([1.0, 0.0, 1.0, 1.0])

    RVertices.push([2.0, 0.0, 1.0, 1.0])
    RVertices.push([3.0, 0.0, 1.0, 1.0])
    RVertices.push([2.0, 3.0, 1.0, 1.0])
    // Back
    RVertices.push([0.0, 6.0, 0.0, 1.0])
    RVertices.push([3.0, 6.0, 0.0, 1.0])
    RVertices.push([0.0, 5.0, 0.0, 1.0])
    RVertices.push([3.0, 5.0, 0.0, 1.0])
    
    RVertices.push([2.0, 5.0, 0.0, 1.0])
    RVertices.push([3.0, 4.0, 0.0, 1.0])
    RVertices.push([2.0, 4.0, 0.0, 1.0])

    RVertices.push([1.0, 5.0, 0.0, 1.0])
    RVertices.push([0.0, 4.0, 0.0, 1.0])
    RVertices.push([1.0, 4.0, 0.0, 1.0])

    RVertices.push([3.0, 4.0, 0.0, 1.0])
    RVertices.push([0.0, 3.0, 0.0, 1.0])
    RVertices.push([3.0, 3.0, 0.0, 1.0])

    RVertices.push([1.0, 3.0, 0.0, 1.0])
    RVertices.push([0.0, 0.0, 0.0, 1.0])
    RVertices.push([1.0, 0.0, 0.0, 1.0])

    RVertices.push([2.0, 0.0, 0.0, 1.0])
    RVertices.push([3.0, 0.0, 0.0, 1.0])
    RVertices.push([2.0, 3.0, 0.0, 1.0])

    // R Color
    RColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, RColorBuffer)
    vertices = [
        // FRONT
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        //BACK
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 0.5, 1.0, 1.0,

        // KANAN
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,

        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,

        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,

        // KIRI
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0,

        // BAWAH
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,

        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,

        // ATAS
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,

        // LENGKAPIN BOLONG
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,

        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,

        // BOLONG KOTAK
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,

        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,

        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,

        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,
        1.0, 0.5, 0.5, 1.0,


    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    RColorBuffer.itemSize = 4
    RColorBuffer.numItems = vertices.length / 4






    CubePositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, CubePositionBuffer)
    vertices = [
        // Front face
        -12.0, -12.0,  12.0,
        12.0, -12.0,  12.0,
        12.0,  12.0,  12.0,
        -12.0,  12.0,  12.0,

        // Back face
        -12.0, -12.0, -12.0,
        -12.0,  12.0, -12.0,
        12.0,  12.0, -12.0,
        12.0, -12.0, -12.0,

        // Top face
        -12.0,  12.0, -12.0,
        -12.0,  12.0,  12.0,
        12.0,  12.0,  12.0,
        12.0,  12.0, -12.0,

        // Bottom face
        -12.0, -12.0, -12.0,
        12.0, -12.0, -12.0,
        12.0, -12.0,  12.0,
        -12.0, -12.0,  12.0,

        // Right face
        12.0, -12.0, -12.0,
        12.0,  12.0, -12.0,
        12.0,  12.0,  12.0,
        12.0, -12.0,  12.0,

        // Left face
        -12.0, -12.0, -12.0,
        -12.0, -12.0,  12.0,
        -12.0,  12.0,  12.0,
        -12.0,  12.0, -12.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    CubePositionBuffer.itemSize = 3
    CubePositionBuffer.numItems = vertices.length / 3

    CubeVertices.push([-12.0, -12.0,  12.0, 1.0])
    CubeVertices.push([ 12.0, -12.0,  12.0, 1.0])
    CubeVertices.push([ 12.0,  12.0,  12.0, 1.0])
    CubeVertices.push([-12.0,  12.0,  12.0, 1.0])
    CubeVertices.push([-12.0, -12.0, -12.0, 1.0])
    CubeVertices.push([ 12.0, -12.0, -12.0, 1.0])
    CubeVertices.push([ 12.0,  12.0, -12.0, 1.0])
    CubeVertices.push([-12.0,  12.0, -12.0, 1.0])
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

const drawScene = () => {
    gl.viewport(0,0,gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    mat4.perspective(pMatrix, glMatrix.toRadian(45), gl.viewportWidth/gl.viewportHeight, 0.1, 100.0)

    mat4.identity(mvMatrix)
    mat4.translate(mvMatrix, mvMatrix, [-1.0, 5.0, -50.0])

    mvPushMatrix()
    mat4.translate(mvMatrix, mvMatrix, [movementXR, movementYR, movementZR])
    console.log(rotater*1.0)
    mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(rR), [0.0, rotater*1.0, 0.0])
    mat4.translate(mvMatrix, mvMatrix, [-1.0, -3.0, -0.5])
    //mvPushMatrix()
    
    //mvPopMatrix()
    
    gl.bindBuffer(gl.ARRAY_BUFFER, RPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, RPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, RColorBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, RColorBuffer.itemSize, gl.FLOAT, false, 0, 0)

    let current_position_r = []
    for(v = 0; v < RVertices.length; v++){
        let temp = MulMat(mvMatrix,RVertices[v]);
        current_position_r.push(temp);
    }
    

    setMatrixUniform()

    gl.drawArrays(gl.TRIANGLES, 0, RPositionBuffer.numItems)
    
    mvPopMatrix()


    mat4.translate(mvMatrix, mvMatrix, [1.5, -5.0, 0.0])

    mvPushMatrix()

    //mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(rSquare), [0.0, 0.1, 0.0])
    mat4.translate(mvMatrix, mvMatrix, [-0.5, 0.0, -0.5])
    
    gl.bindBuffer(gl.ARRAY_BUFFER, CubePositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, CubePositionBuffer.itemSize, gl.FLOAT, false, 0, 0)

    let current_position_cube = []
    for(v = 0; v < CubeVertices.length; v++){
        let temp = MulMat(mvMatrix,CubeVertices[v]);
        current_position_cube.push(temp);
    }

    a = detect_collision(current_position_r, current_position_cube)
    

    setMatrixUniform()

    gl.drawArrays(gl.LINE_LOOP, 0, CubePositionBuffer.numItems)
    
    mvPopMatrix()
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
        rR += (100 * elapsed) / 1000.0
        rSquare += (100 * elapsed) / 1000.0
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


const MulMat = (a,b) => {
    let c1,c2,c3,c4;
    c1 = a[0]*b[0] + a[4]*b[1] + a[8]*b[2] + a[12]*b[3]
    c2 = a[1]*b[0] + a[5]*b[1] + a[9]*b[2] + a[13]*b[3]
    c3 = a[2]*b[0] + a[6]*b[1] + a[10]*b[2] + a[14]*b[3]
    c4 = a[3]*b[0] + a[7]*b[1] + a[11]*b[2] + a[15]*b[3]
    return [c1,c2,c3,c4]
}

const detect_collision = (current_position_r, current_position_cube) => {
    nabrak = false
    // Front
    for(i = 0; i < current_position_r.length; i++){
        if(!(
            current_position_r[i][1] <= current_position_cube[2][1] 
        )){
            if(arahY > 0){
                arahY *= -1.0
                rotater *= -1.0
                updateRPos()
                console.log('front')
            }
            return false
        }
    }
    // Back
    for(i = 0; i < current_position_r.length; i++){
        if(!(
            current_position_r[i][1] >= current_position_cube[4][1]
        )){
            if(arahY < 0){
                arahY *= -1.0
                rotater *= -1.0
                updateRPos()
                console.log('back')
            }
            return false
        }
    }
    // Top
    for(i = 0; i < current_position_r.length; i++){
        if(!(
            current_position_r[i][2] <= current_position_cube[3][2]
        )){
            if(arahZ > 0) {
                arahZ *= -1.0
                rotater *= -1.0
                updateRPos()
                console.log('top')
            }
            return false
        }
    }
    // Bottom
    for(i = 0; i < current_position_r.length; i++){
        if(!(
            current_position_r[i][2] >= current_position_cube[5][2]
        )){
            if(arahZ < 0) {
                arahZ *= -1.0
                rotater *= -1.0
                updateRPos()
                console.log('bottom')
            }
            return false
        }
    }
    // Right
    for(i = 0; i < current_position_r.length; i++){
        if(!(
            current_position_r[i][0] <= current_position_cube[5][0]
        )){
            if(arahX > 0){
                arahX *= -1.0
                rotater *= -1.0
                updateRPos()
                console.log('right')
            }
            return false
        }
    }
    // Left
    for(i = 0; i < current_position_r.length; i++){
        if(!(
            current_position_r[i][0] >= current_position_cube[4][0]
        )){
            if(arahX < 0){
                arahX *= -1.0
                rotater *= -1.0
                updateRPos()
                console.log('left')
            }
            return false
        }
    }
}