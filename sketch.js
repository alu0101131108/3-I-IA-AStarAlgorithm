// video min: 36:42

function removeFromArray(arr, elt) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == elt) {
            arr.splice(i, 1);
        }
    }
}


var cols = 10;
var rows = 10;
var grid = new Array(cols);
var openSet = [];
var closeSet = [];
var start;
var end;


// Object creation.
function Spot(i, j) {
    this.i = i;
    this.j = j;
    this.f = 0;     // Total distance  f(x) = g(x) + h(x);
    this.g = 0;     // Distance from start to this spot.
    this.h = 0;     // Heuristic distance from spot to end.
    this.neighbors = [];

    this.show = function(col) {
        fill(col);
        noStroke(0);
        rect(this.i * w, this.j * h, w - 1, h - 1)
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

function setup() {
    createCanvas(500, 500);

    w = width / cols;
    h = height / rows;

    for (var i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    }

    for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
            grid[i][j] = new Spot(i, j);
        }
    }

    for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
            grid[i][j].addNeighbors();
        }
    }

    start = grid[0][0];
    end = grid[cols - 1][rows - 1];

    openSet.push(start);


    console.log(grid);
}

function draw() {
    if (openSet.length > 0) {

        var winner = 0;
        for (var i = 0; i < openSet.length; i++) {
            if(openSet[i].f < openSet[winner].f) {
                winner = i;
            }
        }

        var current = openSet[winner];
        if (current === openSet[end]) {
            console.log("Done!");
        }

        removeFromArray(openSet, current);
        closeSet.push(current);

        var neighbors = current.neighbors;
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
        }


    }
    else {
        // No solution
    }

    background(0);

    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].show(color(255));
        }
    }

    for (var i = 0; i < openSet.length; i++) {
        openSet[i].show(color(0, 255, 0));
    }

    for (var i = 0; i < closeSet.length; i++) {
        closeSet[i].show(color(0, 0, 255));
    }
}
