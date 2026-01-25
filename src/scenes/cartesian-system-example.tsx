import { makeScene2D, Rect, Txt, Latex, Line, Circle } from "@motion-canvas/2d";
import {
    all,
    createRef,
    createSignal,
    easeInOutCubic,
    map,
    waitFor,
    Vector2,
    createEaseOutBack,
    easeOutQuad,
    linear,
    easeInOutExpo,
    easeInQuad,
    delay, // Для эффекта "Pop"
} from "@motion-canvas/core";
import { CartesianSystem } from "../components/cartesian-system";

export default makeScene2D(function* (view) {
    const system = createRef<CartesianSystem>();
    const sineProgress = createSignal(0);
    const sinRef = createRef<Line>();

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

    const vecStart = yield* system().explainPhysicalVector(
        2,
        1,
        "#FFF",
        "Start(2,1)",
    );
    yield* waitFor(0.3);

    const vecEnd = yield* system().explainPhysicalVector(
        7,
        4,
        "#FF647F",
        "End(7,4)",
    );

    yield* waitFor(0.5);

    const dotStart = createRef<Circle>();
    const dotEnd = createRef<Circle>();
    const lerpGroup = createRef<Rect>();

    view.add(
        <Rect ref={lerpGroup}>
            <Circle
                ref={dotStart}
                position={vecStart.pixelPos}
                size={30}
                fill={"#FFF"}
                scale={0}
            />
            <Circle
                ref={dotEnd}
                position={vecEnd.pixelPos}
                size={30}
                fill={"#FF647F"}
                scale={0}
            />
        </Rect>,
    );

    yield* all(
        vecStart.arrow().opacity(0, 0.4),

        vecStart.label().x(vecStart.label().position().x - 80, 0.4),
        vecStart.label().y(vecStart.label().position().y + 80, 0.4),

        vecEnd.arrow().opacity(0, 0.4),
        vecEnd.label().x(vecEnd.label().position().x + 80, 0.4),
        vecEnd.label().y(vecEnd.label().position().y + 80, 0.4),

        dotStart().scale(1, 0.5, createEaseOutBack(1.5)),
        dotEnd().scale(1, 0.5, createEaseOutBack(1.5)),
    );

    const trackLine = createRef<Line>();
    lerpGroup().add(
        <Line
            ref={trackLine}
            points={[vecStart.pixelPos, vecStart.pixelPos]}
            stroke={"#666"}
            lineWidth={4}
            lineDash={[15, 15]}
            zIndex={-1}
        />,
    );

    yield* trackLine().points(
        [vecStart.pixelPos, vecEnd.pixelPos],
        0.8,
        easeInOutCubic,
    );

    const t = createSignal(0);

    const ghostDot = createRef<Circle>();
    lerpGroup().add(
        <Circle
            ref={ghostDot}
            size={25}
            fill={"#ff00ff"}
            position={() =>
                Vector2.lerp(vecStart.pixelPos, vecEnd.pixelPos, t())
            }
        >
            <Txt
                text={() => `t: ${t().toFixed(2)}`}
                fill={"#ff00ff"}
                y={-45}
                fontSize={24}
                fontFamily={"JetBrains Mono"}
            />
        </Circle>,
    );

    const sliderGroup = createRef<Rect>();
    const sliderContainer = createRef<Rect>();
    const sliderWidth = 500;

    view.add(
        <Rect
            ref={sliderGroup}
            y={400}
            layout
            direction="column"
            alignItems="center"
            gap={30}
            padding={[30, 50]}
            fill={"#141414"}
            stroke={"#333"}
            lineWidth={2}
            radius={24}
            opacity={0}
            zIndex={100}
            shadowBlur={20}
            shadowColor={"rgba(0,0,0,0.5)"}
        >
            <Latex
                height={50}
                margin={[0, 0, 10, 0]}
                fill="white"
                fontSize={15}
                tex={`
                    {\\color{#999} \\vec{P}(t) = } 
                    {\\color{white} \\vec{Start}} 
                    + 
                    ( {\\color{#FF647F} \\vec{End}} - {\\color{white} \\vec{Start}} ) 
                    \\cdot 
                    {\\color{#ff00ff} t}
                `}
            />

            {/* 2. СЛАЙДЕР (Скрыт отдельно) */}
            <Rect>
                <Rect
                    ref={sliderContainer} // <--- ДОБАВИЛ REF
                    width={sliderWidth}
                    height={40}
                    layout={false}
                    opacity={0} // <--- СКРЫТ ИЗНАЧАЛЬНО
                >
                    <Rect
                        width={sliderWidth}
                        height={8}
                        fill="#333"
                        radius={4}
                    />
                    <Rect
                        offsetX={-1}
                        x={-sliderWidth / 2}
                        width={() => map(0, sliderWidth, t())}
                        height={8}
                        fill="#ff00ff"
                        radius={4}
                    />
                    <Circle
                        size={28}
                        fill="#141414"
                        stroke="#ff00ff"
                        lineWidth={4}
                        position={() => [
                            map(-sliderWidth / 2, sliderWidth / 2, t()),
                            0,
                        ]}
                    />
                    <Txt
                        text="0.0"
                        fill="#666"
                        fontSize={20}
                        fontFamily="JetBrains Mono"
                        x={-sliderWidth / 2 - 40}
                        y={0}
                    />
                    <Txt
                        text="1.0"
                        fill="#666"
                        fontSize={20}
                        fontFamily="JetBrains Mono"
                        x={sliderWidth / 2 + 40}
                        y={0}
                    />
                </Rect>
            </Rect>
        </Rect>,
    );

    yield* sliderGroup().opacity(1, 0.8, easeInOutCubic);
    yield* waitFor(1.5);
    yield* sliderContainer().opacity(1, 0.8, easeInOutCubic);

    yield* t(1, 2, easeInOutCubic);
    yield* waitFor(0.5);
    yield* t(0, 1.5, easeInOutCubic);
    yield* waitFor(0.2);
    yield* t(0.5, 0.4);
    yield* t(0.8, 0.4);
    yield* t(1, 0.4);

    yield* trackLine().end(0, 0.3, easeInOutCubic);
    yield* ghostDot().scale(0, 0.3, easeOutQuad);

    yield* sliderGroup().opacity(0, 0.8, easeInOutCubic);
    const wave = yield* system().spawnDynamicSine(
        new Vector2(2, 1),
        new Vector2(7, 4),
        0,
        80,
    );
    yield* wave.line().end(1, 0.8, easeInOutExpo);

    wave.distanceLine().opacity(0.3);

    yield* wave.frequency(Math.PI, 1.2, easeInOutCubic);
    yield* waitFor(0.2);
    yield* all(
        wave.distanceLine().opacity(0, 0.3, easeInQuad),
        dotStart().opacity(0, 0.3, easeInQuad),
        dotEnd().opacity(0, 0.3, easeInQuad),
        vecEnd.label().opacity(0, 0.3, easeInQuad),
        vecStart.label().opacity(0, 0.3, easeInQuad),
    );
    const moveDuration = 1.8;
    yield* all(
        system().switchToPi(0.6),

        wave.start(new Vector2(0, 0), moveDuration, easeInOutExpo),
        wave.end(new Vector2(2, 0), moveDuration, easeInOutExpo),

        wave.frequency(2 * Math.PI, moveDuration, easeInOutExpo),

        wave.amplitude(100, moveDuration * 0.8, easeInOutExpo),

        delay(
            moveDuration * 0.6,
            all(
                system().spacing(400, 1.2, easeInOutExpo),
                system().tricksFontSize(30, 1.2, easeInOutExpo),
            ),
        ),
    );

    yield* all(
        wave.frequency(Math.PI, 0.8, easeInOutCubic),
        wave.end(new Vector2(1, 0), 0.8, easeInOutCubic),
    );

    yield* all(
        system().spacing(100, 1.2, easeInOutExpo),
        system().usePiLabels(false, 0.5),
        system().tricksFontSize(16, 1.2, easeInOutExpo),
        wave.line().opacity(0, 0.3),
    );

    yield* all(
        dotStart().opacity(1, 0.3, easeInQuad),
        dotEnd().opacity(1, 0.3, easeInQuad),
        vecEnd.label().opacity(1, 0.3, easeInQuad),
        vecStart.label().opacity(1, 0.3, easeInQuad),
    );

    yield* waitFor(0.5);

    const start = vecStart.pixelPos;
    const end = vecEnd.pixelPos;

    const diffVector = end.sub(start);
    const direction = diffVector.normalized;

    const radius = 15;
    const gap = 5;
    const totalOffset = radius + gap;

    const adjustedEnd = end.sub(direction.scale(totalOffset));

    const adjustedStart = start.add(direction.scale(totalOffset));

    const diffArrow = createRef<Line>();

    system()
        .contentGroup()
        .add(
            <Line
                ref={diffArrow}
                points={[adjustedStart, adjustedEnd]}
                stroke="#46D9FF"
                lineWidth={4}
                endArrow
                arrowSize={15}
                end={0}
            />,
        );
    const latexNode = sliderGroup().children()[0] as Latex;

    latexNode.tex(`
        {\\color{#46D9FF} \\vec{D}} = 
        {\\color{#FF647F} \\vec{End}} - {\\color{white} \\vec{Start}}
    `);

    yield* diffArrow().end(1, 1, easeInOutCubic);

    yield* all(
        sliderGroup().opacity(1, 0.8, createEaseOutBack(1.2)),
        sliderContainer().opacity(0, 0),
    );

    yield* waitFor(1);

    yield* waitFor(0.5);

    const normLatex = createRef<Latex>();

    sliderGroup().add(
        <Latex
            ref={normLatex}
            width={600}
            margin={[20, 0, 0, 0]}
            fill="white"
            opacity={0} // Скрыт при создании
            tex={`
                {\\color{white} \\vec{u}} = 
                \\text{norm}( {\\color{#46D9FF} \\vec{D}} )
            `}
        />,
    );

    yield* normLatex().opacity(1, 0.6);

    const ghostArrow = createRef<Line>();
    system()
        .contentGroup()
        .add(
            <Line
                ref={ghostArrow}
                points={[adjustedStart, adjustedEnd]} // Те же точки
                stroke="#46D9FF"
                lineWidth={2}
                lineDash={[10, 10]} // Пунктир
                opacity={0} // Сначала невидимый
                endArrow
                arrowSize={15}
            />,
        );

    ghostArrow().opacity(0.3);

    const unitCircle = createRef<Circle>();
    const unitRadius = system().spacing();

    system()
        .contentGroup()
        .add(
            <Circle
                ref={unitCircle}
                position={adjustedStart}
                size={0}
                stroke="#666"
                lineWidth={2}
                lineDash={[5, 5]}
                opacity={0.5}
                zIndex={-1}
            />,
        );

    yield* unitCircle().size(unitRadius * 2, 0.8, createEaseOutBack(1.2));

    const unitTip = adjustedStart.add(direction.scale(unitRadius));

    yield* all(
        diffArrow().points([adjustedStart, unitTip], 1, easeInOutCubic),

        diffArrow().stroke("#FFF", 1),
    );

    yield* waitFor(0.5);
});
