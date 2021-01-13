// ↓     →→↔→→  ↑↘   ↗↓  ↑↘  ↑
// ↓       ↑    ↑ ↘ ↗ ↓  ↑ ↘ ↑
// ↓       ↑    ↑  ↗  ↓  ↑  ↘↑
// ↳→→→  →→↔→→  ↑     ↓  ↑   ↘
// An esoteric language for drawing n stuff

// →←↑↓↖↗↘↙ for text grid movement
// 🡸🡺🡹🡻🡼🡽🡾🡿• for visual grid movement
// ⊗ to end the program.

// for directions →↘↓↙←↖↑↗
const dirs = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];

const rots = [0, 45, 90, 135, 180, 225, 270, 315];

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

// from https://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
function rotate(cx, cy, x, y, angle) { // drawing canvas rotation
	let radians = (Math.PI / 180) * angle,
		cos = Math.cos(radians),
		sin = Math.sin(radians),
		nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
		ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
	return [nx, ny];
}

function cRotate(x, y, angle) { // code canvas rotation
	let index = -1;
	for (var i = 0; i < dirs.length; i++) {
		if (dirs[i][0] == x && dirs[i][1] == y) {
			index = i;
			break;
		}
	}
	return dirs[(index + angle) % 8];
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
		matches[i - 1] = Number(matches[i - 1]);
		matches[i] = dirs['→←↑↓↖↗↘↙'.indexOf(matches[i])];
	}
	return matches;
}

// Execute Limn code
let drawCanvas = document.getElementById("output");
let ctx = drawCanvas.getContext("2d");
function execute(grid) {
	// Code Canvas variables:
	let stack = []; // code stack
	let data = "" //holds the current scalar till it is fully parsed
	let parsInt = false;
	let parsString = false;
	let cPos = [0, 0];  // text pointer position
	let cStep = [0, 1]; // text pointer direction
	let debug = document.getElementById("console");
	debug.innerHTML = "";
	let input = document.getElementById("input").value.split("\n");

	// Drawing Canvas variables:

	let dPos = [0, 0];  // canvas pointer position
	let dRot = 0; // pointer rotation in degrees from the positive x axis
	let dPtrCts = ["#ffffffff", 1];  // canvas pointer color and thickness (in px)

	ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

	while (grid[cPos[0]][cPos[1]] != '⊗') {
		let ch = grid[cPos[0]][cPos[1]];

		//Taking in data
		if (ch >= '0' && ch <= '9' && !parsInt && !parsString) {
			data += ch;
			parsInt = true;
		}
		else if (ch >= '0' && ch <= '9' && parsInt) {
			data += ch;
			// console.log("getting int");
		}
		else if (parsInt && (ch < '0' || ch > '9')) {
			parsInt = false;
			stack.push(Number(data));
			data = "";
			console.log("got int");
			cPos = zipAdd(cPos, cStep.map(x => -x));

		}
		else if (ch == '"' && !parsString) {
			parsString = true;
		}
		else if (ch == '\\' && parsString) { // Standard JS Escape support
			data += grid[cPos[0] + cStep[0]][cPos[1] + cStep[1]];
			cPos = zipAdd(cPos, cStep.map(x => 2 * x));
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
			if (1 + '→↘↓↙←↖↑↗'.indexOf(ch)) {
				cStep = dirs['→↘↓↙←↖↑↗'.indexOf(ch)];
			}
			if (ch == '⟳') {
				if (typeof stack[stack.length - 1] === "number") {
					cStep = cRotate(cStep[0], cStep[1], Math.floor(stack.pop()));
					console.log(cStep);
				}
				else {
					cStep = cRotate(cStep[0], cStep[1], 2);
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
				console.log("Drawing");
				let dirs = parseArrowString(stack.pop());
				let print = (stack.pop()).toString();
				console.log(dirs, print);
				let c = 0;
				cPos = zipAdd(cPos, cStep);
				for (var i = 0; i < dirs.length; i += 2) {
					let tStep = dirs[i + 1];
					for (var j = 0; j < Number(dirs[i]); j++) {
						if (typeof (grid[cPos[0]] || [])[cPos[1]] === "undefined") {
							grid = padAllSides(grid, 1);
						}
						grid[cPos[0]][cPos[1]] = print[c];
						console.log(cPos, print[c]);
						c++;
						cPos = zipAdd(cPos, tStep);
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
			if (ch == '≈') {
				let top = stack.pop();
				if (typeof top === "number") {
					stack.push(String(top));
				}
				else {
					stack.push(Number(top));
				}
			}
			if (ch == '+') {
				let b = stack.pop();
				let a = stack.pop();
				stack.push(a + b);
			}
			if (ch == '-') {
				let b = stack.pop();
				let a = stack.pop();
				stack.push(a - b);
			}
			if (ch == '×') {
				let b = stack.pop();
				let a = stack.pop();
				let tb = typeof b;
				let ta = typeof a;
				if (tb == "number" && ta == "number") {
					stack.push(a * b);
				}
				else if (tb == "number" && ta == "string") {
					stack.push(a.repeat(b));
				}
				else if (ta == "number" && tb == "string") {
					stack.push(b.repeat(a));
				}
			}
			if (ch == '÷') {
				let b = stack.pop();
				let a = stack.pop();
				stack.push(a / b);
			}
			if (ch == '¿') { // Debug stats
				debug.innerHTML += "<b>Position:</b> " + String(cPos) + "\n\n";
				debug.innerHTML += "Grid:\n";
				console.log(grid.map(x => x.join('')).join("\n"));
				debug.innerHTML += grid.map(x => x.join('')).join("\n");
				debug.innerHTML += "\n\nStack:\n";
				debug.innerHTML += JSON.stringify(stack) + "\n\n";
			}
			if (ch == '⩫') {
				stack.push(input.shift());
			}
			if (ch == '🞜') {
				let cmd = grid[cPos[0] + cStep[0]][cPos[1] + cStep[1]];
				if (1 + '→↘↓↙←↖↑↗'.indexOf(cmd)) {
					dRot = rots['→↘↓↙←↖↑↗'.indexOf(cmd)];
				}
				if (cmd == '🖉') {
					let data = stack.pop();
					if (typeof data == "number") {
						ctx.beginPath();
						ctx.moveTo(dPos[0], dPos[1]);
						let rotated = rotate(dPos[0], dPos[1], dPos[0] + data, dPos[1], -dRot);
						ctx.lineTo(rotated[0], rotated[1]);
						console.log(rotated, cmd, dRot);
						dPos = zipAdd(dPos, rotated);
						ctx.stroke();
					}
				}
				cPos = zipAdd(cPos, cStep);

			}
		}

		cPos = zipAdd(cPos, cStep);
		console.log(cPos);

	}
}


window.addEventListener('DOMContentLoaded', (event) => {
	// Setup keyboard
	let charset = `→|Right
←|Left
↑|Up
↓|Down
↖|UpLeft
↗|UpRight
↘|DownRight
↙|DownLeft
⟳|Rotate 90/Rotate 45*n
⊛|Random Direction
⊡|Execute Arrow String
⮺|Copy Area
🖉|Write to Canvas
꩜|Warp
-
×|Multiply
÷|Divide
≈|Cast to String/Int
⋒|If/Else
-
⩫|Get Input
¿|Dump Debug data
⊗|End Program
-
🞜|Convert to Drawing Command
⌒|Draw a curve
⦚|Change Line Attributes
■|Paint Bucket`;
	let kb = document.getElementById("keyboard");
	let data = charset.split('\n');
	for (var i = 0; i < data.length; i++) {
		if (data[i] == "-") {
			kb.innerHTML += "<span class=\"spacer\"></span>"
		}
		else {
			let dat = data[i].split("|");
			kb.innerHTML += "<span class=\"key\" title=\"" + dat[1] + "\">" + dat[0] + "</span>";
		}

	}
	document.querySelectorAll('.key').forEach(item => {

		item.addEventListener('click', event => {
			let box = document.getElementById("code");
			let val = box.value;
			let start = box.selectionStart;
			let end = box.selectionEnd;
			box.value = val.slice(0, start) + event.target.innerHTML + val.slice(end);
			box.selectionStart = start + 1;
			box.selectionEnd = start + 1;
			box.focus();

		})
	});

	// Setup canvas
	ctx.font = '16px Space Mono';
	ctx.textAlign = "center";
	ctx.fillStyle = "#ffffff";
	ctx.fillText('Output will appear here!', drawCanvas.width / 2, drawCanvas.height / 2);


	document.getElementById("execute").addEventListener("click", function (e) {
		grid = document.getElementById("code").value.split('\n');
		let max = Math.max(...grid.map(x => x.length));
		grid = grid.map(x => Array.from(x.padEnd(max)));
		console.log(grid);
		execute(grid);

	});
});



