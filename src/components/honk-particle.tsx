import { Txt, Node, NodeProps, initial, signal, Line } from "@motion-canvas/2d";
import {
    Vector2,
    SimpleSignal,
    createSignal,
    SignalValue,
    easeInOutCubic,
    BBox,
    createRef,
} from "@motion-canvas/core";

export interface HonkParticleProps extends NodeProps {
    startPos?: SignalValue<Vector2>;
    targetPos?: SignalValue<Vector2>;
    content?: SignalValue<string>;
    curveHeight?: SignalValue<number>;
}

export class HonkParticle extends Node {
    @initial(new Vector2(0, 0))
    @signal()
    public declare readonly startPos: SimpleSignal<Vector2, this>;

    @initial(new Vector2(500, 0))
    @signal()
    public declare readonly targetPos: SimpleSignal<Vector2, this>;

    @initial("HONK")
    @signal()
    public declare readonly content: SimpleSignal<string, this>;

    @initial(100)
    @signal()
    public declare readonly curveHeight: SimpleSignal<number, this>;
    private readonly progress = createSignal(0);

    public constructor(props?: HonkParticleProps) {
        super({ ...props });

        this.add(
            <Txt
                text={() => this.content()}
                fill={"#29b6f6"}
                fontFamily={"Courier New"}
                fontWeight={700}
                fontSize={40}
                position={() => this.calculatePath()}
                scale={this.scale}
                rotation={() =>
                    Math.sin(this.progress() * Math.PI) *
                    20 *
                    (this.curveHeight() > 0 ? 1 : -1)
                }
            />
        );
    }

    private calculatePath(): Vector2 {
        const p = this.progress();
        const s = this.startPos();
        const t = this.targetPos();

        const currentLinearPos = Vector2.lerp(s, t, p);

        const pathVector = t.sub(s);
        const perpendicular = new Vector2(-pathVector.y, pathVector.x)
            .normalized;

        const curve = Math.sin(p * Math.PI) * this.curveHeight();
        const offset = perpendicular.scale(curve);

        return currentLinearPos.add(offset);
    }

    public *animate(duration: number) {
        this.progress(0);
        yield* this.progress(1, duration, easeInOutCubic);
        this.remove();
    }

    public *startPosition(position: Vector2, duration: number) {
        yield* this.startPos(position, duration);
    }

    public *endPosition(position: Vector2, duration: number) {
        yield* this.targetPos(position, duration);
    }

    public *drawVector(duration: number = 1) {
        const lineRef = createRef<Line>();

        this.add(
            <Line
                ref={lineRef}
                points={() => [this.startPos(), this.targetPos()]}
                stroke={"#FF00FF"}
                lineWidth={4}
                lineCap={"round"}
                end={0}
                endArrow
            />
        );
        yield* lineRef().end(1, duration);
    }
}
