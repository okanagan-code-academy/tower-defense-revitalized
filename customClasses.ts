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
    export const explosion: Image[] = [
        sprites.projectile.explosion1,
        sprites.projectile.explosion2,
        sprites.projectile.explosion3,
        sprites.projectile.explosion4,
    ]
}


class Turret {
    image: Image
    spriteKind: number = SpriteKind.Unused
    parent: Sprite
    sightRange: number


    constructor(image: Image, parent: Sprite, range: number) {
        this.image = image
        this.parent = parent
        this.sightRange = range
    }
    createSprite(): Sprite {
        return null
    }
}

class ProjectileTurret extends Turret {
    projectileImage: Image
    speed: number
    fireRate: number
    magazineCapacity: number
    reloadDuration: number

    constructor(image: Image, parent: Sprite, projectileImage: Image, speed: number, fireRate: number, magazineCapacity: number, reloadDuration: number, range: number) {
        super(image, parent, range)
        this.projectileImage = projectileImage
        this.speed = speed
        this.fireRate = fireRate
        this.magazineCapacity = magazineCapacity
        this.reloadDuration = reloadDuration

    }
    createSprite(): Sprite {
        let sprite: Sprite = sprites.create(this.image, this.spriteKind)


        return sprite
    }

}

class Projectile {
    image: Image
    health: number

    constructor(image: Image, health: number = 0) {
        this.image = image
        this.health = health
    }

    shootProjectile(sprite: Sprite, angle: number, speed: number): Sprite {
        let projectile: Sprite = sprites.create(this.image, SpriteKind.Projectile)
        sprites.setDataNumber(projectile, "health", this.health)
        projectile.setPosition(sprite.x, sprite.y)
        spriteutils.setVelocityAtAngle(projectile, angle, speed)
        return projectile
    }
}

class ExplosiveProjectile extends Projectile {
    size: number = 4

    shootProjectile(sprite: Sprite, angle: number, speed: number): Sprite {
        let projectile: Sprite = super.shootProjectile(sprite, angle, speed)
        projectile.onDestroyed(function (): void {
            let position: Vector2 = new Vector2(projectile.x, projectile.y)
            createExplosion(position, this.size)
        })
        return projectile

    }
}

function createExplosion(target: Vector2, size: number): void {
    const intervalDuration: number = 50
    let vfxSprite: Sprite = sprites.create(assets.image`blankImage`, SpriteKind.Unused)
    vfxSprite.setPosition(target.x, target.y)
    animation.runImageAnimation(vfxSprite, SpriteSheet.explosion, intervalDuration, false)
    vfxSprite.lifespan = intervalDuration * SpriteSheet.explosion.length
}