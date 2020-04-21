function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Node {
    constructor(x, y, color, visited, isStart, isFinish, algorithm) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.visited = visited;
        this.isStart = isStart;
        this.isFinish = isFinish;
        this.algorithm = algorithm;
    }

    toDraw() {
        if (this.isStart || this.isFinish || this.visited) {
            ctx.fillStyle = this.color;
            ctx.fillRect(14 * this.x, 14 * this.y, 14, 14);
        } else {
            ctx.beginPath();
            ctx.lineWidth = "1";
            ctx.strokeStyle = this.color;
            ctx.rect(14 * this.x, 14 * this.y, 14, 14);
            ctx.stroke();
        }
    }

    equal(other) {
        return other.x == this.x && other.y == this.y
    }
}

function drawBoard() {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].toDraw();
        }
    }
}

function clearBoard(algo) {
    ctx.clearRect(0, 0, 700, 700);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].algorithm = algo;
            if (board[i][j].visited && !board[i][j].isStart && board[i][j].color != 'purple') {
                board[i][j].visited = false;
            }
            board[i][j].toDraw()
        }
    }
}

function clearFullBoard() {
    ctx.clearRect(0, 0, 700, 700);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].visited = false;
            if (board[i][j].color == 'purple') {
                board[i][j].color = 'black';
            }
            board[i][j].toDraw()
        }
    }
}

async function breadthFirst(startX, startY, board) {
    isFound = false;
    queue = [];
    queue.push(board[startX][startY]);
    while (queue.length != 0 && !isFound) {
        var n = queue.shift();
        var neighbors = validNeighbors(n.x, n.y, board);
        for (var i = 0; i < neighbors.length; i++) {
            queue.push(neighbors[i]);
            neighbors[i].visited = true;
            drawBoard();

            if (neighbors[i].isFinish) {
                isFound = true;
                break;
            }
            await sleep(1);
        }
    }
    clearBoard("Depth-first Search");
    depthFirst(startX, startY, board);
}

function validNeighbors(thisX, thisY, board) {
    var neighbors = [];
    if (thisX - 1 >= 0 && !board[thisX - 1][thisY].visited) {
        //console.log("left");
        neighbors.push(board[thisX - 1][thisY]);
    }
    if (thisY - 1 >= 0 && !board[thisX][thisY - 1].visited) {
        //console.log("up");
        neighbors.push(board[thisX][thisY - 1]);
    }
    if (thisX + 1 < 50 && !board[thisX + 1][thisY].visited) {
        //console.log("right");
        neighbors.push(board[thisX + 1][thisY]);
    }
    if (thisY + 1 < 50 && !board[thisX][thisY + 1].visited) {
        //console.log("down");
        neighbors.push(board[thisX][thisY + 1]);
    }
    return neighbors
}

var fx = 0;
var fy = 0;

async function depthFirst(startX, startY, board) {
    document.getElementById("algoName").innerHTML = board[0][0].algorithm;
    stack = [];
    await depthFirstRecur(startX, startY, board, stack);
    clearBoard("A* (A-star)");
    astar(startX, startY, fx, fy, board);
}

async function depthFirstRecur(thisX, thisY, board) {
    board[thisX][thisY].visited = true;
    await sleep(10);
    drawBoard();
    if (board[thisX][thisY].isFinish) {
        //console.log("found");
        fx = thisX;
        fy = thisY;
        return true;
    } else {
        var neighbors = validNeighbors(thisX, thisY, board);
        for (var i = 0; i < neighbors.length; i++) {
            if (await depthFirstRecur(neighbors[i].x, neighbors[i].y, board)) {
                return true;
            }
        }
    }
}

function changeBoardWithCosts(startX, startY, finishX, finishY, board) {
    Node.prototype.cost = 0
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].visited) {
                // distance between current node and start node
                var g = Math.abs(startX - i) + Math.abs(startY - j);

                // estimated distance from current node to end node
                var h = Math.pow(finishX - i, 2) + Math.pow(finishY - j, 2);

                // total cost of the node
                var f = g + h;
                board[i][j].cost = f;
            }
        }
    }

    return board;
}

async function astar(startX, startY, finishX, finishY, board) {
    document.getElementById("algoName").innerHTML = board[0][0].algorithm;


    var path = await astarHelper(startX, startY, finishX, finishY, board);

    for (var i = 0; i < path.length; i++) {
        await sleep(10);
        path[i].visited = true;
        drawBoard();
    }
}

async function astarHelper(startX, startY, finishX, finishY, board) {
    var openList = []; // nodes to be evaluated
    var closedList = []; // nodes already evaluated

    Node.prototype.f = 0;
    Node.prototype.g = 0;
    Node.prototype.h = 0;
    Node.prototype.parentNode = 0;

    openList.push(board[startX][startY]);
    console.log(openList[0]);
    var path = []
    while (openList.length != 0) {
        var currentNode = openList.shift();
        closedList.push(currentNode);
        if (currentNode.isFinish) {
            console.log("found");

            while (currentNode.parentNode != 0) {
                path.unshift(currentNode);
                currentNode = currentNode.parentNode;
            }
            return path;
        }

        var neighbors = validNeighbors(currentNode.x, currentNode.y, board);
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];

            // check if neighbor is in closed
            if (closedList.some((value) => value.equal(neighbor))) {
                continue;
            }

            var gScore = currentNode.g + 1;

            // check if new path to neighbor is shorter or neighbor is not in open list
            if (!openList.some((value) => value.equal(neighbor)) || gScore < neighbor.g) {
                var hScore = getH(neighbor.x, neighbor.y, finishX, finishY);
                var fScore = gScore + hScore;
                neighbor.g = gScore
                neighbor.f = fScore;
                board[neighbor.x][neighbor.y].g = gScore;
                board[neighbor.x][neighbor.y].f = fScore;
                board[neighbor.x][neighbor.y].parentNode = currentNode;
                if (!openList.some((value) => value.equal(neighbor))) {
                    openList.push(neighbor);
                }
            }
        }
    }
}

function getH(x1, y1, x2, y2) {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}