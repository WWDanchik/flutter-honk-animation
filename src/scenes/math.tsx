import {
    Camera,
    Circle,
    Grid,
    Line,
    makeScene2D,
    Node,
    Rect,
    Txt,
} from "@motion-canvas/2d";
import {
    all,
    createRef,
    easeOutBack,
    easeInOutCubic,
    range,
    sequence,
    useLogger,
    delay,
    easeOutElastic,
    createEaseOutBack,
    waitFor,
} from "@motion-canvas/core";

export default makeScene2D(function* (view) {
    view.add(
        <Rect width={view.width()} height={view.height()} fill={"#222222"} />,
    );

    const grid = createRef<Grid>();
    const cameraRef = createRef<Camera>();
    const yAxis = createRef<Line>();
    const xAxis = createRef<Line>();
    const xGroup = createRef<Node>();
    const yGroup = createRef<Node>();
    const pointRef = createRef<Circle>();
    const vectorRef = createRef<Line>();
    const labelRef = createRef<Txt>();
    const dashedX = createRef<Line>(); // Проекция на ось X
    const dashedY = createRef<Line>(); // Проекция на ось Y

    const spacing = 80;
    const tickLength = 20;

    const pX = 3;
    const pY = 2;

    const pixelX = pX * spacing;
    const pixelY = -pY * spacing;
    const softBack = createEaseOutBack(1);
    view.add(
        <Node>
            {/* Пунктирные линии (проекции) */}
            <Line
                ref={dashedX}
                points={[
                    [pixelX, 0],
                    [pixelX, pixelY],
                ]} // От оси X к точке
                stroke={"#666"}
                lineWidth={2}
                lineDash={[10, 10]}
                end={0} // Скрыто
            />
            <Line
                ref={dashedY}
                points={[
                    [0, pixelY],
                    [pixelX, pixelY],
                ]} // От оси Y к точке
                stroke={"#666"}
                lineWidth={2}
                lineDash={[10, 10]}
                end={0} // Скрыто
            />

            {/* Вектор (Стрелка) */}
            <Line
                ref={vectorRef}
                points={[
                    [0, 0],
                    [pixelX, pixelY],
                ]}
                stroke={"#FFC66D"} // Желтый цвет для вектора
                lineWidth={6}
                endArrow
                arrowSize={20}
                end={0} // Скрыто в начале
            />

            {/* Точка (Кружок) */}
            <Circle
                ref={pointRef}
                x={pixelX}
                y={pixelY}
                size={20}
                fill={"#FF647F"} // Красный цвет для точки
                scale={0} // Скрыто
            />

            {/* Подпись */}
            <Txt
                ref={labelRef}
                x={pixelX + 30}
                y={pixelY - 30}
                fill={"#FFF"}
                fontFamily={"JetBrains Mono, monospace"}
                fontSize={28}
                text={`P(${pX}, ${pY})`} // Изначальный текст
                opacity={0}
            />
        </Node>,
    );
    view.add(
        <Camera ref={cameraRef}>
            <Grid
                ref={grid}
                width={"100%"}
                height={"100%"}
                stroke={"#444"}
                lineWidth={1}
                start={0.5}
                end={0.5}
            />
        </Camera>,
    );

    view.add(<Node ref={xGroup} />);
    view.add(<Node ref={yGroup} />);

    const xSteps = range(
        Math.floor(-view.width() / 2 / spacing) * spacing,
        Math.ceil(view.width() / 2 / spacing) * spacing,
        spacing,
    );

    xSteps.forEach((x) => {
        if (Math.abs(x) < 0.1) return;

        xGroup().add(
            <Node x={x} scale={0}>
                <Line
                    points={[
                        [0, -tickLength / 2],
                        [0, tickLength / 2],
                    ]}
                    stroke={"#FFF"}
                    lineWidth={2}
                />
                <Txt
                    y={25}
                    fill={"#CCC"}
                    fontFamily={"JetBrains Mono, monospace"}
                    fontSize={16}
                    text={(x / spacing).toString()}
                    justifyContent={"center"}
                />
            </Node>,
        );
    });

    const ySteps = range(
        Math.floor(-view.height() / 2 / spacing) * spacing,
        Math.ceil(view.height() / 2 / spacing) * spacing,
        spacing,
    );

    ySteps.forEach((y) => {
        if (Math.abs(y) < 0.1) return;

        yGroup().add(
            <Node y={y} scale={0}>
                <Line
                    points={[
                        [-tickLength / 2, 0],
                        [tickLength / 2, 0],
                    ]}
                    stroke={"#FFF"}
                    lineWidth={2}
                />
                <Txt
                    x={-35}
                    fill={"#CCC"}
                    fontFamily={"JetBrains Mono, monospace"}
                    fontSize={16}
                    text={(-y / spacing).toString()}
                    alignItems={"center"}
                />
            </Node>,
        );
    });

    view.add(
        <Line
            ref={yAxis}
            points={[
                [0, view.height() / 2],
                [0, -view.height() / 2],
            ]}
            stroke={"#FFF"}
            lineWidth={4}
            endArrow
            arrowSize={16}
            start={0.5}
            end={0.5}
        />,
    );

    view.add(
        <Line
            ref={xAxis}
            points={[
                [-view.width() / 2, 0],
                [view.width() / 2, 0],
            ]}
            stroke={"#FFF"}
            lineWidth={4}
            endArrow
            arrowSize={16}
            start={0.5}
            end={0.5}
        />,
    );

    cameraRef().scene().position(view.size().div(2));

    yield* all(
        grid().start(0, 0.8, easeInOutCubic),
        grid().end(1, 0.8, easeInOutCubic),
    );

    yield* all(
        yAxis().start(0, 0.6, easeInOutCubic),
        yAxis().end(1, 0.6, easeInOutCubic),
        xAxis().start(0, 0.6, easeInOutCubic),
        xAxis().end(1, 0.6, easeInOutCubic),
    );

    yield* all(
        ...xGroup()
            .children()
            .map((child) =>
                delay(
                    Math.abs(child.x()) * 0.0005,
                    child.scale(1, 0.3, easeOutBack),
                ),
            ),
        ...yGroup()
            .children()
            .map((child) =>
                delay(
                    Math.abs(child.y()) * 0.0005,
                    child.scale(1, 0.3, easeOutBack),
                ),
            ),
    );

    yield* all(
        pointRef().scale(1, 0.6, easeOutBack),
        labelRef().opacity(1, 0.6),
    );

    yield* all(
        dashedX().end(1, 0.6, easeInOutCubic),
        dashedY().end(1, 0.6, easeInOutCubic),
    );
    yield* sequence(
        0.1,
        dashedX().opacity(0.5, 0.5),
        dashedY().opacity(0.5, 0.5),
    );

    yield* delay(0.5, all());

    vectorRef().points([    
        [0, 0],
        [0, 0],
    ]);
    vectorRef().end(1);

    yield* all(
        vectorRef().points(
            [
                [0, 0],
                [pixelX, pixelY],
            ],
            0.3,
            softBack,
        ),

        labelRef().text(`Vector (${pX}, ${pY})`, 0.6),
        labelRef().fill("#FFC66D", 0.6),

        // delay(
        //     0.15,
        //     sequence(
        //         0.05,
        //         pointRef().scale(1.2, 0.1),
        //         pointRef().scale(0.8, 0.3, easeOutBack),
        //     ),
        // ),
    );

    yield* waitFor(2);
});
