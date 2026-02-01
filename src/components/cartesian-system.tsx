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
    createSignal,
    delay,
    easeInOutCubic,
    easeOutBack,
    Matrix2D,
    range,
    Reference,
    sequence,
    SimpleSignal,
    tween,
    useLogger,
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

export interface SineWaveControls {
    frequency: SimpleSignal<number>;
    amplitude: SimpleSignal<number>;
    phase: SimpleSignal<number>;
    start: SimpleSignal<Vector2>; // <--- Новый сигнал
    end: SimpleSignal<Vector2>; // <--- Новый сигнал
    line: Reference<Line>;
    distanceLine: Reference<Line>;
}

export class CartesianSystem extends Node {
    private grid = createRef<Grid>();
    private xAxis = createRef<Line>();
    private yAxis = createRef<Line>();
    private xGroup = createRef<Node>();
    private yGroup = createRef<Node>();
    public contentGroup = createRef<Node>();
    public container = createRef<Node>();

    public spacing: SimpleSignal<number>;
    public tricksFontSize = createSignal(16);
    public usePiLabels = createSignal(false);
    public viewWidth: SimpleSignal<number>;
    public viewHeight: SimpleSignal<number>;
    public radius:SimpleSignal<number>

    constructor(props: CartesianSystemProps) {
        super(props);
        this.viewWidth = createSignal(props.width);
        this.viewHeight = createSignal(props.height);
        this.spacing = createSignal(props.spacing ?? 80);
        this.radius = createSignal(0)

        this.add(
            <Node ref={this.container}>
                <Rect
                    width={() => this.viewWidth()}
                    height={() => this.viewHeight()}
                    fill={"#222222"}
                    radius={() => this.radius()}
                />

                <Grid
                    ref={this.grid}
                    width={() => this.viewWidth()}
                    height={() => this.viewHeight()}
                    spacing={() => this.spacing()}
                    stroke={"#444"}
                    lineWidth={1}
                    start={0.5}
                    end={0.5}
                />

                <Node ref={this.xGroup} />
                <Node ref={this.yGroup} />

                <Line
                    ref={this.yAxis}
                    points={() => [
                        [0, this.viewHeight() / 2],
                        [0, -this.viewHeight() / 2],
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
                    points={() => [
                        [-this.viewWidth() / 2, 0],
                        [this.viewWidth() / 2, 0],
                    ]}
                    stroke={"#FFF"}
                    lineWidth={4}
                    endArrow
                    arrowSize={16}
                    start={0.5}
                    end={0.5}
                />

                <Node ref={this.contentGroup} />
            </Node>,
        );
        this.generateTicks();
    }
    private getLabelText(logicalIndex: number, isVertical: boolean): string {
        const n = logicalIndex;

        if (this.usePiLabels() && !isVertical) {
            if (n === 0) return "0";
            if (n === 1) return "π";
            if (n === -1) return "-π";
            return `${n}π`;
        }
        return n.toString();
    }

    private generateTicks() {
        const tickLen = 20;
        const maxStepsX = Math.ceil(this.viewWidth() / 2 / 50);
        const maxStepsY = Math.ceil(this.viewHeight() / 2 / 50);
        range(-maxStepsX, maxStepsX + 1).forEach((i) => {
            if (i === 0) return;

            this.xGroup().add(
                <Node
                    x={() => i * this.spacing()}
                    scale={0}
                    opacity={() =>
                        Math.abs(i * this.spacing()) > this.viewWidth() / 2
                            ? 0
                            : 1
                    }
                >
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
                        fontSize={() => this.tricksFontSize()}
                        text={() => this.getLabelText(i, false)}
                        justifyContent={"center"}
                    />
                </Node>,
            );
        });

        range(-maxStepsY, maxStepsY + 1).forEach((i) => {
            if (i === 0) return;
            this.yGroup().add(
                <Node
                    scale={0}
                    y={() => -i * this.spacing()}
                    opacity={() =>
                        Math.abs(i * this.spacing()) > this.viewHeight() / 2
                            ? 0
                            : 1
                    }
                >
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
                        fontSize={() => this.tricksFontSize()}
                        text={() => this.getLabelText(i, true)}
                        alignItems={"center"}
                    />
                </Node>,
            );
        });
    }

    public c2s(x: number, y: number): Vector2 {
        return new Vector2(x * this.spacing(), -y * this.spacing());
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
            head,
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
        duration: number = 3.3, // <--- 1. Новый аргумент (дефолт 3.3 сек)
    ) {
        // 2. Считаем коэффициент. 
        // Если duration = 3.3, то s = 1 (стандарт). 
        // Если duration = 1.65, то s = 0.5 (в 2 раза быстрее).
        const s = duration / 3.3;

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
                <Line
                    ref={lineX}
                    points={[origin, pX]}
                    stroke={"#46D9FF"}
                    lineWidth={4}
                    end={0}
                />
                <Txt
                    ref={labelX}
                    text={`x: ${x}`}
                    fill={"#46D9FF"}
                    fontFamily={"JetBrains Mono"}
                    fontSize={24}
                    scale={0}
                    position={origin.add(pX).div(2).add([0, 40])}
                />

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
                    fontSize={28}
                    scale={0}
                    position={pFull.add([0, -40])}
                />

                <Circle
                    ref={dot}
                    size={25}
                    fill={"#FFF"}
                    position={origin}
                    scale={0}
                />
            </Node>,
        );

        // 3. ВЕЗДЕ УМНОЖАЕМ ВРЕМЯ НА s
        
        yield* dot().scale(1, 0.3 * s, easeInOutCubic);

        yield* all(
            dot().position(pX, 0.6 * s, easeInOutCubic),
            lineX().end(1, 0.6 * s, easeInOutCubic),
        );
        yield* labelX().scale(1, 0.2 * s, createEaseOutBack(1.5));
        
        // Паузы тоже масштабируем, чтобы ритм сохранялся
        yield* waitFor(0.1 * s);

        yield* all(
            dot().position(pFull, 0.6 * s, easeInOutCubic),
            lineY().end(1, 0.6 * s, easeInOutCubic),
        );
        yield* labelY().scale(1, 0.2 * s, createEaseOutBack(1.5));
        yield* waitFor(0.1 * s);

        yield* vectorArrow().end(1, 0.4 * s, easeInOutCubic);
        yield* mainLabel().scale(1, 0.3 * s, createEaseOutBack(1.5));

        yield* all(
            lineX().end(0, 0.5 * s, easeInOutCubic),
            labelX().scale(0, 0.3 * s),

            lineY().end(0, 0.5 * s, easeInOutCubic),
            labelY().scale(0, 0.3 * s),

            dot().scale(0, 0.3 * s),
        );

        return {
            group,
            arrow: vectorArrow,
            label: mainLabel,
            pixelPos: pFull,
            logicalPos: new Vector2(x, y),
        };
    }

    public *drawSine() {
        const sineLine = createRef<Line>();

        this.contentGroup().add(
            <Line
                points={() => {
                    return [];
                }}
            />,
        );
    }

    public *switchToPi(duration: number = 0.6) {
        yield* all(
            ...this.xGroup()
                .children()
                .map((c) => c.scale(0.8, duration / 2).to(1, duration / 2)),
            ...this.yGroup()
                .children()
                .map((c) => c.scale(0.8, duration / 2).to(1, duration / 2)),

            delay(duration / 2, this.usePiLabels(true, 0)),
        );
    }

    public *spawnDynamicSine(
        initialStart: Vector2,
        initialEnd: Vector2,
        initialFreq: number = 0,
        initialAmp: number = 40,
    ): Generator<any, SineWaveControls, any> {
        const startSig = createSignal(initialStart);
        const endSig = createSignal(initialEnd);

        const frequency = createSignal(initialFreq);
        const amplitude = createSignal(initialAmp);
        const phase = createSignal(0);

        const sineLine = createRef<Line>();
        const distanceLine = createRef<Line>();

        this.contentGroup().add(
            <>
                <Line
                    ref={distanceLine}
                    opacity={0}
                    stroke={"#ff5555"}
                    lineWidth={4}
                    points={() => [
                        this.c2s(startSig().x, startSig().y),
                        this.c2s(endSig().x, endSig().y),
                    ]}
                />
                <Line
                    ref={sineLine}
                    stroke={"#ff5555"}
                    lineWidth={4}
                    end={0}
                    points={() => {
                        const s = startSig();
                        const e = endSig();

                        const startPixel = this.c2s(s.x, s.y);
                        const endPixel = this.c2s(e.x, e.y);

                        const diff = endPixel.sub(startPixel);

                        if (diff.magnitude < 0.001) return [startPixel];

                        const direction = diff.normalized;

                        const normal = new Vector2(direction.y, -direction.x);

                        const points: Vector2[] = [];
                        const segments = 200;

                        const freqVal = frequency();
                        const ampVal = amplitude();
                        const phaseVal = phase();

                        const errorAtEnd = Math.sin(1 * freqVal + phaseVal);

                        for (let i = 0; i <= segments; i++) {
                            const t = i / segments;

                            const basePos = Vector2.lerp(
                                startPixel,
                                endPixel,
                                t,
                            );

                            const rawSine = Math.sin(t * freqVal + phaseVal);
                            const correctedSine = rawSine - errorAtEnd * t;

                            const offset = normal.scale(correctedSine * ampVal);
                            points.push(basePos.add(offset));
                        }
                        return points;
                    }}
                />
            </>,
        );

        yield* waitFor(0);

        return {
            frequency,
            amplitude,
            line: sineLine,
            phase,
            distanceLine,
            start: startSig,
            end: endSig,
        };
    }

    public *explainNormalConstruction(
        start: Vector2,
        end: Vector2,
        duration: number = 2,
    ) {
        // 1. Подготовка координат
        const startPx = this.c2s(start.x, start.y);
        const endPx = this.c2s(end.x, end.y);
        const diff = endPx.sub(startPx);
        const center = startPx.add(endPx).div(2); // Центр для демонстрации круга

        // Группа для объяснения
        const demoGroup = createRef<Node>();
        this.contentGroup().add(
            <Node ref={demoGroup} position={center} scale={0} />,
        );

        yield* demoGroup().scale(1, 0.5, easeOutBack);

        // 2. Рисуем Единичную окружность (Unit Circle)
        // Для наглядности радиус круга делаем равным нашему spacing (как бы 1 клетка)
        const radius = this.spacing();
        const circle = createRef<Circle>();
        const angleIndicator = createRef<Line>();

        demoGroup().add(
            <>
                <Circle
                    ref={circle}
                    size={radius * 2}
                    stroke="#666"
                    lineWidth={2}
                    lineDash={[5, 5]}
                    opacity={0}
                />
                <Txt
                    text="Unit Circle (r=1)"
                    y={radius + 30}
                    fill="#666"
                    fontSize={20}
                    fontFamily="JetBrains Mono"
                    opacity={0.5}
                />
            </>,
        );

        yield* circle().opacity(1, 0.5);

        // 3. Показываем исходный вектор (Direction)
        // Он пока длинный (просто направление линии)
        const dirVector = createRef<Line>();
        const dirLabel = createRef<Txt>();

        // Нормализованное направление (длина 1)
        const normalizedDir = diff.normalized.scale(radius);

        demoGroup().add(
            <Node rotation={(Math.atan2(diff.y, diff.x) * 180) / Math.PI}>
                <Line
                    ref={dirVector}
                    points={[
                        [0, 0],
                        [radius, 0],
                    ]} // Рисуем локально горизонтально, но Node повернут
                    stroke="#46D9FF" // Cyan
                    lineWidth={4}
                    endArrow
                    arrowSize={15}
                    end={0}
                />
                <Txt
                    ref={dirLabel}
                    text="Direction"
                    y={20}
                    x={radius / 2}
                    fill="#46D9FF"
                    fontSize={20}
                    fontFamily="JetBrains Mono"
                    opacity={0}
                    rotation={(-Math.atan2(diff.y, diff.x) * 180) / Math.PI} // Текст держим прямо
                />
            </Node>,
        );

        yield* all(dirVector().end(1, 0.5), dirLabel().opacity(1, 0.5));

        yield* waitFor(0.5);

        // 4. ПОВОРОТ НА 90 ГРАДУСОВ (Самый сок!)
        // Мы клонируем вектор и вращаем его
        const normalVector = createRef<Line>();
        const normalLabel = createRef<Txt>();

        // Группа для нормали, которую мы будем вращать
        const normalGroup = createRef<Node>();

        demoGroup().add(
            <Node
                ref={normalGroup}
                rotation={(Math.atan2(diff.y, diff.x) * 180) / Math.PI} // Начало там же, где Direction
            >
                <Line
                    ref={normalVector}
                    points={[
                        [0, 0],
                        [radius, 0],
                    ]}
                    stroke="#ff5555" // Red
                    lineWidth={4}
                    endArrow
                    arrowSize={15}
                    opacity={0}
                />
                <Txt
                    ref={normalLabel}
                    text="Normal (-y, x)"
                    y={-20}
                    x={radius / 2}
                    fill="#ff5555"
                    fontSize={20}
                    fontFamily="JetBrains Mono"
                    opacity={0}
                    scale={0}
                />
            </Node>,
        );

        // Показываем "призрак" вектора поверх синего
        normalVector().opacity(1);

        yield* waitFor(0.3);

        // АНИМАЦИЯ ПОВОРОТА
        // Вращаем группу на -90 градусов (или +90 в зависимости от системы)
        yield* all(
            normalGroup().rotation(
                normalGroup().rotation() - 90,
                1.5,
                easeInOutCubic,
            ),
            normalVector().stroke("#ff5555", 0.5), // Меняем цвет на красный в процессе
            normalLabel().opacity(1, 0.5),
            normalLabel().scale(1, 0.5, easeOutBack),
        );

        // Показываем угол 90 градусов
        const angle = createRef<Line>();
        normalGroup().add(
            <Line
                ref={angle}
                points={[
                    [20, 0],
                    [20, 20],
                    [0, 20],
                ]} // Уголок
                stroke="#FFF"
                lineWidth={2}
                opacity={0}
            />,
        );
        yield* angle().opacity(1, 0.3);

        yield* waitFor(1);

        // 5. ДЕМОНСТРАЦИЯ СИНУСА (Рост вектора)
        // Теперь мы показываем, как этот красный вектор меняет длину

        const sineLabel = createRef<Txt>();
        demoGroup().add(
            <Txt
                ref={sineLabel}
                text="sin(t) * Amplitude"
                y={-radius - 40}
                fill="#FFF"
                fontSize={24}
                fontFamily="JetBrains Mono"
                opacity={0}
            />,
        );
        yield* sineLabel().opacity(1, 0.5);

        // Пульсация длины вектора по синусу
        // Мы используем tween для имитации прохода от 0 до PI
        yield* tween(2, (value) => {
            // value идет от 0 до 1
            // Нам нужно simulirovat' sin(0 -> PI)
            const t = value * Math.PI;
            const sinVal = Math.sin(t);

            // Меняем длину красной стрелки
            // radius * 2 - это условная амплитуда для демонстрации
            const currentLen = sinVal * (radius * 1.5);

            normalVector().points([
                [0, 0],
                [currentLen, 0],
            ]);

            // Если длина почти 0, скрываем стрелку, чтоб не артефачила
            normalVector().opacity(currentLen < 1 ? 0 : 1);
        });

        // Чистим за собой (или оставляем, как решишь)
        yield* demoGroup().opacity(0, 0.5);
        demoGroup().remove();
    }
}
