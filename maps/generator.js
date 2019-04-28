const width = 60;
const height = 24;

const randomValue = (min, max) => {
    return min + Math.floor(Math.random() * (max + 1 - min));
}

class Room {

    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;

        this.neighbours = [];
        this.sideArms = [];

        this.bottom = top + height - 1;
        this.right = left + width - 1;
        this.area = width * height;
    }

    addNeighbour(room, spec) {
        if (!spec) {
            spec = room;
            room = spec.room;
        }
        console.assert(!this.neighbours.find(n => n.room === room));
        this.neighbours.push({
            ...spec,
            room,
        });
    }

    replaceNeighbour(prevRoom, newRoom, spec) {
        const index = this.neighbours.findIndex(n => n.room === prevRoom);
        console.assert(index >= 0);
        const prevNeighbour = this.neighbours[index];
        this.neighbours[index] = {
            ...spec || prevNeighbour,
            room: newRoom
        };
    }

    split(preventX, preventY) {
        console.assert(this.width > 6 || this.height > 6);
        if (this.width > 6 && (this.height <= 6 || this.width + Math.random() * 10 > this.height * 1.5 + 5)) {
            let split = randomValue(3, this.width - 4);
            if (this.left + split === preventX) {
                if (split > 3) {
                    split -= 1;
                } else {
                    split += 1;
                }
            }
            const other = new Room(this.left + split, this.top, this.width - split, this.height);

            this.width = split + 1;
            this.right = this.left + this.width - 1;
            this.area = this.width * this.height;

            const neighbours = this.neighbours;
            this.neighbours = [];
            neighbours.forEach((neighbour) => {
                if (neighbour.borderX) {
                    if (neighbour.borderX === this.left) {
                        this.addNeighbour(neighbour);
                    } else {
                        other.addNeighbour(neighbour);
                        neighbour.room.replaceNeighbour(this, other);
                    }
                } else {
                    if (neighbour.borderRight <= this.right) {
                        this.addNeighbour(neighbour);
                    } else if (neighbour.borderLeft >= this.right) {
                        other.addNeighbour(neighbour);
                        neighbour.room.replaceNeighbour(this, other);
                    } else {
                        const newThis = {
                            borderY: neighbour.borderY,
                            borderLeft: neighbour.borderLeft,
                            borderRight: this.right
                        };
                        this.addNeighbour(neighbour.room, newThis);
                        neighbour.room.replaceNeighbour(this, this, newThis);

                        const newOther = {
                            borderY: neighbour.borderY,
                            borderLeft: this.right,
                            borderRight: neighbour.borderRight
                        };
                        other.addNeighbour(neighbour.room, newOther);
                        neighbour.room.addNeighbour(other, newOther);
                    }
                }
            });
            const n = {
                borderX: this.left + split,
                borderTop: this.top,
                borderBottom: this.bottom
            };
            this.addNeighbour(other, n);
            other.addNeighbour(this, n);
            return other;
        } else {
            let split = randomValue(3, this.height - 4);
            if (this.top + split === preventY) {
                if (split > 3) {
                    split -= 1;
                } else {
                    split += 1;
                }
            }
            const other = new Room(this.left, this.top + split, this.width, this.height - split);

            this.height = split + 1;
            this.bottom = this.top + this.height - 1;
            this.area = this.width * this.height;

            const neighbours = this.neighbours;
            this.neighbours = [];
            neighbours.forEach((neighbour) => {
                if (neighbour.borderY) {
                    if (neighbour.borderY === this.top) {
                        this.addNeighbour(neighbour);
                    } else {
                        other.addNeighbour(neighbour);
                        neighbour.room.replaceNeighbour(this, other);
                    }
                } else {
                    if (neighbour.borderBottom <= this.bottom) {
                        this.addNeighbour(neighbour);
                    } else if (neighbour.borderTop >= this.bottom) {
                        other.addNeighbour(neighbour);
                        neighbour.room.replaceNeighbour(this, other);
                    } else {
                        const newThis = {
                            borderX: neighbour.borderX,
                            borderTop: neighbour.borderTop,
                            borderBottom: this.bottom
                        };
                        this.addNeighbour(neighbour.room, newThis);
                        neighbour.room.replaceNeighbour(this, this, newThis);

                        const newOther = {
                            borderX: neighbour.borderX,
                            borderTop: this.bottom,
                            borderBottom: neighbour.borderBottom
                        };
                        other.addNeighbour(neighbour.room, newOther);
                        neighbour.room.addNeighbour(other, newOther);
                    }
                }
            });

            const n = {
                borderY: this.top + split,
                borderLeft: this.left,
                borderRight: this.right
            };
            this.addNeighbour(other, n);
            other.addNeighbour(this, n);
            return other;
        }
    }

    randomPlace() {
        const x = randomValue(this.left + 1, this.right - 1);
        const y = randomValue(this.top + 1, this.bottom - 1);
        return { x, y };
    }
}

const drawRoom = (map, room) => {
    for (let x = 0; x < room.width; x++) {
        for (let y = 0; y < room.height; y++) {
            if (x === 0 || y === 0 || x === room.width - 1 || y === room.height - 1) {
                map[room.top + y][room.left + x] = '#';
            }
        }
    }
}

const pokeHole = (from, to) => {
    const neighbourFrom = from.neighbours.find(n => n.room === to);
    const neighbourTo = to.neighbours.find(n => n.room === from);

    if (neighbourFrom.borderX) {
        const x = neighbourFrom.borderX;
        const y = neighbourFrom.holeY || randomValue(neighbourFrom.borderTop + 1, neighbourFrom.borderBottom - 1);
        neighbourFrom.holeY = y;
        neighbourTo.holeY = y;
        return { x, y };
    } else {
        const x = neighbourFrom.holeX || randomValue(neighbourFrom.borderLeft + 1, neighbourFrom.borderRight - 1);
        const y = neighbourFrom.borderY;
        neighbourFrom.holeX = x;
        neighbourTo.holeX = x;
        return { x, y };
    }
}

const placeDoor = (map, longest, minIndex, maxIndex, door, key) => {
    const doorRoomIndex = randomValue(minIndex, maxIndex);
    const doorPlace = pokeHole(longest[doorRoomIndex], longest[doorRoomIndex + 1])
    map[doorPlace.y][doorPlace.x] = door;
    const keyRoomIndex = randomValue(0, doorRoomIndex - 1);
    let keyRoom = longest[keyRoomIndex];
    while (keyRoom.sideArms.length > 0 && Math.random() < 0.5) {
        keyRoom = keyRoom.sideArms[randomValue(0, keyRoom.sideArms.length - 1)];
    }
    let keyPlace = keyRoom.randomPlace();
    while (map[keyPlace.y][keyPlace.x] != ' ') {
        keyPlace = keyRoom.randomPlace();
    }
    map[keyPlace.y][keyPlace.x] = key;

    return doorRoomIndex;
}

export const data = ({ x, y }) => {
    const map = [];
    for (let y = 0; y < height; y++) {
        map[y] = [];
        for (let x = 0; x < width; x++) {
            map[y][x] = ' ';
        }
    }
    map[y][x] = 'Y';
    const rooms = [new Room(0, 0, width, height)];
    drawRoom(map, rooms[0]);

    while (rooms.length < 10) {
        const biggestRoom = rooms.reduce((biggest, current) => {
            if (!biggest || biggest.area < current.area) {
                return current;
            } else {
                return biggest;
            }
        });
        const newRoom = biggestRoom.split(x, y);
        drawRoom(map, newRoom);
        rooms.push(newRoom);
    }
    rooms.forEach((room) => {
        room.neighbours = room.neighbours.filter((neighbour) => {
            if (neighbour.borderX) {
                return neighbour.borderBottom - neighbour.borderTop > 1;
            } else {
                return neighbour.borderRight - neighbour.borderLeft > 1;
            }
        });
    })

    const startRoom = rooms.find(room => room.left < x && room.right > x && room.top < y && room.bottom > y);
    let longest = [];
    let tries = 0;
    while (longest.length < 11 - tries) {
        tries += 1;
        const path = [startRoom];
        let candidates = startRoom.neighbours;
        while (candidates.length > 0) {
            const nextRoom = candidates[randomValue(0, candidates.length - 1)].room;
            path.push(nextRoom);
            candidates = nextRoom.neighbours.filter(n => path.indexOf(n.room) < 0);
        }
        if (path.length > longest.length) {
            longest = path;
        }
    }
    const goalRoom = longest[longest.length - 1];
    const goal = goalRoom.randomPlace();
    map[goal.y][goal.x] = 'G';

    for (let i = 0; i < longest.length - 1; i++) {
        const hole = pokeHole(longest[i], longest[i + 1]);
        map[hole.y][hole.x] = ' ';
    }

    const coinRooms = [];

    longest.forEach(room => room.connected = true);
    const queue = rooms.filter(room => !room.connected);
    while (queue.length > 0) {
        const next = queue.shift();
        const connectionCandidates = next.neighbours.filter(n => n.room.connected);
        if (connectionCandidates.length > 0) {
            const connection = connectionCandidates[randomValue(0, connectionCandidates.length - 1)].room;
            const hole = pokeHole(next, connection);
            map[hole.y][hole.x] = ' ';
            next.connected = true;
            connection.sideArms.push(next);
            coinRooms.push(next);
        } else {
            queue.push(next);
        }
    }

    while (coinRooms.length < 5) {
        const coinCandidates = rooms.filter(room => coinRooms.indexOf(room) < 0);
        coinRooms.push(coinCandidates[randomValue(0, coinCandidates.length - 1)]);
    }

    coinRooms.forEach(room => {
        let coinPlace = room.randomPlace();
        while(map[coinPlace.y][coinPlace.x] !== ' '){
            let coinPlace = room.randomPlace();
        };
        map[coinPlace.y][coinPlace.x] = 'C';
    });

    const possibleShortCuts = [];
    for (let i = 0; i < longest.length - 2; i++) {
        let j = 0;
        let room = longest[i];
        while (room) {
            room.neighbours.forEach(n => {
                if (!n.holeX && !n.holeY && longest.indexOf(n.room) > i) {
                    possibleShortCuts.push({ from: room, to: n.room, length: longest.indexOf(n.room) - i - (j > 0 ? 1 : 0) });
                }
            });
            room = longest[i].sideArms[j];
            j += 1;
        }
    }
    possibleShortCuts.sort((a, b) => b.length - a.length);
    console.log(possibleShortCuts.map(s => s.length));
    const chosenShortcut = possibleShortCuts[randomValue(0, Math.min(possibleShortCuts.length - 1, 3))];
    const trapHole = pokeHole(chosenShortcut.from, chosenShortcut.to);
    map[trapHole.y][trapHole.x] = 'Ͳ';

    const doorRoom2Index = placeDoor(map, longest, 3, longest.length - 2, 'd', 'k');
    const doorRoom1Index = placeDoor(map, longest, 0, doorRoom2Index - 1, 'D', 'K');

    console.log(doorRoom1Index, doorRoom2Index);

    return map.map(row => row.join('')).join('\n');
}