// CONSTANTS
const FPS = 60;
const LOOP_INTERVAL = Math.round(1000 / FPS);

//Game initial data
let gameLoop, spawnLoop, sunLoop, timeLoop;
let sunEnergy = 25;
let lifeCount = 100;
let health = 10;
let zombieCount = 0;
let sunFlowerCount = 0;
let peaCount = 0;
let selectedWeaponType = "sunflower";
let zombiesArray = [[], [], []];
let sunflowersArray = [[], [], []];
let peasArray = [[], [], []];
let bulletsArray = [[], [], []];
let peaBulletsArray = [[], [], []];
let homeArray = [];
let timeElapsed = 0;
let SPAWN_INTERVAL
let ZOMBIE_HEALTH = 60;
let BULLET_SPAWN_INTERVAL = 2200;
let VELOCITY = 0.5;
let BULLET_DAMAGE = 10;
let BULLET_VELOCITY = 5;

// Public Elements
const $zombieButton = $("#zombie");
const $gridItems = $(".grid-item");
const $lifecount = $("#lifecount");
const $resourceItems = $(".resource-item");
const $flowerCount = $("#flowercount");
const $sunCount = $("#suncount");
const $peaCount = $("#peacount");
const $timeElapsed = $("#timeelapsed");
const $row1Spawn = $("#lane-one-spawn-spot");
const $row2Spawn = $("#lane-two-spawn-spot");
const $row3Spawn = $("#lane-three-spawn-spot");
const $steroidBtn = $("#steroid");
const $home = $(".home");
const $startBtn = $("#start-btn");
const $restartBtn = $("#restart-btn");
const $farm = $("#farm");
const $gameStartScreen = $(".game-start");
const $gameOverScreen = $(".game-over");
const $upgradeBtn = $("#upgrade");
const $bullet = $(".bullet");
const $bulletDamage = $("#bullet-damage");

// update Sun Energy Status
const updateSunEnergy = () => {
  $sunCount.text(sunEnergy);
};

// Zombie | Constructor
function Zombie($row) {
  // Define Initial Values
  this.$elem = null;
  this.health = ZOMBIE_HEALTH;
  this.damage = 20;
  this.position = { x: 0, y: 0 };
  this.movement = { left: true };
  this.updateHealth = function (health) {
    this.$elem.text(health.toFixed(2));
  };

  this.removeSelf = function () {
    this.$elem.remove();
  };
  this.updateSunEnergy = function () {
    sunEnergy += 1.5;
    $sunCount.text(sunEnergy.toFixed(2));
  };

  const zombieInit = () => {
if (timeElapsed < 60 ) {
      this.health = 60;
      SPAWN_INTERVAL = 8000;
      console.log(SPAWN_INTERVAL);
    }

    if (timeElapsed >= 60 && timeElapsed < 81) {
      SPAWN_INTERVAL = 5000;
      ZOMBIE_HEALTH = 100;
      console.log(SPAWN_INTERVAL);
    }

    if (timeElapsed > 80 && timeElapsed < 101) {
      SPAWN_INTERVAL = 3500;
      ZOMBIE_HEALTH = 140;
      console.log(ZOMBIE_HEALTH);
    }

    if (timeElapsed > 100) {
      SPAWN_INTERVAL = 2000;
      ZOMBIE_HEALTH = 200;
      console.log(ZOMBIE_HEALTH);
    }

    // Increase count
    else zombieCount++;
    // Append zombie to game screen
    this.$elem = $(
      `<div id="spawnedZombie" class="spawnedZombie">${this.health}</div>`
    );
    this.$elem.appendTo($row);
  };
  zombieInit();
}

// Zombie | Update position
const updateZombieMovements = (zombie) => {
  const {
    position: { x, y },
    movement: { left },
  } = zombie;
  let newX = x;
  let newY = y;

  if (left) newX -= VELOCITY;

  zombie.position.x = newX;
  zombie.position.y = newY;
  zombie.$elem.css("left", newX).css("top", newY);
};

// Bullet | Constructor
function Bullet($parentWeapon) {
  this.$elem = null;
  this.health = 0;
  this.damage = BULLET_DAMAGE;
  this.position = { x: $parentWeapon.outerWidth() / 2 - 10 };
  this.movement = { right: true };
  this.removeSelf = function () {
    this.$elem.remove();
  };

  const bulletInit = () => {
    // Append bullet to the sunflower
    this.$elem = $("<div class='bullet'></div>");
    this.$elem.appendTo($parentWeapon);
  };

  bulletInit();
}

// Bullet | Update position
const updateBulletMovements = (bullet) => {
  const {
    position: { x },
    movement: { right },
  } = bullet;
  let newX = x;

  if (right) newX += BULLET_VELOCITY;

  bullet.position.x = newX;
  bullet.$elem.css("left", newX);
};

// Home | Constructor
function Home() {
  this.$elem = $(`<div class="home"></div>`);
  this.health = 100;
  this.position = { x: 0, y: 0 };

  const homeInit = () => {
    this.$elem.prependTo("#farm");
  };
  homeInit();
}

// Sunflower | Constructor
function SunFlower($selectedGrid, rowIndex) {
  this.$elem = null;
  this.health = 20;
  this.damage = 10;
  this.position = { x: 0, y: 0 };
  this.bulletInterval = null;

  this.startShooting = function () {
    bulletsArray[rowIndex].push(new Bullet(this.$elem));
    this.bulletInterval = setInterval(() => {
      bulletsArray[rowIndex].push(new Bullet(this.$elem));
    }, BULLET_SPAWN_INTERVAL);
  };

  this.stopShooting = function () {
    clearInterval(this.bulletInterval);
  };

  this.removeSelf = function () {
    this.stopShooting();
    this.$elem.remove();
    sunFlowerCount--;
    $flowerCount.text(sunFlowerCount);
  };

  const sunFlowerInit = () => {
    // Increase sunflower and sun energy count
    sunFlowerCount++;
    sunEnergy -= 10;
    $flowerCount.text(sunFlowerCount);
    $sunCount.text(sunEnergy.toFixed(2));

    // Append sunflower to game screen
    this.$elem = $(
      `<div class="resource-item sunflower" data-id="${sunFlowerCount}"></div>`
    );
    this.$elem.appendTo($selectedGrid).on("click", (e) => {
      e.stopPropagation();
    });

    if (spawnLoop) {
      this.startShooting();
    }
  };

  sunFlowerInit();
}


// Potato | Constructor
function Potato($selectedGrid) {
  // Define Initial Values
  this.$elem = null;
  this.health = 10;
  this.damage = 0;
  this.position = { x: 0, y: 0 };

  this.removeSelf = function () {
    this.$elem.remove();
  };

  const potatoInit = () => {
    // Increase count
    sunEnergy -= 5;
    $sunCount.text(sunEnergy);

    // Append zombie to game screen
    this.$elem = $(`<div class="potato">${this.health}</div>`);
    this.$elem.appendTo($selectedGrid).on("click", (e) => {
      e.stopPropagation();
    });

    // TODO clear interval on removal
    setInterval(() => {
      this.health--;
      if (this.health >= 0) {
        this.$elem.text(`${this.health}`);
      }
    }, 1000);

    console.log("potato added");

    // Potato has limited lifespan, it will be removed automatically after 10 seconds
    setTimeout(() => {
      this.$elem.fadeOut("slow", () => {
        this.$elem.remove();
      });
      console.log("this potato is dead");
    }, 10000);
  };

  potatoInit();
}

// Weapons | Add to grid
const addWeaponToGrid = (e) => {
  const $selectedGrid = $(e.target);
  const rowIndex = $selectedGrid.data("index");

  if ($selectedGrid.children().length < 1) {
    switch (selectedWeaponType) {
      case "sunflower": {
        if (sunEnergy >= 10) {
          sunflowersArray[rowIndex].push(
            new SunFlower($selectedGrid, rowIndex)
          );
        } else {
          console.log("You do not have enough sun energy");
        }
        break;
      }
      case "pea": {
        if (sunEnergy >= 15) {
          peasArray[rowIndex].push(new Pea($selectedGrid));
        } else {
          console.log("You do not have enough sun energy");
        }
        break;
      }
      case "potato": {
        if (sunEnergy >= 5) {
          sunflowersArray[rowIndex].push(new Potato($selectedGrid));
        } else {
          console.log("You do not have enough sun energy");
        }
        break;
      }
    }
  } else {
    console.log("Grid is taken!");
  }
};

// Attack | Decrease opponent health with damage
const attack = (item1, item2) => {
  const { damage: item1D } = item1;
  const { damage: item2D } = item2;

  item1.health -= item2D;
  item2.health -= item1D;
  item1.updateHealth(item1.health);
};

// Loop | Main Game Loop
const startGame = () => {
  if (!gameLoop) {
    gameLoop = setInterval(() => {
      // Zombie Movement
      zombiesArray.forEach((rowZombies) => {
        rowZombies.forEach((zombie) => {
          updateZombieMovements(zombie);
        });
      });

      // Bullet Movement
      bulletsArray.forEach((bullets) => {
        bullets.forEach((bullet) => {
          updateBulletMovements(bullet);
        });
      });

      // Collision and Removal
      for (let i = 0; i < 3; i++) {
        // Zombies vs Weapons
        for (let k = zombiesArray[i].length - 1; k >= 0; k--) {
          for (let n = sunflowersArray[i].length - 1; n >= 0; n--) {
            const collided = checkCollision(
              zombiesArray[i][k],
              sunflowersArray[i][n]
            );
            if (collided) {
              attack(zombiesArray[i][k], sunflowersArray[i][n]);
              if (sunflowersArray[i][n].health <= 0) {
                sunflowersArray[i][n].removeSelf();
                sunflowersArray[i].splice(n, 1);
              }
              if (zombiesArray[i][k].health <= 0) {
                zombiesArray[i][k].updateSunEnergy();
                zombiesArray[i][k].removeSelf();
                zombiesArray[i].splice(k, 1);
                break;
              }
            }
          }
        }

        // Zombies vs Home
        for (let k = zombiesArray[i].length - 1; k >= 0; k--) {
          const collided = checkCollision(zombiesArray[i][k], homeArray[0]);
          if (collided) {
            zombiesArray[i][k].$elem.remove();
            zombiesArray[i].splice(k, 1);
            lifeCount -= 10;
            $lifecount.text(lifeCount);
            break;
          }
        }

        // Zombies vs Bullet
        for (let k = zombiesArray[i].length - 1; k >= 0; k--) {
          for (let n = bulletsArray[i].length - 1; n >= 0; n--) {
            const collided = checkCollision(
              zombiesArray[i][k],
              bulletsArray[i][n]
            );

            if (collided) {
              attack(zombiesArray[i][k], bulletsArray[i][n]);

              if (bulletsArray[i][n].health <= 0) {
                bulletsArray[i][n].$elem.remove();
                bulletsArray[i].splice(n, 1);
              }

              if (zombiesArray[i][k].health <= 0) {
                zombiesArray[i][k].updateSunEnergy();
                zombiesArray[i][k].$elem.remove();
                zombiesArray[i].splice(k, 1);
                break;
              }
            }
          }
        }
      }

      if (lifeCount <= 0) {
        gameOver();
      }
    }, LOOP_INTERVAL);
  }
};

// Collision | Check collision between two items
const checkCollision = (item1, item2) => {
  const { top: item1Y, left: item1X } = item1.$elem.offset();
  const { top: item2Y, left: item2X } = item2.$elem.offset();

  const item1W = item1.$elem.outerWidth();
  const item1H = item1.$elem.outerHeight();
  const item2W = item2.$elem.outerWidth();
  const item2H = item2.$elem.outerHeight();

  const collided =
    item1X < item2X + item2W &&
    item1X + item1W > item2X &&
    item1Y < item2Y + item2H &&
    item1H + item1Y > item2Y;

  return collided;
};

// Loop | Spawning Zombies & Sunflower Bullets
const startSpawn = () => {
  if (!spawnLoop) {
    sunflowersArray.forEach((sunflowers) => {
      sunflowers.forEach((sunflower) => {
        if (sunflower.startShooting) sunflower.startShooting();
      });
    });

    peasArray.forEach((peas) => {
      peas.forEach((pea) => {
        if (pea.startShooting) pea.startShooting();
      });
    });

    zombiesArray[0].push(new Zombie($row1Spawn));
    zombiesArray[1].push(new Zombie($row2Spawn));
    zombiesArray[2].push(new Zombie($row3Spawn));

    spawnLoop = setInterval(() => {
      zombiesArray[0].push(new Zombie($row1Spawn));
      zombiesArray[1].push(new Zombie($row2Spawn));
      zombiesArray[2].push(new Zombie($row3Spawn));
    }, SPAWN_INTERVAL);
  }
};

// Upgrade Bullet Damage
const updateBulletDamageStatus = () => {
  $bulletDamage.text(BULLET_DAMAGE);
};

const upgradeBullet = () => {
  if (sunEnergy >= 50) {
    BULLET_DAMAGE += 5;
    sunEnergy -= 50;
    updateSunEnergy();
    console.log("Bullet upgraded");
    updateBulletDamageStatus();
    ZOMBIE_HEALTH += 50;
  } else {
    console.log("You do not have enough sun energy");
    $upgradeBtn.css("border", "2px solid red");
    setTimeout(() => {
      $upgradeBtn.css("border", "2px solid black");
    }, 2000);
  }
};

// Loop | Sun Generation
const startSunGeneration = () => {
  if (!sunLoop) {
    sunLoop = setInterval(() => {
      if (timeElapsed < 60) {
        sunEnergy = sunEnergy + 0.5 + (sunFlowerCount * 10) / 100;
 SPAWN_INTERVAL = 8000;
        $sunCount.text(sunEnergy.toFixed(2));
      }

      if (timeElapsed > 60 && timeElapsed < 81) {
        sunEnergy = sunEnergy + 0.5 + (sunFlowerCount * 10) / 100;
        SPAWN_INTERVAL = 5000;
        console.log(SPAWN_INTERVAL);
        $sunCount.text(sunEnergy.toFixed(2));
      }

      if (timeElapsed > 80 && timeElapsed < 101) {
        sunEnergy = sunEnergy + 1.5 + (sunFlowerCount * 10) / 100;
        SPAWN_INTERVAL = 3000;
        console.log(SPAWN_INTERVAL);
        $sunCount.text(sunEnergy.toFixed(2));
      }

      if (timeElapsed > 100) {
        sunEnergy = sunEnergy + 2.5 + (sunFlowerCount * 10) / 100;
        SPAWN_INTERVAL =  1000;
        console.log(SPAWN_INTERVAL);
        $sunCount.text(sunEnergy.toFixed(2));
      }
    }, 1000);
  }
};

// Init | Initialize variables and bind events
const init = () => {
  // Bind click on the weapons to change the selected weapon type
  $resourceItems.on("click", (e) => {
    selectedWeaponType = e.target.id;
    console.log("You have selected " + selectedWeaponType);
  });

  // Grid Event
  $gridItems.on("click", addWeaponToGrid);

  // Upgrade button
  $upgradeBtn.on("click", upgradeBullet);

  // Start Round
  $startBtn.on("click", () => {
    // Time Elapsed Clock
    const startTime = () => {
      timeLoop = setInterval(() => {
        timeElapsed++;
        $timeElapsed.text(timeElapsed);
        VELOCITY += 0.01;
      }, 1000);
    };

    console.log("Started generating zombies and sunEnergy");
    startGame();
    startSpawn();
    startSunGeneration();
    startTime();
    homeArray.push(new Home());
    $farm.css("display", "grid");
    $gameStartScreen.css("display", "none");
  });
};

init();

// restart the game
$restartBtn.on("click", () => {
  location.reload();
});

const gameOver = () => {
  $farm.css("display", "none");
  $gameOverScreen.css("display", "flex");

  // Need to stop game
  clearInterval(gameLoop);

  // Need to stop timer
  clearInterval(timeLoop);

  // Need to stop sun generation
  clearInterval(sunLoop);

  // Need to stop zombie spawning
  clearInterval(spawnLoop);

  // Reset initial data

  zombieCount = 0;
  sunFlowerCount = 0;
  peaCount = 0;
  lifeCount = 0;
  sunEnergy = 0;
  zombiesArray = [[], [], []];
  sunflowersArray = [[], [], []];
  bulletsArray = [[], [], []];
  homeArray = [];
  timeElapsed = 0;

  $sunCount.text(sunFlowerCount);
  $timeElapsed.text(timeElapsed);
  $lifecount.text(lifeCount);
  $sunCount.text(sunEnergy);
};
