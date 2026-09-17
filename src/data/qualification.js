export function getQualification(scores, teamCount) {
  const ranked = Array.from({ length: teamCount }, (_, index) => index)
    .sort((first, second) => scores[second] - scores[first] || first - second)
  const cutoff = Math.min(4, teamCount)

  if (teamCount <= 4 || scores[ranked[3]] > scores[ranked[4]]) {
    return { finalists: ranked.slice(0, cutoff), secured: [], tied: [], slots: 0 }
  }

  const cutoffScore = scores[ranked[3]]
  const secured = ranked.filter((index) => scores[index] > cutoffScore)
  const tied = ranked.filter((index) => scores[index] === cutoffScore)

  return { finalists: null, secured, tied, slots: 4 - secured.length }
}
