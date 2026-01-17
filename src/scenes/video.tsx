import {
    Circle,
    Img,
    makeScene2D,
    Rect,
    Node,
    Txt,
    Path,
    Layout,
    Video,
} from "@motion-canvas/2d";
import { all, createRef, range, waitFor } from "@motion-canvas/core";
import phone from "../assets/phone.png"; // Твоя картинка рамки
import animation from "../assets/animation.mp4";

export default makeScene2D(function* (view) {
    const videoRef = createRef<Video>();

    view.add(
        <Node>
            <Video
                ref={videoRef}
                height={view.height() - 90}
                src={animation}
                play
            />

            <Node>
                <Img src={phone} height={view.height()} />
            </Node>
        </Node> 
    );



  yield* waitFor(3);
});
