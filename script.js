var main=function() {
  var CANVAS=document.getElementById("your_canvas");
  CANVAS.width=window.innerWidth;
  CANVAS.height=window.innerHeight;

  /*========================= CAPTURE MOUSE EVENTS ========================= */

  var AMORTIZATION=0.95;
  var drag=false;


  var old_x, old_y;

  var dX=0, dY=0;
  var mouseDown=function(e) {
    drag=true;
    old_x=e.pageX, old_y=e.pageY;
    e.preventDefault();
    return false;
  };

  var mouseUp=function(e){
    drag=false;
  };

  var mouseMove=function(e) {
    if (!drag) return false;
    dX=(e.pageX-old_x)*2*Math.PI/CANVAS.width,
      dY=(e.pageY-old_y)*2*Math.PI/CANVAS.height;
    THETA+=dX;
    PHI+=dY;
    old_x=e.pageX, old_y=e.pageY;
    e.preventDefault();
  };

  CANVAS.addEventListener("mousedown", mouseDown, false);
  CANVAS.addEventListener("mouseup", mouseUp, false);
  CANVAS.addEventListener("mouseout", mouseUp, false);
  CANVAS.addEventListener("mousemove", mouseMove, false);

  /*========================= GET WEBGL CONTEXT ========================= */
  var GL;
  try {
    GL = CANVAS.getContext("experimental-webgl", {antialias: true});
  } catch (e) {
    alert("You are not webgl compatible :(") ;
    return false;
  }

  /*========================= SHADERS ========================= */
  /*jshint multistr: true */

  var shader_vertex_source="\n\
attribute vec3 position;\n\
uniform mat4 Pmatrix;\n\
uniform mat4 Vmatrix;\n\
uniform mat4 Mmatrix;\n\
attribute vec3 color; //the color of the point\n\
varying vec3 vColor;\n\
void main(void) { //pre-built function\n\
gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);\n\
vColor=color;\n\
}";

  var shader_fragment_source="\n\
precision mediump float;\n\
uniform float greyscality;\n\
varying vec3 vColor;\n\
void main(void) {\n\
\n\
\n\
float greyscaleValue=(vColor.r+vColor.g+vColor.b)/3.;\n\
vec3 greyscaleColor=vec3(greyscaleValue,greyscaleValue,greyscaleValue);\n\
\n\
\n\
vec3 color=mix(greyscaleColor, vColor, greyscality);\n\
gl_FragColor = vec4(color, 1.);\n\
}";

  var get_shader=function(source, type, typeString) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert("ERROR IN "+typeString+ " SHADER : " + GL.getShaderInfoLog(shader));
      return false;
    }
    return shader;
  };

  var shader_vertex=get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
  var shader_fragment=get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

  var SHADER_PROGRAM=GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);

  GL.linkProgram(SHADER_PROGRAM);

  var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
  var _greyscality=GL.getUniformLocation(SHADER_PROGRAM, "greyscality");

  var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

  GL.enableVertexAttribArray(_color);
  GL.enableVertexAttribArray(_position);

  GL.useProgram(SHADER_PROGRAM);
  /*======================= THE CIRCLE =========================== */

  var circle_vertex = [];
    circle_vertex.push(0);
    circle_vertex.push(0);
    circle_vertex.push(0);
    circle_vertex.push(1);
    circle_vertex.push(1);
    circle_vertex.push(1);

  for ( var i = 0; i < 360; i++){
    circle_vertex.push(Math.cos(i));
    circle_vertex.push(Math.sin(i));
    circle_vertex.push(0);
    circle_vertex.push(1);
    circle_vertex.push(1);
    circle_vertex.push(1);
  }
  var CIRCLE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(circle_vertex),
    GL.STATIC_DRAW);

  var circle_faces = [];

  for ( var i=0; i<360; i++){
    circle_faces.push(0);
    circle_faces.push(i);
    circle_faces.push((i+1)%360);
  }

  var CIRLCE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRLCE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(circle_faces),
    GL.STATIC_DRAW);

  /*======================= THE CIRCLE =========================== */

  var circle_vertex = [];
    circle_vertex.push(0);
    circle_vertex.push(0);
    circle_vertex.push(0);
    circle_vertex.push(1);
    circle_vertex.push(1);
    circle_vertex.push(1);

  for ( var i = 0; i < 360; i++){
    circle_vertex.push(Math.cos(i));
    circle_vertex.push(Math.sin(i));
    circle_vertex.push(0);
    circle_vertex.push(1);
    circle_vertex.push(1);
    circle_vertex.push(1);
  }
  var CIRCLE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(circle_vertex),
    GL.STATIC_DRAW);

  var circle_faces = [];

  for ( var i=0; i<360; i++){
    circle_faces.push(0);
    circle_faces.push(i);
    circle_faces.push((i+1)%360);
  }

  var CIRLCE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRLCE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(circle_faces),
    GL.STATIC_DRAW);


  /*======================== THE RECTANGLE ============================ */
  var rectangle_vertex=[
    -1,-1,0, 0.96,0.87,0.7,
    1,-1,0, 0.96,0.87,0.7,
    1,1,0,  0.96,0.87,0.7,
    -1,1,0, 0.96,0.87,0.7
  ]
  var RECTANGLE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, RECTANGLE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(rectangle_vertex),
    GL.STATIC_DRAW);

  var rectangle_faces = [
    0,1,2,
    0,2,3
  ];
  var RECTANGLE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(rectangle_faces),
    GL.STATIC_DRAW);

  /*========================= THE BASE LINE ===========================*/
  var line_vertex=[
    -1,-1,0, 0,0,0,
    1,-1,0, 0,0,0,
    1,1,0,  0,0,0,
    -1,1,0, 0,0,0
  ]
  var LINE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, LINE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(line_vertex),
    GL.STATIC_DRAW);

  var line_faces = [
    0,1,2,
    0,2,3
  ];
  var LINE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(line_faces),
    GL.STATIC_DRAW);
  /*========================= THE TETRAHEDRON ========================= */
  //POINTS :
  var tetrahedron_vertex=[
    //base face points, included in the plane y=-1
    -1,-1,-1,     1,0,0,
    1,-1,-1,     1,0,0,
    0,-1,1,      1,0,0,

    //summit, in white
    0,1,0,     1,0,0
  ];

  var TETRAHEDRON_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, TETRAHEDRON_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(tetrahedron_vertex),
    GL.STATIC_DRAW);

  //TETRAHEDRON FACES :
  var tetrahedron_faces = [
    0,1,2, //base

    0,1,3, //side 0
    1,2,3, //side 1
    0,2,3  //side 2
  ];
  var TETRAHEDRON_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TETRAHEDRON_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(tetrahedron_faces),
    GL.STATIC_DRAW);

  /*========================= MATRIX ========================= */

  var PROJMATRIX=LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
  var MOVEMATRIX=LIBS.get_I4();
  var MOVEMATRIX2=LIBS.get_I4();
  var MOVEMATRIX3=LIBS.get_I4();
  var MOVEMATRIX4=LIBS.get_I4();
  var CIRCLEMATRIX=LIBS.get_I4();
  var MOVEMATRIX_TETRA=LIBS.get_I4();
  var VIEWMATRIX=LIBS.get_I4();

  LIBS.translateZ(VIEWMATRIX, -6);
  var THETA=0,
      PHI=0;

  /*========================= DRAWING ========================= */
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.0, 0.0, 0.0, 0.0);
  GL.clearDepth(1.0);

  var time_old=0;
  var animate=function(time) {
    var dt=time-time_old;
    if (!drag) {
      dX*=AMORTIZATION, dY*=AMORTIZATION;
      THETA+=dX, PHI+=dY;
    }
    LIBS.set_I4(MOVEMATRIX_TETRA);
    LIBS.set_I4(MOVEMATRIX);
    LIBS.set_I4(CIRCLEMATRIX);
    LIBS.set_I4(MOVEMATRIX2);
    LIBS.set_I4(MOVEMATRIX3);
    LIBS.set_I4(MOVEMATRIX4);

    LIBS.scaleX(MOVEMATRIX, 1.45);
    LIBS.scaleY(MOVEMATRIX, 0.1);
    LIBS.translateY(MOVEMATRIX,-1.6);

    LIBS.scaleY(MOVEMATRIX2, 1.45);
    LIBS.scaleX(MOVEMATRIX2, 0.1);
    LIBS.translateX(MOVEMATRIX2,1.6);

    LIBS.scaleY(MOVEMATRIX3, 1.45);
    LIBS.scaleX(MOVEMATRIX3, 0.1);
    LIBS.translateX(MOVEMATRIX3,-1.6);

    LIBS.scaleX(MOVEMATRIX4, 1.45);
    LIBS.scaleY(MOVEMATRIX4, 0.1);
    LIBS.translateY(MOVEMATRIX4,1.6);

    LIBS.scaleX(CIRCLEMATRIX, 0.1);
    LIBS.scaleY(CIRCLEMATRIX, 0.1);
    LIBS.translateY(CIRCLEMATRIX, -1.6);
    

    LIBS.scaleX(MOVEMATRIX_TETRA, 2);
    LIBS.scaleY(MOVEMATRIX_TETRA, 2);
    //LIBS.rotateZ(MOVEMATRIX_TETRA, Math.cos(time)*dt*0.0022);
    //LIBS.rotateY(MOVEMATRIX_TETRA, dt*-0.0034);

    /*LIBS.set_I4(MOVEMATRIX2);
    var radius=2; //half distance between the cube centers
    var pos_x=radius*Math.cos(PHI)*Math.cos(THETA);
    var pos_y=-radius*Math.sin(PHI);
    var pos_z=-radius*Math.cos(PHI)*Math.sin(THETA);

    LIBS.set_position(MOVEMATRIX, pos_x, pos_y, pos_z);
    LIBS.set_position(MOVEMATRIX2, -pos_x, -pos_y, -pos_z);

    LIBS.rotateZ(MOVEMATRIX, -PHI);
    LIBS.rotateZ(MOVEMATRIX2, -PHI);

    LIBS.rotateY(MOVEMATRIX, THETA);
    LIBS.rotateY(MOVEMATRIX2, THETA);
    */

    time_old=time;

    GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
    GL.uniform1f(_greyscality, 1);

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_TETRA);
    GL.bindBuffer(GL.ARRAY_BUFFER, RECTANGLE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_FACES);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 2*3, GL.UNSIGNED_SHORT, 0);



    /*==================== DRAW LINES ==========================*/
    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
    GL.bindBuffer(GL.ARRAY_BUFFER, LINE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE_FACES);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 2*3, GL.UNSIGNED_SHORT, 0);


    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX2);
    GL.bindBuffer(GL.ARRAY_BUFFER, LINE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE_FACES);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 2*3, GL.UNSIGNED_SHORT, 0);

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX3);
    GL.bindBuffer(GL.ARRAY_BUFFER, LINE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE_FACES);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 2*3, GL.UNSIGNED_SHORT, 0);

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX4);
    GL.bindBuffer(GL.ARRAY_BUFFER, LINE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE_FACES);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 2*3, GL.UNSIGNED_SHORT, 0);




    GL.uniformMatrix4fv(_Mmatrix, false, CIRCLEMATRIX);
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRLCE_FACES);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 360*3, GL.UNSIGNED_SHORT, 0);


   //GL.uniform1f(_greyscality, 0);
   // GL.drawElements(GL.TRIANGLES, 3*2, GL.UNSIGNED_SHORT, 6*2);
    GL.flush();

    window.requestAnimationFrame(animate);
  };
  animate(0);
};