// ↓     →→↔→→  ↑↘   ↗↓  ↑↘  ↑
// ↓       ↑    ↑ ↘ ↗ ↓  ↑ ↘ ↑
// ↓       ↑    ↑  ↗  ↓  ↑  ↘↑
// ↳→→→  →→↔→→  ↑     ↓  ↑   ↘
// An esoteric language for drawing n stuff

// →←↑↓↖↗↘↙ for text grid movement
// 🡸🡺🡹🡻🡼🡽🡾🡿• for visual grid movement
// ⊗ to end the program.


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

function padAllSides(grid, factor) {
	let max = Math.max(...grid.map(x => x.length));
	let tb = Array(factor).fill(' '.repeat(max));
	let lr = ' '.repeat(factor);
	grid = tb.concat(grid).concat(tb);
	grid = grid.map(x => lr + x + lr);

	return grid;
}

const zipAdd = (a, b) => a.map((k, i) => k + b[i]);

// for directions ←↑↓↖↗↘↙
const dirs = [[0, 1], [0, -1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, 1], [1, -1]];

// returns a parsed arrow string for easy usage
function parseArrowString(directions) {
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
	for (var i = 1; i < matches.length; i += 2) {
		matches[i] = dirs['→←↑↓↖↗↘↙'.indexOf(matches[i])];
	}
	return matches;
}

// Execute Limn code
function execute(grid) {
	// Code Canvas variables:
	let stack = []; // code stack
	let data = "" //holds the current scalar till it is fully parsed
	let parsInt = false;
	let parsString = false;
	let cPos = [0, 0];  // text pointer position
	let cStep = [0, 1]; // text pointer direction
	let warping = false;

	// Drawing Canvas variables:
	let drawCanvas = document.getElementById("output");
	let ctx = drawCanvas.getContext("2d");
	let dPos = [0, 0];  // canvas pointer position
	let dRot = 0; // pointer rotation in degrees
	let dPtrCts = ["#ffffff00", 1];  // canvas pointer color and thickness (in px)
	while (grid[cPos[0]][cPos[1]] != '⊗') {
		let ch = grid[cPos[0]][cPos[1]];

		//Taking in data
		if (ch >= '0' && ch <= '9' && !parsInt && !parsString) {
			data += ch;
			parsInt = true;
		}
		else if (ch >= '0' && ch <= '9' && parsInt) {
			data += ch;
			console.log("getting int");
		}
		else if (parsInt && (ch < '0' || ch > '9')) {
			parsInt = false;
			stack.push(Number(data));
			data = "";
			console.log("got int");

		}
		else if (ch == '"' && !parsString) {
			parsString = true;
		}
		else if (ch == '"' && parsString) {
			parsString = false;
			stack.push(data);
			data = "";
		}
		else if (parsString) {
			data += ch;
		}
		else {
			if (1 + '→←↑↓↖↗↘↙'.indexOf(ch)) {
				cStep = dirs['→←↑↓↖↗↘↙'.indexOf(ch)];
			}
			if (ch == '⟳') {
				if (typeof stack[stack.length - 1] === "number") {
					cStep = rotate(step, 45 * Math.floor(stack.pop));
				}
				else {
					cStep = rotate(step, 90);
				}
			}
			if (ch == '⊛') {
				cStep = dirs[Math.floor(Math.random() * dirs.length)];
			}
			if (ch == '⊡') {
				let dirs = parseArrowString(stack.pop());
				let fac = Math.max(...dirs.flat());
				let str = "";
				let phCursor = zipAdd(cPos, [fac, fac]);
				grid = padAllSides(grid, fac);
				for (var i = 0; i < dirs.length; i += 2) {
					let tStep = dirs[i + 1];
					for (var j = 0; j < Number(dirs[i]); j++) {
						str += grid[phCursor[0]][phCursor[1]];
						phCursor = zipAdd(tStep, phCursor);
					}
				}

				//get the data, and add to stack
				let regex = /(\d+|"\D+")/g
				let match = regex.exec(str);
				let matches = [];
				while (match != null) {
					// matched text: match[0]
					// match start: match.index
					// capturing group n: match[n]
					matches.push(match[0]);
					match = regex.exec(str);
				}
				console.log(str, matches);
				stack = stack.concat(matches);

			}
			if (ch == '⮺') { //TODO
				console.log("Idk what to do with ⮺ yet");
			}
			if (ch == '🖉') {
				let dirs = parseArrowString(stack.pop());
				let print = String(stack.pop());
				let c = 0;
				cPos = zipAdd(cPos, step);
				for (var i = 0; i < dirs.length; i += 2) {
					let tStep = dirs[i + 1];
					for (var j = 0; j < Number(dirs[i]); j++) {
						grid[cPos[0]][cPos[1]] = print[c];
						c++;
					}
				}
			}
			if (ch == '⋒') {
				let bool = stack.pop();
				if (!bool) {
					cStep = rotate(cStep, 90);
				}
			}
			if (ch == '꩜') {
				let warpCoords = [];
				for (var i = 0; i < grid.length; i++) {
					for (var j = 0; j < grid[i].length; j++) {
						if (grid[i][j] == '꩜' && i != cPos[0] && j != cPos[1]) {
							warpCoords.push([i, j]);
						}
					}
				}
				console.log(warpCoords)
				let t = cPos;
				cPos = zipAdd(cPos, cStep);
				if (warpCoords.length == 0) {
					cPos = [0, 0];
				}
				else if (1 + '→←↑↓↖↗↘↙'.indexOf(grid[cPos[0]][cPos[1]])) {
					spStep = dirs['→←↑↓↖↗↘↙'.indexOf(grid[cPos[0]][cPos[1]])];
					while (grid[cPos[0]][cPos[1]] != '꩜') {
						cPos = zipAdd(cPos, spStep);
					}
				}
				else {
					let ncPos = t.map(x => -x);
					let dists = warpCoords.map(y => (zipAdd(y, ncPos)).reduce((a, b) => a + b, 0));
					cPos = warpCoords[dists.indexOf(Math.max(...dists))];
				}

			}
		}

		cPos = zipAdd(cPos, cStep);
		console.log(grid, stack, data);

	}
}

document.getElementById("execute").addEventListener("click", function (e) {
	grid = document.getElementById("code").value.split('\n');
	let max = Math.max(...grid.map(x => x.length));
	grid = grid.map(x => x.padEnd(max));
	console.log(grid);
	execute(grid);

});

