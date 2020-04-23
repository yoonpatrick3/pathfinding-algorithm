function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Snake {
    constructor(xVel, yVel, body) {
        this.xVel = xVel;
        this.yVel = yVel;
        this.body = body;
    }

    draw() {
        for (var i = 0; i < this.body.length; i++) {
            ctx.fillRect(10 * this.body[i][0], 10 * this.body[i][1], 10, 10);
        }
    }
}

function drawBoard() {
    ctx.clearRect(0, 0, 500, 500);
    for (var i = 0; i < 50; i++) {
        for (var j = 0; j < 50; j++) {
            if (positionInSnake(i, j)) {
                ctx.fillStyle = 'black';
                ctx.fillRect(10 * i, 10 * j, 10, 10);
            } else if (i == apple[0] && j == apple[1]) {
                ctx.fillStyle = 'red';
                ctx.fillRect(10 * i, 10 * j, 10, 10);
            } else {
                ctx.beginPath();
                ctx.lineWidth = "1";
                ctx.strokeStyle = 'black';
                ctx.rect(10 * i, 10 * j, 10, 10);
                ctx.stroke();
            }
        }
    }
    /*
    for (var i = 0; i < snake.body.length; i++) {
        ctx.fillRect(10 * snake.body[i][0], 10 * snake.body[i][1], 10, 10);
    }*/
}

function positionInSnake(x, y) {
    for (var i = 0; i < snake.body.length; i++) {
        if (x == snake.body[i][0] && y == snake.body[i][1]) {
            return true;
        }
    }
    return false;
}

function gameStillGoes() {
    if (snake.body[0][0] >= 0 && snake.body[0][0] < 50 && snake.body[0][1] >= 0 && snake.body[0][1] < 50) {
        return snakeHeadInBody();
    } else {
        return false;
    }
}

function snakeHeadInBody() {

    for (var i = 1; i < snake.body.length; i++) {
        if (snake.body[0][0] == snake.body[i][0] && snake.body[0][1] == snake.body[i][1]) {
            return false;
        }
    }
    return true;
}

let newPath = [];

async function update() {
    //var newPath = await runAI();
    if (!letBotRunGame) {
        var newX = snake.body[0][0] + snake.xVel
        var newY = snake.body[0][1] + snake.yVel
    } else {
        try {
            var nextPath = newPath.shift();
            var newX = nextPath.x;
            var newY = nextPath.y;
        } catch (error) {
            console.log("ERROR");
            var keepGoing = true;
            var newArr = [];
            Array.prototype.push.apply(newArr, snake.body);

            console.log("initial new arr", newArr);
            //console.log(newArr);
            do {
                console.log("test2");
                newArr.pop();
                await runAI(newArr);
                console.log(apple, snake.body, newArr, nextPath);
                if (nextPath.length == 0) {
                    clearInterval(game);
                }

                if (nextPath) {
                    keepGoing = false;
                }
            } while (keepGoing);
            var newX = nextPath.x;
            var newY = nextPath.y;
        }
    }
    snake.body.unshift([newX, newY]);
    if (snakeCollidesWithApple(snake.body[0][0], snake.body[0][1])) {
        //console.log(apple, snake.body, nextPath);
        apple = await spawnApple();
        if (letBotRunGame) {
            await runAI(snake.body);
        }
    } else {
        snake.body.pop();
    }


    if (!letBotRunGame) {
        if (d == "U") {
            snake.xVel = 0;
            snake.yVel = -1;
        } else if (d == "D") {
            snake.xVel = 0;
            snake.yVel = 1;
        } else if (d == "R") {
            snake.xVel = 1;
            snake.yVel = 0;
        } else if (d == "L") {
            snake.xVel = -1;
            snake.yVel = 0;
        }
    }

    if (await gameStillGoes()) {
        await drawBoard();
    } else {
        clearInterval(game);
    }


}

function snakeCollidesWithApple(x, y) {
    return x == apple[0] & y == apple[1];
}

function spawnApple() {
    do {
        var keepGoing = false;
        var xA = Math.floor(Math.random() * 50);
        var yA = Math.floor(Math.random() * 50);

        for (var i = 0; i < snake.body.length; i++) {
            if (xA == snake.body[i][0] && yA == snake.body[i][1]) {
                keepGoing = true;
            }
        }

    } while (keepGoing);

    return [xA, yA];
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

class Node {
    constructor(x, y, visited) {
        this.x = x;
        this.y = y;
        this.visited = visited;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.parentNode = 0;
    }

    equal(other) {
        return other.x == this.x && other.y == this.y
    }
}

function ijInSnake(i, j, snakeBody) {
    for (var k = 0; k < snakeBody.length; k++) {
        if (snakeBody[k][0] == i && snakeBody[k][1] == j) {
            return true;
        }
    }
    return false
}

async function runAIinit() {

    console.log(snake.body);

    var path = await astarHelper(snake.body);

    letBotRunGame = true;
    newPath = path;
}

async function runAI(snakeBody) {

    var path = await astarHelper(snakeBody);

    letBotRunGame = true;
    newPath = path;
}

async function astarHelper(snakeBody) {
    //console.log(snakeBody);
    var board = [];
    for (var i = 0; i < 50; i++) {
        var row = []
        for (var j = 0; j < 50; j++) {
            if (ijInSnake(i, j, snakeBody)) {
                row.push(new Node(i, j, true));
            } else {
                row.push(new Node(i, j, false));
            }
        }
        board.push(row);
    }

    var startX = snake.body[0][0];
    var startY = snake.body[0][1];

    var finishX = apple[0];
    var finishY = apple[1];

    var openList = []; // nodes to be evaluated
    var closedList = []; // nodes already evaluated

    openList.push(board[startX][startY]);
    var path = []
    while (openList.length != 0) {
        var currentNode = openList.shift();
        closedList.push(currentNode);
        if (currentNode.x == finishX && currentNode.y == finishY) {
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