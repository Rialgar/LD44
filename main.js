const onload = () => {
    const width = 60;
    const height = 24;

    const states = {
        wall: { character: '#' },
        empty: { character: ' ' }
    };

    for ([key, value] of Object.entries(states)) {
        value.name = key;
    }

    const cells = [];
    const scores = {}

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

                cells[x][y] = {
                    x, y,
                    dom: cell
                }
                setCell(x, y, 'empty');
            }
            table.appendChild(row);
            table.appendChild(document.createTextNode('\n'))
        }
        table.appendChild(document.createTextNode(leftPad('', width, '-')));
        table.appendChild(document.createTextNode('\n'))
        const scoresDom = document.createElement('span');
        table.appendChild(scoresDom);

        const healthLabel = document.createElement('span');
        scoresDom.appendChild(healthLabel);
        healthLabel.textContent = " Health: ";
        const healthDom = document.createElement('span');
        scoresDom.appendChild(healthDom);
        healthDom.textContent = "XXX";
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

        setHealth(100);
        setPoints(0);
    }

    const setCell = (x, y, stateName) => {
        const cell = cells[x][y];
        cell.state = stateName;
        cell.dom.textContent = states[stateName].character;
    }

    const leftPad = (string, length, char) => Array(Math.max(length - string.length, 0) + 1).join(char) + string;

    const setHealth = (health) => {
        scores.healthDom.textContent = leftPad('' + health, 2, '0');
    };

    const setPoints = (points) => {
        const pointsString = points + ' ';
        const scoreSize = pointsString.length + ' Health: XXXPoints: '.length;
        const bufferSize = width - scoreSize;
        const buffer = leftPad('', bufferSize, ' ');
        scores.scoreBuffer.textContent = buffer;
        scores.pointsDom.textContent = pointsString;
    }

    init();
};

if (document.readyState === "loading") {
    document.onreadystatechange(onload);
} else {
    onload();
}