import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, useLogger, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
    const logger = useLogger();
    const rectRef = createRef<Rect>();

    view.add(
        <Rect
            ref={rectRef}
            position={[10, 40]}
            width={20}
            height={20}
            fill="red"
        />
    );

    // ВАЖНО: Даем движку один кадр на просчет координат,
    // иначе он может показать старые данные или нули.

    // Получаем вектор
    const pos = rectRef().absolutePosition();;

logger.info(JSON.stringify(rectRef().worldToLocal()));

    // Выводим красиво, чтобы было понятно
   
logger.info(JSON.stringify({
        x: pos.x,
        y: pos.y,
    }));
    yield* waitFor(6);
});
