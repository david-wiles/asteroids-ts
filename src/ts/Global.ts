/**
 * This class should be used to keep track of all "magic numbers" and other constants that
 * should be accessible everywhere and will not change
 */
class Global {
  worldWidth: number;
  worldHeight: number;
  worldSpeedMultiplier = 0.1;

  asteroidSpeedMultiplier = 5;
  asteroidEdgeMultiplier = 4;
  asteroidMaxSize = 100;
  asteroidDamageSpeedMultiplier = 0.1;
  asteroidMaxHitPoints = 40;
  asteroidMinArea = 700;

  particleMaxTTL = 3000;

  projectileDamage = 5;
  projectileTTL = 500
  projectileSpeedMultiplier = 15;

  starshipShieldPoints = 1000;
  starshipDamageSpeedMultiplier = 0.5;
  starshipFireDelay = 100;
}

let GLOBAL = new Global();

export default GLOBAL;
