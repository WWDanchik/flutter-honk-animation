import {Node, Txt, Rect} from '@motion-canvas/2d';
import {Vector2, Reference} from '@motion-canvas/core';


const randomRange = (min: number, max: number) => min + Math.random() * (max - min);

export class HonkParticle {
    public start: Vector2;
    public target: Vector2;
    public progress: number = 0;
    public curveHeight: number;
    public speed: number = 0.035;
    public readonly visual: Node;
    public readonly ref: Reference<Txt>;
    constructor(
        parent: Node, 
        start: Vector2,
        target: Vector2,
        content: string = "HONK",
        ref: Reference<Txt>
    ) {
        this.start = start;
        this.target = target;
        
        
        this.curveHeight = randomRange(-100, 100);
        this.progress = randomRange(-0.4, 0); 
        this.ref = ref;
       
        this.visual = (
            <Txt
                layout={true}
                text={content}
                fill={'#29b6f6'} 
                fontFamily={'Courier New'} 
                fontWeight={700}
                fontSize={20}
                opacity={0} 
                scale={0}
                position={start}
                ref={ref}
            />
        );
        
        
        parent.add(this.visual);
    }

    update() {
        this.progress += this.speed;

        
        if (this.progress <= 0) {
            this.visual.scale(0);
            this.visual.position(this.start);
            return;
        }

        if (this.progress >= 1) {
            this.visual.opacity(0); 
            return;
        }

        
        const currentLinearPos = Vector2.lerp(this.start, this.target, this.progress  * this.progress);

 
        const path = this.target.sub(this.start);
        
  
        const perpendicular = new Vector2(-path.y, path.x).normalized;

   
        const curveT = Math.sin(this.progress * Math.PI);
        
   
        const curveOffset = perpendicular.scale(curveT * this.curveHeight);

     
        const finalPos = currentLinearPos.add(curveOffset);

    
        this.visual.position(finalPos);
        this.visual.scale(curveT * 6); 
        this.visual.opacity(1);    
        

        this.visual.rotation(curveT * 20 * (this.curveHeight > 0 ? 1 : -1));
    }

    get isDead() {
        return this.progress >= 1;
    }
}