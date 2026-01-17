import { makeScene2D } from "@motion-canvas/2d";
import { createRef, waitFor } from "@motion-canvas/core";
import { CartesianSystem } from "../components/cartesian-system";

export default makeScene2D(function* (view) {
    const system = createRef<CartesianSystem>();

    view.add(
        <CartesianSystem
            ref={system}
            width={view.width()}
            height={view.height()}
            spacing={100}
        />,
    );

    yield* system().setup();
    yield* waitFor(0.5);

    const player = yield* system().showPointAndTransform(1, 1, "#FFF", "P");
    yield* waitFor(0.2);

    const enemy = yield* system().showPointAndTransform(4, 2, "#FF647F", "E");
    yield* waitFor(0.5);
   
   yield* system().subVectors(enemy, player, "#FFE66D", "dir");
});
