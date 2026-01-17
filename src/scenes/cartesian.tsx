import { makeScene2D } from "@motion-canvas/2d";
import { Grid, Line, Layout, Txt } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { all } from "@motion-canvas/core/lib/flow";

export default makeScene2D(function* (view) {
    const grid = createRef<Grid>();

    view.add(
        <Grid
            ref={grid}
            width={"100%"}
            height={"100%"}
            stroke={"red"}
            start={0}
            end={1}
        />
    );

    yield* all(
        grid().end(0.5, 1).to(1, 1).wait(1),
        grid().start(0.5, 1).to(0, 1).wait(1)
    );
});
