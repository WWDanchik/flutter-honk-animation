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
import { createRef, waitFor } from "@motion-canvas/core";
import phone from "../assets/phone.png"; // Твоя картинка рамки

const STICKERS = ["🦆", "🎺", "🗯", "💥", "📢", "🚨", "🤡", "👀", "🧠", "💡"];
export default makeScene2D(function* (view) {
    const phoneGroup = createRef<Node>();

    const cameraMotion = createRef<Camera>();
    const avatarRef = createRef<Circle>();
    view.add(
        <Camera ref={cameraMotion}>
            <Node ref={phoneGroup}>
                <Rect
                    clip={false}
                    width={490}
                    height={1030}
                    radius={80}
                    fill={"#FFFFFF"}
                    layout
                    direction={"column"}
                    paddingLeft={38}
                    paddingRight={40}
                    paddingTop={95}
                >
                   <Keyboard />
                </Rect>
                <Node>
                    <Img src={phone} height={view.height()} layout={false} />
                </Node>
            </Node>
        </Camera>
    );

    yield* waitFor(1);
    yield* cameraMotion().zoom(2, 1);
    yield* cameraMotion().zoom(0.5, 1.5);
    yield* cameraMotion().zoom(1, 1);
});


const IconPlaceholder = ({ icon }: { icon?: string }) => (
    <Txt
        text={icon === "trash" ? "🗑️" : "Example"}
        fontSize={20}
        opacity={0.5}
    />
);

const Keyboard = () => (
    <Rect
        width={"100%"}
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
