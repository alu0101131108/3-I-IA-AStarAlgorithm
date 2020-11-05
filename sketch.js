const boxsize = 10;
const cols = 50;
const rows = 50;
const wallProportion = 0.3;
var pencilSize = 0;
var pencilSizeLimit;
var grid;
var openSet;
var closeSet;
var start;
var end;
var path;
var status;

// Tags
const INIT = 0;
const WORKING = 1;
const SOLVED = 2;
const NOPATH = 3;



function removeFromArray(arr, elt) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == elt) {
            arr.splice(i, 1);
        }
    }
}

function heuristic(a, b) {
    // var d = sqrt(pow(b.i - a.i, 2) + pow(b.j - a.j, 2));
    var d = dist(a.i, a.j, b.i, b.j);    // Euclidean.
    // var d = abs(a.i - b.i) + abs(a.j - b.j);    // Manhattan.
    return d;
}

function resetDataStructures() {
    closeSet = [];
    openSet = [];
    path = [];
    grid = new Array(cols);
}

function drawGrid() {
    background(0);
    start.wall = false;
    end.wall = false;
    for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
            grid[i][j].show(color(255));
        }
    }
}

function checkPencil() {
    // Considering pencilSize = 0, the area converted into a wall will be a 1x1 pixel matrix,
    // where the clicked pixel is the center of that matrix.
    // Considering a bigger pencilSize this matrix would be bigger. PencilSize = 1: 2x2 ... etc.
    // topleft_ij and downright_ij represent the topleft and bottomright corner
    // displacement from center, which is the same for i and j.
    if (mouseIsPressed) {

        var topleft_ij = floor(pencilSize / 2) * -1;
        var downright_ij =  ceil(pencilSize / 2);
        var pressed_col = ceil(mouseX / boxsize) - 1;
        var pressed_row = ceil(mouseY / boxsize) - 1;

        if (mouseButton === LEFT) {
            for (var i = topleft_ij; i <= downright_ij; i++)
                for (var j = topleft_ij; j <= downright_ij; j++)
                    if (pressed_col + i >= 0 && pressed_col + i < cols && pressed_row + j >= 0 && pressed_row + j < rows)
                        grid[pressed_col + i][pressed_row + j].wall = true;

        }
        else {
            for (var i = topleft_ij; i <= downright_ij; i++)
                for (var j = topleft_ij; j <= downright_ij; j++)
                    if (pressed_col + i >= 0 && pressed_col + i < cols && pressed_row + j >= 0 && pressed_row + j < rows)
                        grid[pressed_col + i][pressed_row + j].wall = false;
        }
    }
}

function Spot(i, j) {
    this.i = i;
    this.j = j;
    this.f = 0;     // Total distance  f(x) = g(x) + h(x);
    this.g = 0;     // Distance from start to this spot.
    this.h = 0;     // Heuristic distance from spot to end.
    this.neighbors = [];
    this.previous = undefined;
    this.wall = false;

    this.show = function(col) {
        // fill(col);
        // if (this.wall) {
        //     fill(0);
        // }
        // noStroke(0);
        // rect(this.i * boxsize, this.j * boxsize, boxsize - 1, boxsize - 1);
        // circle(this.i * boxsize + boxsize / 2, this.j * boxsize + boxsize / 2, boxsize + 1);

        noStroke(0);
        if (this.wall) {
            fill(0);
            rect(this.i * boxsize, this.j * boxsize, boxsize - 1, boxsize - 1);
        }
        else {
            fill(col);
            circle(this.i * boxsize + boxsize / 2, this.j * boxsize + boxsize / 2, boxsize + 1);
        }
    }

    this.addNeighbors = function() {
        var i = this.i;
        var j = this.j;

        if (i < cols - 1) {
            this.neighbors.push(grid[i + 1][j]);
        }
        if (i > 0) {
            this.neighbors.push(grid[i - 1][j]);
        }
        if (j < rows - 1) {
            this.neighbors.push(grid[i][j + 1]);
        }
        if (j > 0) {
            this.neighbors.push(grid[i][j - 1]);
        }
    }

}

function keyPressed() {

    // Restart grid.
    if (keyCode == 82) {
        status = INIT;
        setup();
    }

    // Set pencil size (up and down).
    if (keyCode == 38) {
        pencilSize = constrain(pencilSize + 1, 0, pencilSizeLimit);
        console.log(pencilSize);
    }
    if (keyCode == 40) {
        pencilSize = constrain(pencilSize - 1, 0, pencilSizeLimit);
        console.log(pencilSize);
    }
    // Automatic wall set.
    if (keyCode == 65) {
        if (status == INIT) {
            for (var j = 0; j < rows; j++) {
                for (var i = 0; i < cols; i++) {
                    if (random(1) < wallProportion) {
                        grid[i][j].wall = true;
                    }
                    else {
                        grid[i][j].wall = false;
                    }
                }
            }
        }
        else {
            console.log("Search already started, can not override the grid values.");
        }
    }

    // Initiate A* Algorithm.
    if (keyCode == 83) {
        if (status == WORKING) {
            console.log("Algorithm currently running.");
        }
        status = WORKING;
    }

}

function setup() {
    createCanvas(boxsize * cols, boxsize * rows);
    resetDataStructures();

    // Init grid.
    for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
            if (j == 0) grid[i] = new Array(rows);
            grid[i][j] = new Spot(i, j);
        }
    }

    // Find Neighbors.
    for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
            grid[i][j].addNeighbors();
        }
    }

    status = INIT;
    pencilSizeLimit = min(cols, rows) - 1;
    start = grid[0][0];
    end = grid[cols - 1][rows - 1];

    openSet.push(start);
}

function AStarAlgorithm() {

    if (openSet.length > 0) {

        var winner = 0;
        for (var i = 0; i < openSet.length; i++) {
            if(openSet[i].f < openSet[winner].f) {
                winner = i;
            }
        }

        var current = openSet[winner];
        if (current === end) {
            status = SOLVED;
            console.log("Done!");
        }

        removeFromArray(openSet, current);
        closeSet.push(current);

        var neighbors = current.neighbors;
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];

            if (!closeSet.includes(neighbor) && neighbor.wall === false) {
                var tempG = current.g + 1;

                // Already evaluated and may have a better g score. Otherwise needs its g score to be updated.
                if (openSet.includes(neighbor)) {
                    if  (tempG < neighbor.g) {
                        neighbor.g = tempG;
                    }
                }
                // Not evaluated yet, so can directly get the new g score and be added to openSet.
                else {
                    neighbor.g = tempG;
                    openSet.push(neighbor);
                }

                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.previous = current;
            }
        }


    }
    else {
        status = NOPATH;
        console.log("No solution!");
    }

    background(0);

    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].show(color(255));
        }
    }

    for (var i = 0; i < closeSet.length; i++) {
        closeSet[i].show(color(255, 0, 0));
    }

    for (var i = 0; i < openSet.length; i++) {
        openSet[i].show(color(0, 255, 0));
    }


    // Find the path.
    if (status == WORKING || status == SOLVED) {
        path = [];
        var temp = current;
        path.push(temp);
        while (temp.previous) {
            path.push(temp.previous);
            temp = temp.previous;
        }

        for (var i = 0; i < path.length; i++) {
            path[i].show(color(0,0,255));
        }
    }

}

function draw() {
    if (status == INIT) {
        drawGrid();
        checkPencil();
    }
    if (status == WORKING) {
        AStarAlgorithm();
    }
}




// Disables context menu when right mouse button is clicked.
document.oncontextmenu = function() {
  return false;
}

// https://en.wikipedia.org/wiki/Flood_fill
