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
} from "@motion-canvas/core";
import { CartesianSystem } from "../components/cartesian-system";
import phone from "../assets/phone.png";

import grid1 from "../assets/grid-1.png";
import grid2 from "../assets/grid-2.png";
import grid3 from "../assets/grid-3.png";
import grid4 from "../assets/grid-4.png";
import grid5 from "../assets/grid-5.png";
import grid6 from "../assets/grid-6.png";
import grid7 from "../assets/grid-7.png";
import grid8 from "../assets/grid-8.png";
import grid9 from "../assets/grid-9.png";
import grid10 from "../assets/grid-10.png";
import grid11 from "../assets/grid-11.png";
import grid12 from "../assets/grid-12.png";
import grid13 from "../assets/grid-13.png";
import grid14 from "../assets/grid-14.png";
import grid15 from "../assets/grid-15.png";
import grid16 from "../assets/grid-16.png";
import grid17 from "../assets/grid-17.png";
import grid18 from "../assets/grid-18.png";
import grid19 from "../assets/grid-19.png";

const allGrids = [
    grid1,
    grid2,
    grid3,
    grid4,
    grid5,
    grid6,
    grid7,
    grid8,
    grid9,
    grid10,
    grid11,
    grid12,
    grid13,
    grid14,
    grid15,
    grid16,
    grid17,
    grid18,
    grid19,
];
const step1_Empty = ``;

const step2_import = `import 'package:vector_math/vector_math.dart';`;

const step2_Class = `import 'package:vector_math/vector_math.dart';

class HonkParticle {

}`;

const step3_Props = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;
  Vector2 pos;
}`;
const getStep3_Props = (
    val: number,
) => `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = ${val.toFixed(3)};
  double speed = 0.015;
  double curveHeight = 50;
  Vector2 pos;
}`;

const step4_MethodStub = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;
  Vector2 pos;

  void update() {
    
  }
}`;

const step5_Linear = `import 'package:vector_math/vector_math.dart';

class HonkParticle {
  Vector2 start;
  Vector2 target;
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;
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
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;
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
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;
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
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;
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
                    height="95%"
                    fill={cEditorBg}
                    radius={24}
                    clip
                    marginLeft={40}
                    layout
                    direction="column"
                >
                    <Rect
                        width="100%"
                        height={60} // Было 40 -> 60
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
                            text="Honkish Project - VS Code"
                            fill={"#999"}
                            fontSize={20}
                            fontFamily={"JetBrains Mono"}
                            marginLeft={20}
                        />
                    </Rect>

                    <MotionLayout layout direction="row" width="100%" grow={1}>
                        <Rect
                            width={700}
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
                            layout
                            direction="column"
                            // Убираем отступ слева, чтобы цифры были у края
                            padding={[40, 0, 0, 0]}
                            justifyContent="start"
                            alignItems="start"
                        >
                            {/* Горизонтальный контейнер: Слева цифры, Справа код */}
                            <MotionLayout layout direction="row" gap={30}>
                                {/* НОВЫЙ ЭЛЕМЕНТ: КОЛОНКА С ЦИФРАМИ */}
                                <Txt
                                    ref={lineNumbersRef} // <--- Не забудь создать const lineNumbersRef = createRef<Txt>();
                                    text="1"
                                    fill="#858585"
                                    fontSize={42} // Размер шрифта как у кода
                                    lineHeight={60} // ВАЖНО: Высота строки как у кода
                                    fontFamily={"JetBrains Mono"}
                                    textAlign="right"
                                    width={60}
                                    opacity={0.5}
                                />

                                {/* ТВОЙ КОД */}
                                <Code
                                    ref={codeRef}
                                    fontSize={42}
                                    lineHeight={60} // ВАЖНО: Добавь это свойство, чтобы строки совпадали
                                    fontFamily={"JetBrains Mono"}
                                    code={step1_Empty}
                                />
                            </MotionLayout>
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
                                x={() =>
                                    -395 + modalInputRef().text().length * 31.5
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
                                {range(60).map((i) => {
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
                        <Node zIndex={10}>
                            <Img src={phone} height={view.height()} />
                        </Node>
                    </Rect>
                </MotionLayout>
            </MotionLayout>
        </Rect>,
    );

    system().radius(40);

    yield* codeContainerRef().width(2200, 1.5, easeOutExpo);
    yield* waitFor(0.5);

    yield* all(
        modalRef().opacity(1, 0.3),
        modalRef().scale(1, 0.3, easeOutExpo),
    );
    yield* waitFor(0.3);

    const fileName = "honk_particle.dart";
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
                fill={cAccent}
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

    yield* codeRef().selection(DEFAULT, 1.0);

    yield* codeRef().selection(
        codeRef().findAllRanges(/Vector2 target;/gi),
        1.0,
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
    yield* codeRef().selection(DEFAULT, 1.0);

    yield* codeRef().selection(
        codeRef().findAllRanges(/double progress = 0.0;/gi),
        1.0,
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
    yield* codeRef().code(() => getStep3_Props(t()), 0.5, easeInOutCubic);
    const ghostDot = createRef<Circle>();
    lerpGroup().add(
        <Circle
            ref={ghostDot}
            size={25}
            fill={"#ff00ff"}
            position={() =>
                Vector2.lerp(vecStart.pixelPos, vecTarget.pixelPos, t())
            }
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

    // t(0.285);
    // yield waitFor(10);
    yield* t(1, 3);
    yield* t(0, 3);

    yield* all(codeRef().selection(DEFAULT, 1.0), sliderGroup().opacity(0, 1));

    yield* codeRef().selection(
        codeRef().findAllRanges(/double speed = 0.015;/gi),
        1.0,
    );

    const count = 60;
    const width = 911;
    const gap = 40;
    const targetScale = 0.5;

    const lastScreenX = (count - 1) * (width + gap);

    const targetX = -(lastScreenX * targetScale);

    yield* all(
        screensRef().scale(targetScale, 3.5, easeInOutExpo),
        screensRef().x(targetX, 3.5, easeInOutExpo),
    );
    yield* screensRef().scale(1, 0.5, easeOutQuad);
    yield* screensRef().x(1, 0.5, easeOutQuad);
    yield* waitFor(0.5);

    yield* all(screensRef().x(0, 0), screensRef().scale(1, 0));
    yield* waitFor(0.5);

    const oneFrameDist = width + gap;
    // --- 1. РАЗОБЛАЧЕНИЕ (Медленно) ---
    // Сдвигаем ровно на ОДИН кадр. 
    yield* screensRef().x(-oneFrameDist, 0.8, easeInOutCubic);
    yield* waitFor(0.3);
     yield* screensRef().x(-oneFrameDist*2, 0.8, easeInOutCubic);
    yield* waitFor(0.3);

    // --- 2. НАБОР СКОРОСТИ (Средне) ---
    // Проезжаем до 5-го кадра.
    // Лента все еще "едет", мы видим черные полосы.
    yield* screensRef().x(-oneFrameDist * 5, 1.5, linear);

    // --- 3. ПРЕВРАЩЕНИЕ В ВИДЕО (Быстро) ---
    // Мы остановились на 5-м кадре. 
    // Теперь вместо того, чтобы "ехать" дальше, мы начинаем мгновенно 
    // подменять позицию. Зазоры исчезают, появляется плавное движение.
    
    for (let i = 5; i < 60; i++) {
        // Мгновенный перенос (как проектор переключил кадр)
        screensRef().x(-oneFrameDist * i); 
        
        // Пауза между кадрами (0.033 = 30 FPS)
        // Если хочешь быстрее/медленнее, меняй это число
        yield* waitFor(0.033); 
    }

    yield* waitFor(1);
    
    // Сброс в начало
    yield* screensRef().x(0, 0);

    yield* waitFor(0.6);

    yield* screensRef().x(0, 3.5, easeInOutExpo);

    yield* screensRef().scale(1, 0.8, easeOutExpo);

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
        codeRef().code(step5_Linear, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step5_Linear), 1.0, easeInOutCubic),
    );
    yield* waitFor(1.5);

    yield* all(
        codeRef().code(step6_Perp, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step6_Perp), 1.0, easeInOutCubic),
    );
    yield* waitFor(1.5);

    yield* all(
        codeRef().code(step7_Sine, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step7_Sine), 1.0, easeInOutCubic),
    );
    yield* waitFor(1.5);

    yield* all(
        codeRef().code(step8_Final, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step8_Final), 1.0, easeInOutCubic),
    );

    yield* waitFor(3);

    yield* all(phoneCamera().zoom(1.5, 1), phoneCamera().x(200, 1));
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
