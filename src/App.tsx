import kaboom, { KaboomCtx } from 'kaboom';
import { useEffect, useRef } from 'react';
import './App.css';

const FLOOR_HEIGHT = 48;
const JUMP_FORCE = 800;
const SPEED = 480;

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // initialize context
    const k = kaboom({
      width: 640,
      height: 540,
      canvas: canvasRef.current!,
    }) as KaboomCtx;

    // load assets
    k.loadSprite('bean', 'bean.png');

    // keep track of score
    let score = '0';

    k.scene('game', () => {
      // define gravity
      k.setGravity(1600);

      // add a game object to screen
      const player = k.add([
        k.sprite('bean'),
        k.pos(80, 40),
        k.area(),
        k.body(),
      ]);

      function jump() {
        if (player.isGrounded()) {
          player.jump(JUMP_FORCE);
        }
      }

      k.onKeyPress('space', jump);
      k.onClick(jump);

      // lose if player collides with any game obj with tag "tree"
      player.onCollide('tree', () => {
        k.addKaboom(player.pos);
        k.shake(10);
        k.go('lose');
      });

      // floor
      k.add([
        k.rect(k.width(), FLOOR_HEIGHT),
        k.pos(0, k.height() - FLOOR_HEIGHT),
        k.outline(4),
        k.area(),
        k.body({ isStatic: true }),
        k.color(127, 200, 255),
      ]);

      function spawnTree() {
        // add tree
        k.add([
          k.rect(48, k.rand(32, 96)),
          k.area(),
          k.outline(4),
          k.pos(k.width(), k.height() - FLOOR_HEIGHT),
          k.anchor('botleft'),
          k.color(255, 180, 255),
          k.move(k.LEFT, SPEED),
          'tree',
        ]);
        // wait a random amount of time to spawn next tree
        k.wait(k.rand(0.5, 1.5), () => {
          spawnTree();
        });
      }
      // start spawning trees
      spawnTree();

      const scoreLabel = k.add([k.text(score), k.pos(24, 24)]);

      // increment score every frame
      k.onUpdate(() => {
        score = (parseInt(score) + 1).toString();
        scoreLabel.text = score;
      });
    });

    k.scene('lose', () => {
      k.add([k.text('Game Over')]);

      // display score
      k.add([
        k.text(score),
        k.pos(k.width() / 2, k.height() / 2 + 80),
        k.scale(2),
        k.anchor('center'),
      ]);

      // go back to game with space is pressed
      k.onKeyPress('space', () => k.go('game'));
      k.onClick(() => k.go('game'));
      score = '0';
    });

    k.go('game');
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}

export default App;
