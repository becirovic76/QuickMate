const SPButton = document.getElementById('sp-button');
const StartButton = document.getElementById('start-btn');
let switchPages = (current, next, type = 'block') => {
current.style.display = 'none';
next.style.dusplay = type;

}

SPButton.addEventListener('click', ()=> {
    document.getElementById('home-container').style.display = 'none';
    document.getElementById('singleplayer-options').style.display = 'flex';
});

StartButton.addEventListener('click', ()=> {
document.getElementById('singleplayer-options').style.display = 'none';
document.getElementById('sp-board-page').style.display = 'flex';
board.resize();
});

let config = {position:'start', draggable: true};
var board = Chessboard('sp-board', config);