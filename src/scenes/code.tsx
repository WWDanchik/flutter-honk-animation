import {
    makeScene2D,
    Code,
    Rect,
    Node,
    Img,
    Layout as MotionLayout,
    Circle,
    Txt,
    Camera,
    Line,
    Path,
} from "@motion-canvas/2d";
import {
    createRef,
    easeOutExpo,
    waitFor,
    all,
    easeInOutCubic,
    DEFAULT,
    createEaseOutBack,
    Vector2,
    createSignal,
    map,
    range,
    linear,
    easeInBounce,
    easeInExpo,
    easeInOutExpo,
    easeOutQuad,
    easeOutBack,
    easeInOutBack,
    easeOutElastic,
    easeInBack,
    tween,
    delay,
    easeInQuad,
    easeOutCubic,
    easeInCubic,
} from "@motion-canvas/core";
import { CartesianSystem } from "../components/cartesian-system";
import phone from "../assets/phone.png";
import { HonkParticle } from "../honk-particles";

const STICKERS = ["🦆", "🎺", "💥", "📢", "🚨", "👀", "🧠", "💡"];

const gridFiles = import.meta.glob("../assets/grid-*.png", {
    eager: true,
    as: "url",
});

const allGrids = Object.keys(gridFiles)
    .sort((a, b) => {
        // Достаем число из названия файла (чтобы grid-2 шло перед grid-10)
        // Ищем первую попавшуюся группу цифр в пути файла
        const numA = parseInt(a.match(/grid-(\d+)/)?.[1] || "0");
        const numB = parseInt(b.match(/grid-(\d+)/)?.[1] || "0");

        return numA - numB;
    })
    .map((key) => gridFiles[key]);

const step1_Empty = ``;

const step2_import = `import 'package:vector_math/vector_math.dart';`;

const step2_Class = `import 'package:vector_math/vector_math.dart';

class HonkParticle {

}`;

const step3_Props = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.000;
  double speed = 0.015;
  double curveHeight = 100;
  Vector2 pos;
}`;
const getStep_Props_Progress = (
    val: number,
) => `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = ${val.toFixed(3)};
  double speed = 0.015;
  double curveHeight = 100;
  Vector2 pos;
}`;
const getStep_Props_CurveHeight = (
    val: number,
) => `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.000;
  double speed = 0.015;
  double curveHeight = ${val.toFixed(0)};
  Vector2 pos;
}`;

const step4_MethodStub = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.000;
  double speed = 0.015;
  double curveHeight = 100;
  Vector2 pos;

  void update() {
    
  }
}`;

const step5_Linear = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.000;
  double speed = 0.015;
  double curveHeight = 100;
  Vector2 pos;

  void update() {
    progress += speed;
    
    // 1. Linear Movement
    Vector2 currentPos = Vector2.zero();
    Vector2.mix(start, target, progress, currentPos);
  }
}`;

const step6_Perp = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.000;
  double speed = 0.015;
  double curveHeight = 100;
  Vector2 pos;

  void update() {
    progress += speed;
    
    // 1. Linear Movement
    Vector2 currentPos = Vector2.zero();
    Vector2.mix(start, target, progress, currentPos);

    // 2. Perpendicular Vector
    Vector2 path = target - start;
    Vector2 perp = Vector2(-path.y, path.x).normalized();
  }
}`;

const step7_Sine = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.000;
  double speed = 0.015;
  double curveHeight = 100;
  Vector2 pos;

  void update() {
    progress += speed;
    
    // 1. Linear Movement
    Vector2 currentPos = Vector2.zero();
    Vector2.mix(start, target, progress, currentPos);

    // 2. Perpendicular Vector
    Vector2 path = target - start;
    Vector2 perp = Vector2(-path.y, path.x).normalized();

    // 3. Sine Wave
    double curveT = sin(progress * pi);
    perp.scale(curveT * curveHeight);
  }
}`;

const step8_Final = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.000;
  double speed = 0.015;
  double curveHeight = 100;
  Vector2 pos;

  void update() {
    progress += speed;
    
    // 1. Linear Movement
    Vector2 currentPos = Vector2.zero();
    Vector2.mix(start, target, progress, currentPos);

    // 2. Perpendicular Vector
    Vector2 path = target - start;
    Vector2 perp = Vector2(-path.y, path.x).normalized();

    // 3. Sine Wave
    double curveT = sin(progress * pi);
    perp.scale(curveT * curveHeight);

    // Final Position
    pos.setFrom(currentPos + perp);
  }
}`;

function generateLineNumbers(count: number) {
    return Array.from({ length: count }, (_, i) => i + 1).join("\n");
}
function getNumbers(code: string) {
    const lines = code.split("\n").length;
    return Array.from({ length: Math.max(1, lines) }, (_, i) => i + 1).join(
        "\n",
    );
}

export default makeScene2D(function* (view) {
    const codeContainerRef = createRef<Rect>();
    const codeRef = createRef<Code>();
    const sidebarFilesRef = createRef<MotionLayout>();
    const modalRef = createRef<Rect>();
    const modalInputRef = createRef<Txt>();
    const modalInputArea = createRef<Rect>();
    const newFileEntryRef = createRef<MotionLayout>();
    const lineNumbersRef = createRef<Txt>();
    const phoneCamera = createRef<Camera>();

    const cBg = "#DEE2E6";
    const cEditorBg = "#1E1E1E";
    const cSidebarBg = "#252526";
    const cTitleBarBg = "#323233";
    const cAccent = "#42A5F5";

    const system = createRef<CartesianSystem>();
    const overlayRef = createRef<Rect>();

    const screensRef = createRef<Rect>();

    const startCarpetPos = createSignal(-395);

    const createCarpetRef = createRef<Rect>();

    const codeArea = createRef<Node>();


    const honkBtnRef = createRef<Rect>();
    const avatarRef = createRef<Circle>();
    const particleLayer = createRef<Node>();
    const cameraMotion = createRef<Camera>();
    const backgroundRef = createRef<Rect>();

    view.add(
        <Rect width={view.width()} height={view.height()} fill={cBg}>
            <MotionLayout
                layout
                direction="row"
                width="100%"
                height="100%"
                gap={0}
                padding={0}
                alignItems="center"
            >
                <Rect
                    ref={codeContainerRef}
                    width={0}
                    height="98%"
                    fill={cEditorBg}
                    radius={24}
                    clip
                    marginLeft={40}
                    layout
                    direction="column"
                >
                    <Rect
                        width="100%"
                        height={60}
                        minHeight={60}
                        shrink={0}
                        fill={cTitleBarBg}
                        layout
                        justifyContent="start"
                        alignItems="center"
                        padding={[0, 24]}
                        gap={16}
                    >
                        <Circle size={18} fill="#FF5F56" />
                        <Circle size={18} fill="#FFBD2E" />
                        <Circle size={18} fill="#27C93F" />

                        <Txt
                            text="Honkish Project"
                            fill={"#999"}
                            fontSize={20}
                            fontFamily={"JetBrains Mono"}
                            marginLeft={20}
                        />
                    </Rect>

                    <MotionLayout layout direction="row" width="100%" grow={1} shrink={1}>
                        <Rect
                            width={700}
                            minWidth={700}
                            shrink={0}
                            fill={cSidebarBg}
                            layout
                            direction="column"
                            padding={24}
                            gap={16}
                        >
                            <Txt
                                text="EXPLORER"
                                fill="#888"
                                fontSize={32}
                                fontWeight={700}
                                marginBottom={10}
                            />

                            <FileItem name="lib/" isFolder />
                            <Rect marginLeft={30}>
                                <FileItem name="main.dart" />
                            </Rect>

                            <MotionLayout
                                ref={sidebarFilesRef}
                                layout
                                direction="column"
                                gap={16}
                            />
                        </Rect>
                        <Rect
                            grow={1}
                            shrink={1}
                            layout
                            clip
                        >
                            {/* Scroll wrapper - Node без layout для позиционирования */}
                            <Node ref={codeArea} y={0}>
                                {/* Горизонтальный контейнер: Слева цифры, Справа код */}
                                <MotionLayout
                                    layout
                                    direction="row"
                                    gap={30}
                                    padding={[40, 0, 0, 0]}
                                    offset={[-1, -1]}
                                >
                                    {/* КОЛОНКА С ЦИФРАМИ */}
                                    <Txt
                                        ref={lineNumbersRef}
                                        text="1"
                                        fill="#858585"
                                        fontSize={42}
                                        lineHeight={60}
                                        fontFamily={"JetBrains Mono"}
                                        textAlign="right"
                                        width={60}
                                        opacity={0.5}
                                    />

                                    <Code
                                        ref={codeRef}
                                        fontSize={42}
                                        lineHeight={60}
                                        fontFamily={"JetBrains Mono"}
                                        code={step1_Empty}
                                    />
                                </MotionLayout>
                            </Node>
                        </Rect>
                    </MotionLayout>

                    <Rect
                        ref={modalRef}
                        position={[0, -100]}
                        width={900}
                        height={240}
                        fill="#2D2D2D"
                        radius={24}
                        shadowBlur={60}
                        shadowColor={"rgba(0,0,0,0.5)"}
                        layout={false}
                        opacity={0}
                        scale={1}
                    >
                        <Txt
                            text="New File..."
                            fill="#888"
                            fontSize={64}
                            x={-260}
                            y={-60}
                        />

                        <Rect
                            width={820}
                            height={90}
                            fill="#3C3C3C"
                            radius={16}
                            y={40}
                            ref={modalInputArea}
                        >
                            <Txt
                                ref={modalInputRef}
                                text=""
                                fill="#FFF"
                                fontSize={52}
                                fontFamily={"JetBrains Mono"}
                                x={0}
                                textAlign={"left"}
                                textWrap={false}
                                width={780}
                            />

                            <Rect
                                width={6}
                                height={60}
                                fill={cAccent}
                                ref={createCarpetRef}
                                x={() =>
                                    startCarpetPos() +
                                    modalInputRef().text().length * 31.5
                                }
                            />
                        </Rect>
                    </Rect>
                </Rect>

                <MotionLayout
                    layout
                    grow={1}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Rect>
                        <Rect width={911} height={1975} layout={false} clip>
                            <Rect
                                width={911}
                                height={1975}
                                radius={80}
                                layout={false}
                                scale={1}
                                ref={screensRef}
                            >
                                {range(67).map((i) => {
                                    const isMainFrame = i === 0;
                                    const width = 911;
                                    const gap = 40;
                                    const bgImage =
                                        allGrids[
                                            Math.min(i, allGrids.length - 1)
                                        ];
                                    return (
                                        <Rect
                                            key={`${i}`}
                                            layout={false}
                                            width={width}
                                            height={1975}
                                            radius={80}
                                            clip
                                            x={i * (width + gap)}
                                            fill={"#222222"}
                                            lineWidth={2}
                                            opacity={1}
                                        >
                                            {isMainFrame ? (
                                                <Camera ref={phoneCamera}>
                                                    <CartesianSystem
                                                        ref={system}
                                                        width={view.width() * 2}
                                                        height={
                                                            view.height() * 2
                                                        }
                                                        spacing={100}
                                                    />
                                                </Camera>
                                            ) : (
                                                <Img
                                                    src={bgImage}
                                                    width={width}
                                                    height={1977}
                                                    radius={80}
                                                    clip
                                                />
                                            )}
                                        </Rect>
                                    );
                                })}
                            </Rect>
                        </Rect>

                        <Rect
                            clip={false}
                            radius={80}
                            layout={false}
                            direction={"column"}
                            minWidth={470}
                            minHeight={1000}
                            fill={"#0e0d0d"}
                            opacity={1}
                            scale={2}
                            ref={overlayRef}
                        />
                        <Node zIndex={1000}>
                            <Img src={phone} height={view.height()} />
                        </Node>
                    </Rect>
                </MotionLayout>
            </MotionLayout>
        </Rect>,
    );

    system().radius(40);
    phoneCamera().scene().position(view.size().div(2));

    yield* codeContainerRef().width(2400, 1.5, easeOutExpo);
    yield* waitFor(0.5);

    yield* all(
        modalRef().opacity(1, 0.3),
        modalRef().scale(1, 0.3, easeOutExpo),
    );
    yield* waitFor(0.3);
    const fileName = "honk_particle.dart";
    const fileName2 = "honk_particle_controller.dart";
    const activeFile = createSignal<string>(fileName);

    yield* modalInputRef().text(fileName, 0.8);
    yield* waitFor(0.4);

    yield* all(modalRef().opacity(0, 0.2), modalRef().scale(0.9, 0.2));

    sidebarFilesRef().add(
        <MotionLayout
            ref={newFileEntryRef}
            opacity={0}
            layout
            direction="row"
            gap={8}
            alignItems="center"
            marginLeft={30}
        >
            <Txt text="📄" fontSize={48} />
            <Txt
                text={fileName}
                fill={() => (activeFile() == fileName ? cAccent : "#fff")}
                fontSize={48}
                fontFamily={"JetBrains Mono"}
            />
        </MotionLayout>,
    );
    yield* newFileEntryRef().opacity(1, 0.5);
    yield* waitFor(0.5);

    yield* all(
        codeRef().code(step2_import, 0.8, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step2_import), 0.8, easeInOutCubic),
        overlayRef().opacity(0, 0.8, easeInOutCubic),
        system().setup(1),
    );

    yield* codeRef().code(step2_Class, 0.8, easeInOutCubic);
    yield* all(
        codeRef().code(step3_Props, 0.8, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step3_Props), 0.8, easeInOutCubic),
    );
    const dotStart = createRef<Circle>();
    const dotEnd = createRef<Circle>();
    const lerpGroup = createRef<Rect>();

    yield* waitFor(0.8);
    yield* codeRef().selection(
        codeRef().findAllRanges(/Vector2 start;/gi),
        1.0,
        easeInExpo,
    );

    const vecStart = yield* system().explainPhysicalVector(
        2,
        1,
        "#FFF",
        "Start(2,1)",
        1,
    );


    system()
        .contentGroup()
        .add(
            <Rect ref={lerpGroup}>
                <Circle
                    ref={dotStart}
                    position={vecStart.pixelPos}
                    size={30}
                    fill={"#FFF"}
                    scale={0}
                />
            </Rect>,
        );

    yield* all(
        vecStart.arrow().opacity(0, 0.4),

        vecStart.label().x(vecStart.label().position().x - 80, 0.4),
        vecStart.label().y(vecStart.label().position().y + 80, 0.4),

        dotStart().scale(1, 0.5, createEaseOutBack(1.5)),
    );

    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);

    yield* codeRef().selection(
        codeRef().findAllRanges(/Vector2 target;/gi),
        1.0,
        easeInExpo,
    );

    yield* all(phoneCamera().zoom(1.2, 0.5), phoneCamera().x(400, 0.5));
    const vecTarget = yield* system().explainPhysicalVector(
        6,
        3,
        "#FF647F",
        "Target(6,3)",
        1,
    );

    lerpGroup().add(
        <Circle
            ref={dotEnd}
            position={vecTarget.pixelPos}
            size={30}
            fill={"#FF647F"}
            scale={0}
        />,
    );

    yield* all(
        vecTarget.arrow().opacity(0, 0.4),

        vecTarget.label().x(vecTarget.label().position().x + 80, 0.4),
        vecTarget.label().y(vecTarget.label().position().y + 80, 0.4),

        dotEnd().scale(1, 0.5, createEaseOutBack(1.5)),
    );

    yield* waitFor(1);
    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);

    yield* codeRef().selection(
        codeRef().findAllRanges(/double progress = 0.000;/gi),
        1.0,
        easeInExpo,
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
        [vecStart.pixelPos, vecTarget.pixelPos],
        0.8,
        easeInOutCubic,
    );

    const t = createSignal(0);
    yield* codeRef().code(
        () => getStep_Props_Progress(t()),
        0.5,
        easeInOutCubic,
    );
    const ghostDot = createRef<Circle>();
    lerpGroup().add(
        <Circle
            ref={ghostDot}
            size={25}
            fill={"#ff00ff"}
            position={() =>
                Vector2.lerp(vecStart.pixelPos, vecTarget.pixelPos, t())
            }
            zIndex={100000}
        >
            <Txt
                text={() => `t: ${t().toFixed(3)}`}
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

    codeContainerRef().add(
        <Rect
            ref={sliderGroup}
            y={700}
            x={0}
            scale={3}
            layout={false}
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
            height={80}
        >
            <Rect ref={sliderWrapper} height={40}>
                <Rect
                    ref={sliderContainer}
                    width={sliderWidth}
                    layout={false}
                    opacity={1}
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

    yield* all(sliderGroup().opacity(1, 1));

    yield* t(1, 3);
    yield* t(0, 3);

    yield* all(
        codeRef().selection(DEFAULT, 1.0, easeInExpo),
        sliderGroup().opacity(0, 1),
    );

    yield* codeRef().selection(
        codeRef().findAllRanges(/double speed = 0.015;/gi),
        1.0,
        easeInExpo,
    );

    const count = 67;
    const width = 911;
    const gap = 40;
    const targetScale = 0.5;

    const lastScreenX = (count - 1) * (width + gap);

    const targetX = -(lastScreenX * targetScale);

    yield* all(screensRef().scale(targetScale, 1, easeInOutExpo));
    yield* screensRef().x(targetX, 3.5, easeInOutExpo);

    yield* screensRef().x(1, 0.5, easeOutQuad);
    yield* screensRef().scale(1, 0.3, easeOutQuad);
    yield* waitFor(0.5);

    yield* all(screensRef().x(0, 0), screensRef().scale(1, 0));
    yield* waitFor(0.5);

    const oneFrameDist = width + gap;

    for (let i = 0; i < 67; i++) {
        screensRef().x(-oneFrameDist * i);
        yield* waitFor(0.033);
    }

    yield* waitFor(1);

    for (let i = 66; i >= 0; i--) {
        screensRef().x(-oneFrameDist * i);
        yield* waitFor(0.033);
    }

    yield* waitFor(0.6);
    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);
    yield* codeRef().selection(
        codeRef().findAllRanges(/double curveHeight = 100;/gi),
        1.0,
        easeInExpo,
    );

    yield* all(
        ghostDot().opacity(0, 0.8),
        ghostDot().scale(0, 0.8, easeInBack),
    );

    const curveHeight = createSignal(100);
    yield* codeRef().code(
        () => getStep_Props_CurveHeight(curveHeight()),
        0.5,
        easeInOutCubic,
    );

    yield* trackLine().end(0, 1);

    const wave = yield* system().spawnDynamicSine(
        new Vector2(2, 1),
        new Vector2(6, 3),
        0,
        0,
    );

    yield* wave.line().end(1, 0.8, easeInOutExpo);

    yield* wave.frequency(Math.PI, 1.2, easeInOutCubic);

    yield* all(
        wave.amplitude(curveHeight(), 1.2, easeInOutExpo),
        wave.amplitudeLine().end(1, 1, easeInOutExpo),
        wave.amplitudeLine().endArrow(true, 1, easeInOutExpo),

        wave.amplitudeLineTxtOpacity(1, 0.5),
        wave.amplitudeLineTxtScale(1, 0.8, easeOutBack),
    );
    yield* waitFor(0.5);
    yield* all(
        curveHeight(200, 1.2, easeInOutBack),
        wave.amplitude(200, 1.2, easeInOutBack),
    );
    yield* waitFor(0.3);

    yield* all(
        curveHeight(-200, 1.0, easeInOutExpo),
        wave.amplitude(-200, 1.0, easeInOutExpo),
    );
    yield* waitFor(0.5);
    yield* all(
        curveHeight(100, 1.5, easeOutElastic),
        wave.amplitude(100, 1.5, easeOutElastic),
    );

    yield* waitFor(1);

    yield* all(
        wave.amplitude(0, 0.8, easeInBack),
        wave.amplitudeLineTxtScale(0, 0.6, easeInBack),
        wave.amplitudeLineTxtOpacity(0, 0.6),
    );
    yield* all(
        wave.line().end(0, 0.8, easeInOutExpo),
        wave.distanceLine().end(0, 0.8, easeInOutExpo),
    );
    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);

    yield* all(
        codeRef().code(step4_MethodStub, 0.8, easeInOutCubic),
        lineNumbersRef().text(
            getNumbers(step4_MethodStub),
            0.8,
            easeInOutCubic,
        ),
    );

    yield* waitFor(1);

    yield* all(
        codeRef().code(step5_Linear, 0.8, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step5_Linear), 0.8, easeInOutCubic),
    );
    const speed = 0.015;
    const frames = 67;
    yield* codeRef().selection(
        codeRef().findAllRanges(/progress \+= speed;/gi),
        0.5,
        easeInExpo,
    );
    yield* waitFor(0.5);
    yield* all(
        ghostDot().opacity(1, 0.5),
        ghostDot().scale(1, 0.5, easeInBack),
        trackLine().end(1, 0.5, easeOutExpo),
    );

    yield* waitFor(0.5);

    for (let i = 1; i <= 4; i++) {
        const nextValue = i * speed;

        yield* all(t(nextValue, 0));

        yield* waitFor(0.4);
    }
    for (let i = 4; i <= 67; i++) {
        const nextValue = Math.min(i * speed, 1);

        yield* all(t(nextValue, 0));

        yield* waitFor(0.05);
    }

    yield t(0, 0.3);

    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);
    yield* codeRef().selection(
        [
            [
                [12, 17],
                [15, 55],
            ],
        ],
        0.6,
        easeInOutCubic,
    );

    yield* t(1, 3, linear);
    yield* t(0, 3, linear);
    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);
    yield* waitFor(1.5);

    yield* trackLine().end(0, 0.3, easeOutQuad);
    yield* all(ghostDot().opacity(0, 0.5), ghostDot().scale(0.7, 0.5));
    yield* waitFor(1.5);
    yield* all(
        codeRef().code(step6_Perp, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step6_Perp), 1.0, easeInOutCubic),
    );

    const diffArrow = createRef<Line>();

    const start = vecStart.pixelPos;
    const end = vecTarget.pixelPos;
    const radius = 15;
    const diffVector = end.sub(start);
    const direction = diffVector.normalized;
    const totalOffset = radius + 10;
    const adjustedEnd = end.sub(direction.scale(totalOffset));

    const adjustedStart = start.add(direction.scale(totalOffset));

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

    yield* codeRef().selection(
        codeRef().findAllRanges(/Vector2 path = target - start;/gi),
        0.5,
        easeInExpo,
    );

    yield* diffArrow().end(1, 1, easeInOutCubic);
    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);

    yield* codeRef().selection(
        codeRef().findAllRanges(
            /Vector2 perp = Vector2\(-path\.y, path\.x\)\.normalized\(\);/gi,
        ),
        0.5,
        easeInExpo,
    );
    const unitRadius = system().spacing();

    const unitTip = adjustedStart.add(direction.scale(unitRadius));

    yield* all(
        diffArrow().points([adjustedStart, unitTip], 1, easeInOutCubic),
        diffArrow().stroke("#FFF", 1),
    );
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

    yield* normalArrow().end(0, 0.5, easeInOutCubic);
    yield* codeRef().selection(DEFAULT, 0.5, easeInExpo);

    yield* all(
        codeRef().code(step7_Sine, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step7_Sine), 1.0, easeInOutCubic),
    );

    yield* codeRef().selection(
        codeRef().findAllRanges(/double curveT = sin\(progress \* pi\);/gi),
        0.5,
        easeInExpo,
    );
    const wave2 = yield* system().spawnDynamicSine(
        new Vector2(2, 1),
        new Vector2(6, 3),
        0,
        100,
    );
    wave2.distanceLine().opacity(0);
    yield* all(
        wave2.line().end(1, 0.8, easeInOutExpo),
        wave2.frequency(2 * Math.PI, 0.8, easeInOutExpo),
    );

    const moveDuration = 1.8;
    yield* all(
        dotStart().opacity(0, 0.3, easeInQuad),
        dotEnd().opacity(0, 0.3, easeInQuad),
        vecTarget.label().opacity(0, 0.3, easeInQuad),
        vecStart.label().opacity(0, 0.3, easeInQuad),

        phoneCamera().zoom(1.1, 1),
        phoneCamera().x(400, 1),
        system().switchToPi(0.6),

        wave2.start(new Vector2(0, 0), moveDuration, easeInOutExpo),
        wave2.end(new Vector2(2, 0), moveDuration, easeInOutExpo),

        wave2.frequency(2 * Math.PI, moveDuration, easeInOutExpo),
        wave2.amplitude(380, moveDuration * 0.8, easeInOutExpo),
        delay(
            moveDuration * 0.6,
            all(
                system().spacing(380, 1.2, easeInOutExpo),
                system().tricksFontSize(30, 1.2, easeInOutExpo),
            ),
        ),
    );

    const sinConRef = createRef<Rect>();
    screensRef().add(
        <Rect
            y={-650}
            x={150}
            width={500}
            ref={sinConRef}
            layout
            direction="column"
            alignItems="center"
            padding={[30, 40]} // Чуть меньше паддинг по бокам
            // 1. ФОН: Чуть светлее черного, чтобы выделялся
            fill={"#1e1e1e"}
            // 2. ОБВОДКА: Тонкая и аккуратная
            stroke={"#333"}
            lineWidth={2}
            radius={20}
            // Тень для объема
            shadowBlur={30}
            shadowColor={"rgba(0,0,0,0.6)"}
        >
            {/* Строка с формулой */}
            <Rect
                layout
                direction="row"
                alignItems="baseline" // Выравниваем по базовой линии текста
                gap={5} // Небольшой отступ между элементами
            >
                {/* sin( - Делаем спокойным синим (как ключевое слово) */}
                <Txt
                    text="sin("
                    fontFamily={"JetBrains Mono"}
                    fontWeight={600} // Чуть тоньше, чем 700 (элегантнее)
                    fontSize={52}
                    fill={"#569cd6"} // VS Code Blue (Приятный синий)
                />

                {/* Число - Делаем ярким (Желтый или Мятный) */}
                <Txt
                    fontFamily={"JetBrains Mono"}
                    fontWeight={600}
                    fontSize={52}
                    fill={"#dcdcaa"} // VS Code Yellow (Мягкий желтый)
                    // fill={"#4ec9b0"} // Альтернатива: Мятный

                    minWidth={160} // Запас места под широкие цифры
                    textAlign={"center"}
                    text={() => {
                        const val = wave2.dotProgress() * 2 * Math.PI;
                        return val.toFixed(2);
                    }}
                />

                {/* ) - Тоже синим */}
                <Txt
                    text=")"
                    fontFamily={"JetBrains Mono"}
                    fontWeight={600}
                    fontSize={52}
                    fill={"#569cd6"}
                />
            </Rect>

            <Txt
                text="RADIANS"
                fontSize={32}
                fontFamily={"JetBrains Mono"}
                fontWeight={600}
                letterSpacing={2}
                fill={"#888888"}
                marginTop={5}
                opacity={0.8}
            />
        </Rect>,
    );
    yield* wave2.dotProgress(1, 5, linear);
    yield* wave2.dotProgress(0.5, 1, easeOutQuad);

    yield* all(
        wave.frequency(Math.PI, 0.8, easeInOutCubic),
        wave.end(new Vector2(1, 0), 0.8, easeInOutCubic),
    );

    yield* all(
        system().spacing(100, 1.2, easeInOutExpo),
        system().usePiLabels(false, 0.5),
        system().tricksFontSize(16, 1.2, easeInOutExpo),
        wave.line().opacity(0, 0.3),
        sinConRef().scale(0.7, 0.5),
        sinConRef().opacity(0, 0.5),
        wave2.line().end(0, 0.8, easeInOutCubic),
        wave2.dot().opacity(0, 0.8),
        wave2.dot().scale(0.7, 0.8),
        wave2.dotTxt().scale(0.7, 0.8),
        wave2.dotTxt().opacity(0, 0.8),
    );

    yield* all(
        dotStart().opacity(1, 0.3, easeInQuad),
        dotEnd().opacity(1, 0.3, easeInQuad),
        vecTarget.label().opacity(1, 0.3, easeInQuad),
        vecStart.label().opacity(1, 0.3, easeInQuad),
    );

    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);

    yield* codeRef().selection(
        codeRef().findAllRanges(/perp\.scale\(curveT \* curveHeight\);/gi),
        0.5,
        easeInExpo,
    );

    yield* trackLine().end(1, 0.3);
    yield* all(ghostDot().opacity(1, 0.3), ghostDot().scale(1, 0.3));
    const wave3 = yield* system().spawnDynamicSine(
        new Vector2(2, 1),
        new Vector2(6, 3),
        0,
        100,
    );
    wave3.distanceLine().opacity(0);
    yield* wave3.line().end(1, 0.8, easeInOutExpo);

    yield* wave3.frequency(Math.PI, 1.2, easeInOutCubic);

    yield* all(
        wave3.amplitude(100, 1.2, easeInOutExpo),
        wave3.amplitudeLine().end(1, 1, easeInOutExpo),
        wave3.amplitudeLine().endArrow(true, 1, easeInOutExpo),

        wave3.amplitudeLineTxtOpacity(1, 0.5),
        wave3.amplitudeLineTxtScale(1, 0.8, easeOutBack),
    );

    wave3.amplitude(() => Math.sin(t() * Math.PI) * 100);

    yield* t(1, 5, linear);

    yield* waitFor(1.5);

    yield* all(
        wave3.amplitude(0, 0.8, easeInBack),
        wave3.amplitudeLineTxtScale(0, 0.6, easeInBack),
        wave3.amplitudeLineTxtOpacity(0, 0.6),
    );
    yield* all(
        wave3.line().end(0, 0.8, easeInOutExpo),
        wave3.distanceLine().end(0, 0.8, easeInOutExpo),
        t(0, 0.3),
    );
    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);

    yield* all(
        codeRef().code(step8_Final, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step8_Final), 1.0, easeInOutCubic),
    );

    yield* codeRef().selection(
        codeRef().findAllRanges(/pos\.setFrom\(currentPos \+ perp\);/gi),
        0.5,
        easeInExpo,
    );

    const waveTrace = createRef<Line>();
    system()
        .contentGroup()
        .add(
            <Line
                ref={waveTrace}
                points={[adjustedStart]}
                stroke="#ff5555"
                lineWidth={4}
            />,
        );

    t(0);

    yield* all(normalArrow().opacity(1, 1));

    const getWavePoint = (time: number) => {
        const currentBase = Vector2.lerp(adjustedStart, adjustedEnd, time);

        const maxAmp = 80;
        const magnitude = Math.sin(time * Math.PI) * maxAmp;

        const offsetVec = Vector2.fromRadians(endRad).scale(magnitude);

        return currentBase.add(offsetVec);
    };

    normalArrow().end(1);

    normalArrow().points(() => {
        const time = t();
        const currentBase = Vector2.lerp(adjustedStart, adjustedEnd, time);
        const tip = getWavePoint(time);
        return [currentBase, tip];
    });

    waveTrace().points(() => {
        const time = t();
        const path: Vector2[] = [];
        const step = 0.01;

        for (let i = 0; i <= time; i += step) {
            path.push(getWavePoint(i));
        }
        path.push(getWavePoint(time));

        return path;
    });

    yield* t(1, 2, easeInOutCubic);
    yield* waitFor(0.5);
    yield* t(0, 1.5, easeInOutCubic);

    yield* normalArrow().opacity(0, 0.5);

    yield* waitFor(1);
    yield* codeRef().selection(DEFAULT, 1.0, easeInExpo);

    yield* overlayRef().opacity(1, 0.5);
    modalInputRef().text("");
    modalInputRef().x(-50);
    modalInputArea().width(1000);
    modalRef().width(1100);
    startCarpetPos(-445);

    yield* all(
        modalRef().opacity(1, 0.3),
        modalRef().scale(1, 0.3, easeOutExpo),
    );

    yield* modalInputRef().text(fileName2, 0.8);
    yield* waitFor(0.4);

    sidebarFilesRef().add(
        <MotionLayout
            ref={newFileEntryRef}
            opacity={0}
            layout
            direction="row"
            gap={8}
            alignItems="center"
            marginLeft={30}
        >
            <Txt text="📄" fontSize={48} />
            <Txt
                text={
                    fileName2.length > 15
                        ? fileName2.slice(0, 15) + "..."
                        : fileName2
                }
                fill={() => (activeFile() == fileName2 ? cAccent : "#fff")}
                fontSize={48}
                fontFamily={"JetBrains Mono"}
            />
        </MotionLayout>,
    );
    yield* all(
        modalRef().opacity(0, 0.2),
        modalRef().scale(0.9, 0.2),
        newFileEntryRef().opacity(1, 0.5),
        activeFile(fileName2, 0.2),
    );

    codeArea().y(0);
    
    yield* all(
        codeRef().code(``, 0.2, easeInOutCubic),
        lineNumbersRef().text(getNumbers(``), 0.2, easeInOutCubic),
    );
    yield* waitFor(1);
    const step1_Imports = `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:honk_particle.dart';`;
    const step2_Class1 = `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:honk_particle.dart';

class HonkParticleController extends ChangeNotifier {

}`;
    const step3_List = `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:honk_particle.dart';

class HonkParticleController extends ChangeNotifier {
  List<HonkParticle> particles = [];

}`;

    const step4_Emit = `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:honk_particle.dart';

class HonkParticleController extends ChangeNotifier {
  List<HonkParticle> particles = [];

  void emit({
    required Widget widget,
    required Offset from,
    required Offset to,
  }) {
    particles.add(
      HonkParticle(
        child: widget,
        x: from.dx,
        y: from.dy,
        tx: to.dx,
        ty: to.dy,
      ),
    );
  }

}`;

    const step5_Tick = `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:honk_particle.dart';

class HonkParticleController extends ChangeNotifier {
  List<HonkParticle> particles = [];

  void emit({
    required Widget widget,
    required Offset from,
    required Offset to,
  }) {
    particles.add(
      HonkParticle(
        child: widget,
        x: from.dx,
        y: from.dy,
        tx: to.dx,
        ty: to.dy,
      ),
    );
  }

  void tick() {
    if (particles.isEmpty) return;

    for (var p in particles) p.update();
  

    bool hasDeadParticles = particles.any(
      (p) => p.isDead,
    ); 

    if (hasDeadParticles) {
      HapticFeedback.mediumImpact();
    }
  
    particles.removeWhere((p) => p.isDead);

    notifyListeners();
  }
}`;
    yield* all(
        codeRef().code(step1_Imports, 0.5, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step1_Imports), 0.2, easeInOutCubic),
    );
    yield* all(
        codeRef().code(step2_Class1, 0.6, easeOutCubic),
        lineNumbersRef().text(getNumbers(step2_Class1), 0.2, easeInOutCubic),
    );
    yield* waitFor(0.5);

    yield* all(
        codeRef().code(step3_List, 0.6, easeOutCubic),
        lineNumbersRef().text(getNumbers(step3_List), 0.2, easeInOutCubic),
    );

    // Выделить List<HonkParticle> particles = [];
    yield* codeRef().selection(
        codeRef().findAllRanges(/List<HonkParticle> particles = \[\];/gi),
        0.5,
        easeInExpo,
    );

    // Добавить UI телефона
    const chatUIRef = createRef<Rect>();
    const dimOverlayRef = createRef<Rect>();
    
    screensRef().add(<Node>
        <Rect
            ref={chatUIRef}
            clip={true}
            width={490}
            height={1030}
            scale={2}
            radius={80}
            fill={"#FFFFFF"}
            layout
            direction={"column"}
            paddingLeft={38}
            paddingRight={40}
            paddingTop={95}
        >
            <Rect
                width={"100%"}
                height={80}
                direction={"row"}
                alignItems={"center"}
                justifyContent={"space-between"}
            >
                <Path
                    width={40}
                    height={40}
                    data="M 15 2 L 5 12 L 15 22"
                    stroke={"#E5E5EA"}
                    lineWidth={4}
                    lineCap={"round"}
                    lineJoin={"round"}
                    marginRight={10}
                />

                <Rect
                    direction={"column"}
                    alignItems={"center"}
                    justifyContent={"center"}
                >
                    <Txt
                        text="Alex"
                        fill={"black"}
                        fontSize={20}
                        fontWeight={700}
                    />
                    <Txt
                        text="Here 23m ago"
                        fill={"#8e8e93"}
                        fontSize={14}
                    />
                </Rect>

                <Circle
                    size={40}
                    fill={"#BDBDBD"}
                    ref={avatarRef}
                >
                    <Circle
                        size={40}
                        fill={"#BDBDBD"}
                        clip={true}
                        shrink={0}
                        layout={false}
                    >
                        <Node x={0} y={-7}>
                            <Circle
                                size={18}
                                fill={"#EEEEEE"}
                            />
                        </Node>

                        <Node x={0} y={22}>
                            <Circle
                                size={36}
                                fill={"#EEEEEE"}
                            />
                        </Node>
                    </Circle>
                </Circle>
            </Rect>

            <Rect
                direction={"column"}
                grow={1}
                gap={10}
                paddingBottom={20}
                justifyContent={"center"}
                paddingTop={15}
            >
                <Rect
                    fill={"#F2F2F7"}
                    radius={20}
                    width={"100%"}
                    height={200}
                />

                <Rect
                    fill={"#007AFF"}
                    radius={20}
                    width={"100%"}
                    height={180}
                    alignItems={"center"}
                    justifyContent={"center"}
                >
                    <Rect
                        width={3}
                        height={30}
                        fill={"white"}
                        opacity={0.8}
                    />
                </Rect>
            </Rect>

            <Rect
                width={"100%"}
                height={40}
                direction={"row"}
                alignItems={"center"}
                gap={15}
                padding={5}
            >
                <Rect
                    size={30}
                    radius={8}
                    fill={"#007AFF"}
                />
                <Rect
                    fill={"#E5E5EA"}
                    size={30}
                    radius={8}
                />
                <Rect
                    fill={"#E5E5EA"}
                    size={30}
                    radius={8}
                />
                <Rect
                    fill={"#E5E5EA"}
                    size={30}
                    radius={8}
                />
                <Rect
                    fill={"#E5E5EA"}
                    size={30}
                    radius={8}
                />

                <Rect
                    padding={[5, 12]}
                    fill={"#E5E5EA"}
                    radius={8}
                    alignItems={"center"}
                    justifyContent={"center"}
                    ref={honkBtnRef}
                >
                    <Txt
                        text="HONK"
                        fontSize={18}
                        fill={"#8E8E93"}
                        fontWeight={800}
                    />
                </Rect>
                <Rect grow={1} />
                <IconPlaceholder icon="trash" />
            </Rect>

            <Keyboard />
        </Rect>
        {/* Overlay для затемнения UI - ПОД частицами */}
        <Rect
            ref={dimOverlayRef}
            position={[0, 0]}
            width={490}
            height={1030}
            scale={2}
            radius={80}
            fill={"rgba(0,0,0,0.85)"}
            opacity={0}
        />
        {/* Частицы - ПОВЕРХ затемнения */}
        <Rect
            position={[0, 0]}
            height={"100%"}
            width={"100%"}
            layout={false}
            ref={particleLayer}
        />
    </Node>);

    yield* overlayRef().opacity(0, 0.5);

    // Запустить частицы до 80% и затемнить UI
    yield* waitFor(0.3);
    
    // Запуск частиц
    const btnWorldPos = honkBtnRef().absolutePosition();
    const avatarWorldPos = avatarRef().absolutePosition();
    const toLocalMatrix = particleLayer().worldToLocal();
    const startPos = btnWorldPos.transformAsPoint(toLocalMatrix);
    const targetPos = avatarWorldPos.transformAsPoint(toLocalMatrix);

    // Каждая частица со своим рандомным stopProgress
    const particleData: { particle: HonkParticle; stopProgress: number }[] = [];
    const particleCount = 8;

    // Создать все частицы сразу с рандомным stopProgress
    for (let i = 0; i < particleCount; i++) {
        const randomSticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];
        const particle = new HonkParticle(
            particleLayer(),
            startPos,
            targetPos,
            randomSticker,
            createRef<Txt>(),
        );
        const stopProgress = 0.15 + Math.random() * 0.7;
        particleData.push({ particle, stopProgress });
    }


    let running = true;
    while (running) {
        running = false;
        for (const data of particleData) {
            if (!data.particle.isDead && data.particle.progress < data.stopProgress) {
                data.particle.update();
                running = true;
            }
        }
        yield;
    }

    yield* waitFor(0.5);


    yield* dimOverlayRef().opacity(1, 0.5, easeOutCubic);

    yield* waitFor(0.3);

    // Линии от "particles = []" к частицам
    // Добавляем линии в particleLayer чтобы координаты совпадали
    const lines: Line[] = [];
    
    // Позиция кода в мировых координатах, потом в локальные particleLayer
    const codeWorldPos = codeRef().absolutePosition().add(new Vector2(300, 300));
    // toLocalMatrix уже объявлен выше
    const codeLocalPos = codeWorldPos.transformAsPoint(toLocalMatrix);

    for (const data of particleData) {
        // Позиция частицы уже в локальных координатах particleLayer
        const particlePos = data.particle.ref().position();
        
        const lineRef = createRef<Line>();
        
        particleLayer().add(
            <Line
                ref={lineRef}
                points={[codeLocalPos, particlePos]}
                stroke={"#fff"}
                lineWidth={3}
                
                end={0}
            />
        );
        lines.push(lineRef());
    }



    yield* waitFor(0.3);

    // Частицы летят обратно к старту
    yield* all(
        ...particleData.map((data, i) =>
            delay(i * 0.06, data.particle.ref().position(startPos, 0.7, easeInOutCubic))
        ),
        ...particleData.map((data, i) =>
            delay(i * 0.06 + 0.3, data.particle.ref().scale(0, 0.4, easeInCubic))
        )
    );

    // Снять эффекты
    yield* all(
        codeRef().selection(DEFAULT, 0.5),
        dimOverlayRef().opacity(0, 0.5),
    );

    // Очистить
    particleData.forEach((d) => d.particle.ref().remove());
    lines.forEach((l) => l.remove());
    yield* waitFor(0.5);

    yield* all(
        codeRef().code(step4_Emit, 0.6, easeOutCubic),
        lineNumbersRef().text(getNumbers(step4_Emit), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.3);

    // Выделить emit
    yield* codeRef().selection(codeRef().findAllRanges(/void emit\(\{[\s\S]*?\);\n  \}/gm), 0.5, easeInOutCubic);
    yield* waitFor(1);
    yield* codeRef().selection(DEFAULT, 0.3);

    yield* waitFor(0.3);

    yield* all(
        codeRef().code(step5_Tick, 0.6, easeOutCubic),
        lineNumbersRef().text(getNumbers(step5_Tick), 0.2, easeInOutCubic),
        codeArea().y(-550, 0.8, easeInOutCubic),
    );

    yield* waitFor(0.3);

    // Выделить tick
    yield* codeRef().selection(codeRef().findAllRanges(/void tick\(\)[\s\S]*?notifyListeners\(\);\n  \}/gm), 0.5, easeInOutCubic);
    yield* waitFor(1);
    yield* codeRef().selection(DEFAULT, 0.3);

    yield* waitFor(0.5);

    yield* overlayRef().opacity(1, 0.5);

    // Рефакторинг HonkParticle - пошагово
    // 1. Старый код
    const step_Refactor_Old = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.000;
  double speed = 0.015;
  double curveHeight = 100;
  Vector2 pos;

  void update() {
    progress += speed;
    
    // 1. Linear Movement
    Vector2 currentPos = Vector2.zero();
    Vector2.mix(start, target, progress, currentPos);

    // 2. Perpendicular Vector
    Vector2 path = target - start;
    Vector2 perp = Vector2(-path.y, path.x).normalized();

    // 3. Sine Wave
    double curveT = sin(progress * pi);
    perp.scale(curveT * curveHeight);

    // Final Position
    pos.setFrom(currentPos + perp);
  }
}`;

    // 2. С child и key
    const step_Refactor_ChildKey = `import 'dart:math';
import 'package:flutter/material.dart';
import 'package:vector_math/vector_math_64.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.000;
  double speed = 0.015;
  double curveHeight = 100;
  Vector2 pos;

  final Key key = UniqueKey();
  Widget child;

  void update() {
    progress += speed;
    
    // 1. Linear Movement
    Vector2 currentPos = Vector2.zero();
    Vector2.mix(start, target, progress, currentPos);

    // 2. Perpendicular Vector
    Vector2 path = target - start;
    Vector2 perp = Vector2(-path.y, path.x).normalized();

    // 3. Sine Wave
    double curveT = sin(progress * pi);
    perp.scale(curveT * curveHeight);

    // Final Position
    pos.setFrom(currentPos + perp);
  }
}`;

    // 3. С scale и конструктором
    const step_Refactor_Init = `import 'dart:math';
import 'package:flutter/material.dart';
import 'package:vector_math/vector_math_64.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.0;
  double scale = 0;
  double curveHeight;
  double speed;
  Vector2 pos;

  final Key key = UniqueKey();
  Widget child;

  HonkParticle({
    required this.child,
    required double x,
    required double y,
    required double tx,
    required double ty,
  }) : pos = Vector2(x, y),
       target = Vector2(tx, ty),
       start = Vector2(x, y),
       curveHeight = randomRange(-100, 100),
       speed = 0.015,
       progress = randomRange(-0.4, 0);

  void update() {
    progress += speed;
    if (progress <= 0) {
      pos.setFrom(start);
      scale = 0;
      return;
    }
    Vector2 currentPos = Vector2.zero();
    Vector2.mix(start, target, progress, currentPos);

    Vector2 path = target - start;
    Vector2 perp = Vector2(-path.y, path.x).normalized();

    double curveT = sin(progress * pi);
    perp.scale(curveT * curveHeight);

    pos.setFrom(currentPos + perp);
    scale = curveT;
  }

  bool get isDead => progress >= 1;

  static double randomRange(double min, double max) {
    return min + Random().nextDouble() * (max - min);
  }
}`;

    
    yield* activeFile(fileName, 0.3);
    codeArea().y(0);

    yield* all(
        codeRef().code(step_Refactor_Old, 0.5, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Refactor_Old), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.8);

    // Добавить child и key
    yield* all(
        codeRef().code(step_Refactor_ChildKey, 0.6, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Refactor_ChildKey), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.3);

    // Выделить key
    yield* codeRef().selection(codeRef().findAllRanges(/final Key key = UniqueKey\(\);/g), 0.4, easeInOutCubic);
    yield* waitFor(0.8);

    // Выделить child
    yield* codeRef().selection(codeRef().findAllRanges(/Widget child;/g), 0.4, easeInOutCubic);
    yield* waitFor(0.8);

    yield* codeRef().selection(DEFAULT, 0.3);

    yield* waitFor(0.3);

    // Добавить scale и конструктор
    yield* all(
        codeRef().code(step_Refactor_Init, 0.7, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Refactor_Init), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.3);

    // Выделить инициализатор (конструктор)
    yield* codeRef().selection(codeRef().findAllRanges(/HonkParticle\(\{[\s\S]*?progress = randomRange\(-0\.4, 0\);/gm), 0.5, easeInOutCubic);
    yield* waitFor(1.2);
    yield* codeRef().selection(DEFAULT, 0.3);

    yield* waitFor(0.3);

    // Скролл вниз чтобы показать isDead и randomRange
    yield* codeArea().y(-1800, 0.6, easeInOutCubic);

    yield* waitFor(0.3);

    // Выделить isDead
    yield* codeRef().selection(codeRef().findAllRanges(/bool get isDead => progress >= 1;/g), 0.5, easeInOutCubic);
    yield* waitFor(1);

    // Выделить метод randomRange
    yield* codeRef().selection(codeRef().findAllRanges(/static double randomRange[\s\S]*?\}/gm), 0.5, easeInOutCubic);
    yield* waitFor(1);
    
    yield* codeRef().selection(DEFAULT, 0.3);

    yield* waitFor(0.8);

    const fileName3 = "honk_particle_overlay.dart";

    const step_Overlay_Imports = `import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:honk_particle_controller.dart';`;

    const step_Overlay_Class = `import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:honk_particle_controller.dart';

class ParticleOverlay extends StatefulWidget {
  final HonkParticleController controller;
  final Widget child;

  const ParticleOverlay({
    super.key,
    required this.controller,
    required this.child,
  });

  @override
  State<ParticleOverlay> createState() => 
      _ParticleOverlayState();
}`;

    const step_Overlay_State = `import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:honk_particle_controller.dart';

class ParticleOverlay extends StatefulWidget {
  final HonkParticleController controller;
  final Widget child;

  const ParticleOverlay({
    super.key,
    required this.controller,
    required this.child,
  });

  @override
  State<ParticleOverlay> createState() => 
      _ParticleOverlayState();
}

class _ParticleOverlayState extends State<ParticleOverlay>
    with SingleTickerProviderStateMixin {
  late Ticker _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      widget.controller.tick();
    });
    _ticker.start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }
}`;

    const step_Overlay_Build = `import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:honk_particle_controller.dart';

class ParticleOverlay extends StatefulWidget {
  final HonkParticleController controller;
  final Widget child;

  const ParticleOverlay({
    super.key,
    required this.controller,
    required this.child,
  });

  @override
  State<ParticleOverlay> createState() => 
      _ParticleOverlayState();
}

class _ParticleOverlayState extends State<ParticleOverlay>
    with SingleTickerProviderStateMixin {
  late Ticker _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      widget.controller.tick();
    });
    _ticker.start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        return Stack(
          fit: StackFit.expand,
          children: [
            widget.child,
            ...widget.controller.particles.map((p) {
              return Positioned(
                key: p.key,
                left: p.pos.x,
                top: p.pos.y,
                child: FractionalTranslation(
                  translation: Offset(-0.5, -0.5),
                  child: Transform.scale(
                    scale: p.scale,
                    child: p.child,
                  ),
                ),
              );
            }),
          ],
        );
      },
    );
  }
}`;
    modalInputRef().text("");
    startCarpetPos(-445);

    yield* all(
        modalRef().opacity(1, 0.3),
        modalRef().scale(1, 0.3, easeOutExpo),
    );

    yield* modalInputRef().text(fileName3, 0.8);
    yield* waitFor(0.4);

    const newFileEntryRef3 = createRef<MotionLayout>();
    sidebarFilesRef().add(
        <MotionLayout
            ref={newFileEntryRef3}
            opacity={0}
            layout
            direction="row"
            gap={8}
            alignItems="center"
            marginLeft={30}
        >
            <Txt text="📄" fontSize={48} />
            <Txt
                text={
                    fileName3.length > 15
                        ? fileName3.slice(0, 15) + "..."
                        : fileName3
                }
                fill={() => (activeFile() == fileName3 ? cAccent : "#fff")}
                fontSize={48}
                fontFamily={"JetBrains Mono"}
            />
        </MotionLayout>,
    );

  

    yield* all(
        modalRef().opacity(0, 0.2),
        modalRef().scale(0.9, 0.2),
        newFileEntryRef3().opacity(1, 0.5),
        activeFile(fileName3, 0.2),
    );

    codeArea().y(0);

    yield* all(
        codeRef().code(``, 0.2, easeInOutCubic),
        lineNumbersRef().text(getNumbers(``), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.5);

    yield* all(
        codeRef().code(step_Overlay_Imports, 0.5, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step_Overlay_Imports), 0.2, easeInOutCubic),
    );

    yield* all(
        codeRef().code(step_Overlay_Class, 0.6, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Overlay_Class), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.5);

    yield* all(
        codeRef().code(step_Overlay_State, 0.6, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Overlay_State), 0.2, easeInOutCubic),
        codeArea().y(-1120, 0.8, easeInOutCubic)
    );

    yield* waitFor(0.5);

    yield* all(
        codeRef().code(step_Overlay_Build, 0.8, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Overlay_Build), 0.2, easeInOutCubic),
        codeArea().y(-2320, 0.8, easeInOutCubic),
    );

    yield* waitFor(1.5);

    const fileName4 = "chat_screen.dart";

    const step_Chat_Imports = `import 'package:flutter/material.dart';
import 'package:honk_particle_controller.dart';
import 'package:particle_overlay.dart';`;

    const step_Chat_Class = `import 'package:flutter/material.dart';
import 'package:honk_particle_controller.dart';
import 'package:particle_overlay.dart';

class ChatScreen extends StatelessWidget {
  final HonkParticleController _ctrl = 
      HonkParticleController();
  final GlobalKey avatarKey = GlobalKey();
  final GlobalKey fabKey = GlobalKey();

  ChatScreen({super.key});
}`;

    const step_Chat_Helper = `import 'package:flutter/material.dart';
import 'package:honk_particle_controller.dart';
import 'package:particle_overlay.dart';

class ChatScreen extends StatelessWidget {
  final HonkParticleController _ctrl = 
      HonkParticleController();
  final GlobalKey avatarKey = GlobalKey();
  final GlobalKey fabKey = GlobalKey();

  ChatScreen({super.key});

  Offset? getWidgetCenter(GlobalKey key) {
    final box = key.currentContext
        ?.findRenderObject() as RenderBox?;
    if (box == null) return null;

    final topLeft = box.localToGlobal(Offset.zero);
    final size = box.size;

    return topLeft + Offset(size.width / 2, size.height / 2);
  }
}`;

    // С emit методом (без build)
    const step_Chat_EmitMethod = `import 'package:flutter/material.dart';
import 'package:honk_particle_controller.dart';
import 'package:particle_overlay.dart';

class ChatScreen extends StatelessWidget {
  final HonkParticleController _ctrl = 
      HonkParticleController();
  final GlobalKey avatarKey = GlobalKey();
  final GlobalKey fabKey = GlobalKey();

  ChatScreen({super.key});

  Offset? getWidgetCenter(GlobalKey key) {
    final box = key.currentContext
        ?.findRenderObject() as RenderBox?;
    if (box == null) return null;

    final topLeft = box.localToGlobal(Offset.zero);
    final size = box.size;

    return topLeft + Offset(size.width / 2, size.height / 2);
  }

  void _emitParticles() {
    final from = getWidgetCenter(fabKey);
    final to = getWidgetCenter(avatarKey);

    if (from == null || to == null) return;

    for (var i = 0; i < 10; i++) {
      _ctrl.emit(
        widget: Icon(Icons.favorite, color: Colors.red),
        from: from,
        to: to,
      );
    }
  }
}`;

    // С build методом
    const step_Chat_Build = `import 'package:flutter/material.dart';
import 'package:honk_particle_controller.dart';
import 'package:particle_overlay.dart';

class ChatScreen extends StatelessWidget {
  final HonkParticleController _ctrl = 
      HonkParticleController();
  final GlobalKey avatarKey = GlobalKey();
  final GlobalKey fabKey = GlobalKey();

  ChatScreen({super.key});

  Offset? getWidgetCenter(GlobalKey key) {
    final box = key.currentContext
        ?.findRenderObject() as RenderBox?;
    if (box == null) return null;

    final topLeft = box.localToGlobal(Offset.zero);
    final size = box.size;

    return topLeft + Offset(size.width / 2, size.height / 2);
  }

  void _emitParticles() {
    final from = getWidgetCenter(fabKey);
    final to = getWidgetCenter(avatarKey);

    if (from == null || to == null) return;

    for (var i = 0; i < 10; i++) {
      _ctrl.emit(
        widget: Icon(Icons.favorite, color: Colors.red),
        from: from,
        to: to,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ParticleOverlay(
      controller: _ctrl,
      child: Scaffold(
        appBar: AppBar(
          title: Text("Chat"),
          actions: [
            CircleAvatar(key: avatarKey),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          key: fabKey,
          onPressed: () => _emitParticles(),
          child: Icon(Icons.add),
        ),
      ),
    );
  }
}`;

    // Показать модальное окно
    modalInputRef().text("");
    startCarpetPos(-445);

    yield* all(
        modalRef().opacity(1, 0.3),
        modalRef().scale(1, 0.3, easeOutExpo),
    );

    yield* modalInputRef().text(fileName4, 0.8);
    yield* waitFor(0.4);

    // Добавить файл в sidebar
    const newFileEntryRef4 = createRef<MotionLayout>();
    sidebarFilesRef().add(
        <MotionLayout
            ref={newFileEntryRef4}
            opacity={0}
            layout
            direction="row"
            gap={8}
            alignItems="center"
            marginLeft={30}
        >
            <Txt text="📄" fontSize={48} />
            <Txt
                text={fileName4}
                fill={() => (activeFile() == fileName4 ? cAccent : "#fff")}
                fontSize={48}
                fontFamily={"JetBrains Mono"}
            />
        </MotionLayout>,
    );

    yield* all(
        modalRef().opacity(0, 0.2),
        modalRef().scale(0.9, 0.2),
        newFileEntryRef4().opacity(1, 0.5),
        activeFile(fileName4, 0.2),
    );

  
    codeArea().y(0);

    yield* all(
        codeRef().code(``, 0.2, easeInOutCubic),
        lineNumbersRef().text(getNumbers(``), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.5);


    yield* all(
        codeRef().code(step_Chat_Imports, 0.5, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step_Chat_Imports), 0.2, easeInOutCubic),
    );

    yield* all(
        codeRef().code(step_Chat_Class, 0.6, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Chat_Class), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.3);


    yield* codeRef().selection(codeRef().findAllRanges(/final HonkParticleController _ctrl =[\s\S]*?HonkParticleController\(\);/gm), 0.4, easeInOutCubic);
    yield* waitFor(0.8);

    // Выделить avatarKey
    yield* codeRef().selection(codeRef().findAllRanges(/final GlobalKey avatarKey = GlobalKey\(\);/g), 0.4, easeInOutCubic);
    yield* waitFor(0.8);

    // Выделить fabKey
    yield* codeRef().selection(codeRef().findAllRanges(/final GlobalKey fabKey = GlobalKey\(\);/g), 0.4, easeInOutCubic);
    yield* waitFor(0.8);

    yield* codeRef().selection(DEFAULT, 0.3);

    yield* waitFor(0.3);

    // getWidgetCenter
    yield* all(
        codeRef().code(step_Chat_Helper, 0.6, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Chat_Helper), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.3);

    // Выделить getWidgetCenter
    yield* codeRef().selection(codeRef().findAllRanges(/Offset\? getWidgetCenter[\s\S]*?size\.height \/ 2\);[\s\S]*?\}/gm), 0.5, easeInOutCubic);
    yield* waitFor(1);
    yield* codeRef().selection(DEFAULT, 0.3);

    yield* waitFor(0.3);

    // Добавить emit метод
    yield* all(
        codeArea().y(-800, 0.6, easeInOutCubic),
        codeRef().code(step_Chat_EmitMethod, 0.7, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Chat_EmitMethod), 0.2, easeInOutCubic),
    );
    yield* codeRef().selection(codeRef().findAllRanges(/void _emitParticles\(\)[\s\S]*?\n  \}/gm), 0.5, easeInOutCubic);
    yield* waitFor(1);
    yield* codeRef().selection(DEFAULT, 0.3);

    yield* waitFor(0.3);

    // Добавить build метод
    yield* all(
        codeArea().y(-1600, 0.6, easeInOutCubic),
        codeRef().code(step_Chat_Build, 0.7, easeOutCubic),
        lineNumbersRef().text(getNumbers(step_Chat_Build), 0.2, easeInOutCubic),
    );

    yield* waitFor(0.3);

    // Скролл чтобы видеть emit и build
    

    yield* waitFor(0.3);

    // Выделить _emitParticles
   

    // Выделить build
    yield* codeRef().selection(codeRef().findAllRanges(/@override[\s\S]*?Widget build[\s\S]*?\n  \}/gm), 0.5, easeInOutCubic);
    yield* waitFor(1);

    yield* codeRef().selection(DEFAULT, 0.3);

    yield* waitFor(2);
});

function FileItem({
    name,
    isFolder = false,
}: {
    name: string;
    isFolder?: boolean;
}) {
    return (
        <MotionLayout layout direction="row" gap={8} alignItems="center">
            <Txt text={isFolder ? "📁" : "📄"} fontSize={48} />
            <Txt
                text={name}
                fill="#CCCCCC"
                fontSize={48}
                fontFamily={"JetBrains Mono"}
            />
        </MotionLayout>
    );
}








const IconPlaceholder = ({ icon }: { icon?: string }) => (
    <Txt
        text={icon === "trash" ? "🗑️" : "Example"}
        fontSize={20}
        opacity={0.5}
    />
);

const Keyboard = () => (
    <Rect
        width={"110%"}
        marginLeft={-20}
        height={600}
        fill={"#D1D5DB"}
        direction={"column"}
        gap={12}
        justifyContent={"start"}
    >
        <Rect
            height={40}
            width={"100%"}
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-around"}
        >
            <Txt text="sin()" fontSize={18} fill={"black"} />
            <Rect width={1} height={20} fill={"#999"} />
            <Txt text="cos()" fontSize={18} fill={"black"} />
            <Rect width={1} height={20} fill={"#999"} />
            <Txt text="tan()" fontSize={18} fill={"black"} />
        </Rect>

        <KeyRow keys="QWERTYUIOP" />
        <KeyRow keys="ASDFGHJKL" pad={15} />
        <Rect
            direction={"row"}
            gap={6}
            justifyContent={"center"}
            width={"100%"}
        >
            <KeySpecial icon="⬆" width={42} />
            <KeyRow keys="ZXCVBNM" noContainer />
            <KeySpecial icon="⌫" width={42} />
        </Rect>

        <Rect
            direction={"row"}
            gap={6}
            justifyContent={"center"}
            width={"100%"}
            marginTop={5}
        >
            <KeySpecial text="123" width={85} bg="#B0B3BE" />
            <Rect grow={1}>
                <KeySpecial text="space" width={"100%"} />
            </Rect>

            <KeySpecial text="return" width={85} bg="#B0B3BE" />
        </Rect>
    </Rect>
);

const KeyRow = ({ keys, pad = 0, noContainer = false }: any) => {
    const content = keys.split("").map((char: string) => (
        <Rect
            width={42}
            height={42}
            radius={5}
            fill={"white"}
            alignItems={"center"}
            justifyContent={"center"}
        >
            <Txt
                text={char}
                fontSize={22}
                fill={"black"}
                fontFamily={"sans-serif"}
            />
        </Rect>
    ));

    if (noContainer) return <>{content}</>;

    return (
        <Rect
            direction={"row"}
            gap={6}
            justifyContent={"center"}
            width={"100%"}
            paddingLeft={pad}
            paddingRight={pad}
        >
            {content}
        </Rect>
    );
};

const KeySpecial = ({ text, icon, width, bg = "#B0B3BE" }: any) => (
    <Rect
        width={width}
        height={42}
        radius={5}
        fill={bg}
        alignItems={"center"}
        justifyContent={"center"}
    >
        {text && <Txt text={text} fontSize={16} fill={"black"} />}
        {icon && <Txt text={icon} fontSize={20} fill={"black"} />}
    </Rect>
);
