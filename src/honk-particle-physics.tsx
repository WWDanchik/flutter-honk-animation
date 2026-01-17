import {Node, Txt} from '@motion-canvas/2d';
import {Vector2} from '@motion-canvas/core';

export class HonkParticlePhysic {
    // Позиция и скорость
    public position: Vector2;
    public velocity: Vector2;
    
    // Параметры "всплытия"
    public floatSpeed: number = 3.0; // Как быстро летит вверх
    
    // Жизненный цикл
    public age: number = 0;
    public lifeTime: number = 2.0; // Сколько секунд живет (примерно, зависит от FPS)
    
    public radius: number = 35; // Радиус "личного пространства" (побольше для текста)
    public readonly visual: Node;

    constructor(parent: Node, start: Vector2, content: string = "HONK") {
        this.position = start;
        
        // Начальная скорость:
        // Быстро вверх + совсем чуть-чуть случайности вбок, чтобы не стояли столбом
        this.velocity = new Vector2(
            (Math.random() - 0.5) * 1.0, 
            -this.floatSpeed
        );

        this.visual = (
            <Txt 
                text={content}
                fill={'#29b6f6'}
                fontFamily={'Arial'} // Или твой шрифт
                fontWeight={700}
                fontSize={40} // Чуть крупнее
                position={start}
                opacity={0}
                scale={0}
            />
        );
        parent.add(this.visual);
    }

    update() {
        this.age += 0.016; // Примерно 1 кадр при 60fps

        // 1. Применяем скорость к позиции
        // Важно: мы меняем this.position НАВСЕГДА. Никаких возвратов к кривой.
        this.position = this.position.add(this.velocity);
        
        // 2. Возвращаем вертикальную скорость к норме (чтобы они не разгонялись бесконечно)
        // Но горизонтальную (velocity.x) оставляем! Это дает инерцию сдвига.
        this.velocity.y = -this.floatSpeed;
        
        // Трение для горизонтали (чтобы боковой сдвиг со временем замедлялся, но плавно)
        this.velocity.x *= 0.95; 

        // 3. Обновляем визуал
        this.visual.position(this.position);

        // --- Красота (Scale / Opacity) ---
        // Плавное появление (Pop up)
        if (this.age < 0.3) {
            // Эффект пружинки (overshoot) можно добавить, но пока простой ease
            const t = this.age / 0.3;
            this.visual.scale(t); 
            this.visual.opacity(t);
        } 
        // Исчезновение в конце
        else if (this.age > this.lifeTime - 0.5) {
            const t = (this.lifeTime - this.age) / 0.5;
            this.visual.opacity(t);
            this.visual.scale(t);
        } 
        else {
            this.visual.opacity(1);
            this.visual.scale(1);
        }
    }
    
    get isDead() { return this.age >= this.lifeTime; }
}