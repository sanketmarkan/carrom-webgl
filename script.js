var positionx = new Array(10);
var positiony = new Array(10);
var cspeed = new Array(10);
var done = new Array(10);
var cinmotion = new Array(10);
var ciTHETA = new Array(10);
var inmotion = false,power = 3;
var strikerx = 0,strikery=-1.6;
var mousex = 0,mousey=0;
var iTHETA;

for ( var i = 0 ;i < 9; i++){
  cspeed[i]=0;
  done[i] = false;
  cinmotion[i]=false;
  ciTHETA[i] =0;
}
for ( var i = 0 ;i < 4; i++){
  positiony[i]=0.3*Math.cos(i*LIBS.degToRad(90));
  positionx[i]=0.3*Math.sin(i*LIBS.degToRad(90));
}

for ( var i = 4 ;i < 8; i++){
  positiony[i]=0.3*Math.cos(LIBS.degToRad(i*90+45));
  positionx[i]=0.3*Math.sin(LIBS.degToRad(i*90+45));
}
positiony[8]=0;
positionx[8]=0;
 
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
    if (inmotion) return;
    inmotion = true;
    speed = power;
    dX=-4.3+8.6/CANVAS.width*e.pageX;
    dY=-2+4/CANVAS.height*e.pageY;
    dY *= -1;
    mousex = dX;
    mousey = dY;
    var x = strikerx, y = strikery;
    THETA = Math.atan2 ( dY - y, dX - x);
    iTHETA = THETA;
    if(2 * iTHETA < -Math.PI)
      iTHETA = Math.PI;
    else if ( iTHETA < 0)
      iTHETA = 0;
    e.preventDefault();
  };

  var mouseUp=function(e){
    drag=false;
  };

  var mouseMove=function(e) {
    dX=-4.3+8.6/CANVAS.width*e.pageX;
    dY=-2+4/CANVAS.height*e.pageY;
    dY *= -1;
    mousex = dX;
    mousey = dY;
    var x = strikerx, y = strikery;
    THETA = Math.atan2 ( dY - y, dX - x);
    e.preventDefault();
  };


  var keypress = function(e){
    if(e.keyCode==37){
      strikerx -=0.1;
      strikerx = Math.max(-1.4,strikerx);
    }
    if(e.keyCode==39){
      strikerx +=0.1;
      strikerx = Math.min(1.4,strikerx);
    }
  }
  window.addEventListener("keyup", keypress, false);
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

  /* ========== ========== */
  var circle_vertex2 = [];
    circle_vertex2.push(0);
    circle_vertex2.push(0);
    circle_vertex2.push(0);
    circle_vertex2.push(0.627450980392);
    circle_vertex2.push(0.321568627451);
    circle_vertex2.push(0.176470588235);

  for ( var i = 0; i < 360; i++){
    circle_vertex2.push(Math.cos(i));
    circle_vertex2.push(Math.sin(i));
    circle_vertex2.push(0);
    circle_vertex2.push(0.627450980392);
    circle_vertex2.push(0.321568627451);
    circle_vertex2.push(0.176470588235);
  }
  var CIRCLE_VERTEX2= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(circle_vertex2),
    GL.STATIC_DRAW);

  var circle_faces2 = [];

  for ( var i=0; i<360; i++){
    circle_faces2.push(0);
    circle_faces2.push(i);
    circle_faces2.push((i+1)%360);
  }

  var CIRCLE_FACES2= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(circle_faces2),
    GL.STATIC_DRAW);


  /*======================= THE CIRCLE =========================== */

  var circle_vertex = [];
    circle_vertex.push(0);
    circle_vertex.push(0);
    circle_vertex.push(0);
    circle_vertex.push(0.678431372549);
    circle_vertex.push(1);
    circle_vertex.push(0.18431372549);

  for ( var i = 0; i < 360; i++){
    circle_vertex.push(Math.cos(i));
    circle_vertex.push(Math.sin(i));
    circle_vertex.push(0);
    circle_vertex.push(0.678431372549);
    circle_vertex.push(1);
    circle_vertex.push(0.18431372549);
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

  var CIRCLE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(circle_faces),
    GL.STATIC_DRAW);

  /*======================= THE COINS =========================== */

  var coin_vertex = new Array(10);
  var coin_faces = new Array(10);
  var COIN_FACES = new Array(10);
  var COIN_VERTEX = new Array(10);
  var c1 = new Array(10);
  var c2 = new Array(10);
  var c3 = new Array(10);
  for ( var j = 0; j<9 ;j++){
    if( j < 4){
      c1[j]=1;
      c2[j]=1;
      c3[j]=1;
    }
    else if( j< 8){
      c1[j]=0;
      c2[j]=0;
      c3[j]=0;
    }
    else{
      c1[j]=1;
      c2[j]=0;
      c3[j]=1;
    }
  }
  for (var j = 0; j < 9; j++){
    coin_vertex[j] = [];
    coin_faces[j] = [];
    coin_vertex[j].push(0);
    coin_vertex[j].push(0);
    coin_vertex[j].push(0);
    coin_vertex[j].push(c1[j]);
    coin_vertex[j].push(c2[j]);
    coin_vertex[j].push(c3[j]);

    for ( var i = 0; i < 360; i++){
      coin_vertex[j].push(Math.cos(i));
      coin_vertex[j].push(Math.sin(i));
      coin_vertex[j].push(0);
      coin_vertex[j].push(c1[j]);
      coin_vertex[j].push(c2[j]);
      coin_vertex[j].push(c3[j]);
    }
    COIN_VERTEX[j] = GL.createBuffer ();
    GL.bindBuffer(GL.ARRAY_BUFFER, COIN_VERTEX[j]);
    GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(coin_vertex[j]),
    GL.STATIC_DRAW);


    for ( var i=0; i<360; i++){
      coin_faces[j].push(0);
      coin_faces[j].push(i);
      coin_faces[j].push((i+1)%360);
    }

    COIN_FACES[j] = GL.createBuffer ();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, COIN_FACES[j]);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(coin_faces[j]),
    GL.STATIC_DRAW);
    }
    


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
    -1,-1,0, 0.823529411765,0.705882352941,0.549019607843,
    1,-1,0,  0.823529411765,0.705882352941,0.549019607843,
    1,1,0,   0.823529411765,0.705882352941,0.549019607843,
    -1,1,0, 0.823529411765,0.705882352941,0.549019607843
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
  var CIRCLEMATRIX1=LIBS.get_I4();
  var CIRCLEMATRIX2=LIBS.get_I4();
  var CIRCLEMATRIX3=LIBS.get_I4();
  var CIRCLEMATRIX4=LIBS.get_I4();
  var MOVEMATRIX_TETRA=LIBS.get_I4();
  var VIEWMATRIX=LIBS.get_I4();
  var LINEMATRIX=LIBS.get_I4();
  var COINMATRIX = new Array(10);
  for ( var i = 0;i < 9; i++)
    COINMATRIX[i] = LIBS.get_I4();


  //var dX=(e.pageX)*2*Math.PI/CANVAS.width,
 // var dY=(e.pageY)*2*Math.PI/CANVAS.height;
  //console.log(e.pageY);

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
     /*======================== FOLLOW LINE ==========================*/
  
  var line2_vertex=[
    strikerx-0.01,strikery,0, 0.678431372549,1,0.18431372549,
    strikerx+0.01,strikery,0, 0.678431372549,1,0.18431372549,
    mousex-0.01,mousey,0,  0.678431372549,1,0.18431372549,
    mousex+0.01,mousey,0, 0.678431372549,1,0.18431372549   
  ]
  var LINE2_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, LINE2_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(line2_vertex),
    GL.STATIC_DRAW);

  var line2_faces = [
    0,1,2,
    1,2,3
  ];
  var LINE2_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE2_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(line2_faces),
    GL.STATIC_DRAW);

  if ( inmotion ){
    speed -= 0.01;
    speed = Math.max(0,speed);
    strikerx += (speed * Math.cos(iTHETA))/10;
    strikery += (speed * Math.sin(iTHETA))/10;
    if(strikerx >= 1.9 || strikerx <= -1.9){
      strikerx -= (speed * Math.cos(iTHETA))/10;
      iTHETA = Math.PI - iTHETA;
    }
    if(strikery >= 1.9 || strikery <= -1.9){
      strikery -= (speed * Math.sin(iTHETA))/10;
      iTHETA = -1 *iTHETA;
    }
    if(speed <= 0){
      speed = 0;
      inmotion = false;
      strikery = -1.6;
      strikerx = 0;
    }
  }

  for ( var i = 0; i< 9 ;i++){
    if(Math.sqrt(Math.pow(positionx[i]-1.86,2)+Math.pow(positiony[i]+1.86,2) <= 0.04))
      done[i] = true;

    if(Math.sqrt(Math.pow(positionx[i]-1.86,2)+Math.pow(positiony[i]-1.86,2) <= 0.04))
      done[i] = true;

    if(Math.sqrt(Math.pow(positionx[i]+1.86,2)+Math.pow(positiony[i]+1.86,2) <= 0.04))
      done[i] = true;

    if(Math.sqrt(Math.pow(positionx[i]+1.86,2)+Math.pow(positiony[i]-1.86,2) <= 0.04))
      done[i] = true;
    if(done[i]==true)
      positionx[i] = -4;
  }


  for ( var i = 0; i< 9 ;i++)
    if(cinmotion[i]){
      cspeed[i] -= 0.01;
      cspeed[i] = Math.max(0,cspeed[i]);
      positionx[i] += (cspeed[i] * Math.cos(ciTHETA[i]))/10;
      positiony[i] += (cspeed[i] * Math.sin(ciTHETA[i]))/10;
      if(positionx[i] >= 1.9 || positionx[i] <= -1.9){
        positionx[i] -= (cspeed[i] * Math.cos(ciTHETA[i]))/10;
        ciTHETA[i] = Math.PI - ciTHETA[i];
      }
      if(positiony[i] >= 1.9 || positiony[i] <= -1.9){
        positiony[i] -= (cspeed[i] * Math.sin(ciTHETA[i]))/10;
        ciTHETA[i] = -1 * ciTHETA[i];
      }
      if(speed <= 0){
        cspeed[i] = 0;
        cinmotion[i] = false;
        ciTHETA[i] = 0;
      }
    }

  for ( var i = 0; i < 9 ;i++){
    for ( var j = i+1;j<9;j++){
      if ( Math.sqrt(Math.pow(positionx[i] - positionx[j],2)+Math.pow(positiony[i]- positiony[j],2)) < 0.15){
        var linjoinangle = Math.atan2(positiony[i]-positiony[j],positionx[i] - positionx[j]);
        var sx,sy,cx,cy;
        cx = cspeed[i] * Math.cos(linjoinangle - ciTHETA[i] );
        cy = cspeed[i] * Math.sin(linjoinangle - ciTHETA[i] );
        sx = cspeed[j] * Math.cos(linjoinangle - ciTHETA[j] );
        sy = cspeed[j] * Math.sin(linjoinangle - ciTHETA[j] );
        console.log(cx,cy,sx,sy);
        ciTHETA[j] = Math.atan2(-1*sy*Math.cos(linjoinangle)+cx*Math.sin(linjoinangle),cx*Math.cos(linjoinangle)+sy*Math.sin(linjoinangle));
        ciTHETA[i] = Math.atan2(-1*cy*Math.cos(linjoinangle)+sx*Math.sin(linjoinangle),sx*Math.cos(linjoinangle)+cy*Math.sin(linjoinangle));
        cspeed[j] = Math.sqrt(cx*cx+sy*sy);
        cspeed[i] = Math.sqrt(sx*sx+cy*cy);
        cinmotion[i] = true;
        cinmotion[j] = true;
      }
    }
  }

  for ( var i = 0; i< 9 ;i++){
    if ( Math.sqrt(Math.pow(positionx[i] - strikerx,2)+Math.pow(positiony[i]-strikery,2)) < 0.2){
      var linjoinangle = Math.atan2(positiony[i]-strikery,positionx[i] - strikerx);
      var sx,sy,cx,cy;
      cx = cspeed[i] * Math.cos(linjoinangle - ciTHETA[i] );
      cy = cspeed[i] * Math.sin(linjoinangle - ciTHETA[i] );
      sx = speed * Math.cos(linjoinangle - iTHETA );
      sy = speed * Math.sin(linjoinangle - iTHETA );
      iTHETA = Math.atan2(-1*sy*Math.cos(linjoinangle)+cx*Math.sin(linjoinangle),cx*Math.cos(linjoinangle)+sy*Math.sin(linjoinangle));
      ciTHETA[i] = Math.atan2(-1*cy*Math.cos(linjoinangle)+sx*Math.sin(linjoinangle),sx*Math.cos(linjoinangle)+cy*Math.sin(linjoinangle));
      speed = Math.sqrt(cx*cx+sy*sy);
      cspeed[i] = Math.sqrt(sx*sx+cy*cy);
      cinmotion[i] = true;
    }
  }


    var dt=time-time_old;
    if (!drag) {
      dX*=AMORTIZATION, dY*=AMORTIZATION;
      THETA+=dX, PHI+=dY;
    }
    LIBS.set_I4(MOVEMATRIX_TETRA);
    LIBS.set_I4(MOVEMATRIX);
    LIBS.set_I4(LINEMATRIX);
    LIBS.set_I4(CIRCLEMATRIX);
    LIBS.set_I4(CIRCLEMATRIX1);
    LIBS.set_I4(CIRCLEMATRIX2);
    LIBS.set_I4(CIRCLEMATRIX3);
    LIBS.set_I4(CIRCLEMATRIX4);
    LIBS.set_I4(MOVEMATRIX2);
    LIBS.set_I4(MOVEMATRIX3);
    LIBS.set_I4(MOVEMATRIX4);

    for ( var i = 0; i < 9; i++){
      LIBS.set_I4(COINMATRIX[i]);
      LIBS.scaleX(COINMATRIX[i], 0.1);
      LIBS.scaleY(COINMATRIX[i], 0.1);
      LIBS.translateX(COINMATRIX[i], positionx[i]);
      LIBS.translateY(COINMATRIX[i], positiony[i]);
    }

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
    LIBS.translateX(CIRCLEMATRIX, strikerx);
    LIBS.translateY(CIRCLEMATRIX, strikery);

    LIBS.scaleX(CIRCLEMATRIX1,0.14);
    LIBS.scaleY(CIRCLEMATRIX1,0.14);
    LIBS.translateY(CIRCLEMATRIX1,-1.86);
    LIBS.translateX(CIRCLEMATRIX1,-1.86);

    LIBS.scaleX(CIRCLEMATRIX2,0.14);
    LIBS.scaleY(CIRCLEMATRIX2,0.14);
    LIBS.translateY(CIRCLEMATRIX2,1.86);
    LIBS.translateX(CIRCLEMATRIX2,-1.86);

    LIBS.scaleX(CIRCLEMATRIX3,0.14);
    LIBS.scaleY(CIRCLEMATRIX3,0.14);
    LIBS.translateY(CIRCLEMATRIX3,-1.86);
    LIBS.translateX(CIRCLEMATRIX3,1.86);

    LIBS.scaleX(CIRCLEMATRIX4,0.14);
    LIBS.scaleY(CIRCLEMATRIX4,0.14);
    LIBS.translateY(CIRCLEMATRIX4,1.86);
    LIBS.translateX(CIRCLEMATRIX4,1.86);    
    
    LIBS.scaleX(MOVEMATRIX_TETRA, 2);
    LIBS.scaleY(MOVEMATRIX_TETRA, 2);
    

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


  
    /*=========================== DRAW STRIKER =======================*/

    GL.uniformMatrix4fv(_Mmatrix, false, CIRCLEMATRIX);
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 360*3, GL.UNSIGNED_SHORT, 0);

    /*=========================== DRAW COINS =========================*/

    for (var i = 0; i<9; i++){
      if(done[i]) continue;
      GL.uniformMatrix4fv(_Mmatrix, false, COINMATRIX[i]);
      GL.bindBuffer(GL.ARRAY_BUFFER, COIN_VERTEX[i]);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, COIN_FACES[i]);

      GL.uniform1f(_greyscality, 1);
      GL.drawElements(GL.TRIANGLES, 360*3, GL.UNSIGNED_SHORT, 0);
    }
    if ( !inmotion ){
    GL.uniformMatrix4fv(_Mmatrix, false, LINEMATRIX);
    GL.bindBuffer(GL.ARRAY_BUFFER, LINE2_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE2_FACES);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 2*3, GL.UNSIGNED_SHORT, 0);
  }

    GL.uniformMatrix4fv(_Mmatrix, false, CIRCLEMATRIX1);
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2 );
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 360*3, GL.UNSIGNED_SHORT, 0);


    GL.uniformMatrix4fv(_Mmatrix, false, CIRCLEMATRIX2);
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2 );
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 360*3, GL.UNSIGNED_SHORT, 0);


    GL.uniformMatrix4fv(_Mmatrix, false, CIRCLEMATRIX3);
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2 );
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 360*3, GL.UNSIGNED_SHORT, 0);

    GL.uniformMatrix4fv(_Mmatrix, false, CIRCLEMATRIX4);
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2 );
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);

    GL.uniform1f(_greyscality, 1);
    GL.drawElements(GL.TRIANGLES, 360*3, GL.UNSIGNED_SHORT, 0);
    GL.flush();

    window.requestAnimationFrame(animate);
  };
  animate(0);
};