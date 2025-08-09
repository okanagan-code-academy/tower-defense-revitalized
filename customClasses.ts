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
    export const towerMenuFrame: Image =assets.image`towerMenuFrame`
}


class Tower {
    menuImage: Image
    turretObject: Turret
    cost: number
    static towerMenuSprites: Sprite[] = []
    static tileFrameSprites: Sprite[] = []

    constructor(image: Image, turret: Turret, cost: number) {
        this.menuImage = image
        this.turretObject = turret
        this.cost = cost
    }

    createMenuSprite(): void {
        let tileSprite: Sprite = sprites.create(SpriteSheet.towerMenuFrame, SpriteKind.MenuFrame)
        Tower.tileFrameSprites.push(tileSprite)
        tileSprite.setFlag(SpriteFlag.RelativeToCamera, true)
        let menuTowerSprite: Sprite = sprites.create(this.menuImage, SpriteKind.MenuTower)
        Tower.towerMenuSprites.push(menuTowerSprite)
        let totalTowers: number = Tower.towerMenuSprites.length
        let startingPositionX: number = (scene.screenWidth() / 2)
        if (totalTowers > 1) {
            startingPositionX = (scene.screenWidth() / 2) - ((totalTowers * SpriteSheet.towerMenuFrame.width) / 2)
        }
        let index: number = 0
        for (let tile of Tower.tileFrameSprites) {
            tile.setPosition(startingPositionX + index * tile.image.width, scene.screenHeight() - (tile.image.height / 2))
        }

        forever(function (): void {
            menuTowerSprite.setPosition(tileSprite.x + scene.cameraProperty(CameraProperty.Left), tileSprite.y + scene.cameraProperty(CameraProperty.Top))
        })
    }
    createTowerSprite(): Sprite {
        let towerSprite: Sprite = sprites.create(this.menuImage, SpriteKind.PsuedoTower)
        sprites.setDataNumber(towerSprite, "cost", this.cost)
        info.changeScoreBy((-1)*this.cost)
        return towerSprite
    }
    createTurretSprite(parentSprite: Sprite): Sprite {
        let turretSprite: Sprite = this.turretObject.createSprite(parentSprite)
        return turretSprite
    }

}
class ProjectileTower extends Tower {
    constructor() {
        const image: Image = SpriteSheet.towerBases[1]
        const projectileTurret = new ProjectileTurret()
        const cost: number = 25
        super(image, projectileTurret, cost)
    }
}

class Turret {
    image: Image
    spriteKind: number = SpriteKind.Unused
    sightRange: number


    constructor(image: Image, range: number) {
        this.image = image
        this.sightRange = range
    }
    createSprite(towerSprite: Sprite): Sprite {
        return null
    }
}

class ProjectileTurret extends Turret {
    projectile: Projectile
    speed: number
    fireRate: number
    magazineCapacity: number
    reloadDuration: number

    constructor() {
        const image: Image = SpriteSheet.projectileTurret
        const range: number = 50
        const projectile: Projectile = new Projectile(SpriteSheet.bullets._pickRandom(), 0, 2)
        const speed: number = 100
        const fireRate: number = 50
        const magazineCapacity: number = 25
        const reloadDuration: number = 1000

        super(image, range)
        this.projectile = projectile
        this.speed = speed
        this.fireRate = fireRate
        this.magazineCapacity = magazineCapacity
        this.reloadDuration = reloadDuration

    }
    createSprite(parentSprite: Sprite): Sprite {
        let turretSprite: Sprite = sprites.create(this.image, this.spriteKind)
        turretSprite.setPosition(parentSprite.x, parentSprite.y)
        let currentTarget: Sprite = null
        sprites.setDataSprite(turretSprite, "parentSprite", parentSprite)
        forever(function (): void {
            // turretSprite.setPosition(parentSprite.x, parentSprite.y)
            let nearbyTargets: Sprite[] = spriteutils.getSpritesWithin(SpriteKind.Enemy, this.sightRange, turretSprite)
            currentTarget = nearbyTargets[0]
            if (currentTarget) {
                transformSprites.rotateSprite(turretSprite, spriteutils.radiansToDegrees(Math.lerpAngle(transformSprites.getRotation(turretSprite), spriteutils.angleFrom(turretSprite, currentTarget), 1 - Math.exp(-game.getDeltaTime()))))
            }
        })
        let remainingAmmo: number = this.magazineCapacity

        forever(function (): void {
            if (remainingAmmo <= 0) {
                remainingAmmo = this.magazineCapacity
                pause(this.reloadDuration)
            } else if (currentTarget) {
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
        const offset: number = 5
        let projectile: Sprite = sprites.create(this.image, SpriteKind.Projectile)
        projectile.setFlag(SpriteFlag.GhostThroughWalls, true)
        sprites.setDataNumber(projectile, "health", this.health)
        sprites.setDataNumber(projectile, "damage", this.damage)
        spriteutils.placeAngleFrom(projectile, angle, offset, sprite)
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