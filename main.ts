namespace SpriteKind {
    export const Cursor = SpriteKind.create()
}

let cursorSprite: Sprite = null

onStart()

function onStart() : void {
    createCursor()
    createLevel()
}

function createCursor() : void {
    cursorSprite = sprites.create(assets.image`cursor`, SpriteKind.Cursor)
    forever(function(){
        cursorSprite.setPosition(browserEvents.mouseX() + scene.cameraProperty(CameraProperty.Left), browserEvents.mouseY() + scene.cameraProperty(CameraProperty.Top))
    })
}

function createLevel() : void {
    scene.setTileMapLevel(assets.tilemap`test`)
    cameraController()
}

function cameraController() : void {
    let cameraPosition: Vector2 = Vector2.ZERO()
    const cameraSpeed: number = 0.25
    forever(function(){
        if(controller.up.isPressed() && cameraPosition.y > 0){
            cameraPosition.y -= cameraSpeed * game.getDeltaTime()
        } else if (controller.down.isPressed() && cameraPosition.y < game.currentScene().tileMap.areaHeight()){
            cameraPosition.y += cameraSpeed * game.getDeltaTime()
        }
        if(controller.left.isPressed() && cameraPosition.x > 0){
            cameraPosition.x -= cameraSpeed * game.getDeltaTime()
        } else if (controller.right.isPressed() && cameraPosition.x < game.currentScene().tileMap.areaWidth()){
            cameraPosition.x += cameraSpeed * game.getDeltaTime()
        }
        scene.centerCameraAt(cameraPosition.x, cameraPosition.y)
    })
}