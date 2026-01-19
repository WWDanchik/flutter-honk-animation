import { makeScene2D, Rect, Txt, Latex, Line, Circle } from "@motion-canvas/2d";
import {
    all,
    createRef,
    createSignal,
    easeInOutCubic,
    map,
    waitFor,
    Vector2,
    createEaseOutBack, // Для эффекта "Pop"
} from "@motion-canvas/core";
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
        vecStart.label().scale(0, 0.4),

        vecEnd.arrow().opacity(0, 0.4),
        vecEnd.label().scale(0, 0.4),

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

    const sliderGroup = createRef<Rect>(); // Ссылка на всю панель
    const sliderContainer = createRef<Rect>(); // Ссылка только на слайдер
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
            opacity={0} // Панель скрыта целиком
            zIndex={100}
            shadowBlur={20}
            shadowColor={"rgba(0,0,0,0.5)"}
        >
            {/* 1. ФОРМУЛА (Появится вместе с фоном) */}
            <Latex
                width={600}
                margin={[0, 0, 10, 0]}
                fill="white" // Чтобы плюсы и скобки были белыми
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

    // 1. Появляется панель с ФОРМУЛОЙ
    // Голос: "Математически это выглядит вот так..."
    yield* sliderGroup().opacity(1, 0.8, easeInOutCubic);

    yield* waitFor(1.5); // Даем время прочитать формулу

    // 2. Появляется СЛАЙДЕР
    // Голос: "...но по сути, всё зависит от одного числа t."
    yield* sliderContainer().opacity(1, 0.8, easeInOutCubic);

    yield* t(1, 2, easeInOutCubic);
    yield* waitFor(0.5);
    yield* t(0, 1.5, easeInOutCubic);

    yield* waitFor(0.2);
    yield* t(0.5, 0.4);
    yield* t(0.8, 0.4);
    yield* t(1, 0.4);
});
