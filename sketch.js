const boxsize = 10;
const cols = 50;
const rows = 50;
const wallProportion = 0.3;
var grid;
var openSet;
var closeSet;
var start;
var end;
var path;

// Tags
const INIT = 0;
const WORKING = 1;
const SOLVED = 2;
const NOPATH = 3;

var status = INIT;



function removeFromArray(arr, elt) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == elt) {
            arr.splice(i, 1);
        }
    }
}

function heuristic(a, b) {
    // var d = sqrt(pow(b.i - a.i, 2) + pow(b.j - a.j, 2));
    // var d = dist(a.i, a.j, b.i, b.j);    // Euclidean.
    var d = abs(a.i - b.i) + abs(a.j - b.j);    // Manhattan.
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

// Cell creation.
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

    start = grid[0][0];
    end = grid[cols - 1][rows - 1];

    drawGrid();

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
        if (mouseIsPressed) {
            var pressed_col = constrain(ceil(mouseX / boxsize), 1, cols) - 1;
            var pressed_row = constrain(ceil(mouseY / boxsize), 1, rows) - 1;
            grid[pressed_col][pressed_row].wall = true;
        }
    }
    if (status == WORKING) {
        AStarAlgorithm();
    }
}

// https://en.wikipedia.org/wiki/Flood_fill
