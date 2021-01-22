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

function getPixel(imageData, x, y) {
	if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
		return [-1, -1, -1, -1];  // impossible color
	} else {
		const offset = (y * imageData.width + x) * 4;
		return imageData.data.slice(offset, offset + 4);
	}
}

function setPixel(imageData, x, y, color) {
	const offset = (y * imageData.width + x) * 4;
	imageData.data[offset + 0] = color[0];
	imageData.data[offset + 1] = color[1];
	imageData.data[offset + 2] = color[2];
	imageData.data[offset + 3] = color[0];
}

function colorsMatch(a, b) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
function hexToRGB(hex) {

	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const a = parseInt(hex.slice(7, 9), 16);

	return [r, g, b, a];

}
function floodFill(ctx, x, y, fillColor) {
	// read the pixels in the canvas
	const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

	// get the color we're filling
	const targetColor = getPixel(imageData, x, y);

	// check we are actually filling a different color
	if (!colorsMatch(targetColor, fillColor)) {

		const pixelsToCheck = [x, y];
		while (pixelsToCheck.length > 0) {
			const y = pixelsToCheck.pop();
			const x = pixelsToCheck.pop();

			const currentColor = getPixel(imageData, x, y);
			if (colorsMatch(currentColor, targetColor)) {
				setPixel(imageData, x, y, fillColor);
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
function cRotate(cx, cy, x, y, angle) { // drawing canvas rotation
	let radians = (Math.PI / 180) * angle,
		cos = Math.cos(radians),
		sin = Math.sin(radians),
		nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
		ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
	return [nx, ny];
}

function rotate(x, y, angle) { // code canvas rotation
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
	let tb = [' '.repeat(max)];
	let lr = ' '.repeat(factor);
	grid = grid.map(x => x.join(''));
	grid = tb.concat(grid).concat(tb);
	grid = grid.map(x => Array.from(lr + x + lr));
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
		matches[i] = dirs['→↘↓↙←↖↑↗'.indexOf(matches[i])];
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
	let max_ops = parseInt(document.getElementById("max-ops").value);
	let completed_ops = 0;
	// Drawing Canvas variables:

	let dPos = [0, 0];  // canvas pointer position
	let dRot = 0; // pointer rotation in degrees from the positive x axis
	let dPtrCts = ["#ffffffff", 1];  // canvas pointer color and thickness (in px)
	let drawing = false;

	ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
	ctx.textAlign = "left";

	while (grid[cPos[0]][cPos[1]] != '⊗' || Math.max(...cPos) > 100) {
		let ch = grid[cPos[0]][cPos[1]];
		completed_ops += 1;
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
			let d = grid[cPos[0] + cStep[0]][cPos[1] + cStep[1]];
			switch (d) {
				case 'n':
					data += '\n';
					break;
				case 't':
					data += '\t';
					break;
				case 'r':
					data += '\r';
					break;
				default:
					data += d;
					break;
			}
			cPos = zipAdd(cPos, cStep);

		}
		else if (ch == '"' && parsString) {
			parsString = false;
			stack.push(data);
			data = "";
		}
		else if (parsString) {
			data += ch;
		}
		else if (!drawing) {
			if (1 + '→↘↓↙←↖↑↗'.indexOf(ch)) {
				cStep = dirs['→↘↓↙←↖↑↗'.indexOf(ch)];
			}
			else {
				switch (ch) {
					case '⟳':
						if (typeof stack[stack.length - 1] === "number") {
							cStep = rotate(cStep[0], cStep[1], Math.floor(stack.pop()));
							console.log(cStep);
						}
						else {
							cStep = rotate(cStep[0], cStep[1], 2);
						}
						break;
					case '⊛':
						cStep = dirs[Math.floor(Math.random() * dirs.length)];
						break;
					case '⊡':
						let dir = parseArrowString(stack.pop());
						let eva = stack.pop();
						let str = "";
						let tmPos = cPos;
						for (var i = 0; i < dir.length; i += 2) {
							let tStep = dir[i + 1];
							for (var j = 0; j < Number(dir[i]); j++) {
								tmPos = zipAdd(tStep, tmPos);
								if (typeof (grid[tmPos[0]] || [])[tmPos[1]] === "undefined") {
									grid = padAllSides(grid, 1);
									tmPos = zipAdd(tmPos, [1, 1]);
								}
								str += grid[tmPos[0]][tmPos[1]];

							}
						}
						if (eva) {
							//get the data, and add to stack
							let regex = /(\d+|"\D+")/g
							let match = regex.exec(str);
							let matches = [];
							while (match != null) {
								// matched text: match[0]
								// match start: match.index
								// capturing group n: match[n]
								matches.push(eval(match[0]));
								match = regex.exec(str);
							}
							console.log(str, matches);
							stack = stack.concat(matches);
						} else {
							stack.push(str);
						}
						console.log(str)
						break;
					case '⮺':
						let pos = parseArrowString(stack.pop());
						let w = stack.pop();
						let h = stack.pop();
						break;
					case '✎':

						let dira = parseArrowString(stack.pop());
						let print = (stack.pop()).toString();
						let c = 0;
						for (var i = 0; i < dira.length; i += 2) {
							let tStep = dira[i + 1];
							for (var j = 0; j < Number(dira[i]); j++) {
								cPos = zipAdd(cPos, tStep);
								if (typeof (grid[cPos[0]] || [])[cPos[1]] === "undefined") {
									grid = padAllSides(grid, 1);
									cPos = zipAdd([1, 1], cPos);
								}
								if (print[c]) {
									grid[cPos[0]][cPos[1]] = print[c];
									// console.log(cPos, print[c]);
									c++;
								}

							}
						}
						console.log(grid.toString());
						break;
					case '⋒':
						let bool = stack.pop();
						if (!bool) {
							cStep = rotate(cStep, 90);
						}
						break;
					case '꩜':
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
						break;
					case '≈':
						let top = stack.pop();
						if (typeof top === "number") {
							stack.push(String(top));
						}
						else {
							stack.push(Number(top));
						}
						break;
					case '+':
						let b = stack.pop();
						let a = stack.pop();
						stack.push(a + b);
						break;
					case '-':
						let d = stack.pop();
						let x = stack.pop();
						stack.push(x - d);
						break;
					case '×':
						let f = stack.pop();
						let e = stack.pop();
						let tb = typeof f;
						let ta = typeof e;
						if (tb == "number" && ta == "number") {
							stack.push(e * f);
						}
						else if (tb == "number" && ta == "string") {
							stack.push(e.repeat(f));
						}
						else if (ta == "number" && tb == "string") {
							stack.push(f.repeat(e));
						}
						break;
					case '÷':
						let dd = stack.pop();
						let dv = stack.pop();
						stack.push(dv / dd);
						break;
					case '¿':
						debug.innerHTML += "<b>Position:</b> " + String(cPos) + "\n\n";
						debug.innerHTML += "Grid:\n";
						console.log(grid.map(x => x.join('')).join("\n"));
						debug.innerHTML += grid.map(x => x.join('')).join("\n");
						debug.innerHTML += "\n\nStack:\n";
						debug.innerHTML += JSON.stringify(stack) + "\n\n";
						break;
					case '⩫':
						stack.push(input.shift());
						break;
					case '⌇': //curve
						let rad = parseArrowString(stack.pop());
						let dist = stack.pop();

						ctx.beginPath();
						ctx.moveTo(dPos[0], dPos[1]);
						let median = dPos;
						for (let i = 0; i < rad.length; i += 2) {
							median = zipAdd(median, rad[i + 1].map(x => x * rad[i]));
						}
						let rotated = cRotate(dPos[0], dPos[1], dPos[0] + dist, dPos[1], -dRot);

						let controlX = 2 * median[0] - dPos[0] / 2 - rotated[0] / 2;
						let controlY = 2 * median[1] - dPos[1] / 2 - rotated[1] / 2;
						ctx.quadraticCurveTo(controlX, controlY, rotated[0], rotated[1]);
						console.log(dPos, rotated);
						dPos = rotated;
						ctx.stroke();
						break;
					case '⌒': //TODO: curve
						break;
					case '⦚':
						let style = stack.pop();
						let color = stack.pop();
						ctx.font = style;
						ctx.fillStyle = color;
						ctx.strokeStyle = color;
						break;
					case '■': //freezes the browser for some reason
						let colr = stack.pop();
						floodFill(ctx, dPos[0], dPos[1], hexToRGB(colr));
					case '•':
						drawing = true;
						console.log("drawing");
						break;
				}
			}

		}
		else if (drawing) {
			if (1 + '→↘↓↙←↖↑↗'.indexOf(ch)) {
				dRot = rots['→↘↓↙←↖↑↗'.indexOf(ch)];
			}
			else {
				switch (ch) {
					case '•':
						drawing = false;
						console.log("Leaving drawing");
						break;
					case '✎':
						let data = stack.pop();
						if (typeof data == "number") {

							ctx.beginPath();
							ctx.moveTo(dPos[0], dPos[1]);
							let rotated = cRotate(dPos[0], dPos[1], dPos[0] + data, dPos[1], -dRot);
							ctx.lineTo(rotated[0], rotated[1]);
							// console.log(dPos, rotated, cmd, dRot);
							dPos = rotated;
							ctx.stroke();
						}
						else {
							ctx.save();
							ctx.translate(dPos[0], dPos[1]);
							ctx.rotate(dRot);
							ctx.font = (dPtrCts[1] * 12) + "px sans-serif";
							ctx.fillText(data, dPos[0], dPos[1]);
							ctx.restore();
						}
						break;
					case '⟳':
						dRot += Number(stack.pop());
						break;
					case '⊛':
						dRot = Math.floor(Math.random() * 360);
						break;
					case '⮺':
						let height = stack.pop();
						let width = stack.pop();
						let dirc = parseArrowString(stack.pop());
						let copyPos = cPos;
						for (let i = 0; i < dirc.length; i += 2) {
							copyPos = zipAdd(copyPos, dirc[i + 1].map(x => x * dirc[i]));
						}
						stack.push(ctx.getImageData(copyPos[0], copyPos[1], width, height));
						break;

				}
			}

		}
		cPos = zipAdd(cPos, cStep);
		if (completed_ops > max_ops) {
			return;
		}
	}
}


window.addEventListener('DOMContentLoaded', (event) => {
	// Setup keyboard
	let charset = `→|Right|d
←|Left|a
↑|Up|w
↓|Down|s
↖|UpLeft|q
↗|UpRight|e
↘|DownRight|c
↙|DownLeft|z
⟳|Rotate 90/Rotate 45*n|r
⊛|Random Direction|o
⊡|Execute Arrow String|x
⮺|Copy Area|t
✎|Write to Canvas|i
꩜|Warp|p
-
×|Multiply|-
÷|Divide|+
≈|Cast to String/Int|=
⋒|If/Else|:
-
⩫|Get Input|l
¿|Dump Debug data|?
⊗|End Program|\`
-
•|Convert to Drawing Command|.
⌇|Draw a curve|u
⌒|Draw an arc|0
⦚|Change Line Attributes|]
■|Paint Bucket|h`;
	let kb = document.getElementById("keyboard");
	let data = charset.split('\n');
	for (var i = 0; i < data.length; i++) {
		if (data[i] == "-") {
			kb.innerHTML += "<span class=\"spacer\"></span>"
		}
		else {
			let dat = data[i].split("|");
			kb.innerHTML += "<span class=\"key\" title=\"" + dat[1] + "\n` + " + dat[2] + "\">" + dat[0] + "</span>";
		}

	}
	document.querySelectorAll('.key').forEach(item => {

		item.addEventListener('click', event => {
			let box = document.getElementById("code");
			let val = box.value;
			let start = box.selectionStart;
			let end = box.selectionEnd;
			box.value = val.slice(0, start) + event.target.innerHTML + val.slice(end);
			console.log(event.target.innerHTML);
			box.selectionStart = start + 1;
			box.selectionEnd = start + 1;
			box.focus();

		})
	});
	let keys = charset.split('\n').filter(x => x != '-').map(x => x.split('|'));
	let codeBox = document.getElementById("code");
	let params = new URLSearchParams(window.location.search);
	let code = params.get("code") || "";
	let inp = params.get("input") || "";
	codeBox.value = decodeURIComponent(code);
	document.getElementById("input").value = decodeURIComponent(inp);


	codeBox.addEventListener("keypress", function (event) {
		let fun = function (event) {
			event.preventDefault();
			kb.style.background = "none";
			let trans = keys.map(x => x[2]);
			let box = document.getElementById("code");
			let val = box.value;
			let start = box.selectionStart;
			let end = box.selectionEnd;
			if (1 + trans.indexOf(event.key)) {
				box.value = val.slice(0, start) + keys[trans.indexOf(event.key)][0] + val.slice(end);
			}
			else {
				box.value = val.slice(0, start) + event.key + val.slice(end);
			}
			box.selectionStart = start + 1;
			box.selectionEnd = start + 1;
			box.focus();
			codeBox.removeEventListener("keypress", fun);
		}
		if (event.key == '`') {
			event.preventDefault();
			kb.style.background = "#222";

			codeBox.addEventListener("keypress", fun);

		}
		else {
			kb.style.background = "none";
			codeBox.removeEventListener("keypress", fun);
		}
	});

	// Setup canvas
	ctx.font = '16px Space Mono';
	ctx.textAlign = "center";
	ctx.fillStyle = "#ffffff";
	ctx.fillText('Output will appear here!', drawCanvas.width / 2, drawCanvas.height / 2);

	document.getElementById("permalink").addEventListener("click", function (e) {
		let code = document.getElementById("code").value;
		let input = document.getElementById("input").value;
		console.log(window.location.href);
		window.location.href = encodeURI(window.location.href.split('?')[0] + "?code=" + encodeURIComponent(code) + "&input=" + encodeURIComponent(input));


	});

	document.getElementById("execute").addEventListener("click", function (e) {
		grid = document.getElementById("code").value.split('\n');
		let max = Math.max(...grid.map(x => x.length));
		grid = grid.map(x => Array.from(x.padEnd(max)));
		console.log(grid);
		execute(grid);

	});
});



