function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
/*
#######################
 Positon finding
#######################
*/
function getCursorPosition(canvas, event) {
	/*Recupérer la position actuelle du canva dans un objet*/
	const rect = canvas.getBoundingClientRect();
	/*Transformer pour obtenir un position relative au canva*/
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	return [x, y];
}
function getGamePosition(x, y) {
	const idx = Math.floor(x / game.cube.width);
	const idy = Math.floor(y / game.cube.height);
	console.log(`Click on ${idx}:${idy}`);
	return [idx, idy];
}
function middlePosFromIndex(idx, idy) {
	const posx = idx * game.cube.width + game.cube.width / 2;
	const posy = idy * game.cube.height + game.cube.height / 2;
	return [posx, posy];
}
function getAvailableSpaceBottom(idx, idy) {
	let spaceAvailable = 0;
	for (y = idy + 1; y < game.row; y++) {
		if (game.states[y][idx] == undefined) {
			spaceAvailable++;
		} else {
			return spaceAvailable;
		}
	}
	return spaceAvailable;
}

/*
################################
 Drawing grid icons and messages
################################
*/

/* Cut lines with rectangle to show like a margin on the game
function drawGameMargin(game) {
  game.ctx.fillRect(0, 0, game.bounding.width, game.spacing * 1.5);
  game.ctx.fillRect(0, game.bounding.height - game.spacing * 1.5, game.bounding.width, game.spacing * 1.5);
  game.ctx.fillRect(0, 0, game.spacing * 1.5, game.bounding.height);
  game.ctx.fillRect(game.bounding.width - game.spacing * 1.5, 0, game.spacing * 1.5, game.bounding.height);
}
//Draw cubes that make the background seams to be line XD
function drawGrid(game) {
  game.ctx.fillStyle = "#242424";
  for (x = 0; x < game.colmun; x++) {
    for (y = 0; y < game.row; y++) {
      game.ctx.fillRect(
        x * game.cube.width + (x > 0 ? game.spacing / 2 : 0),
        y * game.cube.height + (y > 0 ? game.spacing / 2 : 0),
        game.cube.width - (x < game.colmun - 1 ? (x > 0 ? game.spacing : game.spacing / 2) : 0),
        game.cube.height - (y < game.row - 1 ? (y > 0 ? game.spacing : game.spacing / 2) : 0)
      );
    }
  }
  drawGameMargin(game);
  drawGridPoint();
}
*/
/*Draw line insted of cubes that make the background seams to be line XD*/
function drawGridPoint() {
	game.ctx.fillStyle = game.color.line;
	for (axis = 0; axis < 2; axis++) {
		for (x = 0; x < (axis == 0 ? game.colmun : game.row) - 1; x++) {
			game.ctx.beginPath();
			game.ctx.arc(axis == 0 ? (x + 1) * game.cube.width : game.spacing * 1.5, axis == 0 ? game.spacing * 1.5 : (x + 1) * game.cube.height, game.spacing / 2, 0, 2 * Math.PI);
			game.ctx.arc(axis == 0 ? (x + 1) * game.cube.width : game.bounding.width - game.spacing * 1.5, axis == 0 ? game.bounding.height - game.spacing * 1.5 : (x + 1) * game.cube.height, game.spacing / 2, 0, 2 * Math.PI);
			game.ctx.fill();
		}
	}
}
function drawGridNew() {
	game.ctx.fillStyle = game.color.line;
	for (x = 0; x < game.colmun - 1; x++) {
		game.ctx.fillRect((x + 1) * game.cube.width - game.spacing * 0.5, game.spacing * 1.5, game.spacing, game.bounding.height - game.spacing * 3);
	}
	for (y = 0; y < game.row - 1; y++) {
		game.ctx.fillRect(game.spacing * 1.5, (y + 1) * game.cube.height - game.spacing * 0.5, game.bounding.width - game.spacing * 3, game.spacing);
	}
	drawGridPoint();
}

function drawClearColumn(idx, idy, spaceAvailable) {
	game.ctx.fillStyle = document.getElementById("canvas").style.backgroundColor;
	game.ctx.fillRect(idx * game.cube.width + game.spacing / 2, idy * game.cube.height + game.spacing / 2, game.cube.width - game.spacing, (spaceAvailable + 1) * game.cube.height - game.spacing);
}
async function drawDropingJeton(idx, idy, playerTurn) {
	game.dropingRuning = true;
	spaceAvailable = getAvailableSpaceBottom(idx, idy);
	game.states[idy + spaceAvailable][idx] = game.playerTurn;

	let posX = middlePosFromIndex(idx, idy)[0];
	let posYCurrent = middlePosFromIndex(idx, idy)[1];
	let posEnd = middlePosFromIndex(idx, idy + spaceAvailable)[1];

	//Newton law F=ma ( F:force , m:mass , a:acceleration )
	//Finalement on vas juste use v = √[2×g×h] (V: speed g:pesanteur h:hauteur)
	// g = 9,81 m.s
	//Finalement simple acceleration on loop incrément
	let increment = 5;
	for (posY = posYCurrent; posY <= posEnd; posY = posY + increment) {
		increment = increment * 1.03;
		drawClearColumn(idx, idy, spaceAvailable);
		//Solid font so it display plain circle
		game.ctx.font = fontSelect("solid", game.color.player[playerTurn ? 0 : 1], 87);
		game.ctx.fillText("\uf111", posX, posY);
		drawGridNew();
		await sleep(10);
	}
	drawClearColumn(idx, idy, spaceAvailable);
	game.ctx.font = fontSelect("solid", game.color.player[playerTurn ? 0 : 1], 87);
	game.ctx.fillText("\uf111", posX, posEnd);
	drawGridNew();
	game.dropingRuning = false;
}

function fontSelect(style, color, resize = 100, bypassSize) {
	game.ctx.fillStyle = color;
	return `${style == "regular" ? 400 : 900} ${bypassSize == undefined ? ((game.cube.height < game.cube.width ? game.cube.height : game.cube.width) - game.spacing) * (resize / 100) : bypassSize}px "Font Awesome 5 Free"`;
}
function updatePlayerText(elementID) {
	document.getElementById(elementID).innerHTML = game.playerTurn == true ? "Joueur 1" : "Joueur 2";
	document.getElementById(elementID).style.color = game.playerTurn ? game.color.player[0] : game.color.player[1];
}
function drawMessageCenter(message, color, size) {
	game.ctx.fillStyle = game.color.line;
	//Draw a 10% larger than text rectangle
	game.ctx.fillRect(0, game.bounding.height / 2 - size / 2 + (size * 0.1) / 2, game.bounding.width, size * 1.1);
	game.ctx.font = fontSelect("regular", color, undefined, size);
	game.ctx.fillText(message, game.bounding.width / 2, game.bounding.height / 2);
}

/*
##############
 Win checking
##############
*/
/*Check the hole tab can make a better checker based on last input */
function checkWin(nbForWin) {
	// Check diagonals
	for (side = 0; side < 2; side++) {
		// Origin of diagonal start frist row then last row, top to bottom then bottom to top
		// For each element on the raw (second run excluding sides element since they already got check)
		for (x = side == 0 ? 0 : 1; x < (side == 0 ? game.colmun : game.colmun - 1); x++) {
			//Check diagonal toward left (second run toward right)
			for (directionX = 0; directionX < 2; directionX++) {
				// Check if the diagonal currently checked can contain enough element to win
				if (directionX == 0 ? x + nbForWin - 1 < game.colmun : x - nbForWin + 1 >= 0) {
					let xcopy = x;
					let alignedCount = 1;
					// Check the current diagonal and count successive value correspong to game.playerTurn (last play)
					for (y = side == 0 ? 1 : game.row - 2; side == 0 ? y < game.row : y >= 0; side == 0 ? y++ : y--) {
						directionX == 0 ? xcopy++ : xcopy--;
						if (xcopy < 0 || xcopy > game.colmun) {
							continue; //exit the check and go for next direction or next element on line
						}
						if (game.states[side == 0 ? y - 1 : y + 1][directionX == 0 ? xcopy - 1 : xcopy + 1] == game.states[y][xcopy] && game.states[y][xcopy] == game.playerTurn) {
							alignedCount++;
							if (alignedCount >= nbForWin) {
								return true;
							}
						} else {
							alignedCount = 1;
						}
					}
				}
			}
		}
	}
	/*Check rows*/
	for (y = 0; y < game.row; y++) {
		let alignedCount = 1;
		for (x = 1; x < game.colmun; x++) {
			if (game.states[y][x - 1] == game.states[y][x] && game.states[y][x] == game.playerTurn) {
				alignedCount++;
				if (alignedCount >= nbForWin) {
					return true;
				}
			} else {
				alignedCount = 1;
			}
		}
	}
	/*Check columns*/
	for (x = 0; x < game.colmun; x++) {
		let alignedCount = 1;
		for (y = 1; y < game.row; y++) {
			if (game.states[y - 1][x] == game.states[y][x] && game.states[y][x] == game.playerTurn) {
				alignedCount++;
				if (alignedCount >= nbForWin) {
					return true;
				}
			} else {
				alignedCount = 1;
			}
		}
	}
	return false;
}
function checkTie() {
	for (x = 0; x < game.colmun; x++) {
		for (y = 0; y < game.row; y++) {
			if (game.states[y][x] == undefined) {
				return false;
			}
		}
	}
	return true;
}

/*
###################################
 Game object inialisation and reset
###################################
*/
function selectPlayerRandom() {
	rdm = Math.floor(Math.random() * 2);
	return rdm < 1 ? true : false;
}
function generateEmptyTab() {
	for (s = 0; s < game.row; s++) {
		game.states.push([]);
	}
}
function calcGame() {
	game.canvas = document.querySelector("canvas");

	/*A bit messy but working XD*/
	game.canvas.width = 900 * (game.colmun / game.row);
	game.canvas.height = 900;
	if (game.canvas.width > document.getElementById("body").getBoundingClientRect().width * 0.9) {
		game.canvas.width = document.getElementById("body").getBoundingClientRect().width * 0.9;
		game.canvas.height = game.canvas.width * (game.row / game.colmun);
	} else if (game.canvas.width < 600) {
		game.canvas.width = 600;
		game.canvas.height = game.canvas.width * (game.row / game.colmun);
	}

	game.bounding = game.canvas.getBoundingClientRect();
	game.ctx = game.canvas.getContext("2d");
	/*game initial setup*/
	game.cube.height = game.bounding.height / game.row;
	game.cube.width = game.bounding.width / game.colmun;
	/*Dynamic spacing*/
	game.spacing = game.cube.height * 0.12;
	game.ctx.textBaseline = "middle";
	game.ctx.textAlign = "center";
	generateEmptyTab();
}
/*
#######################
All onclick function
#######################
*/
function resetGame() {
	game.ctx.clearRect(0, 0, game.bounding.width, game.bounding.height);
	drawGridNew();
	game.states = [];
	generateEmptyTab();
	game.ended = false;
}
function hideMenu() {
	$("div.setting").toggleClass("hide-setting");
	$("#menu-btn").toggleClass("disable-btn");
}
function updateSettings() {
	game.colmun = parseInt($("#col").val());
	game.row = parseInt($("#row").val());
	game.nbForWin = parseInt($("#nbWin").val());
	if (game.nbForWin > game.colmun && game.nbForWin > game.row) {
		game.nbForWin = game.colmun > game.row ? game.colmun : game.row;
		$("#nbWin").val(game.nbForWin);
	}
	calcGame();
	resetGame();
}
function updateSquare() {
	$("#row").toggleClass("d-none");
	$("#row")
		.prev()
		.toggleClass("d-none");
	$("#row").val($("#col").val());
	if ($("#square:checked").val() == "on") {
		$("#col")
			.prev()
			.html("Lines :");
	} else {
		$("#col")
			.prev()
			.html("Column :");
		$("#titre")
			.empty()
			.append("TikTakTwo");
	}
	updateSettings();
}
function updateGameMode() {
	if ($("#gameMode:checked").val() == "on") {
		if ($("#square:checked").val() == "on") {
			updateSquare();
			$("#square:checked").prop("checked", false);
		}
		$("#titre")
			.empty()
			.append("Puissance 4");
		game.mode = 1;
		$("#row").val(6);
		$("#col").val(7);
		$("#nbWin").val(4);
	} else {
		$("#titre")
			.empty()
			.append("TikTakTwo");
		game.mode = 0;
		$("#row").val(3);
		$("#col").val(3);
		$("#nbWin").val(3);
	}
	updateSettings();
}

/*
###############################
 Starting main program
###############################
*/

const game = {
	colmun: 3, // Can be custom
	row: 3, // Can be custom
	spacing: 20, // Can be custom erased by calcGame()
	cube: {},
	states: [],
	score: [0, 0],
	playerTurn: selectPlayerRandom(),
	nbForWin: 3,
	ended: false,
	mode: 0,
	dropingRuning: false,
	color: {
		line: "#242424",
		player: ["#18BC9C", "#FF4646"]
	}
};
calcGame();
//drawGrid(game);
drawGridNew();
updatePlayerText("joueur");
/*
###############################
 Starting game
###############################
*/
game.canvas.addEventListener("mousedown", async function(event) {
	if (!game.dropingRuning) {
		let click = getCursorPosition(game.canvas, event);
		click = getGamePosition(click[0], click[1]);
		if (game.states[click[1]][click[0]] == undefined && !game.ended) {
			pos = middlePosFromIndex(click[0], click[1]);
			if (game.mode == 0) {
				if (game.playerTurn) {
					game.ctx.font = fontSelect("regular", game.color.player[0], 87);
					game.states[click[1]][click[0]] = true;
					game.ctx.fillText("\uf111", pos[0], pos[1]);
				} else {
					game.ctx.font = fontSelect("solid", game.color.player[1]);
					game.states[click[1]][click[0]] = false;
					game.ctx.fillText("\uf00d", pos[0], pos[1]);
				}
			} else {
				await drawDropingJeton(click[0], click[1], game.playerTurn);
			}
			if (checkWin(game.nbForWin)) {
				game.ended = true;
				game.playerTurn ? game.score[0]++ : game.score[1]++;
				document.getElementById("score1").innerHTML = `Joueur 1 : ${game.score[0]}`;
				document.getElementById("score2").innerHTML = `Joueur 2 : ${game.score[1]}`;
				drawMessageCenter(`Joueur ${game.playerTurn ? "1" : "2"} a gagné !`, game.playerTurn ? game.color.player[0] : game.color.player[1], 70);
			} else if (checkTie()) {
				game.ended = true;
				drawMessageCenter("Egalité !", "#FFA001", 70);
			}
			game.playerTurn = !game.playerTurn;
			updatePlayerText("joueur");
		}
	}
});
