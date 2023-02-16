export const lostActionPointsForScorpion: { [ attackType: string ]: number } = {
    step: 1,
    punch: 3,
} 

export const damageFromScorpion: { [ attackType: string ]: number } = {
    punch: 3,
} 

export const lostActionPointsForHero: { [ attackType: string ]: number } = {
    step: 1,
    fists: 3,
    pistol: 4,
} 

export const damageFromHero: { [ attackType: string ]: number } = {
    fists: 5,
    pistol: 10,
}

export const entitiesTotalActionPoints: { [ attackType: string ]: number } = {
  hero: 10,
  scorpion: 5,
  deathclaw: 8,
};
