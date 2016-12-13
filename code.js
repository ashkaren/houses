
"use strict";

var gl, program, texture, vertices, texCoords, canvas, focal_length;
var fov = 60;
var texture, image;

var TR = [], RO = [];
var backProgram;

var pointsArray = [], textureCoords = [];
var objectPositions = [];
var currentlyPressedKeys = [];

window.onload = function init()
{
	
	RO = rotate(1, new vec4(0, 1, 0, 0));
	
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(1.0, 0.0, 1.0, 0.0 );

    //  Load shaders and initialize attribute buffers
    backProgram = initShaders( gl, "back-vertex-shader", "back-fragment-shader" );

    program = initShaders( gl, "vertex-shader", "fragment-shader" );


	window.addEventListener("keydown", function(event) {
		currentlyPressedKeys[event.keyCode] = true;
    });
    
    window.addEventListener("keyup", function(event) {
		currentlyPressedKeys[event.keyCode] = false;
    });
    
	initTexture();
	
   
   for (var i = -5; i < 4; i++) {
		for (var j = -5; j < 4; j++)
		{
			objectPositions.push(new vec4( i*3 , 0, j*3, 1));
		}
	}
   /*
	for(var i=0; i<50; i++)
	{
		objectPositions.push(new vec4( (Math.random() -.5) * 20 , 0, (Math.random() -.5) * 20, 1));
	}
	*/
   
   
   
	TR = new mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	RO = new mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

	place_objects();

	focal_length = 1;
    render();
};

function place_objects()
{
	pointsArray = [];
	textureCoords = [];
	for(var i=0;i<objectPositions.length;i++)
	{
		objectPositions[i] = vecMatMult(objectPositions[i], TR);
		objectPositions[i] = vecMatMult(objectPositions[i], RO);
		create_billboard(objectPositions[i]);
	}
}


function collision(){
   for(var k=0; k<objectPositions.length; k++)
   {
      var pos = objectPositions[k];
      var d = Math.pow((pos[0]),2)+ Math.pow((pos[2]),2);
      if(d<0.5&&pos[2]<0)
      {
         return true;
      }
   
   }
   return false;

};
 function create_billboard(position) 
 {
	
	var vertices = [ new vec4(-.5, -.5, .5, 1), new vec4(.5, -.5, .5, 1), new vec4(-.5, .5, .5, 1), new vec4(.5, -.5, .5, 1), new vec4(-.5, .5, .5, 1), new vec4(.5, .5, .5, 1)];
	var t = translate(position[0], 0, position[2]);

	for(var i=0; i<6; i++)
	{
		pointsArray.push(vecMatMult(vertices[i], t)); 
	}
	
	textureCoords.push(new vec2(0, 0), new vec2(1, 0), new vec2(0, 1), new vec2 (1, 0), new vec2(0, 1), new vec2(1, 1)); 

}

function vecMatMult(vec, mat) 
{ // this function multiplies a matrix with a vector, resulting in a vector 
	var res = vec4();
	res[0] = mat[0][0] * vec[0] + mat[0][1] * vec[1] + mat[0][2] * vec[2] + mat[0][3] * vec[3];
	res[1] = mat[1][0] * vec[0] + mat[1][1] * vec[1] + mat[1][2] * vec[2] + mat[1][3] * vec[3];
	res[2] = mat[2][0] * vec[0] + mat[2][1] * vec[1] + mat[2][2] * vec[2] + mat[2][3] * vec[3];
	res[3] = mat[3][0] * vec[0] + mat[3][1] * vec[1] + mat[3][2] * vec[2] + mat[3][3] * vec[3];
	return res;
}


function initTexture() 
{
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	texture.image = new Image();
	texture.image.src = "house.png";
	texture.image.onload = function() { 
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
}

function transform_geometry()
{
		for(var i=0;i<pointsArray.length;i++)
		{
			pointsArray[i] = vecMatMult(pointsArray[i], TR);
			pointsArray[i] = vecMatMult(pointsArray[i], RO);
		}
}

function handle_input()
{
	TR = new mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	RO = new mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	if(currentlyPressedKeys[87]==true && collision()==false)
	{
		TR = new mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.05, 0, 0, 0, 1);
	}
	if(currentlyPressedKeys[83]==true)
	{
		TR = new mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -0.05, 0, 0, 0, 1);
	}
	
	if(currentlyPressedKeys[65]==true)
	{
		//TR = new mat4(1, 0, 0, 0.02, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
		RO = rotate(-1, new vec4(0, 1, 0, 0));
	}
	if(currentlyPressedKeys[68]==true)
	{
		//TR = new mat4(1, 0, 0, -0.02, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
		RO = rotate(1, new vec4(0, 1, 0, 0));
	}
}

function render() 
{
    
    gl.useProgram(backProgram);
  
    gl.disable(gl.DEPTH_TEST);
	 var backVertices = [new vec2(1,0),new vec2(-1,0),new vec2(-1,1),
                        new vec2(-1,1),new vec2(1,1),new vec2(1,0),
                        new vec2(-1,0),new vec2(1,-1),new vec2(-1,-1),
                        new vec2(-1,0),new vec2(1,0),new vec2(1,-1)];
	 var backColors = [new vec4(1, 1, 1, 1),new vec4(1, 1, 1, 1),new vec4(0, 0, 1, 1),
                      new vec4(0, 0, 1, 1),new vec4(0, 0, 1, 1),new vec4(1, 1, 1, 1),
                      new vec4(1, 1, 1, 1),new vec4(0, 1, 0, 1),new vec4(0, 1, 0, 1),
                      new vec4(1, 1, 1, 1),new vec4(1, 1, 1, 1),new vec4(0, 1, 0, 1)];
	 
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );   
    gl.bufferData( gl.ARRAY_BUFFER, flatten(backVertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( backProgram, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(backColors),
                                gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( backProgram, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );     
    gl.drawArrays( gl.TRIANGLES, 0, 12);
	 
    gl.useProgram( program ); 
	 gl.enable(gl.DEPTH_TEST);
	 gl.blendFunc(gl.SRC_ALPHA , gl.ONE_MINUS_SRC_ALPHA);
	 gl.enable(gl.BLEND);
   	 handle_input();
   	 place_objects();
   	 collision();
   	 //detect_collisions();
	 var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	
    var texBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, texBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(textureCoords), gl.STATIC_DRAW );
    // Associate out shader variables with our data buffer
    var vTextureCoord = gl.getAttribLocation( program, "vTextureCoord" );
    gl.vertexAttribPointer( vTextureCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTextureCoord );
	
	
	var projection = perspective(fov, canvas.width/canvas.height, 0.001, 100);
	var address = gl.getUniformLocation(program, "projection");
	gl.uniformMatrix4fv(address, false, flatten(projection));

	address = gl.getUniformLocation(program, "rotation");
	gl.uniformMatrix4fv(address, false, flatten(RO));
	
	address = gl.getUniformLocation(program, "translation");
	gl.uniformMatrix4fv(address, false, flatten(TR));

    //gl.clear( gl.COLOR_BUFFER_BIT );
	//console.log(pointsArray.length + ", " + textureCoords.length);

    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length);
    requestAnimFrame( render );
	
}
