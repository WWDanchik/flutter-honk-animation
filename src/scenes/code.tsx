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
} from "@motion-canvas/2d";
import {
    createRef,
    easeOutExpo,
    waitFor,
    all,
    easeInOutCubic,
    DEFAULT,
    createEaseOutBack,
} from "@motion-canvas/core";
import phone from "../assets/phone.png";
import { CartesianSystem } from "../components/cartesian-system";

const step1_Empty = ``;

const step2_Class = `class HonkParticle {

}`;

const step3_Props = `class HonkParticle {
  Vector2 start;
  Vector2 target;
  Vector2 pos;
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;
}`;

const step4_MethodStub = `class HonkParticle {
  Vector2 start;
  Vector2 target;
  Vector2 pos;
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;

  void update() {
    
  }
}`;

const step5_Linear = `class HonkParticle {
  Vector2 start;
  Vector2 target;
  Vector2 pos;
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;

  void update() {
    progress += speed;
    
    // 1. Linear Movement
    Vector2 currentPos = Vector2.zero();
    Vector2.mix(start, target, progress, currentPos);
  }
}`;

const step6_Perp = `class HonkParticle {
  Vector2 start;
  Vector2 target;
  Vector2 pos;
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;

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

const step7_Sine = `class HonkParticle {
  Vector2 start;
  Vector2 target;
  Vector2 pos;
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;

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

const step8_Final = `class HonkParticle {
  Vector2 start;
  Vector2 target;
  Vector2 pos;
  double progress = 0.0;
  double speed = 0.015;
  double curveHeight = 50;

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
                        <Rect
                            layout={false}
                            width={911}
                            height={1975}
                            clip
                            radius={40}
                        >
                            <Camera ref={phoneCamera}>
                                <CartesianSystem
                                    ref={system}
                                    width={view.width() * 2}
                                    height={view.height() * 2}
                                    spacing={100}
                                />
                            </Camera>
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
                        <Node>
                            <Img src={phone} height={view.height()} />
                        </Node>
                    </Rect>
                </MotionLayout>
            </MotionLayout>
        </Rect>,
    );

    yield* waitFor(1);
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
        codeRef().code(step2_Class, 0.8, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step2_Class), 0.8, easeInOutCubic),
        overlayRef().opacity(0, 0.8, easeInOutCubic),
        system().setup(),
    );

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

    yield* waitFor(0.3);

    yield* waitFor(0.8);
    yield* codeRef().selection(DEFAULT, 1.0);

    yield* waitFor(0.8);
    yield* codeRef().selection(
        codeRef().findAllRanges(/Vector2 target;/gi),
        1.0,
    );

    yield* all(phoneCamera().zoom(1.2, 0.5), phoneCamera().x(350, 0.5));
    const vecTarget = yield* system().explainPhysicalVector(
        6,
        3,
        "#FF647F",
        "Target(6,4)",
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

        vecTarget.label().x(vecTarget.label().position().x - 80, 0.4),
        vecTarget.label().y(vecTarget.label().position().y + 80, 0.4),

        dotEnd().scale(1, 0.5, createEaseOutBack(1.5)),
    );

    yield* waitFor(1.5);

    yield* all(
        codeRef().code(step4_MethodStub, 0.8, easeInOutCubic),
        lineNumbersRef().text(
            getNumbers(step4_MethodStub),
            0.8,
            easeInOutCubic,
        ),
    );

    yield* waitFor(2);
    // Step 5: Linear Movement logic
    // Тут мы показываем, что сначала считаем просто прямую линию
    yield* all(
        codeRef().code(step5_Linear, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step5_Linear), 1.0, easeInOutCubic),
    );
    yield* waitFor(1.5); // Пауза, чтобы прочитать про Vector2.mix

    // Step 6: Perpendicular calculation
    // Добавляем расчет направления и перпендикуляра
    yield* all(
        codeRef().code(step6_Perp, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step6_Perp), 1.0, easeInOutCubic),
    );
    yield* waitFor(1.5);

    // Step 7: Sine Wave Logic
    // Добавляем синус
    yield* all(
        codeRef().code(step7_Sine, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step7_Sine), 1.0, easeInOutCubic),
    );
    yield* waitFor(1.5);

    // Step 8: Final Position
    // Суммируем всё
    yield* all(
        codeRef().code(step8_Final, 1.0, easeInOutCubic),
        lineNumbersRef().text(getNumbers(step8_Final), 1.0, easeInOutCubic),
    );

    // Финальная пауза, чтобы насладиться кодом
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
