/**
 * Upgrade definitions — player picks 1 of 3 between waves
 */

export const UPGRADES = [
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
    apply(player) { player.damage += 1; },
  },
  {
    id: 'speed',
    name: 'Caffeine Boost',
    icon: '~~',
    description: 'Move speed +15%',
    apply(player) { player.baseSpeed *= 1.15; },
  },
  {
    id: 'hp',
    name: 'git stash',
    icon: '+H',
    description: 'Max HP +2, heal full',
    apply(player) { player.maxHp += 2; player.hp = player.maxHp; },
  },
  {
    id: 'projectile_speed',
    name: 'Fiber Optic',
    icon: '->',
    description: 'Projectile speed +30%',
    apply(player) { player.projectileSpeedMult = (player.projectileSpeedMult || 1) * 1.3; },
  },
  {
    id: 'multi_shot',
    name: 'Fork Process',
    icon: '&&',
    description: 'Double shot',
    maxStacks: 1,
    apply(player) { player.multiShot = (player.multiShot || 1) + 1; },
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
