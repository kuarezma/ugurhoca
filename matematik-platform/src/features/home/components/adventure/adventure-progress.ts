export type AdventureProgressRow = {
  topic: string;
  mastery_level: number | null;
};
export type AdventureProgressData = {
  currentStreak: number;
  quizCount: number;
  badgeCount: number;
  topics: AdventureProgressRow[];
};

export function getAdventureStars(mastery: number) {
  return mastery >= 85 ? 3 : mastery >= 60 ? 2 : mastery >= 30 ? 1 : 0;
}

export function calculateAdventureTopics<T extends { title: string }>(
  topics: T[],
  progress: AdventureProgressRow[],
) {
  const masteryByTopic = new Map(
    progress.map((row) => [row.topic, row.mastery_level ?? 0]),
  );
  const activeIndex = topics.findIndex(
    (topic) => (masteryByTopic.get(topic.title) ?? 0) < 70,
  );
  return topics.map((topic, index) => {
    const mastery = Math.min(
      100,
      Math.max(0, masteryByTopic.get(topic.title) ?? 0),
    );
    return {
      ...topic,
      mastery,
      stars: getAdventureStars(mastery),
      status:
        mastery >= 70
          ? ('completed' as const)
          : index === activeIndex
            ? ('active' as const)
            : ('open' as const),
    };
  });
}
