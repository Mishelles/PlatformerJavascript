class PhysicManager {
    update(obj) {
        if (obj.pos_y > 650 || obj.pos_y < 0) {
            obj.kill();
            return "stop";
        }
        if (obj.move_x === 2 && obj.move_y === 2) {
            return "stop";
        }
        if (obj.move_y === 4) {
            obj.pos_y -= 30;
            return "move";
        }
        if (obj.move_x === 3 && obj.move_y === 3) {
            let i = obj.goIt;
            let j = i;
            if (i >= 4) j = i - 4;
            if (obj.goLeft === true) {
                obj.pos_x += 10;
                obj.position = obj.right[j];
                i++;
                if (i === 8) {
                    obj.goIt = 0;
                    obj.goLeft = false;
                } else obj.goIt = i;
            } else {
                obj.pos_x -= 10;
                obj.position = obj.left[j];
                i++;
                if (i === 8) {
                    obj.goIt = 0;
                    obj.goLeft = true;
                } else obj.goIt = i;
            }
            return "move";
        }
        let newX = undefined;
        let newY = undefined;
        if (obj.jump === true && obj.move_y === 0) {
            newX = obj.pos_x;
            newY = obj.pos_y + 50;
            let ts = mapManager.getTilesetIdx(newX - 10 + obj.size_x / 2, newY + obj.size_y / 2);
            if (ts !== 0 && obj.onTouchMap) {
                obj.jump = false;
                obj.onTouchMap(ts);
            }
            if (obj.jump === true) {
                obj.pos_y += 10;
            }
        }
        if (obj.move_x === 0 && obj.move_y === 0) {
            newX = obj.pos_x;
            newY = obj.pos_y + 50;
            let ts = mapManager.getTilesetIdx(newX - 10 + obj.size_x / 2, newY + obj.size_y / 2);
            if (ts !== 0 && obj.onTouchMap) {
                return "stop";
            }
            obj.pos_y += 10;
            return "stop";
        }
        if (obj.move_x !== 0 && obj.move_y === 0) {
            newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
            newY = obj.pos_y + 50;
            let ts = mapManager.getTilesetIdx(newX - 10 + obj.size_x / 2, newY + obj.size_y / 2);
            if (ts === 0 && obj.onTouchMap) {
                obj.pos_y += 10;
            }
        }
        if (obj.move_y !== 0) {
            newX = obj.pos_x;
            newY = obj.pos_y + 50;
            let ts = mapManager.getTilesetIdx(obj.pos_x - 10 + obj.size_x / 2, newY + obj.size_y / 2);
            if (ts === 0 && obj.onTouchMap) {
                return;
            }
        }
        if (obj.jump === true) {
            newX = obj.pos_x + Math.floor(obj.move_x * obj.speed) + obj.move_x * 20;
        } else {
            newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        }
        if (newX < 10) return "stop";
        newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);
        let ts = mapManager.getTilesetIdx(newX + obj.size_x / 2, newY + obj.size_y / 2);
        let e = this.entityAtXY(obj, newX, newY);
        if (e !== null && obj.onTouchEntity) {
            obj.onTouchEntity(e);
        }
        if (ts !== 0 && obj.onTouchMap) {
            obj.jump = false;
            obj.onTouchMap(ts);
        }
        if (ts === 0 && e === null) {
            obj.pos_x = newX;
            obj.pos_y = newY;
        } else
            return "break";
        return "move";
    }

    entityAtXY(obj, x, y) {
        for(let i = 0; i < gameManager.entities.length; i++) {
            let e = gameManager.entities[i];
            if(e.name !== obj.name) {
                if(x + obj.size_x < e.pos_x || y + obj.size_y < e.pos_y || x > e.pos_x + e.size_x  || y > e.pos_y + e.size_y)
                    continue;
                return e;
            }
        }
        return null;
    }
}