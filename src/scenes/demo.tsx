import {
    Camera,
    Circle,
    Img,
    makeScene2D,
    Node,
    Path,
    Rect,
    Txt,
} from "@motion-canvas/2d";
import {
    all,
    createRef,
    easeInOutExpo,
    Reference,
    useLogger,
    waitFor,
} from "@motion-canvas/core";
import phone from "../assets/phone.png"; // Твоя картинка рамки
import { HonkParticle } from "../honk-particles";

const STICKERS = ["🦆", "🎺", "🗯", "💥", "📢", "🚨", "🤡", "👀", "🧠", "💡"];
export default makeScene2D(function* (view) {
    const phoneGroup = createRef<Node>();
    const honkBtnRef = createRef<Rect>();
    const avatarRef = createRef<Circle>();
    const particleLayer = createRef<Node>();
    const cameraMotion = createRef<Camera>();
    const overlayRef = createRef<Rect>();
    const backgroundRef = createRef<Rect>();
    view.add(
        <Rect
            width={view.width() - 500}
            height={view.height() - 500}
            fill={"#1e1e1e"}
            radius={40}
            clip
            shadowBlur={40}
            shadowColor={"rgba(0,0,0,0.5)"}
            ref={backgroundRef}
        >
            <Rect scale={0.7}>
                <Camera ref={cameraMotion}>
                    <Node ref={phoneGroup}>
                        <Node>
                            <Rect
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
                            <Rect
                                clip={false}
                                radius={80}
                                layout
                                direction={"column"}
                                ref={overlayRef}
                                minWidth={470}
                                minHeight={1000}
                                fill={"#222222"}
                                opacity={0}
                                scale={2}
                            />
                            <Node>
                                <Img src={phone} height={view.height()} />
                            </Node>

                            <Rect
                                position={[0, 0]}
                                height={"100%"}
                                width={"100%"}
                                layout={false}
                                ref={particleLayer}
                            />
                        </Node>
                    </Node>
                </Camera>
            </Rect>
        </Rect>,
    );

    cameraMotion().scene().position(view.size().div(2));

    yield* waitFor(0.5);
    yield* all(
        cameraMotion().centerOn(honkBtnRef(), 1, easeInOutExpo),
        cameraMotion().zoom(1.3, 1, easeInOutExpo),
    );

    yield* honkBtnRef().scale(0.8, 0.3).to(1, 0.3);

    yield* all(
        cameraMotion().reset(0.5, easeInOutExpo),
        waitFor(0.2),
        runParticle(honkBtnRef, avatarRef, particleLayer, cameraMotion),
    );

    yield* waitFor(0.5);

    yield* all(
        backgroundRef().width(view.width(), 1),
        backgroundRef().height(view.height(), 1),
        backgroundRef().radius(0, 1),
        overlayRef().opacity(1, 0.5),
        cameraMotion().zoom(12, 1),
        cameraMotion().rotation(90, 1),
    );

    yield* all(cameraMotion().zoom(10, 1), cameraMotion().rotation(90, 1));
});

function* runParticle(
    honkBtnRef: Reference<Rect>,
    avatarRef: Reference<Circle>,
    particleLayer: Reference<Node>,
    cameraMotion: Reference<Camera>,
): Generator<void> {
    const btnWorldPos = honkBtnRef().absolutePosition();
    const avatarWorldPos = avatarRef().absolutePosition();

    const toLocalMatrix = particleLayer().worldToLocal();

    const startPos = btnWorldPos.transformAsPoint(toLocalMatrix);
    const targetPos = avatarWorldPos.transformAsPoint(toLocalMatrix);

    const particles: HonkParticle[] = [];
    const particleCount = 15;
    const duration = 300;
    const logger = useLogger();

    for (let i = 0; i < particleCount; i++) {
        const randomSticker =
            STICKERS[Math.floor(Math.random() * STICKERS.length)];
        const particle = new HonkParticle(
            particleLayer(),
            startPos,
            targetPos,
            randomSticker,
            createRef<Txt>(),
        );
        logger.debug(
            JSON.stringify({
                startPos,
                targetPos,
                progress: particle.progress,
                curveHeight: particle.curveHeight,
            }),
        );
        particles.push(particle);
    }

    while (particles.some((p) => !p.isDead)) {
        particles.forEach((p, i) => {
            if (!p.isDead) {
                p.update();
            }
        });

        yield;
    }
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
