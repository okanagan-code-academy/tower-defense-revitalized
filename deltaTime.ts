namespace game {
    /**
    * The amount of time elapsed per frame
    *
    */
    //% block
    //% group="Gameplay"
    //% help=game/delta-time weight=100
    //% blockId=deltatime block="delta time"
    //% blockAllowMultiple=1
    export function getDeltaTime(): number {
        return control.eventContext().deltaTimeMillis
    }
}