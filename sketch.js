var boxsize = 10;
var cols = 150;
var rows = 50;
var wallProportion = 0.3;
var grid = new Array(cols);
var openSet = [];
var closeSet = [];
var start;
var end;
var boxsize, h;
var path = [];
var noSolution = false;


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

// Object creation.
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
        fill(col);
        if (this.wall) {
            fill(0);
        }
        noStroke(0);
        rect(this.i * boxsize, this.j * boxsize, boxsize - 1, boxsize - 1)
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
    createCanvas(boxsize * cols, boxsize * rows);

    for (var i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    }

    for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
            grid[i][j] = new Spot(i, j);
            if (random() < wallProportion) {
                grid[i][j].wall = true;
            }
        }
    }

    for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
            grid[i][j].addNeighbors();
        }
    }

    start = grid[0][0];
    end = grid[cols - 1][rows - 1];

    start.wall = false;
    end.wall = false;

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
        if (current === end) {
            noLoop();
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
        noSolution = true;
        console.log("No solution!");
        noLoop();
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
    if (!noSolution) {
        path = [];
        var temp = current;
        path.push(temp);
        while (temp.previous) {
            path.push(temp.previous);
            temp = temp.previous;
        }
    }

    for (var i = 0; i < path.length; i++) {
        path[i].show(color(0,0,255));
    }

}
