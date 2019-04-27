import Map from './map.js';

const width = 60;
const height = 24;
const shortcutCost = 100;

const states = {
    wall: { character: '#', color: 'grey' },
    empty: { character: ' ' },
    shortcut: { character: 'Ͳ', color: 'red' },
    goal: { character: 'G', color: 'green' },
    player: { character: 'Y' }
};

for (let [key, value] of Object.entries(states)) {
    value.name = key;
}

const cells = [];
const scores = {
    health: 3000,
    points: 0,
    level: 0
}

const levels = [
    'intro'
];

const map = new Map();

const init = () => {
    const table = document.getElementById('game');
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    for (let y = 0; y < height; y++) {
        const row = document.createElement('span');
        for (let x = 0; x < width; x++) {
            if (y === 0) {
                cells[x] = [];
            }
            const cell = document.createElement('span');
            row.appendChild(cell);

            cells[x][y] = cell;
            setCell(x, y, 'empty');
        }
        table.appendChild(row);
        table.appendChild(document.createTextNode('\n'))
    }
    table.appendChild(document.createTextNode(symPad('', width, '-')));
    table.appendChild(document.createTextNode('\n'))
    const scoresDom = document.createElement('span');
    table.appendChild(scoresDom);

    const healthLabel = document.createElement('span');
    scoresDom.appendChild(healthLabel);
    healthLabel.textContent = " Lifetime: ";
    const healthDom = document.createElement('span');
    scoresDom.appendChild(healthDom);
    const scoreBuffer = document.createElement('span');
    scoresDom.appendChild(scoreBuffer);
    const pointsLabel = document.createElement('span');
    scoresDom.appendChild(pointsLabel);
    pointsLabel.textContent = "Points: ";
    const pointsDom = document.createElement('span');
    scoresDom.appendChild(pointsDom);

    scores.healthDom = healthDom;
    scores.scoreBuffer = scoreBuffer;
    scores.pointsDom = pointsDom;

    renderScores();
    render(map.getChunk(0, 0, width, height));

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    unpause();
}

const setCell = (x, y, stateName) => {
    const cell = cells[x][y];
    cell.textContent = states[stateName].character;
    if (states[stateName].color) {
        cell.style.color = states[stateName].color;
    } else {
        cell.style.color = '';
    }
}

const symPad = (string, length, char) => {
    const diff = Math.max(length - string.length, 0);
    const left = Math.floor(diff / 2);
    const right = Math.ceil(diff / 2);
    return Array(left + 1).join(char) + string + Array(right + 1).join(char);
}

const renderScores = () => {
    const { health, points, healthDom, pointsDom, scoreBuffer } = scores;

    const healthString = health + ' ';
    const pointsString = points + ' ';

    healthDom.textContent = healthString;
    pointsDom.textContent = pointsString;

    const scoreSize = healthString.length + pointsString.length + ' Lifetime: Points: '.length;
    const bufferSize = width - scoreSize;
    const buffer = symPad('', bufferSize, ' ');
    scoreBuffer.textContent = buffer;
}

const render = (chunk) => {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const state = chunk[x][y] || 'empty';
            setCell(x, y, state);
        }
    }
}

const handleCollision = (colission, dx, dy) => {
    switch (colission.current) {
        case 'shortcut':
            scores.health -= shortcutCost;
            map.setCell(colission.x, colission.y, 'empty');
            break;
        case 'goal':
            scores.level += 1;
            map.setCell(colission.x, colission.y, 'empty');
            map.movePlayer(dx, dy);
            loadLevel();
            break;
    }
}

const keysDown = {};

const onKeyDown = (evt) => {
    if (keysDown[evt.key]) {
        return;
    }
    keysDown[evt.key] = true;

    let dx, dy;
    switch (evt.key) {
        case 'W':
        case 'w':
        case 'ArrowUp':
            [dx, dy] = [0, -1];
            break;
        case 'S':
        case 's':
        case 'ArrowDown':
            [dx, dy] = [0, 1];
            break;
        case 'A':
        case 'a':
        case 'ArrowLeft':
            [dx, dy] = [-1, 0];
            break;
        case 'D':
        case 'd':
        case 'ArrowRight':
            [dx, dy] = [1, 0];
            break;
    }
    const colission = map.movePlayer(dx, dy);
    if (colission) {
        handleCollision(colission, dx, dy);
    }
    render(map.getChunk(0, 0, width, height));
    renderScores();
}

const onKeyUp = (evt) => {
    keysDown[evt.key] = false;
}

const loadLevel = async () => {
    const level = levels[scores.level];
    if (level) {
        await map.load(`./maps/${level}.js`);
    } else {
        alert('Needs more levels!');
        window.location.reload();
    }
}

const reduceHealth = () => {
    scores.health -= 1;
    renderScores();
    if (scores.health <= 0) {
        alert('It ends here');
        window.location.reload();
    }
}

const pause = () => {
    paused = true;
    doUnpause = false;
}

const unpause = () => {
    doUnpause = true;
    window.requestAnimationFrame(gameTick);
}

let paused = true;
let doUnpause = false;
let timeSinceLastHealthDrop = 0;
let lastTime = 0;
const gameTick = function (time) {
    if (!paused) {
        const delta = Math.min(time - lastTime, 100);
        timeSinceLastHealthDrop += delta;
        while (timeSinceLastHealthDrop > 100) {
            reduceHealth();
            timeSinceLastHealthDrop -= 100;
        }
        window.requestAnimationFrame(gameTick);
    } else if (doUnpause) {
        paused = false;
        window.requestAnimationFrame(gameTick);
    }

    lastTime = time;
};

(async () => {
    await loadLevel();
    if (document.readyState === "loading") {
        console.log('using load event');
        document.addEventListener('load', init);
    } else {
        console.log('calling immediately');
        init();
    }
})()