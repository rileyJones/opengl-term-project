
const VERTEX_STRIDE = 12*4;

class Mesh {
    /** 
     * Creates a new mesh and loads it into video memory.
     * 
     * @param {WebGLRenderingContext} gl  
     * @param {number} program
     * @param {number[]} vertices
     * @param {number[]} indices
    */
    constructor( gl, program, vertices, indices ) {
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.indis = create_and_load_elements_buffer( gl, indices, gl.STATIC_DRAW );

        this.n_verts = vertices.length;
        this.n_indis = indices.length;
        this.program = program;
    }

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLingContext} gl 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     */

	static uv_sphere(gl, program, radius, theta, phi) {
		let verts = [];
		let indis = [];
		let base_vec = new Vec4(0, radius, 0);
		
		for(let t = 0; t < theta; t++) {
		    for(let p = 0; p < phi; p++) {
		        let new_vec = Mat4.rotation_xz(p/(phi-1)).mul(Mat4.rotation_yz(t/(theta-1)/2)).transform_vec(base_vec);
		        let norm_vec = new_vec.norm();
		        verts.push(new_vec.x);
		        verts.push(new_vec.y);
		        verts.push(new_vec.z);
		        verts.push(1.0);
		        verts.push(1.0);
		        verts.push(1.0);
		        verts.push(1.0);
		        verts.push(norm_vec.x);
		        verts.push(norm_vec.y);
		        verts.push(norm_vec.z);
		        verts.push(p/(phi-1));
		        verts.push(t/(theta-1));
		    }
		}
		for(let t = 1; t < theta; t++) {
		  for(let p = 1; p < phi; p++) {
		      indis.push((t-1)+(p-1)*theta);
		      indis.push((t)+(p)*theta);
		      indis.push((t)+(p-1)*theta);
		      
		      
		      indis.push((t-1)+(p)*theta);
		      indis.push((t)+(p)*theta);
		      indis.push((t-1)+(p-1)*theta);
		  }
		}

	    return new Mesh(gl, program, verts, indis);
	}
    static box( gl, program, width, height, depth ) {
        let hwidth = width / 2.0;
        let hheight = height / 2.0;
        let hdepth = depth / 2.0;

        let verts = [
            hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0,	0,0,0,     0.75, 0.50,
            -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0, 0,0,0,    0.50, 0.50,
            -hwidth, hheight, -hdepth,      0.0, 0.0, 1.0, 1.0, 0,0,0,    0.50, 0.25,
            hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0, 0,0,0,    0.75, 0.25,

            hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0,0,0,    1.00, 0.50,
            -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0,0,0,    0.25, 0.50,
            -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0, 0,0,0,    0.25, 0.25,
            hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0,0,0,    1.00, 0.25,
            
            hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0,0,0,    0.00, 0.50,
            -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0,0,0,    0.25, 0.50,
            -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0, 0,0,0,    0.25, 0.25,
            hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0,0,0,    0.00, 0.25,
            
            hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0, 0,0,0,    0.75, 0.75,
            -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0, 0,0,0,    0.50, 0.75,
            -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0, 0,0,0,    0.50, 0.00,
            hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0, 0,0,0,    0.75, 0.00,
        ];

        let indis = [
            0,  2,  3,  2,  0,  1,	// Frnt - GOOD
            4,  3,  7,  3,  4,  0,	// Rigt - GOOD
            9, 11, 10, 11,  9,  8,	// Back - GOOD
            1,  6,  2,  6,  1,  5,	// Left - GOOD
            3, 14, 15, 14,  3,  2,	// Top  - GOOD
            12, 1,  0,  1, 12, 13,	// Bott - GOOD
        ];

        return new Mesh( gl, program, verts, indis );
    }


    /**
     * Render the mesh. Does NOT preserve array/index buffer or program bindings! 
     * 
     * @param {WebGLRenderingContext} gl 
     */
    render( gl ) {
        gl.cullFace( gl.BACK );
        gl.enable( gl.CULL_FACE );
        
        gl.useProgram( this.program );
        gl.bindBuffer( gl.ARRAY_BUFFER, this.verts );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indis );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "coordinates", 
            this.verts, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 0 
        );

		/*
        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "color", 
            this.verts, 4, 
            gl.FLOAT, false, VERTEX_STRIDE, 3*4
        );
        */
        set_vertex_attrib_to_buffer(
            gl, this.program,
            "normal",
            this.verts, 3,
            gl.FLOAT, false, VERTEX_STRIDE, 7*4
        );
        
        set_vertex_attrib_to_buffer(
            gl, this.program,
            "uv",
            this.verts, 2,
            gl.FLOAT, false, VERTEX_STRIDE, 10*4
        );
        

        gl.drawElements( gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0 );
    }
    render_instanced( gl, count ) {
        gl.cullFace( gl.BACK );
        gl.enable( gl.CULL_FACE );
        
        gl.useProgram( this.program );
        gl.bindBuffer( gl.ARRAY_BUFFER, this.verts );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indis );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "coordinates", 
            this.verts, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 0 
        );

		/*
        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "color", 
            this.verts, 4, 
            gl.FLOAT, false, VERTEX_STRIDE, 3*4

        );
        */
        set_vertex_attrib_to_buffer(
            gl, this.program,
            "normal",
            this.verts, 3,
            gl.FLOAT, false, VERTEX_STRIDE, 7*4
        );
        
        set_vertex_attrib_to_buffer(
            gl, this.program,
            "uv",
            this.verts, 2,
            gl.FLOAT, false, VERTEX_STRIDE, 10*4
        );
        

        gl.drawElementsInstanced( gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0 , count);
    }

    /**
     * Parse the given text as the body of an obj file.
     * @param {WebGLRenderingContext} gl
     * @param {WebGLProgram} program
     * @param {string} text
     */
    static from_obj_text( gl, program, text ) {
        // create verts and indis from the text 	
	let verts = []
	let indis = []
	let lines = text.split(/\r?\n/);
	for(let x = 0; x < lines.length; x++ ) {
	  let line = lines[x];
	  line = line.trim();
	  let parts_of_line = line.split(/\s+/);
	  let style;
	  let i = 0;
	  for(i = 0; i < parts_of_line.length; i++) {
	    let part = parts_of_line[i];
	    if( i == 0) {
	      style = part;
	    } else {
	      switch(style) {
	        case 'v':
	          verts.push(parseFloat(part));
	          break;
	        case 'f':
	          indis.push(parseInt(part)-1);
	          break;
	      }
	    }
	  }
	  while(style == 'v' && i <= 7) {
	    if( i != 7) {
	      verts.push(0.8);
	    } else {
	      verts.push(1.0);
	    }
	    i++;
	  }
	}
        return new Mesh( gl, program, verts, indis );
    }

    /**
     * Asynchronously load the obj file as a mesh.
     * @param {WebGLRenderingContext} gl
     * @param {string} file_name 
     * @param {WebGLProgram} program
     * @param {function} f the function to call and give mesh to when finished.
     */
    static from_obj_file( gl, file_name, program, f ) {
        let request = new XMLHttpRequest();
        
        // the function that will be called when the file is being loaded
        request.onreadystatechange = function() {
            // console.log( request.readyState );

            if( request.readyState != 4 ) { return; }
            if( request.status != 200 ) { 
                throw new Error( 'HTTP error when opening .obj file: ', request.statusText ); 
            }

            // now we know the file exists and is ready
			// load the file 
            let loaded_mesh = Mesh.from_obj_text( gl, program, request.responseText );

            console.log( 'loaded ', file_name );
            f( loaded_mesh );
        };

        
        request.open( 'GET', file_name ); // initialize request. 
        request.send();                   // execute request
    }
}
