import { makeScene2D, Code, Rect, Node, Img } from "@motion-canvas/2d";
import { createRef, waitFor } from "@motion-canvas/core";
import phone from "../assets/phone.png";
export default makeScene2D(function* (view) {

    const overlayRef = createRef<Rect>()
    view.add(
        <Rect width={view.width()} height={view.height()} fill="#DEE2E6">
            <Rect
                clip={false}
                radius={80}
                layout
                direction={"column"}
                ref={overlayRef}
                minWidth={470}
                minHeight={1000}
                fill={"#0e0d0d"}
                opacity={1}
                scale={2}
            />
            <Node>
                <Img src={phone} height={view.height()} />
            </Node>
        </Rect>,
    );

    yield* waitFor(2)
});
