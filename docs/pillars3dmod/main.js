title = "PILLARS 3D";

description = `
[Slide] Move
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

/** @type {{x: number, z: number, size: Vector, color: Color}[]} */
let pillars;
let nextPillarTicks;
let nextSpecialPillar;
let pos;
let vy;
let multiplier;

const GRAVITY_FACTOR = .05;
const JUMP_FACTOR = 2;
const PILLAR_FREQ = 30; // Lower number = more pillars
const SPECIAL_FREQ = 5;
const FAKE_CHANCE = 50; // The chance a special pillar is a fake pillar

function getNextPillarColor() {
  return (Math.random() * 100) + 1 < FAKE_CHANCE ? "light_yellow" : "yellow";
}

function update() {
  if (!ticks) {
    pillars = [{ x: 0, z: 20, size: vec(100, 100), color: "yellow" }];
    nextPillarTicks = nextSpecialPillar = SPECIAL_FREQ;
    pos = vec(50, 10);
    vy = 0;
    multiplier = 1;
  }
  nextPillarTicks--;
  if (nextPillarTicks < 0) {
    nextSpecialPillar--;
    pillars.unshift({
      x: rnds(60, 160),
      z: 20,
      size: vec(rnd(50, 100), rnd(70, 180)),
      color: nextSpecialPillar < 0 ? getNextPillarColor() : "black",
    });
    nextPillarTicks = PILLAR_FREQ / difficulty;
    if (nextSpecialPillar < 0) {
      nextSpecialPillar = SPECIAL_FREQ;
    }
  }
  color("light_red");
  rect(0, 60, 100, 1);
  color("black");
  pos.x = clamp(input.pos.x, 6, 93);
  pos.y += vy;
  vy += GRAVITY_FACTOR * difficulty;
  text("TT", pos.x - 3, pos.y).isColliding.rect;
  if (pos.y > 95) {
    play("explosion");
    end();
  }
  pillars = pillars.filter((p) => {
    color(p.color);
    if (
      box(
        p.x / p.z + 50,
        p.size.y / 3 / p.z + 60,
        p.size.x / p.z,
        p.size.y / p.z
      ).isColliding.text.T
    ) {
      const ty = p.size.y / 3 / p.z + 60 - p.size.y / p.z / 2;
      if (vy > 0 && p.color != "red") {
        play("laser");
        vy = -JUMP_FACTOR * sqrt(difficulty);
        if (pos.y > ty) {
          pos.y = ty;
        }
      }
      addScore(multiplier, p.x / p.z + 50, ty);
      if (p.color === "yellow") {
        play("select");
        multiplier++;
      }
      return false;
    }
    p.z -= difficulty * 0.2;
    return p.z > 1;
  });
}