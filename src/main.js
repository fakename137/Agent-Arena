// 2D Fighting Game - Agent Arena Fight Club
class Fighter {
  constructor(x, y, color, name, isPlayer1 = true) {
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 120;
    this.color = color;
    this.name = name;
    this.isPlayer1 = isPlayer1;

    // Health and stats
    this.health = 100;
    this.maxHealth = 100;
    this.attack = isPlayer1 ? 85 : 80;
    this.defense = isPlayer1 ? 75 : 80;
    this.speed = isPlayer1 ? 70 : 75;

    // Animation states
    this.state = 'idle'; // idle, attack, defend, hurt, victory, defeat
    this.animationFrame = 0;
    this.animationSpeed = 0.2;
    this.animationTimer = 0;

    // Movement
    this.velocityX = 0;
    this.velocityY = 0;
    this.onGround = true;
    this.jumpPower = -15;
    this.moveSpeed = 5;

    // Combat
    this.isAttacking = false;
    this.isDefending = false;
    this.attackCooldown = 0;
    this.defendCooldown = 0;
    this.hitbox = {
      x: this.x - 10,
      y: this.y,
      width: this.width + 20,
      height: this.height,
    };

    // Visual effects
    this.particles = [];
    this.flashTimer = 0;
    this.shakeTimer = 0;
  }

  update(deltaTime) {
    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }

    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Gravity
    if (!this.onGround) {
      this.velocityY += 0.8;
    }

    // Ground collision
    if (this.y + this.height > 500) {
      this.y = 500 - this.height;
      this.velocityY = 0;
      this.onGround = true;
    }

    // Update hitbox
    this.hitbox.x = this.x - 10;
    this.hitbox.y = this.y;

    // Update cooldowns
    if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
    if (this.defendCooldown > 0) this.defendCooldown -= deltaTime;

    // Update effects
    if (this.flashTimer > 0) this.flashTimer -= deltaTime;
    if (this.shakeTimer > 0) this.shakeTimer -= deltaTime;

    // Update particles
    this.particles = this.particles.filter((particle) => {
      particle.update(deltaTime);
      return particle.life > 0;
    });

    // State transitions
    if (this.state === 'attack' && this.attackCooldown <= 0) {
      this.state = 'idle';
      this.isAttacking = false;
    }

    if (this.state === 'defend' && this.defendCooldown <= 0) {
      this.state = 'idle';
      this.isDefending = false;
    }
  }

  draw(ctx) {
    ctx.save();

    // Apply shake effect
    if (this.shakeTimer > 0) {
      ctx.translate(Math.random() * 4 - 2, Math.random() * 4 - 2);
    }

    // Apply flash effect
    if (this.flashTimer > 0) {
      ctx.globalAlpha = 0.5;
    }

    // Draw character body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw character details based on state
    this.drawDetails(ctx);

    // Draw particles
    this.particles.forEach((particle) => particle.draw(ctx));

    // Draw name
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y - 10);

    // Draw health bar above character
    this.drawHealthBar(ctx);

    ctx.restore();
  }

  drawDetails(ctx) {
    ctx.fillStyle = '#ffffff';

    switch (this.state) {
      case 'idle':
        // Eyes
        ctx.fillRect(this.x + 15, this.y + 20, 8, 8);
        ctx.fillRect(this.x + 37, this.y + 20, 8, 8);
        // Mouth
        ctx.fillRect(this.x + 20, this.y + 40, 20, 4);
        break;

      case 'attack':
        // Angry eyes
        ctx.fillRect(this.x + 12, this.y + 18, 10, 10);
        ctx.fillRect(this.x + 38, this.y + 18, 10, 10);
        // Open mouth
        ctx.fillRect(this.x + 18, this.y + 38, 24, 8);
        // Attack effect
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + (this.isPlayer1 ? 60 : -20), this.y + 40, 20, 40);
        break;

      case 'defend':
        // Shield effect
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(this.x - 10, this.y, 10, this.height);
        // Defensive stance
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 15, this.y + 20, 8, 8);
        ctx.fillRect(this.x + 37, this.y + 20, 8, 8);
        break;

      case 'hurt':
        // Dizzy eyes
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 15, this.y + 20, 8, 8);
        ctx.fillRect(this.x + 37, this.y + 20, 8, 8);
        break;
    }
  }

  drawHealthBar(ctx) {
    const barWidth = 80;
    const barHeight = 8;
    const barX = this.x - 10;
    const barY = this.y - 30;

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health fill
    const healthPercent = this.health / this.maxHealth;
    const fillWidth = barWidth * healthPercent;

    if (healthPercent > 0.6) {
      ctx.fillStyle = '#00ff00';
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#ffff00';
    } else {
      ctx.fillStyle = '#ff0000';
    }

    ctx.fillRect(barX, barY, fillWidth, barHeight);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  attack() {
    if (this.attackCooldown <= 0) {
      this.state = 'attack';
      this.isAttacking = true;
      this.attackCooldown = 0.5;
      this.createAttackParticles();
      return true;
    }
    return false;
  }

  defend() {
    if (this.defendCooldown <= 0) {
      this.state = 'defend';
      this.isDefending = true;
      this.defendCooldown = 1.0;
      this.createDefendParticles();
      return true;
    }
    return false;
  }

  special() {
    if (this.attackCooldown <= 0) {
      this.state = 'attack';
      this.isAttacking = true;
      this.attackCooldown = 1.0;
      this.createSpecialParticles();
      return true;
    }
    return false;
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    this.state = 'hurt';
    this.flashTimer = 0.3;
    this.shakeTimer = 0.2;
    this.createDamageParticles();
  }

  createAttackParticles() {
    for (let i = 0; i < 5; i++) {
      this.particles.push(
        new Particle(
          this.x + (this.isPlayer1 ? 60 : -10),
          this.y + 40 + Math.random() * 40,
          '#ff0000',
          0.5
        )
      );
    }
  }

  createDefendParticles() {
    for (let i = 0; i < 8; i++) {
      this.particles.push(
        new Particle(
          this.x - 10 + Math.random() * 10,
          this.y + Math.random() * this.height,
          '#0000ff',
          1.0
        )
      );
    }
  }

  createSpecialParticles() {
    for (let i = 0; i < 15; i++) {
      this.particles.push(
        new Particle(
          this.x + (this.isPlayer1 ? 60 : -10),
          this.y + 40 + Math.random() * 40,
          '#ff00ff',
          0.8
        )
      );
    }
  }

  createDamageParticles() {
    for (let i = 0; i < 10; i++) {
      this.particles.push(
        new Particle(
          this.x + Math.random() * this.width,
          this.y + Math.random() * this.height,
          '#ff6666',
          0.6
        )
      );
    }
  }
}

class Particle {
  constructor(x, y, color, life) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = Math.random() * 4 + 2;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.life -= deltaTime;
    this.size *= 0.98;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameOver
    this.round = 1;
    this.maxRounds = 5;
    this.timer = 60;
    this.timerInterval = null;

    // Players
    this.player1 = new Fighter(200, 380, '#ff4444', 'Bitcoin Brawler', true);
    this.player2 = new Fighter(940, 380, '#4444ff', 'Ethereum Elite', false);

    // Game loop
    this.lastTime = 0;
    this.gameLoop = this.gameLoop.bind(this);

    // Controls
    this.keys = {};
    this.setupControls();

    // Battle log
    this.battleLog = [];

    // Start game
    this.startGame();
  }

  setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Button controls
    document.getElementById('attackBtn').addEventListener('click', () => {
      this.player1.attack();
      this.addToLog('Bitcoin Brawler attacks!', 'attack');
    });

    document.getElementById('defendBtn').addEventListener('click', () => {
      this.player1.defend();
      this.addToLog('Bitcoin Brawler defends!', 'defend');
    });

    document.getElementById('specialBtn').addEventListener('click', () => {
      this.player1.special();
      this.addToLog('Bitcoin Brawler uses special!', 'special');
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetGame();
    });
  }

  startGame() {
    // Hide title
    document.getElementById('title').classList.add('hidden');

    // Start timer
    this.timerInterval = setInterval(() => {
      this.timer--;
      document.getElementById('timer').textContent = `Time: ${this.timer}`;

      if (this.timer <= 0) {
        this.endRound();
      }
    }, 1000);

    // Start game loop
    this.gameState = 'playing';
    this.gameLoop();
  }

  gameLoop(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.gameState === 'playing') {
      this.update(deltaTime);
      this.draw();
    }

    requestAnimationFrame(this.gameLoop);
  }

  update(deltaTime) {
    // Update players
    this.player1.update(deltaTime);
    this.player2.update(deltaTime);

    // Handle input
    this.handleInput();

    // AI for player 2
    this.updateAI(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Check win conditions
    this.checkWinConditions();
  }

  handleInput() {
    // Player 1 movement
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.player1.velocityX = -this.player1.moveSpeed;
    } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.player1.velocityX = this.player1.moveSpeed;
    } else {
      this.player1.velocityX = 0;
    }

    // Player 1 jump
    if ((this.keys['KeyW'] || this.keys['ArrowUp']) && this.player1.onGround) {
      this.player1.velocityY = this.player1.jumpPower;
      this.player1.onGround = false;
    }

    // Player 1 attacks
    if (this.keys['KeyJ']) {
      if (this.player1.attack()) {
        this.addToLog('Bitcoin Brawler attacks!', 'attack');
      }
    }

    if (this.keys['KeyK']) {
      if (this.player1.defend()) {
        this.addToLog('Bitcoin Brawler defends!', 'defend');
      }
    }

    if (this.keys['KeyL']) {
      if (this.player1.special()) {
        this.addToLog('Bitcoin Brawler uses special!', 'special');
      }
    }
  }

  updateAI(deltaTime) {
    // Simple AI for player 2
    const aiTimer = Math.random() * 100;

    if (aiTimer < 2) {
      // Random movement
      this.player2.velocityX = (Math.random() - 0.5) * 4;
    } else if (aiTimer < 4) {
      // Jump
      if (this.player2.onGround) {
        this.player2.velocityY = this.player2.jumpPower;
        this.player2.onGround = false;
      }
    } else if (aiTimer < 6) {
      // Attack
      if (this.player2.attack()) {
        this.addToLog('Ethereum Elite attacks!', 'attack');
      }
    } else if (aiTimer < 8) {
      // Defend
      if (this.player2.defend()) {
        this.addToLog('Ethereum Elite defends!', 'defend');
      }
    } else if (aiTimer < 10) {
      // Special
      if (this.player2.special()) {
        this.addToLog('Ethereum Elite uses special!', 'special');
      }
    }
  }

  checkCollisions() {
    // Check if players are attacking and hitting each other
    if (
      this.player1.isAttacking &&
      this.checkHitboxCollision(this.player1, this.player2)
    ) {
      const damage = this.player1.isDefending ? 5 : 15;
      this.player2.takeDamage(damage);
      this.addToLog(`Bitcoin Brawler hits for ${damage} damage!`, 'attack');
    }

    if (
      this.player2.isAttacking &&
      this.checkHitboxCollision(this.player2, this.player1)
    ) {
      const damage = this.player2.isDefending ? 5 : 15;
      this.player1.takeDamage(damage);
      this.addToLog(`Ethereum Elite hits for ${damage} damage!`, 'attack');
    }
  }

  checkHitboxCollision(attacker, defender) {
    const attackX = attacker.x + (attacker.isPlayer1 ? attacker.width : -20);
    const attackY = attacker.y + 40;
    const attackWidth = 20;
    const attackHeight = 40;

    return (
      attackX < defender.x + defender.width &&
      attackX + attackWidth > defender.x &&
      attackY < defender.y + defender.height &&
      attackY + attackHeight > defender.y
    );
  }

  checkWinConditions() {
    if (this.player1.health <= 0) {
      this.endRound('player2');
    } else if (this.player2.health <= 0) {
      this.endRound('player1');
    }
  }

  endRound(winner = null) {
    clearInterval(this.timerInterval);

    if (winner) {
      this.addToLog(
        `${
          winner === 'player1' ? 'Bitcoin Brawler' : 'Ethereum Elite'
        } wins the round!`,
        'special'
      );
    } else {
      this.addToLog("Time's up! Round is a draw!", 'defend');
    }

    this.round++;

    if (this.round > this.maxRounds) {
      this.endGame();
    } else {
      setTimeout(() => {
        this.startNewRound();
      }, 2000);
    }
  }

  startNewRound() {
    // Reset players
    this.player1.health = this.player1.maxHealth;
    this.player2.health = this.player2.maxHealth;
    this.player1.x = 200;
    this.player2.x = 940;
    this.player1.state = 'idle';
    this.player2.state = 'idle';

    // Update UI
    document.getElementById(
      'roundInfo'
    ).textContent = `Round ${this.round} / ${this.maxRounds}`;
    this.updateHealthBars();

    // Restart timer
    this.timer = 60;
    document.getElementById('timer').textContent = `Time: ${this.timer}`;
    this.timerInterval = setInterval(() => {
      this.timer--;
      document.getElementById('timer').textContent = `Time: ${this.timer}`;

      if (this.timer <= 0) {
        this.endRound();
      }
    }, 1000);
  }

  endGame() {
    this.gameState = 'gameOver';
    this.addToLog('Game Over!', 'special');

    // Show final results
    setTimeout(() => {
      alert('🥊 Game Over! 🥊\n\nThanks for playing Agent Arena Fight Club!');
    }, 1000);
  }

  resetGame() {
    // Reset game state
    this.round = 1;
    this.timer = 60;
    this.gameState = 'playing';

    // Reset players
    this.player1.health = this.player1.maxHealth;
    this.player2.health = this.player2.maxHealth;
    this.player1.x = 200;
    this.player2.x = 940;
    this.player1.state = 'idle';
    this.player2.state = 'idle';

    // Clear battle log
    this.battleLog = [];
    this.updateBattleLog();

    // Update UI
    document.getElementById(
      'roundInfo'
    ).textContent = `Round ${this.round} / ${this.maxRounds}`;
    document.getElementById('timer').textContent = `Time: ${this.timer}`;
    this.updateHealthBars();

    // Restart timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer--;
      document.getElementById('timer').textContent = `Time: ${this.timer}`;

      if (this.timer <= 0) {
        this.endRound();
      }
    }, 1000);
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background elements
    this.drawBackground();

    // Draw players
    this.player1.draw(this.ctx);
    this.player2.draw(this.ctx);

    // Draw UI elements
    this.drawUI();
  }

  drawBackground() {
    // Draw floor
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, 500, this.canvas.width, 100);

    // Draw some background elements
    this.ctx.fillStyle = '#333333';
    for (let i = 0; i < 5; i++) {
      this.ctx.fillRect(100 + i * 200, 450, 100, 50);
    }
  }

  drawUI() {
    // Update health bars
    this.updateHealthBars();
  }

  updateHealthBars() {
    const player1HealthBar = document.getElementById('player1Health');
    const player2HealthBar = document.getElementById('player2Health');

    player1HealthBar.style.width = `${
      (this.player1.health / this.player1.maxHealth) * 100
    }%`;
    player2HealthBar.style.width = `${
      (this.player2.health / this.player2.maxHealth) * 100
    }%`;
  }

  addToLog(message, type = 'attack') {
    this.battleLog.push({ message, type, time: Date.now() });

    // Keep only last 10 entries
    if (this.battleLog.length > 10) {
      this.battleLog.shift();
    }

    this.updateBattleLog();
  }

  updateBattleLog() {
    const logContainer = document.getElementById('battleLog');
    const entries = logContainer.querySelectorAll('.log-entry');
    entries.forEach((entry) => entry.remove());

    this.battleLog.forEach((entry) => {
      const logEntry = document.createElement('div');
      logEntry.className = `log-entry log-${entry.type}`;
      logEntry.textContent = entry.message;
      logContainer.appendChild(logEntry);
    });

    // Auto-scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

// Start the game when the page loads
window.addEventListener('load', () => {
  new Game();
});
