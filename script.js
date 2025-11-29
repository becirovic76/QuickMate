const SPButton = document.getElementById('sp-button');
const StartButton = document.getElementById('start-btn');
const showBestMove = document.getElementById('show-best-move-button')
let config = { position: 'start', draggable: true, onDrop: pieceDropHandler };
let selectedDifficulty = 30;

SPButton.addEventListener('click', () => {
    document.getElementById('home-container').style.display = 'none';
    document.getElementById('singleplayer-options').style.display = 'flex';
});

const game = new Chess();
StartButton.addEventListener('click', () => {
    let selectedColor = 'white';
    selectedColor = document.querySelector('input[name="color"]:checked').value;
    document.getElementById('singleplayer-options').style.display = 'none';
    console.log(document.querySelector('input[name="difficulty"]:checked').value)
    switch (document.querySelector('input[name="difficulty"]:checked')) {
        case 'easy':
            selectedDifficulty = 5;
            break;
        case 'medium':
            selectedDifficulty = 10;
            break;
        case 'hard':
            selectedDifficulty = 30;
            break;
        default:
            selectedDifficulty = 10000;
    }
    var board = Chessboard('sp-board', {
        position: 'start',
        draggable: true,





        // Called when piece is dropped
        onDrop: (source, target) => {
            console.log('on drop called')
            gameCanBeContinued();
            const move = game.move({
                from: source,
                to: target,
                promotion: 'q', // Always promote to queen for simplicity
            });
            if (move === null) return 'snapback'; // Illegal move
            
            
            let cleanFen = game.fen().split(' ');
            cleanFen[3] = '-';
            let cleanFen1 = cleanFen.join(' ');
            
            postChessApi({ fen: cleanFen1, depth: 30, variants: 2 }).then((data) => {
                board.draggable = false;
                console.log('om nom nom')
                console.log(data)
                // board.move(`${data.from}-${data.to}`)
                if (data.isPromotion == true)
                    game.move({ from: data.from, to: data.to, promotion: data.promotion })

                else
                    game.move({ from: data.from, to: data.to })
                board.position(game.fen(),)
                gameCanBeContinued();
                board.draggable = true;
            });


        },


        onSnapEnd: () => { board.position(game.fen()); clearAllArrows() }
    });
    board.orientation(selectedColor);
    document.getElementById('sp-board-page').style.display = 'flex';
    board.resize();
    if (selectedColor == 'black') {

    }
});

function playTheBestMove(game, board) {
    //cleaning fen because of a bug in the api
    let cleanFen = game.fen().split(' ');
    cleanFen[3] = '-';
    let cleanFen1 = cleanFen.join(' ');

    postChessApi({ fen: cleanFen1, depth: selectedDifficulty, variants: 2 }).then((data) => {
        console.log('om nom nom')
        console.log(data)
        // board.move(`${data.from}-${data.to}`)
        if (data.isPromotion == true)
            game.move({ from: data.from, to: data.to, promotion: data.promotion })

        else
            game.move({ from: data.from, to: data.to })
        board.position(game.fen(),)
        gameCanBeContinued();
    });
}

function gameCanBeContinued() {
    if (game.in_checkmate()) {
        document.querySelector(`[data-piece="${game.turn()}K"]`).parentElement.style.backgroundColor = 'red';
        return false
    }
    else if (game.in_stalemate()) {
        document.querySelector(`[data-piece="${game.turn()}K"]`).parentElement.style.backgroundColor = 'gray';
        return false
    }
    else if (game.in_draw()) {
        document.querySelector('[data-piece="wK"]').parentElement.style.backgroundColor = 'gray';
        document.querySelector('[data-piece="bK"]').parentElement.style.backgroundColor = 'gray';
        return false
    }
    else if (game.in_threefold_repetition()) {
        document.querySelector('[data-piece="wK"]').parentElement.style.backgroundColor = 'gray';
        document.querySelector('[data-piece="bK"]').parentElement.style.backgroundColor = 'gray';
        return false
    }
    else {
        return true
    }

}

function drawAnArrow(from, to) {
    const fromSquare = document.querySelector(`[data-square="${from}"]`);
    const toSquare = document.querySelector(`[data-square="${to}"]`);
    if (!fromSquare || !toSquare) return console.error("Invalid square IDs");

    const board = document.getElementById('sp-board');
    if (!board) return console.error("Board not found");

    let canvas = document.getElementById('arrow-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'arrow-canvas';
        canvas.style.position = 'absolute';
        canvas.style.pointerEvents = 'none';
        canvas.style.top = '0';
        canvas.style.left = '0';
        board.style.position = 'relative';
        board.appendChild(canvas);
    }

    canvas.width = board.offsetWidth;
    canvas.height = board.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rectFrom = fromSquare.getBoundingClientRect();
    const rectTo = toSquare.getBoundingClientRect();
    const rectBoard = board.getBoundingClientRect();

    const fromX = rectFrom.left + rectFrom.width / 2 - rectBoard.left;
    const fromY = rectFrom.top + rectFrom.height / 2 - rectBoard.top;
    const toX = rectTo.left + rectTo.width / 2 - rectBoard.left;
    const toY = rectTo.top + rectTo.height / 2 - rectBoard.top;

    // Calculate scale factor (based on square size)
    const squareSize = rectFrom.width;
    const lineWidth = squareSize * 0.15;
    const headLength = squareSize * 0.5;
    const headWidth = squareSize * 0.35;

    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Calculate end of the arrow body (start of head)
    const bodyEndX = toX - headLength * Math.cos(angle);
    const bodyEndY = toY - headLength * Math.sin(angle);

    // Draw arrow line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(bodyEndX, bodyEndY);
    ctx.strokeStyle = 'rgba(128, 0, 128, 0.6)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        bodyEndX + headWidth * Math.sin(angle),
        bodyEndY - headWidth * Math.cos(angle)
    );
    ctx.lineTo(
        bodyEndX - headWidth * Math.sin(angle),
        bodyEndY + headWidth * Math.cos(angle)
    );
    ctx.closePath();
    ctx.fillStyle = 'rgba(128, 0, 128, 0.6)';
    ctx.fill();
}

function clearAllArrows() {
    const canvas = document.getElementById('arrow-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

showBestMove.addEventListener('click', () => {
    //temp fen cleaning:
    let cleanFen = game.fen();
    cleanFen = cleanFen.split(' ');
    cleanFen[3] = '-';
    let cleanFen1 = cleanFen.join(' ');

    postChessApi({ fen: cleanFen1, depth: 30, variants: 1 }).then((data) => {
        drawAnArrow(data.from, data.to)
    });
});

async function postChessApi(data = {}) {
    const response = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

function pieceDropHandler(source, target) {
    console.log('on drop called')
    gameCanBeContinued();
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q', // Always promote to queen for simplicity
    });
    if (move === null) return 'snapback'; // Illegal move


    let cleanFen = game.fen().split(' ');
    cleanFen[3] = '-';
    let cleanFen1 = cleanFen.join(' ');

    postChessApi({ fen: cleanFen1, depth: 30, variants: 2 }).then((data) => {
        console.log('om nom nom')
        console.log(data)
        // board.move(`${data.from}-${data.to}`)
        if (data.isPromotion == true)
            game.move({ from: data.from, to: data.to, promotion: data.promotion })

        else
            game.move({ from: data.from, to: data.to })
        board.position(game.fen(),)
        gameCanBeContinued();
    });


}