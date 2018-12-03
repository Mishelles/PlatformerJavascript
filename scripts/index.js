const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 800;

const DEFAULT_BLOCK_SIZE = 64;
const DEFAULT_MAP_SIZE = 64;
const DEFAULT_MAP_PATH = "../testmap.json";

window.onload = () => {
    const canvas = document.getElementById("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const context = canvas.getContext("2d");
    const mapManager = new MapManager();
    mapManager.loadMap();
    console.log(mapManager);
    mapManager.draw(context);
};

class Tileset {
    constructor(firstgid, image, name, xCount, yCount) {
        this.firstgid = firstgid;
        this.image = image;
        this.name = name;
        this.xCount = xCount;
        this.yCount = yCount;
    }
}

class Tile {
    constructor(img = null, px = 0, py = 0) {
        this.img = img;
        this.px = px;
        this.py = py;
    }
}

class MapManager {
    constructor() {
        this.mapData = null;
        this.tLayer = null;
        this.xCount = 0;
        this.yCount = 0;
        this.tSize = {
            x: DEFAULT_BLOCK_SIZE,
            y: DEFAULT_BLOCK_SIZE
        };
        this.mapSize = {
            x: DEFAULT_MAP_SIZE,
            y: DEFAULT_MAP_SIZE
        };
        this.tilesets = [];
        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.view = {
            x: 0, y: 0,
            w: CANVAS_WIDTH, h: CANVAS_HEIGHT
        }
    }

    loadMap(path = DEFAULT_MAP_PATH) {
        let promise = fetch(path)
            .then(response => response.json())
            .then(response => this.parseMap(response))
            .catch(error => {
                console.log('Error: ' + error);
                return null;
            });
    }

    parseMap(tilesJSON) {
        this.mapData = tilesJSON;
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.yCount * this.tSize.y;

        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            const image = new Image();
            image.onload = () => {
                this.imgLoadCount++;
                if (this.imgLoadCount === this.mapData.tilesets.length) {
                    this.imgLoaded = true;
                }
            };
            image.src = this.mapData.tilesets[i].image;
            const t = this.mapData.tilesets[i];
            const ts = new Tileset(
                t.firstgid,
                image,
                t.name,
                Math.floor(t.imagewidth / this.tSize.x),
                Math.floor(t.imageheight / this.tSize.y)
            );
            this.tilesets.push(ts);
        }
        this.jsonLoaded = true;
    }

    draw(ctx) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => {
                this.draw(ctx)
            }, 100);
        } else {
            if (this.tLayer === null) {
                for (let id = 0; id < this.mapData.layers.length; id++) {
                    const layer = this.mapData.layers[id];
                    if (layer.type === "tilelayer") {
                        this.tLayer = layer;
                        break;
                    }
                }
            }
            for (let i = 0; i < this.tLayer.data.length; i++) {
                if (this.tLayer.data[i] !== 0) {
                    const tile = this.getTile(this.tLayer.data[i]);
                    let pX = (i % this.xCount) * this.tSize.x;
                    let pY = Math.floor(i / this.xCount) * this.tSize.y;

                    if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                        continue;

                    pX -= this.view.x;
                    pY -= this.view.y;

                    ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x,
                        this.tSize.y, pX, pY, this.tSize.x, this.tSize.y);
                }
            }
        }
    }

    getTile(tileIndex) {
        const tile = new Tile();
        const tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        const id = tileIndex = tileset.firstgid;
        const x = id % tileset.xCount;
        const y = Math.floor(id / tileset.xCount);
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile;
    }

    getTileset(tileIndex) {
        for (let i = this.tilesets.length - 1; i >= 0; i--) {
            if (this.tilesets[i].firstgid <= tileIndex) {
                return this.tilesets[i];
            }
        }
        return null;
    }

    isVisible(x, y, width, height) {
        return !(x + width < this.view.x || y + height < this.view.y ||
            x > this.view.x + this.view.w || y > this.view.y + this.view.h);
    }

}