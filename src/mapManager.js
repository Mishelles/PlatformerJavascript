const INITIAL_WIDTH = 1700;
const INITIAL_HEIGHT = 850;

class MapManager {
    constructor() {
        this.mapData = null;
        this.tLayer = [];
        this.xCount = 0;
        this.yCount = 0;
        this.tSize = {x: 0, y: 0};
        this.mapSize = {x: 0, y: 0};
        this.tilesets = [];
        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.view = {x: 0, y: 0, w: INITIAL_WIDTH, h: INITIAL_WIDTH}
    }

    loadMap(path) {
        const request = new XMLHttpRequest();
        request.overrideMimeType("application/json");
        request.open("GET", path, true);
        request.onreadystatechange = function() {
            if(request.readyState === 4 && request.status === 200) {
                mapManager.parseMap(request.responseText);
            }
        };
        request.send();
    }

    draw(ctx) {
        ctx.clearRect(0, 0, INITIAL_WIDTH, INITIAL_HEIGHT);
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => {
                this.draw(ctx);
            }, 100);
        } else {
            if (this.tLayer.length === 0)
                for (let id = 0; id < this.mapData.layers.length; id++) {
                    let layer = this.mapData.layers[id];
                    if (layer.type === "tilelayer") {
                        this.tLayer.push(layer);
                    }
                }
            for (let j = 0; j < this.tLayer.length; j++) {
                for (let i = 0; i < this.tLayer[j].data.length; i++) {
                    if (this.tLayer[j].data[i] !== 0) {
                        let tile = this.getTile(this.tLayer[j].data[i]);
                        let pX = (i % this.xCount) * this.tSize.x;
                        let pY = Math.floor(i / this.xCount) * this.tSize.x - 80;
                        if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                            continue;
                        pX -= this.view.x;
                        pY -= this.view.y;
                        if (tile.name === "t3") {
                            ctx.drawImage(tile.img, pX, pY - 20, tile.tileW, tile.tileH);
                        } else {
                            ctx.drawImage(tile.img, pX, pY, tile.tileW, tile.tileH);
                        }
                    }
                }
            }
        }
    }

    parseMap(tilesJSON) {
        this.mapData = JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.xCount * this.tSize.y;
        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            let img = new Image();
            img.onload = () => {
                this.imgLoadCount++;
                if (this.imgLoadCount === this.mapData.tilesets.length) {
                    this.imgLoaded = true;
                }
            };
            img.src = this.mapData.tilesets[i].image;
            let t = this.mapData.tilesets[i];
            let ts = {
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / this.tSize.x),
                yCount: Math.floor(t.imageheight / this.tSize.y),
                tileW: t.imagewidth,
                tileH: t.imageheight
            };
            this.tilesets.push(ts);
        }
        this.jsonLoaded = true;
    }

    getTile(tileIndex) {
        let tile = {
            img: null,
            px: 0,
            py: 0,
            tileW: 0,
            tileH: 0,
            name: null
        };
        let tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        tile.tileH = tileset.tileH;
        tile.tileW = tileset.tileW;
        tile.name = tileset.name;
        let id = tileIndex - tileset.firstgid;
        let x = id % tileset.xCount;
        let y = Math.floor(id / tileset.xCount);
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
        return !(x + width < this.view.x || y + height < this.view.y || x > this.view.x + this.view.w || y > this.view.y + this.view.h);
    }

    parseEntities() {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => {
                this.parseEntities();
            }, 100);
        } else
            for (let j = 0; j < this.mapData.layers.length; j++)
                if (this.mapData.layers[j].type === 'objectgroup') {
                    let entities = this.mapData.layers[j];
                    for (let i = 0; i < entities.objects.length; i++) {
                        let e = entities.objects[i];
                        try {
                            let obj = new gameManager.factory[e.type]();
                            obj.name = e.name;
                            obj.pos_x = e.x;
                            obj.pos_y = e.y;
                            obj.size_x = e.width;
                            obj.size_y = e.height;
                            gameManager.entities.push(obj);
                            if (obj.name === "player")
                                gameManager.initPlayer(obj);
                        } catch (ex) {
                            console.log("" + e.gid + e.type + ex);
                        }
                    }
                }
    }

    getTilesetIdx(x, y) {
        const wX = x;
        const wY = y;
        const idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
        return this.tLayer[1].data[idx];
    }

    centerAt(x, y) {
        if (x < this.view.w / 2)
            this.view.x = 0;
        else if (x > this.mapSize.x - this.view.w / 2)
            this.view.x = this.mapSize.x - this.view.w;
        else
            this.view.x = x - (this.view.w / 2);
    }

}