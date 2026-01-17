import { Camera, Circle, makeScene2D, Rect, Video } from "@motion-canvas/2d";
import { Grid, Line, Layout, Txt } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { all, waitFor } from "@motion-canvas/core/lib/flow";
import { easeOutBack } from "@motion-canvas/core";
import browser from "../assets/0116.mp4";
import camera from "./camera";

export default makeScene2D(function* (view) {
    const browserRef = createRef<Rect>();
    const videoRef = createRef<Video>();
    const cameraRef = createRef<Camera>();
    view.add(
        <Camera ref={cameraRef}>
            <Rect
                ref={browserRef}
                width={1600}
                height={900}
                fill={"#1e1e1e"}
                radius={20}
                clip
                shadowBlur={40}
                shadowColor={"rgba(0,0,0,0.5)"}
            >
                <Video
                    ref={videoRef}
                    height={view.height() - 90}
                    src={browser}
                    play
                />
            </Rect>
        </Camera>
    );
    cameraRef().scene().position(view.size().div(2));
    yield* waitFor(7);
    yield* all(cameraRef().zoom(1.5, 0.6, easeOutBack));
    yield* waitFor(0.6);
    yield* cameraRef().reset(0.6, easeOutBack);
});
