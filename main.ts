namespace SpriteKind {
    export const Cursor = SpriteKind.create()
    export const Unused = SpriteKind.create()
    export const MenuTower = SpriteKind.create()
    export const Indicator = SpriteKind.create()
}

let cursorSprite: Sprite = null

onStart()

function onStart() : void {
    createCursor()
    createLevel()
    createTowerMenu()
}

function createTowerMenu() : void {
    let tileSprite: Sprite =sprites.create(assets.image`whiteBackground`, SpriteKind.Unused)
    tileSprite.setFlag(SpriteFlag.RelativeToCamera, true)
    let towerObject: Sprite = sprites.create(assets.image`testTower`, SpriteKind.MenuTower)
    towerObject.setFlag(SpriteFlag.RelativeToCamera, true)
    tileSprite.setPosition(scene.screenWidth() / 2 , scene.screenHeight() - (tileSprite.image.height / 2))
    towerObject.setPosition(tileSprite.x, tileSprite.y)
}

function createCursor() : void {
    cursorSprite = sprites.create(assets.image`cursor`, SpriteKind.Cursor)
    let currentTileIndicatorSprite: Sprite = sprites.create(SpriteSheet.tileIndicatorImage, SpriteKind.Indicator)
    sprites.setDataSprite(cursorSprite, "currentTileIndicator", currentTileIndicatorSprite)
    forever(function(){
        cursorSprite.setPosition(scene.cameraProperty(CameraProperty.Left) + browserEvents.mouseX(), scene.cameraProperty(CameraProperty.Top) + browserEvents.mouseY())
        tiles.placeOnTile(currentTileIndicatorSprite, cursorSprite.tilemapLocation())
        if(tiles.tileAtLocationEquals(cursorSprite.tilemapLocation(), assets.image`blankImage`)) {
            currentTileIndicatorSprite.setFlag(SpriteFlag.Invisible, false)
        } else {
            currentTileIndicatorSprite.setFlag(SpriteFlag.Invisible, true)
        }
    })
}

function createLevel() : void {
    scene.setTileMapLevel(assets.tilemap`test`)
    scene.setBackgroundColor(7)
    // mousePositionCameraController()
    // keyboardCameraController()
    mouseDragController()
}


function mouseDragController() : void {
    let cameraPosition: Vector2 = new Vector2(scene.cameraProperty(CameraProperty.X), scene.cameraProperty(CameraProperty.Y))
    const screenSize: Vector2 = new Vector2(scene.screenWidth(), scene.screenHeight())
    const tileMapSize: Vector2 = new Vector2(game.currentScene().tileMap.areaWidth(), game.currentScene().tileMap.areaHeight())
    const cameraSpeed: number = 0.2
    let startingPosition: Vector2 = Vector2.ZERO()

    browserEvents.MouseRight.onEvent(browserEvents.MouseButtonEvent.Pressed, function(x: number, y:number) { 
        startingPosition = getGlobalMousePoisition()
    })
    forever(function() { 
        let displacement: Vector2 = Vector2.ZERO()
        
        if(browserEvents.MouseRight.isPressed()){
            displacement = getGlobalMousePoisition().subtract(startingPosition)
        }
        cameraPosition = cameraPosition.add(displacement.scale(cameraSpeed))

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