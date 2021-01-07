// ↓     →→↔→→  ↑↘   ↗↓  ↑↘  ↑
// ↓       ↑    ↑ ↘ ↗ ↓  ↑ ↘ ↑
// ↓       ↑    ↑  ↗  ↓  ↑  ↘↑
// ↳→→→  →→↔→→  ↑     ↓  ↑   ↘
// An esoteric language for drawing n stuff

// →←↑↓↖↗↘↙ for text grid movement
// 🡸🡺🡹🡻🡼🡽🡾🡿• for visual grid movement
// ⊗ to end the program.

let grid = [];     // code input
let deque = []; // code stack
let data = "" //holds the current scalar till it is fully parsed
let cPos = [0, 0];  // text pointer position
let cPtrCts = "";   // text pointer contents
let cStep = [0, 1]; // text pointer direction
let dPos = [0, 0];  // canvas pointer position
let dRot = 0; // pointer rotation in degrees
let dPtrCts = ["#ffffff00", 1];  // canvas pointer color and thickness (in px)

document.getElementById("execute").addEventListener("click", function (e) {

});

const zip = (a, b) => a.map((k, i) => k + b[i]);
// for directions ←↑↓↖↗↘↙
const dirs = [[0, 1], [0, -1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, 1], [1, -1]];

// Execute Limn code
function execute() {
	while (grid[pos[0]][pos[1]] != '⊗') {
		let ch = grid[pos[0]][pos[1]];
		// change direction
		if ('→←↑↓↖↗↘↙'.indexOf(ch)) {
			step = dirs['→←↑↓↖↗↘↙'.indexOf(ch)];
		}

		pos = zipAdd(pos, step);

	}


}

