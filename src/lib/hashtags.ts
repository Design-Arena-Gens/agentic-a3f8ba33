const hashtagMap: Record<string, string[]> = {
  business: [
    "#entrepreneurtips",
    "#sidehustleideas",
    "#digitalproducts",
    "#smallbizowner",
    "#passiveincome",
  ],
  fitness: [
    "#fitcheck",
    "#wellnesstips",
    "#workoutroutine",
    "#fitnessmotivation",
    "#healthylifestyle",
  ],
  beauty: [
    "#skincareroutine",
    "#beautyhacks",
    "#glowupchallenge",
    "#makeuptutorial",
    "#selfcareclub",
  ],
  tech: [
    "#techtiktok",
    "#aiforcreators",
    "#productivityhack",
    "#techtools",
    "#automationtips",
  ],
  default: [
    "#fyp",
    "#viral",
    "#tiktokmade",
    "#contentcreator",
    "#dailyinspo",
  ],
};

export function getHashtags(niche: string) {
  const normalized = niche.trim().toLowerCase();
  const match =
    Object.entries(hashtagMap).find(([key]) => normalized.includes(key))?.[1] ??
    hashtagMap.default;

  return Array.from(new Set([...match, ...hashtagMap.default])).slice(0, 6);
}
