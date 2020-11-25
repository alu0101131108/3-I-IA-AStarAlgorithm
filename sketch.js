// Default values.
var cols = 30;
var rows = 30;
var wallProportion = 0.3;
var boxsize = 15;
var heuristicMode = 1;            // 0: Euclidean Distance    1: Manhattan Distance.
var pencilSize = 0;
var pencilSizeLimit;
var grid;
var openSet;
var closeSet;
var start;
var end;
var path;
var status;
var counter = 0;

// Tags
const INIT = 0;
const WORKING = 1;
const SOLVED = 2;
const NOPATH = 3;

function count() {
    counter++;
    // console.log(counter);
}

function removeFromArray(arr, elt) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == elt) {
            arr.splice(i, 1);
        }
    }
}

function heuristic(a, b) {
    var d;
    switch (heuristicMode) {
        case 0:     // Euclidean.
            d = dist(a.i, a.j, b.i, b.j);       // Same as: sqrt(pow(b.i - a.i, 2) + pow(b.j - a.j, 2));
            break;
        case 1:     // Manhattan.
            d = abs(a.i - b.i) + abs(a.j - b.j);
            break;
        default:
            d = dist(a.i, a.j, b.i, b.j);
            break;
    }
    return d;
}

function resetDataStructures() {
    closeSet = [];
    openSet = [];
    path = [];
    grid = new Array(cols);
}

function showFrame() {
    background(0);

    // Non analized spots.
    for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
            grid[i][j].show(color(255));
        }
    }

    // Close set.
    for (var i = 0; i < closeSet.length; i++) {
        closeSet[i].show(color(255, 0, 0));
    }

    // Open set.
    for (var i = 0; i < openSet.length; i++) {
        openSet[i].show(color(0, 255, 0));
    }

    // Path.
    for (var i = 0; i < path.length; i++) {
        path[i].show(color(0,0,255));
    }

    start.show(color(0, 117, 27));
    end.show(color(61, 0, 0));

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
        start.wall = false;
        end.wall = false;
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

    // Show current values.
    if (keyCode == 96) {
        console.clear();
        console.log("Current values:");
        console.log("\tColumns: " + cols);
        console.log("\tRows: " + rows);
        console.log("\tSize: " + boxsize);
        console.log("\tWall proportion: " + wallProportion);
        console.log("\tWall pencil size: " + pencilSize);
    }

    // Initial config options.
    if (status == INIT) {
        // Set pencil size (bigger).
        if (keyCode == 38) {
            pencilSize = constrain(pencilSize + 1, 0, pencilSizeLimit);
            console.log("Wall pencil size: " + pencilSize);
        }
        // Set pencil size (smaller).
        if (keyCode == 40) {
            pencilSize = constrain(pencilSize - 1, 0, pencilSizeLimit);
            console.log("Wall pencil size: " + pencilSize);
        }

        // Set grid width (bigger).
        if (keyCode == 102) {
            cols += 1;
            console.log("Added one column.");
            setup();
        }
        // Set grid width (smaller).
        if (keyCode == 100) {
            cols -= 1;
            console.log("Removed one column.");
            setup();
        }
        // Set grid height (bigger).
        if (keyCode == 98) {
            rows += 1;
            console.log("Added one row.");
            setup();
        }
        // Set grid width (smaller).
        if (keyCode == 104) {
            rows -= 1;
            console.log("Removed one column.");
            setup();
        }

        // Set boxsize (bigger).
        if (keyCode == 105) {
            boxsize += 1;
            console.log("Grid size: " + boxsize);
            setup();
        }
        // Set boxsize (smaller).
        if (keyCode == 103) {
            boxsize -= 1;
            console.log("Grid size: " + boxsize);
            setup();
        }

        // Set wall proportion (smaller).
        if (keyCode == 97) {
            wallProportion -= 0.1;
            console.log("Wall proportion: " + wallProportion);
        }
        // Set wall proportion (bigger).
        if (keyCode == 99) {
            wallProportion += 0.1;
            console.log("Wall proportion: " + wallProportion);
        }

        // Set size default values.
        if (keyCode == 101) {
            cols = 30;
            rows = 30;
            boxsize = 15;
            wallProportion = 0.3;
            pencilSize = 0;
            console.log("Values set to default");
            setup();
        }


        // Automatic wall set.
        if (keyCode == 65) {
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
            start.wall = false;
            end.wall = false;
        }

        // Initiate A* Algorithm.
        if (keyCode == 83) {
            counter = 0;
            setInterval(count, 1);    //  Init counter and increment it each 100 miliseconds.
            openSet.push(start);
            status = WORKING;
        }

        // Change heuristic function.
        if (keyCode == 72) {
            if (heuristicMode == 0) {
                heuristicMode = 1;
                console.log("Heuristic: Manhattan.");
            }
            else {
                heuristicMode = 0;
                console.log("Heuristic: Euclidean.");
            }
        }

        // Set Initial spot.
        if (keyCode == 73) {
            var pressed_col = ceil(mouseX / boxsize) - 1;
            var pressed_row = ceil(mouseY / boxsize) - 1;
            if (pressed_col >= 0 && pressed_col < cols && pressed_row >= 0 && pressed_row < rows) {
                start = grid[pressed_col][pressed_row];
                start.wall = false;
                console.log("Start point set at: (" + pressed_col + ", " + pressed_row + ").");
            }
        }

        // Set Ending spot.
        if (keyCode == 69) {
            var pressed_col = ceil(mouseX / boxsize) - 1;
            var pressed_row = ceil(mouseY / boxsize) - 1;
            if (pressed_col >= 0 && pressed_col < cols && pressed_row >= 0 && pressed_row < rows) {
                end = grid[pressed_col][pressed_row];
                end.wall = false;
                console.log("Ending point set at: (" + pressed_col + ", " + pressed_row + ").");
            }
        }
    }
    else {
        console.log("Search already started.");
    }
}

function setup() {
    let canvas = createCanvas(boxsize * cols, boxsize * rows);
    canvas.style("border: 5px solid black; margin: 20px");
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
}

function AStarAlgorithm() {

    if (openSet.length > 0) {

        // Find the node in openSet with lowest f score. Will be stored at openSet[winner].
        var winner = 0;
        for (var i = 0; i < openSet.length; i++) {
            if(openSet[i].f < openSet[winner].f) {
                winner = i;
            }
        }

        var current = openSet[winner];

        // May have reached the end.
        if (current === end) {
            status = SOLVED;
            console.log("Done in: " + counter + " miliseconds");
            console.log("Expanded nodes: " + closeSet.length);
            console.log("path nodes: " + path.length);
            showFrame();
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

    // Find the path.
    if (status == WORKING || status == SOLVED) {
        path = [];
        var temp = current;
        path.push(temp);
        while (temp.previous) {
            path.push(temp.previous);
            temp = temp.previous;
        }
    }

}

function draw() {
    if (status == INIT) {
        checkPencil();
        showFrame();
    }
    if (status == WORKING) {
        AStarAlgorithm();
        showFrame();
    }
}




// Disables context menu when right mouse button is clicked.
document.oncontextmenu = function() {
  return false;
}

// https://en.wikipedia.org/wiki/Flood_fill
