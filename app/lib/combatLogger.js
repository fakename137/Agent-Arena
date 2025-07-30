export class CombatLogger {
  constructor() {
    this.combatLog = [];
  }

  // Add to combat log
  addToCombatLog(message) {
    this.combatLog.push(message);
    // Keep only last 5 messages
    if (this.combatLog.length > 5) {
      this.combatLog.shift();
    }
  }

  // Get combat log
  getCombatLog() {
    return this.combatLog;
  }

  // Clear combat log
  clearCombatLog() {
    this.combatLog = [];
  }

  // Get last N messages
  getLastMessages(count = 4) {
    return this.combatLog.slice(-count);
  }
}
