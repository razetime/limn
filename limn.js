// ↓     →→↔→→  ↑↘   ↗↓  ↑↘  ↑
// ↓       ↑    ↑ ↘ ↗ ↓  ↑ ↘ ↑
// ↓       ↑    ↑  ↗  ↓  ↑  ↘↑
// ↳→→→  →→↔→→  ↑     ↓  ↑   ↘
// An esoteric language for drawing n stuff

// →←↑↓↖↗↘↙ for text grid movement
// 🡸🡺🡹🡻🡼🡽🡾🡿• for visual grid movement
// ⊗ to end the program.

// Code Canvas variables:
let grid = [];     // code input
let deque = []; // code stack
let data = "" //holds the current scalar till it is fully parsed
let parsInt = false;
let parsString = false;
let cPos = [0, 0];  // text pointer position
let cPtrCts = "";   // text pointer contents
let cStep = [0, 1]; // text pointer direction

// Drawing Canvas variables:
let drawCanvas = document.getElementById("output");
let ctx = drawCanvas.getContext("2d");
let dPos = [0, 0];  // canvas pointer position
let dRot = 0; // pointer rotation in degrees
let dPtrCts = ["#ffffff00", 1];  // canvas pointer color and thickness (in px)

// Helper function for floodfill
function getPixel(pixelData, x, y) {
	if (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) {
		return -1;  // impossible color
	} else {
		return pixelData.data[y * pixelData.width + x];
	}
}

// floodfill function taken from Stack Overflow
function floodFill(ctx, x, y, fillColor) {
	// read the pixels in the canvas
	const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

	// make a Uint32Array view on the pixels so we can manipulate pixels
	// one 32bit value at a time instead of as 4 bytes per pixel
	const pixelData = {
		width: imageData.width,
		height: imageData.height,
		data: new Uint32Array(imageData.data.buffer),
	};

	// get the color we're filling
	const targetColor = getPixel(pixelData, x, y);

	// check we are actually filling a different color
	if (targetColor !== fillColor) {

		const pixelsToCheck = [x, y];
		while (pixelsToCheck.length > 0) {
			const y = pixelsToCheck.pop();
			const x = pixelsToCheck.pop();

			const currentColor = getPixel(pixelData, x, y);
			if (currentColor === targetColor) {
				pixelData.data[y * pixelData.width + x] = fillColor;
				pixelsToCheck.push(x + 1, y);
				pixelsToCheck.push(x - 1, y);
				pixelsToCheck.push(x, y + 1);
				pixelsToCheck.push(x, y - 1);
			}
		}

		// put the data back
		ctx.putImageData(imageData, 0, 0);
	}
}

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

function rotate(pt, angle) {
	let a = toRadians(angle)
	let c = Math.cos(a);
	let s = Math.sin(a);
	let x = pt[0];
	let y = pt[1];
	return [Math.floor(x * c + y * s), Math.floor(x * s + y * c)];
}

// returns a parsed arrow string for easy usage
function splitArrowString(directions) {
	let regex = /(\d+|\D+)/g
	let match = regex.exec(directions);
	let matches = [];
	while (match != null) {
		// matched text: match[0]
		// match start: match.index
		// capturing group n: match[n]
		matches.push(match[0]);
		match = regex.exec(directions);
	}
	return matches;
}

const zipAdd = (a, b) => a.map((k, i) => k + b[i]);

// for directions ←↑↓↖↗↘↙
const dirs = [[0, 1], [0, -1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, 1], [1, -1]];

// Execute Limn code
function execute() {
	while (grid[pos[0]][pos[1]] != '⊗') {
		let ch = grid[pos[0]][pos[1]];

		//Taking in data
		if (ch >= '0' && ch <= '9' && !parsInt && !parsString) {
			data += ch;
			parsInt = true;
		}
		else if (parsInt && ch < '0' && ch > '9') {
			deque.push(Number(data));
			data = "";
		}
		else if (ch == '"' && !parsString) {
			parsString = true;
		}
		else if (ch == '"' && parsString) {
			parsString = false;
			deque.push(data);
			data = "";
		}
		else if (parsString) {
			data += ch;
		}
		else {
			if ('→←↑↓↖↗↘↙'.indexOf(ch)) {
				step = dirs['→←↑↓↖↗↘↙'.indexOf(ch)];
			}
			if (ch == '⟳') {
				if (typeof deque[deque.length - 1] === "number") {
					step = rotate(step, 45 * Math.floor(deque.pop));
				}
				else {
					step = rotate(step, 90);
				}
			}
			if (ch == '⊛') {
				step = dirs[Math.floor(Math.random() * dirs.length)];
			}
			if (ch == '⊡') { //TODO

			}
			if (ch == '⮺') { //TODO
				if (typeof deque[deque.length - 1] === "number") {

				}
				else {
					console.log('invalid types for copy(⮺)')
				}
			}
			if (ch == '🖉') {

			}
		}

		pos = zipAdd(pos, step);

	}
}

document.getElementById("execute").addEventListener("click", function (e) {
	grid = document.getElementById("code").value.split('\n');
	let max = Math.max(...grid.map(x => x.length));
	grid = grid.map(x => x.padEnd(max));
	console.log(grid);
});

