namespace SpriteKind {
    export const Cursor = SpriteKind.create()
    export const Unused = SpriteKind.create()
    export const MenuTower = SpriteKind.create()
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
    forever(function(){
        cursorSprite.setPosition(scene.cameraProperty(CameraProperty.Left) + browserEvents.mouseX(), scene.cameraProperty(CameraProperty.Top) + browserEvents.mouseY())
    })
}

function createLevel() : void {
    scene.setTileMapLevel(assets.tilemap`test`)
    cameraController()
}


function cameraController() : void {
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
        // if(controller.up.isPressed()){
        //     cameraPosition.y -= cameraSpeed * game.getDeltaTime()
        // } else if (controller.down.isPressed() && cameraPosition.y < game.currentScene().tileMap.areaHeight()){
        //     cameraPosition.y += cameraSpeed * game.getDeltaTime()
        // }
        // if(controller.left.isPressed()){
        //     cameraPosition.x -= cameraSpeed * game.getDeltaTime()
        // } else if (controller.right.isPressed() && cameraPosition.x < game.currentScene().tileMap.areaWidth()){
        //     cameraPosition.x += cameraSpeed * game.getDeltaTime()
        // }


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
