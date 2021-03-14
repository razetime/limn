// ↓     →→↔→→  ↑↘   ↗↓  ↑↘  ↑
// ↓       ↑    ↑ ↘ ↗ ↓  ↑ ↘ ↑
// ↓       ↑    ↑  ↗  ↓  ↑  ↘↑
// ↳→→→  →→↔→→  ↑     ↓  ↑   ↘
// An esoteric language for drawing n stuff

// →←↑↓↖↗↘↙ for text grid movement
// 🡸🡺🡹🡻🡼🡽🡾🡿• for visual grid movement
// ⊗ to end the program.

// for directions →↘↓↙←↖↑↗
const dirs = [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1]
];

const rots = [0, 45, 90, 135, 180, 225, 270, 315];


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
    return dirs[(index + Math.floor(angle / 45)) % 8];
}

function getPoint(c1, c2, radius, angle) {
    return [c1 + Math.cos(angle) * radius, c2 + Math.sin(angle) * radius];
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
    let cPos = [0, 0]; // text pointer position
    let cStep = [0, 1]; // text pointer direction
    let debug = document.getElementById("console");
    debug.innerHTML = "";
    let input = document.getElementById("input").value.split("\n");
    let maxOps = parseInt(document.getElementById("max-ops").value);
    let completedOps = 0;

    // Drawing Canvas variables:
    let dPos = [0, 0]; // canvas pointer position
    let dRot = 0; // pointer rotation in degrees from the positive x axis
    let dPtrCts = ["#ffffffff", 1]; // canvas pointer color and thickness (in px)
    let drawing = false;
    let finalOrigin = [0, 0];
    let finalSize = [50, 50];

    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    ctx.textAlign = "left";

    while (grid[cPos[0]][cPos[1]] != '⊗') {
        let ch = grid[cPos[0]][cPos[1]];
        completedOps += 1;
        //Taking in data
        if (ch >= '0' && ch <= '9' && !parsInt && !parsString) {
            data += ch;
            parsInt = true;
        } else if (ch >= '0' && ch <= '9' && parsInt) {
            data += ch;
            // console.log("getting int");
        } else if (parsInt && (ch < '0' || ch > '9')) {
            parsInt = false;
            stack.push(Number(data));
            data = "";
            console.log("got int");
            cPos = zipAdd(cPos, cStep.map(x => -x));
        } else if (ch == '"' && !parsString) {
            parsString = true;
        } else if (ch == '\\' && parsString) { // Simple JS Escape support
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

        } else if (ch == '"' && parsString) {
            parsString = false;
            stack.push(data);
            data = "";
        } else if (parsString) {
            data += ch;
        } else if (ch == '¿') {
            debug.innerHTML += "<b>Position:</b> " + String(cPos) + "\n\n";
            debug.innerHTML += "Grid:\n";
            console.log(grid.map(x => x.join('')).join("\n"));
            debug.innerHTML += grid.map(x => x.join('')).join("\n");
            debug.innerHTML += "\n\nStack:\n";
            debug.innerHTML += JSON.stringify(stack) + "\n\n";
        } else if (!drawing) {
            if (1 + '→↘↓↙←↖↑↗'.indexOf(ch)) {
                cStep = dirs['→↘↓↙←↖↑↗'.indexOf(ch)];
            } else {
                switch (ch) {
                    case '⟳':
                        if (typeof stack[stack.length - 1] === "number") {
                            cStep = rotate(cStep[0], cStep[1], Math.floor(stack.pop()));
                            console.log(cStep);
                        } else {
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
                                if (typeof(grid[tmPos[0]] || [])[tmPos[1]] === "undefined") {
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
                    case '♼':
                        let w = stack.pop();
                        let h = stack.pop();
                        let cp = zipAdd(cPos, cStep);
                        let copy = new Array(h).fill(null).map(() => new Array(w).fill(null));
                        console.log(copy);
                        for (let i = cp[0]; i < cp[0] + h; i++) {
                            for (let j = cp[1]; j < cp[1] + w; j++) {
                                if (typeof(grid[i] || [])[j] === "undefined") {
                                    grid = padAllSides(grid, 1);
                                    cPos = zipAdd([1, 1], cPos);
                                    cp = zipAdd([1, 1], cp);
                                }
                                console.log(i, j);
                                copy[i - cp[0]][j - cp[1]] = grid[i][j];
                            }
                        }
                        stack.push(copy.map(row => row.join("")).join("\n"));
                        break;
                    case '✎':
                        let dira = parseArrowString(stack.pop());
                        let print = (stack.pop()).toString();
                        let c = 0;
                        for (var i = 0; i < dira.length; i += 2) {
                            let tStep = dira[i + 1];
                            for (var j = 0; j < Number(dira[i]); j++) {
                                cPos = zipAdd(cPos, tStep);
                                if (typeof(grid[cPos[0]] || [])[cPos[1]] === "undefined") {
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
                            cStep = rotate(cStep[0], cStep[1], 90);
                        }
                        break;
                    case '⌾':
                        let warpCoords = [];
                        for (var i = 0; i < grid.length; i++) {
                            for (var j = 0; j < grid[i].length; j++) {
                                if (grid[i][j] == '⌾' && i != cPos[0] && j != cPos[1]) {
                                    warpCoords.push([i, j]);
                                }
                            }
                        }
                        console.log(warpCoords)
                        let t = cPos;
                        cPos = zipAdd(cPos, cStep);
                        if (warpCoords.length == 0) {
                            cPos = [0, 0];
                        } else if (1 + '→←↑↓↖↗↘↙'.indexOf(grid[cPos[0]][cPos[1]])) {
                            spStep = dirs['→←↑↓↖↗↘↙'.indexOf(grid[cPos[0]][cPos[1]])];
                            while (grid[cPos[0]][cPos[1]] != '⌾') {
                                cPos = zipAdd(cPos, spStep);
                            }
                        } else {
                            let ncPos = t.map(x => -x);
                            let dists = warpCoords.map(y => (zipAdd(y, ncPos)).reduce((a, b) => a + b, 0));
                            cPos = warpCoords[dists.indexOf(Math.max(...dists))];
                        }
                        break;
                    case '≈':
                        let top = stack.pop();
                        if (typeof top === "number") {
                            stack.push(String(top));
                        } else {
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
                    case '%':
                        let p = stack.pop();
                        let q = stack.pop();
                        stack.push(q % p);
                        break;
                    case '×':
                        let f = stack.pop();
                        let e = stack.pop();
                        let tb = typeof f;
                        let ta = typeof e;
                        if (tb == "number" && ta == "number") {
                            stack.push(e * f);
                        } else if (tb == "number" && ta == "string") {
                            stack.push(e.repeat(f));
                        } else if (ta == "number" && tb == "string") {
                            stack.push(f.repeat(e));
                        }
                        break;
                    case '÷':
                        let dd = stack.pop();
                        let dv = stack.pop();
                        stack.push(dv / dd);
                        break;
                    case '⩫':
                        stack.push(input.shift());
                        break;
                    case '⌒': // non-circular curve
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
                    case '○': // arc
                        let radiuss = 2 * stack.pop();
                        let anglee = stack.pop();
                        let rota = cRotate(dPos[0], dPos[1], dPos[0] + radiuss, dPos[1], -dRot);
                        ctx.moveTo(rota[0], rota[1]);
                        ctx.beginPath();
                        console.log(rota, anglee);
                        //show the control points
                        // ctx.fillRect(rota[0], rota[1], 5, 5);
                        // ctx.fillRect(dPos[0], dPos[1], 5, 5);
                        ctx.arc(rota[0], rota[1], radiuss, toRadians(180 + dRot), toRadians(360 - 180 + dRot - anglee));
                        ctx.stroke();
                        dPos = getPoint(rota[0], rota[1], radiuss, toRadians(360 - 180 + dRot - anglee));
                        break;
                    case '⸗':
                        let style = stack.pop();
                        let color = stack.pop();
                        ctx.font = style;
                        ctx.fillStyle = color;
                        ctx.strokeStyle = color;
                        break;
                    case '◍': //freezes the browser for some reason, maybe i should wait a bit longer for the result.
                        let colr = stack.pop();
                        console.log(hexToRGB(colr));
                        let coler = hexToRGB(colr);
                        floodFill(ctx, dPos[0], dPos[1], coler);
                    case '•':
                        drawing = true;
                        console.log("drawing");
                        break;
                }
            }

        } else if (drawing) { //only used if delimited by •
            if (1 + '→↘↓↙←↖↑↗'.indexOf(ch)) {
                dRot = rots['→↘↓↙←↖↑↗'.indexOf(ch)];
            } else {
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
                            dPos = rotated;
                            ctx.stroke();
                        } else {
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
                    case '♼':
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
        if (completedOps > maxOps) {
            return;
        }
        finalOrigin = [Math.min(finalOrigin[0], dPos[0]), Math.min(finalOrigin[1], dPos[1])];
        finalSize = [Math.max(finalSize[0], dPos[0]), Math.max(finalSize[1], dPos[1])];
    }
    result = ctx.getImageData(...finalOrigin, ...finalSize);
    finalSize = [finalSize[0] - finalOrigin[0], finalSize[1] - finalOrigin[1]];
    console.log(finalSize, finalOrigin);
    drawCanvas.width = finalSize[0];
    drawCanvas.height = finalSize[1];
    ctx.putImageData(result, 0, 0);
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
♼|Copy Area|t
✎|Write to Canvas|i
⌾|Warp|p
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
•|Enter Drawing Mode|.
⌒|Draw a curve|u
○|Draw an arc|0
⸗|Change Line Attributes|]
◍|Paint Bucket|h`;
    let kb = document.getElementById("keyboard");
    let data = charset.split('\n');
    for (var i = 0; i < data.length; i++) {
        if (data[i] == "-") {
            kb.innerHTML += "<span class=\"spacer\"></span>"
        } else {
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


    codeBox.addEventListener("keypress", function(event) {
        let fun = function(event) {
            event.preventDefault();
            kb.style.background = "none";
            let trans = keys.map(x => x[2]);
            let box = document.getElementById("code");
            let val = box.value;
            let start = box.selectionStart;
            let end = box.selectionEnd;
            if (1 + trans.indexOf(event.key)) {
                box.value = val.slice(0, start) + keys[trans.indexOf(event.key)][0] + val.slice(end);
            } else {
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

        } else {
            kb.style.background = "none";
            codeBox.removeEventListener("keypress", fun);
        }
    });

    // Setup canvas
    ctx.font = '16px Space Mono';
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText('Output will appear here!', drawCanvas.width / 2, drawCanvas.height / 2);

    document.getElementById("permalink").addEventListener("click", function(e) {
        let code = document.getElementById("code").value;
        let input = document.getElementById("input").value;
        window.location.href = encodeURI(window.location.href.split('?')[0] + "?code=" + encodeURIComponent(code) + "&input=" + encodeURIComponent(input));
    });

    document.getElementById("execute").addEventListener("click", function(e) {
        grid = document.getElementById("code").value.split('\n');
        let max = Math.max(...grid.map(x => x.length));
        grid = grid.map(x => Array.from(x.padEnd(max)));
        execute(grid);
    });
});