class Controller {
    constructor() {
        this.nextFrame = {};
        this.currentFrame = {};
        this.previousFrame = {};
    }
    isKeyPressed(keyCode) {
        return !!this.currentFrame[keyCode] && !this.previousFrame[keyCode];
    }
    isKeyReleased(keyCode) {
        return !this.currentFrame[keyCode] && !!this.previousFrame[keyCode];
    }
    isKeyHeld(keyCode) {
        return !!this.currentFrame[keyCode];
    }
    press(keyCode) {
        this.nextFrame[keyCode] = true;
    }
    release(keyCode) {
    	this.nextFrame[keyCode] = false;
    }
    update() {
        if(this.previousFrame === undefined) return;
        this.previousFrame = JSON.parse(JSON.stringify(this.currentFrame));
        this.currentFrame = JSON.parse(JSON.stringify(this.nextFrame));
    }
}


let keyboardController = new Controller();

document.addEventListener('keyup', (e) => {
    keyboardController.release(e.code);
});
document.addEventListener('keydown', (e) => {
    keyboardController.press(e.code);
});
