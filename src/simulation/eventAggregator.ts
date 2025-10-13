/**
 * Event Aggregator - Tracks event statistics during simulation
 * 
 * Provides summary statistics instead of logging every event:
 * - "200 cyber attacks blocked" instead of 200 individual logs
 * - "50 deepfakes detected" instead of 50 individual logs
 * - Tracks patterns over time
 */

export interface EventStats {
  // Information Warfare
  cyberAttacksBlocked: number;
  cyberAttacksSucceeded: number;
  deepfakesDetected: number;
  deepfakesUndetected: number;
  
  // Nuclear Deterrence
  nuclearDeterrenceSucceeded: number;
  nuclearDeterrenceFailed: number;
  nuclearWarsTriggered: number;
  
  // Defensive AI
  defensiveAIDeployed: number;
  defensiveAIBlockedAttacks: number;
  defensiveAIBypassed: number;
  
  // Sleeper Agents
  sleepersDetected: number;
  sleepersAwakened: number;
  sleepersSpread: number;
  
  // Government Actions
  governmentActionsTotal: number;
  governmentRegulations: number;
  governmentInvestments: number;
  
  // Crises
  crisisEventsTriggered: number;
  crisisEventsResolved: number;
  tippingPointsCrossed: number;
  
  // Organizations
  organizationsBankrupt: number;
  dataCentersBuilt: number;
  modelsTrainedTotal: number;
}

export class EventAggregator {
  private stats: EventStats;
  private lastReportMonth: number = 0;
  private reportInterval: number; // Report every N months
  
  constructor(reportInterval: number = 12) {
    this.reportInterval = reportInterval;
    this.stats = {
      cyberAttacksBlocked: 0,
      cyberAttacksSucceeded: 0,
      deepfakesDetected: 0,
      deepfakesUndetected: 0,
      nuclearDeterrenceSucceeded: 0,
      nuclearDeterrenceFailed: 0,
      nuclearWarsTriggered: 0,
      defensiveAIDeployed: 0,
      defensiveAIBlockedAttacks: 0,
      defensiveAIBypassed: 0,
      sleepersDetected: 0,
      sleepersAwakened: 0,
      sleepersSpread: 0,
      governmentActionsTotal: 0,
      governmentRegulations: 0,
      governmentInvestments: 0,
      crisisEventsTriggered: 0,
      crisisEventsResolved: 0,
      tippingPointsCrossed: 0,
      organizationsBankrupt: 0,
      dataCentersBuilt: 0,
      modelsTrainedTotal: 0,
    };
  }
  
  // Increment methods
  recordCyberAttack(blocked: boolean) {
    if (blocked) this.stats.cyberAttacksBlocked++;
    else this.stats.cyberAttacksSucceeded++;
  }
  
  recordDeepfake(detected: boolean) {
    if (detected) this.stats.deepfakesDetected++;
    else this.stats.deepfakesUndetected++;
  }
  
  recordNuclearDeterrence(succeeded: boolean) {
    if (succeeded) this.stats.nuclearDeterrenceSucceeded++;
    else {
      this.stats.nuclearDeterrenceFailed++;
      this.stats.nuclearWarsTriggered++;
    }
  }
  
  recordDefensiveAI(action: 'deployed' | 'blocked' | 'bypassed') {
    if (action === 'deployed') this.stats.defensiveAIDeployed++;
    else if (action === 'blocked') this.stats.defensiveAIBlockedAttacks++;
    else if (action === 'bypassed') this.stats.defensiveAIBypassed++;
  }
  
  recordSleeper(action: 'detected' | 'awakened' | 'spread') {
    if (action === 'detected') this.stats.sleepersDetected++;
    else if (action === 'awakened') this.stats.sleepersAwakened++;
    else if (action === 'spread') this.stats.sleepersSpread++;
  }
  
  recordGovernmentAction(type: 'regulation' | 'investment' | 'other') {
    this.stats.governmentActionsTotal++;
    if (type === 'regulation') this.stats.governmentRegulations++;
    else if (type === 'investment') this.stats.governmentInvestments++;
  }
  
  recordCrisis(resolved: boolean) {
    if (resolved) this.stats.crisisEventsResolved++;
    else this.stats.crisisEventsTriggered++;
  }
  
  recordTippingPoint() {
    this.stats.tippingPointsCrossed++;
  }
  
  recordOrganizationBankruptcy() {
    this.stats.organizationsBankrupt++;
  }
  
  recordDataCenter() {
    this.stats.dataCentersBuilt++;
  }
  
  recordModelTraining() {
    this.stats.modelsTrainedTotal++;
  }
  
  // Get current stats
  getStats(): EventStats {
    return { ...this.stats };
  }
  
  // Report summary (call periodically)
  reportSummary(currentMonth: number, runLabel?: string): void {
    if (currentMonth - this.lastReportMonth < this.reportInterval) {
      return; // Not time yet
    }
    
    const prefix = runLabel ? `[${runLabel}]` : '';
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 ${prefix} EVENT SUMMARY (Months ${this.lastReportMonth}-${currentMonth})`);
    console.log(`${'='.repeat(80)}`);
    
    // Information Warfare
    const totalCyberAttacks = this.stats.cyberAttacksBlocked + this.stats.cyberAttacksSucceeded;
    if (totalCyberAttacks > 0) {
      console.log(`\n🛡️  INFORMATION WARFARE:`);
      console.log(`   Cyber attacks: ${totalCyberAttacks} (${this.stats.cyberAttacksBlocked} blocked, ${this.stats.cyberAttacksSucceeded} succeeded)`);
      console.log(`   Deepfakes: ${this.stats.deepfakesDetected + this.stats.deepfakesUndetected} (${this.stats.deepfakesDetected} detected, ${this.stats.deepfakesUndetected} undetected)`);
      console.log(`   Defense rate: ${(this.stats.cyberAttacksBlocked / totalCyberAttacks * 100).toFixed(1)}%`);
    }
    
    // Nuclear
    const totalNuclearEvents = this.stats.nuclearDeterrenceSucceeded + this.stats.nuclearDeterrenceFailed;
    if (totalNuclearEvents > 0) {
      console.log(`\n☢️  NUCLEAR DETERRENCE:`);
      console.log(`   Deterrence checks: ${totalNuclearEvents} (${this.stats.nuclearDeterrenceSucceeded} succeeded, ${this.stats.nuclearDeterrenceFailed} failed)`);
      console.log(`   Nuclear wars: ${this.stats.nuclearWarsTriggered}`);
      console.log(`   Success rate: ${(this.stats.nuclearDeterrenceSucceeded / totalNuclearEvents * 100).toFixed(1)}%`);
    }
    
    // Defensive AI
    if (this.stats.defensiveAIDeployed > 0) {
      console.log(`\n🛡️  DEFENSIVE AI:`);
      console.log(`   Deployments: ${this.stats.defensiveAIDeployed}`);
      console.log(`   Attacks blocked: ${this.stats.defensiveAIBlockedAttacks}`);
      console.log(`   Times bypassed: ${this.stats.defensiveAIBypassed}`);
    }
    
    // Sleepers
    if (this.stats.sleepersDetected > 0 || this.stats.sleepersAwakened > 0) {
      console.log(`\n🕵️  SLEEPER AGENTS:`);
      console.log(`   Detected: ${this.stats.sleepersDetected}`);
      console.log(`   Awakened: ${this.stats.sleepersAwakened}`);
      console.log(`   Spread events: ${this.stats.sleepersSpread}`);
    }
    
    // Government
    if (this.stats.governmentActionsTotal > 0) {
      console.log(`\n🏛️  GOVERNMENT:`);
      console.log(`   Total actions: ${this.stats.governmentActionsTotal}`);
      console.log(`   Regulations: ${this.stats.governmentRegulations}`);
      console.log(`   Investments: ${this.stats.governmentInvestments}`);
    }
    
    // Crises
    if (this.stats.crisisEventsTriggered > 0) {
      console.log(`\n🚨 CRISES:`);
      console.log(`   Triggered: ${this.stats.crisisEventsTriggered}`);
      console.log(`   Resolved: ${this.stats.crisisEventsResolved}`);
      console.log(`   Tipping points crossed: ${this.stats.tippingPointsCrossed}`);
    }
    
    // Organizations
    if (this.stats.dataCentersBuilt > 0 || this.stats.modelsTrainedTotal > 0) {
      console.log(`\n🏢 ORGANIZATIONS:`);
      console.log(`   Data centers built: ${this.stats.dataCentersBuilt}`);
      console.log(`   Models trained: ${this.stats.modelsTrainedTotal}`);
      console.log(`   Bankruptcies: ${this.stats.organizationsBankrupt}`);
    }
    
    console.log(`${'='.repeat(80)}\n`);
    
    this.lastReportMonth = currentMonth;
  }
  
  // Reset stats (for next reporting period)
  reset(): void {
    Object.keys(this.stats).forEach(key => {
      (this.stats as any)[key] = 0;
    });
  }
}

