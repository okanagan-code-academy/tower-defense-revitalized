class Vector2 {
    public x: number = 0
    public y: number = 0

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
    static ONE() {
        return new Vector2(1, 1)
    }
    static ZERO() {
        return new Vector2(0, 0)
    }
    length(): number {
        let vector: Vector2 = Vector2.ZERO()
        return spriteutils.distanceBetween(this, vector)
    }
    angle(): number {
        return Math.atan2(this.y, this.x)
    }
    add(vector2: Vector2): Vector2 {
        return new Vector2(this.x + vector2.x, this.y + vector2.y)
    }
    subtract(vector2: Vector2): Vector2 {
        return new Vector2(vector2.x - this.x, vector2.y - this.y)
    }
    normalize(): Vector2 {
        let length: number = this.length()
        return new Vector2(this.x / length, this.y / length)
    }
    scale(scalar: number): Vector2 {
        return new Vector2(scalar * this.x, scalar * this.y)
    }
    lerp(vector1: Vector2, t: number): Vector2 {
        let resultVector: Vector2 = Vector2.ZERO()
        resultVector.x = Math.lerp(this.x, vector1.x, t)
        resultVector.y = Math.lerp(this.y, vector1.y, t)
        return resultVector
    }
    dot(vector1: Vector2): number {
        return this.x * vector1.x + this.y * vector1.y
    }
    compare(vector1: Vector2): boolean {
        return (this.x == vector1.x) && (this.y == vector1.y)
    }
    toTileLocation(): tiles.Location {
        /**
        * A niche case to convert a Vector2 to Tile Location
        * @param x correpsonds with a column
        * @param y correpsonds with a row
        */
        return tiles.getTileLocation(this.x, this.y)
    }
}

namespace SpriteSheet {
    export const tileIndicatorImage: Image = assets.image`tileIndicator`
    export const tileIndicatorValidAnimation: Image[] = [
        assets.image`tileIndicator`,
        assets.image`tileIndicatorTransition1`,
        assets.image`tileIndicatorTransition2`,
        assets.image`tileIndicatorTransition1`,
        assets.image`tileIndicator`,
        assets.image`blankImage`,
        assets.image`blankImage`,
        assets.image`blankImage`,
    ]
}
