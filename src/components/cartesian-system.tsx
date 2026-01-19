import {
    Circle,
    Grid,
    Line,
    Node,
    NodeProps,
    Rect,
    Txt,
} from "@motion-canvas/2d";
import {
    all,
    createEaseOutBack,
    createRef,
    delay,
    easeInOutCubic,
    range,
    Reference,
    sequence,
    Vector2,
    waitFor,
} from "@motion-canvas/core";

const softBack = createEaseOutBack(0.6);

export interface CartesianSystemProps extends NodeProps {
    width: number;
    height: number;
    spacing?: number;
}

export type ManagedVector = {
    line: Reference<Line>;
    head: Reference<Circle>;
    label: Reference<Txt>;
    group: Reference<Node>;
    logicalPos: Vector2;
    color: string;
};

export class CartesianSystem extends Node {
    private grid = createRef<Grid>();
    private xAxis = createRef<Line>();
    private yAxis = createRef<Line>();
    private xGroup = createRef<Node>();
    private yGroup = createRef<Node>();
    public contentGroup = createRef<Node>();

    public readonly spacing: number;
    public readonly viewWidth: number;
    public readonly viewHeight: number;

    constructor(props: CartesianSystemProps) {
        super(props);
        this.viewWidth = props.width;
        this.viewHeight = props.height;
        this.spacing = props.spacing ?? 80;

        this.add(
            <>
                <Rect
                    width={this.viewWidth}
                    height={this.viewHeight}
                    fill={"#222222"}
                />

                <Grid
                    ref={this.grid}
                    width={this.viewWidth}
                    height={this.viewHeight}
                    spacing={this.spacing}
                    stroke={"#444"}
                    lineWidth={1}
                    start={0.5}
                    end={0.5}
                />

                <Node ref={this.xGroup} />
                <Node ref={this.yGroup} />

                <Line
                    ref={this.yAxis}
                    points={[
                        [0, this.viewHeight / 2],
                        [0, -this.viewHeight / 2],
                    ]}
                    stroke={"#FFF"}
                    lineWidth={4}
                    endArrow
                    arrowSize={16}
                    start={0.5}
                    end={0.5}
                />
                <Line
                    ref={this.xAxis}
                    points={[
                        [-this.viewWidth / 2, 0],
                        [this.viewWidth / 2, 0],
                    ]}
                    stroke={"#FFF"}
                    lineWidth={4}
                    endArrow
                    arrowSize={16}
                    start={0.5}
                    end={0.5}
                />

                <Node ref={this.contentGroup} />
            </>,
        );
        this.generateTicks();
    }

    private generateTicks() {
        const tickLen = 20;

        range(
            Math.floor(-this.viewWidth / 2 / this.spacing) * this.spacing,
            Math.ceil(this.viewWidth / 2 / this.spacing) * this.spacing,
            this.spacing,
        ).forEach((x) => {
            if (Math.abs(x) < 0.1) return;
            this.xGroup().add(
                <Node x={x} scale={0}>
                    <Line
                        points={[
                            [0, -tickLen / 2],
                            [0, tickLen / 2],
                        ]}
                        stroke={"#FFF"}
                        lineWidth={2}
                    />
                    <Txt
                        y={25}
                        fill={"#CCC"}
                        fontFamily={"JetBrains Mono"}
                        fontSize={16}
                        text={(x / this.spacing).toString()}
                        justifyContent={"center"}
                    />
                </Node>,
            );
        });

        range(
            Math.floor(-this.viewHeight / 2 / this.spacing) * this.spacing,
            Math.ceil(this.viewHeight / 2 / this.spacing) * this.spacing,
            this.spacing,
        ).forEach((y) => {
            if (Math.abs(y) < 0.1) return;
            this.yGroup().add(
                <Node y={y} scale={0}>
                    <Line
                        points={[
                            [-tickLen / 2, 0],
                            [tickLen / 2, 0],
                        ]}
                        stroke={"#FFF"}
                        lineWidth={2}
                    />
                    <Txt
                        x={-35}
                        fill={"#CCC"}
                        fontFamily={"JetBrains Mono"}
                        fontSize={16}
                        text={(-y / this.spacing).toString()}
                        alignItems={"center"}
                    />
                </Node>,
            );
        });
    }

    public c2s(x: number, y: number): Vector2 {
        return new Vector2(x * this.spacing, -y * this.spacing);
    }

    public *setup() {
        yield* all(
            this.grid().start(0, 0.8, easeInOutCubic),
            this.grid().end(1, 0.8, easeInOutCubic),
        );
        yield* all(
            this.xAxis().start(0, 0.5, easeInOutCubic),
            this.xAxis().end(1, 0.5, easeInOutCubic),
            this.yAxis().start(0, 0.5, easeInOutCubic),
            this.yAxis().end(1, 0.5, easeInOutCubic),
        );
        yield* all(
            ...this.xGroup()
                .children()
                .map((c) =>
                    delay(Math.abs(c.x()) * 0.0005, c.scale(1, 0.3, softBack)),
                ),
            ...this.yGroup()
                .children()
                .map((c) =>
                    delay(Math.abs(c.y()) * 0.0005, c.scale(1, 0.3, softBack)),
                ),
        );
    }

    public *showPointAndTransform(
        x: number,
        y: number,
        color: string,
        name: string,
    ): Generator<any, ManagedVector, any> {
        const pixelPos = this.c2s(x, y);
        const pixelX = this.c2s(x, 0);
        const pixelY = this.c2s(0, y);

        const dashedX = createRef<Line>();
        const dashedY = createRef<Line>();
        const point = createRef<Circle>();
        const label = createRef<Txt>();

        const vecGroup = createRef<Node>();
        const vecLine = createRef<Line>();
        const vecHead = createRef<Circle>();

        this.contentGroup().add(
            <Node>
                <Line
                    ref={dashedX}
                    points={[pixelX, pixelPos]}
                    stroke={"#666"}
                    lineWidth={2}
                    lineDash={[10, 10]}
                    end={0}
                />
                <Line
                    ref={dashedY}
                    points={[[0, pixelPos.y], pixelPos]}
                    stroke={"#666"}
                    lineWidth={2}
                    lineDash={[10, 10]}
                    end={0}
                />

                <Circle
                    ref={point}
                    x={pixelPos.x}
                    y={pixelPos.y}
                    size={20}
                    fill={color}
                    scale={0}
                />

                <Txt
                    ref={label}
                    x={pixelPos.x + 30}
                    y={pixelPos.y - 30}
                    fill={"#FFF"}
                    fontFamily={"JetBrains Mono"}
                    fontSize={28}
                    text={`P(${x}, ${y})`}
                    opacity={0}
                />

                <Node ref={vecGroup}>
                    <Line
                        ref={vecLine}
                        points={[
                            [0, 0],
                            [0, 0],
                        ]}
                        stroke={color}
                        lineWidth={6}
                        endArrow
                        arrowSize={20}
                        end={1}
                    />
                    <Circle ref={vecHead} x={0} y={0} size={0} fill={color} />
                </Node>
            </Node>,
        );

        yield* all(point().scale(1, 0.5, softBack), label().opacity(1, 0.5));

        yield* all(
            dashedX().end(1, 0.6, easeInOutCubic),
            dashedY().end(1, 0.6, easeInOutCubic),
        );
        yield* sequence(
            0.1,
            dashedX().opacity(0.3, 0.5),
            dashedY().opacity(0.3, 0.5),
        );

        yield* waitFor(0.3);

        yield* all(
            vecLine().points([[0, 0], pixelPos], 0.8, softBack),

            label().text(name, 0.6),
            label().fill(color, 0.6),

            delay(
                0.15,
                sequence(0.1, point().scale(1.3, 0.1), point().scale(0, 0.3)),
            ),

            delay(0.6, vecHead().position(pixelPos, 0)),
        );

        return {
            line: vecLine,
            head: vecHead,
            label,
            group: vecGroup,
            logicalPos: new Vector2(x, y),
            color,
        };
    }

    public *addVectors(
        v1: ManagedVector,
        v2: ManagedVector,
        resultColor: string,
        resultName: string = "Sum",
    ) {
        const startPos = this.c2s(v1.logicalPos.x, v1.logicalPos.y);
        const offset = this.c2s(v2.logicalPos.x, v2.logicalPos.y);
        const finalPos = startPos.add(offset);

        const sumLogical = v1.logicalPos.add(v2.logicalPos);

        const ghostV2 = createRef<Line>();
        this.contentGroup().add(
            <Line
                ref={ghostV2}
                points={v2.line().points()}
                stroke={v2.color}
                lineWidth={4}
                lineDash={[10, 10]}
                opacity={1}
                endArrow
                arrowSize={15}
            />,
        );

        const flyingV2 = createRef<Line>();
        this.contentGroup().add(
            <Line
                ref={flyingV2}
                points={v2.line().points()}
                stroke={v2.color}
                lineWidth={6}
                endArrow
                arrowSize={20}
            />,
        );

        v2.line().opacity(0);
        v2.head().opacity(0);
        v2.label().opacity(0);

        yield* all(
            ghostV2().opacity(0.3, 0.5),
            flyingV2().position(startPos, 1, easeInOutCubic),
        );

        const sumVec = yield* this.spawnSimpleVector(
            sumLogical.x,
            sumLogical.y,
            resultColor,
            resultName,
        );

        yield* flyingV2().lineDash([10, 10], 0.5);

        return sumVec;
    }

    public *normalize(vec: ManagedVector) {
        const oldPixelEnd = this.c2s(vec.logicalPos.x, vec.logicalPos.y);
        const normLogical = vec.logicalPos.normalized;
        const newPixelEnd = this.c2s(normLogical.x, normLogical.y);

        const oldSilhouette = createRef<Line>();
        this.contentGroup().add(
            <Line
                ref={oldSilhouette}
                points={[[0, 0], oldPixelEnd]}
                stroke={vec.color}
                lineWidth={4}
                opacity={0.3} // Сразу тусклый
                lineDash={[15, 15]}
            />,
        );

        oldSilhouette().moveDown();

        yield* all(
            vec.line().points([[0, 0], newPixelEnd], 1, softBack),

            vec.label().position(newPixelEnd.add([20, -20]), 1, softBack),
            vec.label().text(`norm`, 0.5),
        );

        vec.logicalPos = normLogical;
    }

    private *spawnSimpleVector(
        x: number,
        y: number,
        color: string,
        name: string,
    ): Generator<any, ManagedVector, any> {
        const group = createRef<Node>();
        const line = createRef<Line>();
        const label = createRef<Txt>();

        // <--- ИСПРАВЛЕНИЕ ЗДЕСЬ: Создаем ссылку явно как Circle
        const head = createRef<Circle>();

        const endPixel = this.c2s(x, y);

        this.contentGroup().add(
            <Node ref={group}>
                <Line
                    ref={line}
                    points={[
                        [0, 0],
                        [0, 0],
                    ]}
                    stroke={color}
                    lineWidth={6}
                    endArrow
                    arrowSize={20}
                />

                {/* <--- ИСПРАВЛЕНИЕ ЗДЕСЬ: Привязываем ссылку */}
                <Circle ref={head} x={0} y={0} size={0} fill={color} />

                <Txt
                    ref={label}
                    text={name}
                    x={endPixel.x + 20}
                    y={endPixel.y - 20}
                    fill={color}
                    fontSize={28}
                    fontFamily={"JetBrains Mono"}
                    opacity={0}
                />
            </Node>,
        );

        yield* all(
            line().points([[0, 0], endPixel], 0.8, softBack),
            label().opacity(1, 0.5),
        );

        return {
            line,
            head, // <--- Теперь это Reference<Circle>, а не Reference<unknown>
            label,
            group,
            logicalPos: new Vector2(x, y),
            color,
        };
    }

    public *subVectors(
        target: ManagedVector,
        origin: ManagedVector,
        color: string,
        name: string,
    ) {
        const startPixel = this.c2s(origin.logicalPos.x, origin.logicalPos.y);
        const endPixel = this.c2s(target.logicalPos.x, target.logicalPos.y);
        const subLogical = target.logicalPos.sub(origin.logicalPos);

        const displacementLine = createRef<Line>();
        const label = createRef<Txt>();
        const mathVectorGroup = createRef<Node>();
        const mathLine = createRef<Line>();

        const headRef = createRef<Circle>();

        this.contentGroup().add(
            <Node>
                <Line
                    ref={displacementLine}
                    points={[startPixel, startPixel]}
                    stroke={color}
                    lineWidth={6}
                    endArrow
                    arrowSize={20}
                />
                <Txt
                    ref={label}
                    text={name}
                    x={startPixel.x}
                    y={startPixel.y}
                    fill={color}
                    fontSize={24}
                    fontFamily={"JetBrains Mono"}
                    opacity={0}
                />
            </Node>,
        );

        yield* all(
            displacementLine().points([startPixel, endPixel], 0.8, softBack),
            label().position(
                startPixel.add(endPixel).div(2).add([20, -20]),
                0.8,
                softBack,
            ),
            label().opacity(1, 0.5),
        );

        yield* waitFor(0.5);

        return {
            line: mathLine,
            head: headRef,
            label: label,
            group: mathVectorGroup,
            logicalPos: subLogical,
            color,
        };
    }

    public *constructVector(
        x: number,
        y: number,
        color: string,
        label: string,
    ) {
        const origin = this.c2s(0, 0);
        const pX = this.c2s(x, 0);
        const pFull = this.c2s(x, y);

        const group = createRef<Node>();
        const lineX = createRef<Line>();
        const lineY = createRef<Line>();
        const vector = createRef<Line>();
        const text = createRef<Txt>();

        this.contentGroup().add(
            <Node ref={group}>
                {/* Компонента X */}
                <Line
                    ref={lineX}
                    points={[origin, origin]}
                    stroke={"#46D9FF"} // Cyan
                    lineWidth={2}
                    lineDash={[5, 5]}
                    opacity={0.6}
                />
                {/* Компонента Y */}
                <Line
                    ref={lineY}
                    points={[pX, pX]}
                    stroke={"#A6E22E"} // Green
                    lineWidth={2}
                    lineDash={[5, 5]}
                    opacity={0.6}
                />
                {/* Итоговый Вектор */}
                <Line
                    ref={vector}
                    points={[origin, pFull]}
                    stroke={color}
                    lineWidth={4}
                    endArrow
                    arrowSize={15}
                    end={0} // Скрыт в начале
                />
                <Txt
                    ref={text}
                    text={label}
                    fill={color}
                    fontFamily={"JetBrains Mono"}
                    fontSize={24}
                    position={pFull.add([0, -30])}
                    opacity={0}
                />
            </Node>,
        );

        // Анимация: Быстрый "чертеж"
        // 1. Выстрел X
        yield* lineX().points([origin, pX], 0.3, easeInOutCubic);
        // 2. Выстрел Y
        yield* lineY().points([pX, pFull], 0.3, easeInOutCubic);
        // 3. Замыкание вектора
        yield* vector().end(1, 0.4, easeInOutCubic);
        yield* text().opacity(1, 0.4);

        // 4. Убираем вспомогательные линии (очищаем чертеж)
        yield* all(lineX().opacity(0, 0.3), lineY().opacity(0, 0.3));

        return {
            group,
            vector,
            pixelPos: pFull,
            logicalPos: new Vector2(x, y),
        };
    }

    public *explainPhysicalVector(
        x: number,
        y: number,
        color: string,
        label: string,
    ) {
        const origin = this.c2s(0, 0);
        const pX = this.c2s(x, 0);
        const pFull = this.c2s(x, y);

        const group = createRef<Node>();
        const dot = createRef<Circle>();

        const lineX = createRef<Line>();
        const labelX = createRef<Txt>();

        const lineY = createRef<Line>();
        const labelY = createRef<Txt>();

        const vectorArrow = createRef<Line>();
        const mainLabel = createRef<Txt>();

        this.contentGroup().add(
            <Node ref={group}>
                {/* 1. ЛИНИЯ X (Тянется от начала) */}
                <Line
                    ref={lineX}
                    points={[origin, pX]}
                    stroke={"#46D9FF"}
                    lineWidth={4}
                
                    end={0} // Скрыта (длина 0)
                />
                <Txt
                    ref={labelX}
                    text={`x: ${x}`}
                    fill={"#46D9FF"}
                    fontFamily={"JetBrains Mono"}
                    fontSize={24}
                    scale={0} // Скрыт (масштаб 0)
                    position={origin.add(pX).div(2).add([0, 40])}
                />

                {/* 2. ЛИНИЯ Y (Тянется от угла) */}
                <Line
                    ref={lineY}
                    points={[pX, pFull]}
                    stroke={"#A6E22E"}
                    lineWidth={4}
          
                    end={0}
                />
                <Txt
                    ref={labelY}
                    text={`y: ${y}`}
                    fill={"#A6E22E"}
                    fontFamily={"JetBrains Mono"}
                    fontSize={24}
                    scale={0}
                    position={pX.add(pFull).div(2).add([40, 0])}
                />

                {/* 3. ВЕКТОР (Желтый) */}
                <Line
                    ref={vectorArrow}
                    points={[origin, pFull]}
                    stroke={color}
                    lineWidth={6}
                    endArrow
                    arrowSize={20}
                    end={0}
                />
                <Txt
                    ref={mainLabel}
                    text={label}
                    fill={color}
                    fontFamily={"JetBrains Mono"}
                    fontSize={32}
                    scale={0}
                    position={pFull.add([0, -40])}
                />

                {/* 4. ТОЧКА (Курсор) */}
                <Circle
                    ref={dot}
                    size={25}
                    fill={"#FFF"}
                    position={origin}
                    scale={0} // Появится в начале
                />
            </Node>,
        );

        // --- АНИМАЦИЯ (Natural Flow) ---

        // 1. Появление точки
        yield* dot().scale(1, 0.3, easeInOutCubic);

        // 2. Движение по X (Тянем линию)
        yield* all(
            dot().position(pX, 0.6, easeInOutCubic),
            lineX().end(1, 0.6, easeInOutCubic),
        );
        yield* labelX().scale(1, 0.2, createEaseOutBack(1.5)); // "Pop" эффект для текста
        yield* waitFor(0.1);

        // 3. Движение по Y (Тянем вторую линию)
        yield* all(
            dot().position(pFull, 0.6, easeInOutCubic),
            lineY().end(1, 0.6, easeInOutCubic),
        );
        yield* labelY().scale(1, 0.2, createEaseOutBack(1.5));
        yield* waitFor(0.1);

        // 4. УДАР ВЕКТОРА (Snap!)
        // Вектор резко прочерчивается
        yield* vectorArrow().end(1, 0.4, easeInOutCubic);
        yield* mainLabel().scale(1, 0.3, createEaseOutBack(1.5));

        // 5. ТРАНСФОРМАЦИЯ (Втягивание)
        // Линии X и Y не исчезают, они "убегают" обратно в точки, освобождая место вектору
        yield* all(
            // Линия X сжимается обратно к началу (или к концу, как решишь)
            // start(1) заставит её "догнать" конец и исчезнуть вправо
            // end(0) заставит её втянуться влево
            lineX().end(0, 0.5, easeInOutCubic),
            labelX().scale(0, 0.3), // Текст схлопывается

            lineY().end(0, 0.5, easeInOutCubic), // Линия Y втягивается вниз
            labelY().scale(0, 0.3),

            // Точка тоже схлопывается, так как теперь есть стрелка
            dot().scale(0, 0.3),
        );

        return {
            group,
            arrow: vectorArrow,
            label: mainLabel,
            pixelPos: pFull,
            logicalPos: new Vector2(x, y),
        };
    }
}
