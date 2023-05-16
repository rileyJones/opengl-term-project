class Texture {
	constructor(src) {
		this.image = new Image();
		let texture = this
		this.tex = null;
		this.image.onload = function(){
			texture.tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture.tex);
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA,
				gl.RGBA, gl.UNSIGNED_BYTE, this);
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		this.image.src = src;

	}
}
