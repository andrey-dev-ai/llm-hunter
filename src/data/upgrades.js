/**
 * Upgrade definitions — player picks 1 of 3 between waves
 */

export const UPGRADES = [
  // --- Original upgrades (rebalanced) ---
  {
    id: 'fire_rate',
    name: 'npm install turbo',
    icon: '>>',
    description: 'Fire rate +25%',
    apply(player) { player.shootRate *= 0.75; },
  },
  {
    id: 'damage',
    name: 'Code Review',
    icon: '!!',
    description: 'Damage +1',
    maxStacks: 2,
    apply(player) { player.damage += 1; },
  },
  {
    id: 'speed',
    name: 'Caffeine Boost',
    icon: '~~',
    description: 'Move speed +15%',
    maxStacks: 2,
    apply(player) { player.baseSpeed *= 1.15; },
  },
  {
    id: 'hp',
    name: 'git stash',
    icon: '+H',
    description: 'Max HP +2, heal full',
    maxStacks: 3,
    apply(player) { player.maxHp += 2; player.hp = player.maxHp; },
  },
  {
    id: 'projectile_speed',
    name: 'Fiber Optic',
    icon: '->',
    description: 'Projectile speed +30%, +1 pierce',
    maxStacks: 1,
    apply(player) {
      player.projectileSpeedMult = (player.projectileSpeedMult || 1) * 1.3;
      player.pierce += 1;
    },
  },
  {
    id: 'multi_shot',
    name: 'Fork Process',
    icon: '&&',
    description: '+1 shot, fire rate -10%',
    maxStacks: 2,
    apply(player) {
      player.multiShot = (player.multiShot || 1) + 1;
      player.shootRate *= 1.1;
    },
  },

  // --- New upgrades ---
  {
    id: 'pierce',
    name: 'Regex',
    icon: '/.*/',
    description: 'Projectiles pierce through 2 enemies',
    maxStacks: 1,
    apply(player) { player.pierce += 2; },
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'TS',
    description: 'Damage +50%, fire rate -20%',
    maxStacks: 1,
    apply(player) {
      player.damage = Math.ceil(player.damage * 1.5);
      player.shootRate *= 1.2;
    },
  },
  {
    id: 'shield',
    name: 'Docker Container',
    icon: '[ ]',
    description: 'Shield absorbs 1 hit (15s cooldown)',
    maxStacks: 1,
    apply(player) { player.shield = true; },
  },
  {
    id: 'ricochet',
    name: 'Rubber Duck Debug',
    icon: '<>',
    description: 'Projectiles bounce to nearest enemy',
    maxStacks: 1,
    apply(player) { player.bounces += 1; },
  },
  {
    id: 'kill_aoe',
    name: 'Stack Overflow',
    icon: 'SO',
    description: 'Every 5th kill triggers AoE explosion',
    maxStacks: 1,
    apply(player) { player.killAoeEnabled = true; },
  },
  {
    id: 'heal_aoe',
    name: 'npm audit fix',
    icon: 'fix',
    description: 'Healing creates damage wave (2 dmg)',
    maxStacks: 1,
    apply(player) { player.healAoe = true; },
  },
];

/**
 * Pick N random unique upgrades from the pool.
 * Filters out upgrades that reached maxStacks for this player.
 */
export function pickRandomUpgrades(count = 3, player = null) {
  const pool = UPGRADES.filter(up => {
    if (!up.maxStacks || !player) return true;
    const stacks = player._upgradeStacks?.[up.id] || 0;
    return stacks < up.maxStacks;
  });
  const shuffled = [...pool];
  const result = [];
  for (let i = 0; i < count && shuffled.length > 0; i++) {
    const idx = Math.floor(Math.random() * shuffled.length);
    result.push(shuffled[idx]);
    shuffled.splice(idx, 1);
  }
  return result;
}
