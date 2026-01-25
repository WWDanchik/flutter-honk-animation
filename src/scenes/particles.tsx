import { Camera, Latex, Line, makeScene2D, Node } from "@motion-canvas/2d";
import {
    all,
    createRef,
    createSignal,
    delay,
    linear,
    Vector2,
    waitFor,
} from "@motion-canvas/core";
import { HonkParticle } from "../components/honk-particle";
const STICKERS = ["🦆", "🎺", "🗯", "💥", "📢", "🚨", "🤡", "👀", "🧠", "💡"];
export default makeScene2D(function* (view) {
    const camera = createRef<Camera>();
    const particleLayer = createRef<Node>();
    const lineRef = createRef<Line>();
    const sineProgress = createSignal(0);

    const amplitude = createSignal(100);
    const frequency = createSignal(0.02);

    const p1 = createRef<HonkParticle>();
    const p2 = createRef<HonkParticle>();
    const p3 = createRef<HonkParticle>();
    const p4 = createRef<HonkParticle>();
    const p5 = createRef<HonkParticle>();
    const p6 = createRef<HonkParticle>();
    const p7 = createRef<HonkParticle>();
    const p8 = createRef<HonkParticle>();
    const p9 = createRef<HonkParticle>();
    const p10 = createRef<HonkParticle>();
    const p11 = createRef<HonkParticle>();

    const lineLength = 600;
    const pointCount = 100; 

    view.add(
        <Camera ref={camera}>
            <Node ref={particleLayer} />

            <Line
                points={() => {
                    const points: Vector2[] = [];

                    const currentXMax = lineLength * sineProgress();

                    for (let i = 0; i < pointCount; i++) {
                        const x =
                            (i / pointCount) * lineLength - lineLength / 2;

                        if (x > currentXMax - lineLength / 2) {
                            break;
                        }

                        const y = Math.sin(x * frequency()) * amplitude();
                        points.push(new Vector2(x, y));
                    }
                    return points;
                }}
                stroke={"#FF00FF"}
                lineWidth={8}
                lineCap={"round"}
                lineJoin={"round"}
            />
        </Camera>
    );

    yield* sineProgress(1, 3, linear);

  
    yield* amplitude(50, 1);
    yield* frequency(0.01, 1); 
    yield* sineProgress(0, 1); 

  

    particleLayer().add(
        <>
            <HonkParticle
                ref={p1}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={100}
                content={STICKERS[0]}
            />
            <HonkParticle
                ref={p2}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={110}
                content={STICKERS[1]}
            />
            <HonkParticle
                ref={p3}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={90}
                content={STICKERS[2]}
            />
            <HonkParticle
                ref={p4}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={80}
                content={STICKERS[3]}
            />
            <HonkParticle
                ref={p5}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={40}
                content={STICKERS[4]}
            />
            <HonkParticle
                ref={p6}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={50}
                content={STICKERS[5]}
            />
            <HonkParticle
                ref={p7}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={-30}
                content={STICKERS[6]}
            />
            <HonkParticle
                ref={p8}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={-80}
                content={STICKERS[7]}
            />
            <HonkParticle
                ref={p9}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={-50}
                content={STICKERS[8]}
            />
            <HonkParticle
                ref={p10}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={-30}
                content={STICKERS[9]}
            />
            <HonkParticle
                ref={p11}
                startPos={new Vector2(500, -400)}
                targetPos={new Vector2(-500, -400)}
                curveHeight={-100}
                content={STICKERS[9]}
            />
        </>
    );

    yield* all(
        p1().animate(1.5),
        p2().animate(1.5),
        p3().animate(1.5),
        p4().animate(1.5),
        p5().animate(1.5),
        p6().animate(1.5),
        p7().animate(1.5),
        p8().animate(1.5),
        p9().animate(1.5),
        p10().animate(1.5),
        p11().animate(1.5)
    );

    yield* waitFor(10);
});
