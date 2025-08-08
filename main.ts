namespace SpriteKind {
    export const Cursor = SpriteKind.create()
    export const Unused = SpriteKind.create()
    export const MenuTower = SpriteKind.create()
    export const Indicator = SpriteKind.create()
    export const Tower = SpriteKind.create()
}
namespace OverlapEvents {
    sprites.onOverlap(SpriteKind.Cursor, SpriteKind.MenuTower, function (sprite: Sprite, otherSprite: Sprite): void {
        let currentTowerSprite: Sprite = sprites.readDataSprite(sprite, "currentTower")
        if (browserEvents.MouseLeft.isPressed() && !currentTowerSprite) {
            let towerSprite: Sprite = sprites.create(otherSprite.image, SpriteKind.Player)
            sprites.setDataSprite(sprite, "currentTower", towerSprite)

        }
    })
}

let cursorSprite: Sprite = null
let currentMapPath: tiles.Location[]
let isValidTile: boolean = false
let enemyPath: tiles.Location[] = null
let waveStart: boolean = true

onStart()

function onStart() : void {
    createCursor()
    createLevel()
    createTowerMenu()
}

function createTowerMenu(): void {
    let tileSprite: Sprite = sprites.create(assets.image`whiteBackground`, SpriteKind.Unused)
    tileSprite.setFlag(SpriteFlag.RelativeToCamera, true)
    let towerObject: Sprite = sprites.create(assets.image`testTower`, SpriteKind.MenuTower)
    tileSprite.setPosition(scene.screenWidth() / 2, scene.screenHeight() - (tileSprite.image.height / 2))
    forever(function (): void {
        towerObject.setPosition(tileSprite.x + scene.cameraProperty(CameraProperty.Left), tileSprite.y + scene.cameraProperty(CameraProperty.Top))
    })
}

function createCursor(): void {
    cursorSprite = sprites.create(assets.image`cursor`, SpriteKind.Cursor)
    cursorSprite.z = 1000
    sprites.setDataSprite(cursorSprite, "currentTower", null)

    let currentTileIndicatorSprite: Sprite = sprites.create(SpriteSheet.tileIndicatorImage, SpriteKind.Indicator)
    animation.runImageAnimation(currentTileIndicatorSprite, SpriteSheet.tileIndicatorValidAnimation, 150, true)

    sprites.setDataSprite(cursorSprite, "currentTileIndicator", currentTileIndicatorSprite)

    forever(function (): void {

        currentTileIndicatorSprite.setFlag(SpriteFlag.Invisible, !isValidTile)

        cursorSprite.setPosition(scene.cameraProperty(CameraProperty.Left) + browserEvents.mouseX(), scene.cameraProperty(CameraProperty.Top) + browserEvents.mouseY())
        tiles.placeOnTile(currentTileIndicatorSprite, cursorSprite.tilemapLocation())
        isValidTile = validTileCheck()


        let towerSprite: Sprite = sprites.readDataSprite(cursorSprite, "currentTower")
        if (!towerSprite) {
            return
        }

        if (browserEvents.MouseLeft.isPressed()) {
            towerSprite.setPosition(cursorSprite.x, cursorSprite.y)
        } else if (isValidTile) {
            tiles.placeOnTile(towerSprite, cursorSprite.tilemapLocation())
            towerSprite.setKind(SpriteKind.Tower)
            sprites.setDataSprite(cursorSprite, "currentTower", null)
        } else {
            towerSprite.destroy(effects.fire, 250)
        }
    })
}

function validTileCheck(): boolean {
    let currentTileIndicatorSprite: Sprite = sprites.readDataSprite(cursorSprite, "currentTileIndicator")

    if (!tiles.tileAtLocationEquals(cursorSprite.tilemapLocation(), assets.image`blankImage`)) {
        return false
    }
    for (let tower of sprites.allOfKind(SpriteKind.Tower)) {
        let cursorTileLocation: Vector2 = new Vector2(cursorSprite.tilemapLocation().column, cursorSprite.tilemapLocation().row)
        let towerTileLocation: Vector2 = new Vector2(tower.tilemapLocation().column, tower.tilemapLocation().row)
        if (cursorTileLocation.compare(towerTileLocation)) {
            return false
        }
    }


    return true
}
function createLevel() : void {
    scene.setTileMapLevel(assets.tilemap`test`)
    scene.setBackgroundColor(8)
    // mousePositionCameraController()
    // keyboardCameraController()
    cameraController()
}

// This doesn't work! :(
function constructTilePath(): tiles.Location[] {
    let startingTileLocation: tiles.Location[] = tiles.getTilesByType(assets.tile`spawnTile`)
    let finishTileLocation: tiles.Location[] = tiles.getTilesByType(assets.tile`finishTile`)
    let path: tiles.Location[] = scene.aStar(startingTileLocation[0], finishTileLocation[0], assets.tile`pathTile`)


    return path
}

function createEnemy() {
    let enemySprite: Sprite = sprites.create(assets.image`enemyImage`, SpriteKind.Enemy)
    let currentDirection: Vector2 = Vector2.ZERO()
    tiles.placeOnRandomTile(enemySprite, assets.tile`spawnTile`)
    let enemyStatusBar: StatusBarSprite = statusbars.create(10, 4, StatusBarKind.Health)
    enemyStatusBar.attachToSprite(enemySprite)
    enemyStatusBar.value = 100
    let enemyDuration: number = 750

    spriteutils.onSpriteUpdateInterval(enemySprite, enemyDuration, function (sprite: Sprite): void {
        let targetDirection: Vector2 = Vector2.ZERO()
        let spriteTileLocation: Vector2 = new Vector2(sprite.tilemapLocation().column, sprite.tilemapLocation().row)
        let directionVectors: Vector2[] = [
            Vector2.UP(),
            Vector2.RIGHT(),
            Vector2.DOWN(),
            Vector2.LEFT()
        ]
        for (let direction of directionVectors) {
            if (direction.compare(currentDirection.scale(-1))) {
                continue
            }
            targetDirection = spriteTileLocation.add(direction)
            if (!tileUtil.tileIs(tileUtil.currentTilemap(), targetDirection.toTileLocation(), assets.image`blankImage`)) {
                currentDirection = direction
                break
            }
        }

        spriteutils.moveTo(sprite, targetDirection.toTileLocation(), enemyDuration, false)

    })


}

forever(function (): void {
    if (!waveStart) {
        return
    }
    createEnemy()
    pause(5000)
})

function cameraController(): void {
    let cameraPosition: Vector2 = new Vector2(scene.cameraProperty(CameraProperty.X), scene.cameraProperty(CameraProperty.Y))
    const screenSize: Vector2 = new Vector2(scene.screenWidth(), scene.screenHeight())
    const tileMapSize: Vector2 = new Vector2(game.currentScene().tileMap.areaWidth(), game.currentScene().tileMap.areaHeight())
    const cameraSpeed: number = 0.2
    let startingPosition: Vector2 = Vector2.ZERO()

    browserEvents.MouseRight.onEvent(browserEvents.MouseButtonEvent.Pressed, function (x: number, y: number) {
        startingPosition = getGlobalMousePoisition()
    })
    forever(function (): void {
        let displacement: Vector2 = Vector2.ZERO()
        // right click and drag to move the camera
        if (browserEvents.MouseRight.isPressed()) {
            displacement = getGlobalMousePoisition().subtract(startingPosition)
        }
        cameraPosition = cameraPosition.add(displacement.scale(cameraSpeed))

        cameraPosition = new Vector2(
            Math.clamp(screenSize.x / 2, tileMapSize.x, cameraPosition.x),
            Math.clamp(screenSize.y / 2, tileMapSize.y, cameraPosition.y)
        )

        // Use arrow keys to move the camera
        if (controller.up.isPressed()) {
            cameraPosition.y -= cameraSpeed * game.getDeltaTime()
        } else if (controller.down.isPressed()) {
            cameraPosition.y += cameraSpeed * game.getDeltaTime()
        }
        if (controller.left.isPressed()) {
            cameraPosition.x -= cameraSpeed * game.getDeltaTime()
        } else if (controller.right.isPressed()) {
            cameraPosition.x += cameraSpeed * game.getDeltaTime()
        }

        scene.centerCameraAt(
            cameraPosition.x,
            cameraPosition.y
        )

    })
}


function keyboardCameraController() : void {
    let cameraPosition: Vector2 = new Vector2(scene.cameraProperty(CameraProperty.X), scene.cameraProperty(CameraProperty.Y))
    const screenSize: Vector2 = new Vector2(scene.screenWidth(), scene.screenHeight())
    const tileMapSize: Vector2 = new Vector2(game.currentScene().tileMap.areaWidth(), game.currentScene().tileMap.areaHeight())
    const cameraSpeed: number = 1.0
    
    forever(function() { 
        if (controller.up.isPressed()) {
            cameraPosition.y -= cameraSpeed * game.getDeltaTime()
        } else if (controller.down.isPressed()) {
            cameraPosition.y += cameraSpeed * game.getDeltaTime()
        }
        if (controller.left.isPressed()) {
            cameraPosition.x -= cameraSpeed * game.getDeltaTime()
        } else if (controller.right.isPressed()) {
            cameraPosition.x += cameraSpeed * game.getDeltaTime()
        }

        cameraPosition = new Vector2(
            Math.clamp(screenSize.x / 2, tileMapSize.x, cameraPosition.x),
            Math.clamp(screenSize.y / 2, tileMapSize.y, cameraPosition.y)
        )

        scene.centerCameraAt(
            cameraPosition.x,
            cameraPosition.y
        )
    })
}


function mousePositionCameraController() : void {
    let cameraPosition: Vector2 = new Vector2(scene.cameraProperty(CameraProperty.X), scene.cameraProperty(CameraProperty.Y))
    let cursorDistanceFromCameraCentre: Vector2 = Vector2.ZERO()
    const screenSize: Vector2 = new Vector2(scene.screenWidth(), scene.screenHeight())
    const tileMapSize: Vector2 = new Vector2(game.currentScene().tileMap.areaWidth(), game.currentScene().tileMap.areaHeight())
    const cameraSpeed: number = 5.0
    const minimumRadius: number = 30.0
    
    forever(function(){
        cursorDistanceFromCameraCentre = new Vector2(
            cursorSprite.x - scene.cameraProperty(CameraProperty.X), 
            cursorSprite.y - scene.cameraProperty(CameraProperty.Y)
            )
        
        if(cursorDistanceFromCameraCentre.length() > minimumRadius){
            cameraPosition = cameraPosition.add(
                    cursorDistanceFromCameraCentre.normalize().scale(cameraSpeed),
                )
        }

        cameraPosition = new Vector2(
            Math.clamp(screenSize.x / 2, tileMapSize.x, cameraPosition.x),
            Math.clamp(screenSize.y / 2, tileMapSize.y, cameraPosition.y)
        )
        
        scene.centerCameraAt(
            cameraPosition.x,
            cameraPosition.y
        )
    })
}


function getLocalMousePosition() : Vector2 {
    return new Vector2(browserEvents.mouseX(), browserEvents.mouseY())
}

function getGlobalMousePoisition() : Vector2 {
    let localMousePosition: Vector2 = getLocalMousePosition()
    let cameraPosition: Vector2 = new Vector2(scene.cameraProperty(CameraProperty.Left), scene.cameraProperty(CameraProperty.Top))
    let globalMousePosition: Vector2 = localMousePosition.add(cameraPosition)

    return globalMousePosition
}