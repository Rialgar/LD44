import Map from './map.js';

const width = 60;
const height = 24;
const shortcutCost = 100;

const states = {
    wall: { character: '#', color: 'grey' },
    empty: { character: ' ' },
    shortcut: { character: 'Ͳ', color: 'red' },
    goal: { character: 'G', color: 'green' },
    player: { character: 'Y', color: 'aqua' },
    door1: { character: 'D', color: 'darkorange' },
    key1: { character: 'K', color: 'darkorange' },
    door2: { character: 'd', color: 'dodgerblue' },
    key2: { character: 'k', color: 'dodgerblue' },
    coin: { character: 'C', color: 'yellow'}
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
let inited = false;

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
            setCellState(x, y, 'empty');
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
    const scoreBufferLeft = document.createElement('span');
    scoresDom.appendChild(scoreBufferLeft);
    const key1Dom = document.createElement('span');
    key1Dom.style.color = states.key1.color;
    scoresDom.appendChild(key1Dom);
    const key2Dom = document.createElement('span');
    key2Dom.style.color = states.key2.color;
    scoresDom.appendChild(key2Dom);
    const scoreBufferRight = document.createElement('span');
    scoresDom.appendChild(scoreBufferRight);
    const pointsLabel = document.createElement('span');
    scoresDom.appendChild(pointsLabel);
    pointsLabel.textContent = "Points: ";
    const pointsDom = document.createElement('span');
    scoresDom.appendChild(pointsDom);

    scores.healthDom = healthDom;
    scores.scoreBufferLeft = scoreBufferLeft;
    scores.key1Dom = key1Dom;
    scores.key2Dom = key2Dom;
    scores.scoreBufferRight = scoreBufferRight;
    scores.pointsDom = pointsDom;

    renderScores();
    render(map.getChunk(0, 0, width, height));

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    showText('Welcome. This game is played with WASD or Arrow Keys. To win a level [aqua]Y[]ou need to reach the [green]G[]oal. ' +
        'You can pay 10 seconds of lifetime to pass the [red]Ͳ[]rap, or take the long way around. ' +
        'Orange [darkorange]K[]eys open orange [darkorange]D[]oors. Blue [dodgerblue]k[]eys open blue [dodgerblue]d[]oors. ' +
        'Completing a level is worth 10 points. Collecting a [yellow]C[]oin is worth 1. \n' +
        'Press Enter or Space to start.');
    inited = true;
}

const setCellContent = (x, y, character, color, opacity, textDecoration) => {
    const cell = cells[x][y];
    cell.textContent = character;
    cell.style.color = color || '';
    cell.style.opacity = opacity || '';
    cell.style.textDecoration = textDecoration || '';
}

const setCellState = (x, y, stateName) => {
    const { character, color } = states[stateName];
    setCellContent(x, y, character, color);
}

const symPad = (string, length, char) => {
    const diff = Math.max(length - string.length, 0);
    const left = Math.floor(diff / 2);
    const right = Math.ceil(diff / 2);
    return Array(left + 1).join(char) + string + Array(right + 1).join(char);
}

const renderScores = () => {
    const { health, points, healthDom, pointsDom, scoreBufferLeft, scoreBufferRight, key1, key2, key1Dom, key2Dom } = scores;

    healthDom.textContent = health;
    pointsDom.textContent = points + ' ';
    key1Dom.textContent = key1 ? 'K' : ' ';
    key2Dom.textContent = key2 ? 'k' : ' ';


    const scoreSizeLeft = ` Lifetime: ${health}K`.length;
    const bufferSizeLeft = width / 2 - scoreSizeLeft;
    const bufferLeft = symPad('', bufferSizeLeft, ' ');
    scoreBufferLeft.textContent = bufferLeft;

    const scoreSizeRight = `kPoints: ${points} `.length;
    const bufferSizeRight = width / 2 - scoreSizeRight;
    const bufferRight = symPad('', bufferSizeRight, ' ');
    scoreBufferRight.textContent = bufferRight;
}

const render = (chunk) => {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const state = chunk[x][y] || 'empty';
            setCellState(x, y, state);
        }
    }
}

let textShowing = false;
const showText = (text) => {
    textShowing = true;
    const margin = 2;
    const padding = 3;

    const words = text.split(' ');
    let lines = [''];
    let currentLine = '';
    let lineLength = 0;
    words.forEach(word => {
        const wordLength = word.replace(/\[.*?\]/g, '').length;
        if (word.indexOf('\n') === 0 || lineLength + 1 + wordLength > width - 2 * (margin + 1 + padding)) {
            lines.push(currentLine.trim());
            lines.push('');
            currentLine = word;
            lineLength = wordLength;
        } else {
            currentLine = currentLine + ' ' + word;
            lineLength += 1 + wordLength;
        }
    });
    lines.push(currentLine.trim());
    const colors = lines.map(line => {
        const changes = line.match(/\[.*?\]/g);
        if (changes) {
            let prevIndex = 0;
            return changes.map(match => {
                const index = line.indexOf(match, prevIndex);
                prevIndex = index + 1;
                return {
                    pos: line.substring(0, index).replace(/\[.*?\]/g, '').length,
                    color: match.substring(1, match.length - 1)
                };
            })
        } else {
            return [];
        }
    });
    lines = lines.map((line, index) => {
        const pureText = line.replace(/\[.*?\]/g, '');
        const padded = symPad(pureText, width - 2 * (margin + 1), ' ');
        const shift = padded.indexOf(pureText[0]);
        colors[index].forEach(color => color.pos += shift)

        return padded;
    });
    let currentColor = '';
    for (let y = 0; y < height; y++) {
        const line = lines[y - margin - 1];
        const lineColors = colors[y - margin - 1] || [];
        let nextColor = lineColors.shift();
        for (let x = 0; x < width; x++) {
            if (x < margin || x >= width - margin || y < margin || y >= height - margin) {
                cells[x][y].style.opacity = '0.1';
            } else if (x === margin || x === width - margin - 1 || y === margin || y === height - margin - 1) {
                setCellContent(x, y, '#', '');
            } else if (line) {
                if (nextColor && nextColor.pos === x - (margin + 1)) {
                    currentColor = nextColor.color;
                    nextColor = lineColors.shift();
                }
                const character = line[x - (margin + 1)];
                setCellContent(x, y, character, currentColor, '', currentColor ? 'underline' : '');
            } else {
                setCellContent(x, y, ' ', '');
            }
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
            scores.points += 10;
            scores.key1 = false;
            scores.key2 = false;
            renderScores();
            pause();
            loadLevel();
            break;
        case 'key1':
        case 'key2':
            scores[colission.current] = true;
            map.setCell(colission.x, colission.y, 'empty');
            map.movePlayer(dx, dy);
            break;
        case 'door1':
        case 'door2':
            const key = 'key' + colission.current.substr(-1);
            if (scores[key]) {
                map.setCell(colission.x, colission.y, 'empty');
                scores[key] = false;
            }
            break;
        case 'coin':
            scores.points += 1;
            map.setCell(colission.x, colission.y, 'empty');
            map.movePlayer(dx, dy);
            break;
    }
}

let ended = false;

const keysDown = {};

const onKeyDown = (evt) => {
    if (keysDown[evt.key]) {
        return;
    }
    keysDown[evt.key] = true;

    if (paused) {
        switch (evt.key) {
            case 'Enter':
            case ' ':
                if (textShowing) {
                    if (ended) {
                        window.location.reload();
                    } else {
                        render(map.getChunk(0, 0, width, height));
                        textShowing = false;
                        unpause();
                    }
                }
                break;
        }
        return;
    }

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
}

const onKeyUp = (evt) => {
    keysDown[evt.key] = false;
}

const loadLevel = async () => {
    const level = levels[scores.level] || 'generator';
    await map.load(`./maps/${level}.js`);
    if (inited) {
        render(map.getChunk(0, 0, width, height));
        unpause();
    }
}

const reduceHealth = () => {
    scores.health -= 1;
    if (scores.health <= 0) {
        const localRecord = parseInt(localStorage.highScore) || 0;
        let scoreSentance = ''
        if(localRecord < scores.points){
            scoreSentance = `That is a new personal High Score! \nYour previous was ${localRecord}.`;
            localStorage.highScore = scores.points;            
        } else {
            scoreSentance = `Your personal High Score is ${localRecord}.`;
        }
        window.setTimeout(() => showText(`You died, but reached [aqua]${scores.points}[] points! \n \n${scoreSentance}`));
        pause();
        ended = true;
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

    renderScores();
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