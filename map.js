const characterToState = {
    '#': 'wall',
    ' ': 'empty',
    'Ͳ': 'shortcut',
    'G': 'goal',
    'Y': 'player',
    'D': 'door1',
    'K': 'key1',
    'd': 'door2',
    'k': 'key2',
}

export default class Map {
    tiles = [];
    whidth = 0;
    height = 0;
    player = { x: 0, y: 0 };

    async load(filename) {
        const module = await import(filename);
        const data = module.data();
        const rows = data.split('\n');
        this.height = rows.length;
        this.width = rows[0].length;

        this.tiles.length = 0;
        for (let x = 0; x < this.width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < this.height; y++) {
                const state = characterToState[rows[y][x]];
                this.tiles[x][y] = { x, y, loaded: state || 'empty' };
                this.tiles[x][y].current = this.tiles[x][y].loaded;
                if (state === 'player') {
                    this.player.x = x;
                    this.player.y = y;
                }
            }
        }
    }

    getCell(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.tiles[x][y];
        } else {
            return { x, y, current: null };
        }
    }

    setCell(x, y, state) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.tiles[x][y].current = state;
        }
    }

    getChunk(startX, startY, width, height) {
        const out = Array(width);
        for (let x = 0; x < width; x++) {
            out[x] = [];
            for (let y = 0; y < height; y++) {
                out[x][y] = this.getCell(startX + x, startY + y).current;
            }
        }
        return out;
    }

    movePlayer(dx, dy) {
        const { x: sx, y: sy } = this.player;
        const tx = sx + dx;
        const ty = sy + dy;

        if (this.getCell(tx, ty).current !== 'empty') {
            return this.getCell(tx, ty);
        }

        this.player.x = tx;
        this.player.y = ty;
        this.tiles[sx][sy].current = 'empty';
        this.tiles[tx][ty].current = 'player';
    }
}