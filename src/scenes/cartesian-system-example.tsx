import {
    makeScene2D,
    Rect,
    Txt,
    Latex,
    Line,
    Circle,
    Layout,
    Node,
    Img,
    Camera,
} from "@motion-canvas/2d";
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
    delay,
    tween,
    sin,
    ThreadGenerator,
    easeOutExpo,
} from "@motion-canvas/core";
import { CartesianSystem } from "../components/cartesian-system";
import phone from "../assets/phone.png";

const CAMERA_ZOOM = 2.37;
export default makeScene2D(function* (view) {
    const system = createRef<CartesianSystem>();
    const sineProgress = createSignal(0);
    const sinRef = createRef<Line>();
    const cameraPhoneRef = createRef<Camera>();
    const cameraCartesianSystemRef = createRef<Camera>();
    const overlayRef = createRef<Rect>();
    const contentRef = createRef<Node>();
    view.add(
        <Rect fill={"#DEE2E6"} width={view.width()} height={view.height()}>
            <Camera ref={cameraCartesianSystemRef}>
                <Rect width={view.width()} height={view.height()} clip>
                    <Rect scale={1} rotation={90} ref={contentRef}>
                        <CartesianSystem
                            ref={system}
                            width={view.width() / CAMERA_ZOOM}
                            height={view.height() / CAMERA_ZOOM}
                            spacing={100}
                        />
                    </Rect>
                    <Rect
                        clip={false}
                        radius={80}
                        layout
                        direction={"column"}
                        ref={overlayRef}
                        minWidth={470}
                        minHeight={1000}
                        fill={"#0e0d0d"}
                        opacity={0}
                        scale={2}
                    />
                    <Node>
                        <Img src={phone} height={view.height()} />
                    </Node>
                </Rect>
            </Camera>
        </Rect>,
    );

    cameraCartesianSystemRef().scene().position(view.size().div(2));
    cameraCartesianSystemRef().zoom(CAMERA_ZOOM);
    cameraCartesianSystemRef().rotation(90);

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
        6,
        3,
        "#FF647F",
        "End(6,4)",
    );

    yield* waitFor(0.5);

    const dotStart = createRef<Circle>();
    const dotEnd = createRef<Circle>();
    const lerpGroup = createRef<Rect>();

    contentRef().add(
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
    const sliderWrapper = createRef<Rect>();

    contentRef().add(
        <Rect
            ref={sliderGroup}
            y={250}
            layout
            direction="column"
            alignItems="center"
            padding={[30, 50]}
            fill={"#141414"}
            stroke={"#333"}
            lineWidth={2}
            radius={24}
            opacity={0}
            zIndex={100}
            shadowBlur={20}
            shadowColor={"rgba(0,0,0,0.5)"}
            width={700}
        >
            <Rect ref={sliderWrapper} height={40}>
                <Rect
                    ref={sliderContainer}
                    width={sliderWidth}
                    layout={false}
                    opacity={0}
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
    const baseLatex = createRef<Latex>();
    sliderGroup().add(
        <Latex
            ref={baseLatex}
            tex={`
                {\\color{#999} \\vec{P}_{base}(t) = } 
                {\\color{white} \\vec{Start}} 
                + 
                ( {\\color{#FF647F} \\vec{End}} - {\\color{white} \\vec{Start}} ) 
                \\cdot 
                {\\color{#ff00ff} t}
            `}
            fill="white"
            height={45}
            opacity={0}
        />,
    );

    yield* all(
        baseLatex().opacity(1, 0.8, easeInOutCubic),
        sliderContainer().opacity(1, 0.8, easeInOutCubic),
    );
    yield* sliderGroup().opacity(1, 0.8, easeInOutCubic);
    yield* waitFor(1.5);

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
        new Vector2(6, 3),
        0,
        system().spacing(),
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
        wave.amplitude(380, moveDuration * 0.8, easeInOutExpo),
        delay(
            moveDuration * 0.6,
            all(
                system().spacing(380, 1.2, easeInOutExpo),
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

    const diffLatex = createRef<Latex>();
    sliderGroup().add(
        <Latex
            ref={diffLatex}
            tex={`
                {\\color{#46D9FF} \\vec{D}} = 
                {\\color{#FF647F} \\vec{End}} - {\\color{white} \\vec{Start}}
            `}
            fill="white"
            height={45}
            opacity={0}
            margin={[5, 0, 0, 0]}
        />,
    );
    yield* diffLatex().opacity(1, 0.6);

    yield* diffArrow().end(1, 1, easeInOutCubic);
    yield* sliderWrapper().layout(false, 0);
    yield* all(
        sliderGroup().opacity(1, 0.8, createEaseOutBack(1.2)),
        sliderContainer().opacity(0, 0),
    );
    yield* sliderContainer().height(0, 1);

    yield* waitFor(1);

    const normLatex = createRef<Latex>();
    sliderGroup().add(
        <Latex
            ref={normLatex}
            tex={`
                {\\color{white} \\vec{u}} = 
                \\text{norm}( {\\color{#46D9FF} \\vec{D}} )
            `}
            fill="white"
            height={45}
            opacity={0}
            margin={[5, 0, 0, 0]}
        />,
    );
    yield* normLatex().opacity(1, 0.6);
    const ghostArrow = createRef<Line>();
    system()
        .contentGroup()
        .add(
            <Line
                ref={ghostArrow}
                points={[adjustedStart, adjustedEnd]}
                stroke="#46D9FF"
                lineWidth={2}
                lineDash={[10, 10]}
                opacity={0}
                endArrow
                arrowSize={15}
            />,
        );

    ghostArrow().opacity(0.3);

    const unitRadius = system().spacing();

    const unitTip = adjustedStart.add(direction.scale(unitRadius));

    yield* all(
        diffArrow().points([adjustedStart, unitTip], 1, easeInOutCubic),
        diffArrow().stroke("#FFF", 1),
    );

    yield* waitFor(0.5);

    const rotLatex = createRef<Latex>();
    sliderGroup().add(
        <Latex
            ref={rotLatex}
            tex={`
                {\\color{#A6E22E} \\vec{n}} = 
                \\text{rot}_{90^\\circ}( {\\color{white} \\vec{u}} )
            `}
            fill="white"
            height={45}
            opacity={0}
            margin={[5, 0, 0, 0]}
        />,
    );
    yield* rotLatex().opacity(1, 0.6);

    const uVector = direction.scale(unitRadius);
    const startRad = Math.atan2(uVector.y, uVector.x);
    const startDeg = (startRad * 180) / Math.PI;
    const endRad = startRad - Math.PI / 2;
    const endDeg = startDeg - 90;

    const normalArrow = createRef<Line>();
    const traceArc = createRef<Circle>();
    const angleText = createRef<Txt>();

    system()
        .contentGroup()
        .add(
            <>
                <Circle
                    ref={traceArc}
                    position={adjustedStart}
                    size={unitRadius * 2}
                    startAngle={startDeg}
                    endAngle={startDeg}
                    stroke="#A6E22E"
                    lineWidth={2}
                    lineDash={[5, 5]}
                    opacity={0.6}
                />
                <Line
                    ref={normalArrow}
                    points={[adjustedStart, adjustedStart.add(uVector)]}
                    stroke="#A6E22E"
                    lineWidth={4}
                    endArrow
                    arrowSize={15}
                    opacity={0}
                />
                <Txt
                    ref={angleText}
                    text="0°"
                    fill="#A6E22E"
                    fontSize={24}
                    fontFamily="JetBrains Mono"
                    opacity={0}
                />
            </>,
        );

    normalArrow().opacity(1);

    yield* tween(1.5, (value) => {
        const t = easeInOutCubic(value);

        const currentRad = map(startRad, endRad, t);
        const currentDeg = map(startDeg, endDeg, t);

        const currentVec = Vector2.fromRadians(currentRad).scale(unitRadius);
        normalArrow().points([adjustedStart, adjustedStart.add(currentVec)]);

        traceArc().endAngle(currentDeg);

        const angleValue = Math.round(map(0, 90, t));
        angleText().text(`${angleValue}°`);

        const midRad = map(startRad, currentRad, 0.5);

        const textPos = adjustedStart.add(
            Vector2.fromRadians(midRad).scale(unitRadius + 40),
        );
        angleText().position(textPos);

        if (value < 0.1) {
            angleText().opacity(map(0, 1, value * 10));
        }
    });

    const cornerSize = 20;
    const vBase = direction.scale(cornerSize);
    const vNorm = Vector2.fromRadians(endRad).scale(cornerSize);
    const cornerTip = adjustedStart.add(vBase).add(vNorm);

    const perpSign = createRef<Line>();
    system()
        .contentGroup()
        .add(
            <Line
                ref={perpSign}
                points={[
                    adjustedStart.add(vBase),
                    cornerTip,
                    adjustedStart.add(vNorm),
                ]}
                stroke="#FFF"
                lineWidth={2}
                end={0}
                opacity={0.8}
            />,
        );

    yield* all(
        perpSign().end(1, 0.5, easeInOutCubic),
        angleText().opacity(0, 0.5),
        traceArc().opacity(0, 0.5),
    );

    yield* waitFor(1);

    yield* all(
        perpSign().end(0, 0.5, easeInOutCubic),
        diffArrow().end(0, 0.5, easeInOutCubic),
    );

    yield* waitFor(1);

    const sineLatex = createRef<Latex>();

    sliderGroup().add(
        <Latex
            ref={sineLatex}
            tex={`
                {\\color{white} \\vec{P}(t)} = 
                {\\color{#999} \\vec{P}_{base}(t)} + 
                {\\color{#A6E22E} \\vec{n} \\cdot A \\sin(\\pi t)}
            `}
            fill="white"
            height={45}
            opacity={0}
            margin={[5, 0, 0, 0]} // Чуть-чуть отступа
        />,
    );

    yield* all(sineLatex().opacity(1, 0.6));
    const waveTrace = createRef<Line>();
    system()
        .contentGroup()
        .add(
            <Line
                ref={waveTrace}
                points={[adjustedStart]} // Начальная точка
                stroke="#ff5555"
                lineWidth={4}
                zIndex={-1}
            />,
        );

    // 1. Сбрасываем сигнал времени в 0 (чтобы слайдер и логика вернулись в начало)
    t(0);

    yield* all(
        sliderContainer().opacity(1, 0.5),
        sliderWrapper().layout(true, 0),
        normalArrow().opacity(1),
    );

    // 3. Хелпер: Функция расчета позиции точки в любой момент времени
    // (Используем замыкание: adjustedStart, adjustedEnd, endRad берутся из кода выше)
    const getWavePoint = (time: number) => {
        // База на прямой линии
        const currentBase = Vector2.lerp(adjustedStart, adjustedEnd, time);

        // Смещение (Синус)
        const maxAmp = 80;
        const magnitude = Math.sin(time * Math.PI) * maxAmp;

        // Вектор смещения (по нормали, которую мы нашли раньше)
        const offsetVec = Vector2.fromRadians(endRad).scale(magnitude);

        // Итоговая точка
        return currentBase.add(offsetVec);
    };

    // 4. СВЯЗЫВАЕМ ЗЕЛЕНУЮ СТРЕЛКУ (Reactive)
    // Motion Canvas будет вызывать эту функцию каждый кадр
    normalArrow().points(() => {
        const time = t(); // Читаем сигнал
        const currentBase = Vector2.lerp(adjustedStart, adjustedEnd, time);
        const tip = getWavePoint(time);
        return [currentBase, tip];
    });

    // 5. СВЯЗЫВАЕМ КРАСНЫЙ СЛЕД (Reactive Trace)
    // Генерируем массив точек от 0 до текущего t
    waveTrace().points(() => {
        const time = t();
        const path: Vector2[] = [];
        const step = 0.01; // Детализация линии (меньше = плавее)

        for (let i = 0; i <= time; i += step) {
            path.push(getWavePoint(i));
        }
        path.push(getWavePoint(time)); // Обязательно добавляем самый кончик

        return path;
    });

    yield* t(1, 2, easeInOutCubic);
    yield* waitFor(0.5);
    yield* t(0, 1.5, easeInOutCubic);
    yield* waitFor(0.2);
    yield* t(0.5, 0.4);
    yield* t(0.8, 0.4);
    yield* t(1, 0.4);

    yield* normalArrow().opacity(0, 0.5);

    yield* waitFor(1);

    const examples = [
        { start: new Vector2(2, 1), end: new Vector2(7, 4) }, // Наш основной (из примера)
        { start: new Vector2(-4, -2), end: new Vector2(-1, 2) }, // В другом квадранте
        { start: new Vector2(-3, 3), end: new Vector2(1, 3) }, // Горизонтальный
        { start: new Vector2(6, -3), end: new Vector2(6, 2) }, // Вертикальный
        { start: new Vector2(0, -4), end: new Vector2(4, -1) }, // Короткий
    ];

    const examplesGroup = createRef<Layout>();
    contentRef().add(<Layout ref={examplesGroup} />);

    yield* t(0, 0.5);

    // Скрываем "одиночные" элементы предыдущего шага, чтобы не мешали
    // (Если они еще видны)

    yield* all(
        sliderContainer().opacity(1, 0.5),
        normalArrow().opacity(0), // Скрываем старую стрелку совсем
    );
    const animations: ThreadGenerator[] = [];
    examples.forEach((ex, index) => {
        // --- А. Расчет геометрии ---
        const start = ex.start.scale(system().spacing());
        const end = ex.end.scale(system().spacing());

        const diff = end.sub(start);
        const dir = diff.normalized;

        const radius = 15;
        const gap = 5;
        const totalOffset = radius + gap;

        const adjStart = start.add(dir.scale(totalOffset));
        const adjEnd = end.sub(dir.scale(totalOffset));

        const angleRad = Math.atan2(dir.y, dir.x) - Math.PI / 2;

        // --- Б. Хелпер для расчета волны ---
        const getPoint = (time: number) => {
            const base = Vector2.lerp(adjStart, adjEnd, time);
            const amp = 80;
            const mag = Math.sin(time * Math.PI) * amp;
            const offset = Vector2.fromRadians(angleRad).scale(mag);
            return base.add(offset);
        };

        // --- В. Создаем визуальные элементы ---
        const arrowRef = createRef<Line>();
        const traceRef = createRef<Line>();
        const startDot = createRef<Circle>();
        const endDot = createRef<Circle>();

        examplesGroup().add(
            <>
                <Circle
                    ref={startDot}
                    position={start}
                    size={30}
                    fill="#FFF"
                    scale={0}
                />
                <Circle
                    ref={endDot}
                    position={end}
                    size={30}
                    fill="#FF647F"
                    scale={0}
                />

                <Line
                    points={[adjStart, adjEnd]}
                    stroke="#333"
                    lineWidth={2}
                    lineDash={[5, 5]}
                    zIndex={-2}
                />

                <Line
                    ref={traceRef}
                    points={() => {
                        const time = t();
                        const path: Vector2[] = [];
                        const step = 0.02;
                        for (let i = 0; i <= time; i += step)
                            path.push(getPoint(i));
                        path.push(getPoint(time));
                        return path;
                    }}
                    stroke="#ff5555"
                    lineWidth={4}
                    zIndex={-1}
                />

                <Line
                    ref={arrowRef}
                    points={() => {
                        const time = t();
                        const base = Vector2.lerp(adjStart, adjEnd, time);
                        const tip = getPoint(time);
                        return [base, tip];
                    }}
                    stroke="#A6E22E"
                    lineWidth={4}
                    endArrow
                    arrowSize={15}
                    opacity={0}
                />
            </>,
        );

        animations.push(
            (function* () {
                yield* waitFor(index * 0.1);

                yield* all(
                    startDot().scale(1, 0.4, createEaseOutBack(1.5)),
                    endDot().scale(1, 0.4, createEaseOutBack(1.5)),
                    arrowRef().opacity(1, 0.4),
                );
            })(),
        );
    });

    yield* all(...animations);

    yield* waitFor(0.5);

    yield* t(1, 2, easeInOutCubic);
    yield* waitFor(0.5);
    yield* t(0, 1.5, easeInOutCubic);
    yield* waitFor(0.2);
    yield* t(0.5, 0.4);
    yield* t(0.8, 0.4);
    yield* t(1, 0.4);

    yield* waitFor(1);

    const pop = createEaseOutBack(1.2);

    yield* all(
        cameraCartesianSystemRef().zoom(1, 1, pop),
        system().viewWidth(2000, 0.5, easeOutExpo),
        overlayRef().opacity(1, 1, easeOutExpo),
        cameraCartesianSystemRef().rotation(0, 1, pop),
        system().radius(80, 1, pop),
    );
});
