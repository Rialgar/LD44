const characterToState = {
    '#': 'wall',
    ' ': 'empty'
}

export default class Map {
    tiles = [];
    whidth = 0;
    height = 0;

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
                this.tiles[x][y] = { loaded: characterToState[rows[y][x]] || 'empty' };
                this.tiles[x][y].current = this.tiles[x][y].loaded;
            }
        }
    }

    getCell(x, y){
        if(x >= 0 && x < this.width && y >= 0 && y < this.height){
            return this.tiles[x][y].current;
        } else {
            return null;
        }
    }

    getChunk(startX, startY, width, height){
        const out = Array(width);
        for (let x = 0; x < width; x++) {
            out[x] = [];
            for (let y = 0; y < height; y++) {
                out[x][y] = this.getCell(startX + x, startY + y);
            }
        }
        return out;
    }
}