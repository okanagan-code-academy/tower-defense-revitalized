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
//% weight=100 color=#8E2EC4 icon=""
namespace Math {
    /**
    * Linear interpolation between two values
    * @param value0 is a real number, eg: 25.44
    * @param value1 is a different real number, eg: 52.14
    */
    //% block
    //% help=math/linear-interpolation weight=100
    //% blockId=lerp block="linear interpolation"
    //% blockAllowMultiple=1
    export function lerp(value0: number, value1: number, t: number): number {
        return value0 + t * (value1 - value0);
    }
    /**
    * Linear interpolation between two values, in particular with angles.
    * Angles are restricted between the interval [-PI, PI]
    * @param value0 is a real number, eg: 25.44
    * @param value1 is a different real number, eg: 52.14
    */
    //% block
    //% help=math/linear-interpolation-angles weight=100
    //% blockId=lerpAngle block="linear interpolation for angles"
    //% blockAllowMultiple=1
    export function lerpAngle(value0: number, value1: number, t: number): number {
        let horizontalComponent = (1 - t) * Math.cos(value0) + t * Math.cos(value1);
        let verticalComponent = (1 - t) * Math.sin(value0) + t * Math.sin(value1);
        return Math.atan2(verticalComponent, horizontalComponent);
    }
}
