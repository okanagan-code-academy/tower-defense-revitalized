namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 320
    export const ARCADE_SCREEN_HEIGHT = 240
}

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
    static UP(): Vector2 {
        return new Vector2(0, -1)
    }
    static RIGHT(): Vector2 {
        return new Vector2(1, 0)
    }
    static DOWN(): Vector2 {
        return new Vector2(0, 1)
    }
    static LEFT(): Vector2 {
        return new Vector2(-1, 0)
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
    export const projectileTurret: Image =assets.image`projetileTurret`

    export const bullets: Image[] = [
            assets.image`bullet`,
            assets.image`bullet1`,
            assets.image`bullet2`,
            assets.image`bullet3`,

        ]
    export const towerBases: Image[] = [
            assets.image`base1`,
            assets.image`base2`,
            assets.image`base3`,
            assets.image`base4`,
            assets.image`base5`,
        ]
}


class Turret {
    turretImage: Image
    spriteKind: number = SpriteKind.Unused
    baseSprite: Sprite
    sightRange: number
    cost: number


    constructor(image: Image, baseSprite: Sprite, range: number, cost: number) {
        this.turretImage = image
        this.baseSprite = baseSprite
        this.sightRange = range
        this.cost = cost
    }
    createSprite(position: Vector2): Sprite {
        return null
    }
}

class ProjectileTurret extends Turret {
    projectile: Projectile 
    speed: number
    fireRate: number
    magazineCapacity: number
    reloadDuration: number

    constructor(speed: number, fireRate: number, magazineCapacity: number, reloadDuration: number) {
        const image: Image = SpriteSheet.projectileTurret
        const range: number = 100
        const cost: number = 25
        const projectile: Projectile = new Projectile(SpriteSheet.bullets._pickRandom(), 0, 2)
        const baseSprite: Sprite = sprites.create(SpriteSheet.towerBases._pickRandom(), SpriteKind.Unused)

        super(image, baseSprite, range, cost)
        this.projectile = projectile
        this.speed = speed
        this.fireRate = fireRate
        this.magazineCapacity = magazineCapacity
        this.reloadDuration = reloadDuration

    }
    createSprite(position: Vector2): Sprite {
        let turretSprite: Sprite = sprites.create(this.turretImage, this.spriteKind)
        let currentTarget: Sprite = null
        sprites.setDataSprite(turretSprite, "baseSprite", this.baseSprite)
        forever(function() : void {
            let nearbyTargets: Sprite[] = spriteutils.getSpritesWithin(SpriteKind.Enemy, this.sightRange, turretSprite)
            currentTarget = nearbyTargets[0]
            if(currentTarget) {
                transformSprites.rotateSprite(turretSprite, Math.lerpAngle(transformSprites.getRotation(turretSprite), spriteutils.angleFrom(turretSprite, currentTarget), 1 - Math.exp(-game.getDeltaTime())))
            }
        })
        let remainingAmmo: number = this.magazineCapacity
        
        forever(function(): void {
            if(remainingAmmo <= 0){
                remainingAmmo = this.magazineCapacity
                pause(this.reloadDuration)
                return
            }
            if(currentTarget){
                this.projectile.shootProjectile(turretSprite, spriteutils.angleFrom(turretSprite, currentTarget), this.speed)
                remainingAmmo -= 1
                pause(this.fireRate)
            }
        })
        return turretSprite
    }

}

class Projectile {
    image: Image
    health: number
    damage: number
    size: number

    constructor(image: Image, health: number = 0, damage: number) {
        this.image = image
        this.health = health
        this.damage = damage
    }

    shootProjectile(sprite: Sprite, angle: number, speed: number): Sprite {
        let projectile: Sprite = sprites.create(this.image, SpriteKind.Projectile)
        sprites.setDataNumber(projectile, "health", this.health)
        sprites.setDataNumber(projectile, "damage", this.damage)
        projectile.setPosition(sprite.x, sprite.y)
        spriteutils.setVelocityAtAngle(projectile, angle, speed)
        return projectile
    }
}

class ExplosiveProjectile extends Projectile {

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