const topicKeywords: Record<string, string[]> = {
  education: [
    'study', 'exam', 'class', 'homework', 'university', 'school', 'lecture',
    'assignment', 'degree', 'result', 'grades', 'project work', 'thesis', 
    'course', 'learning', 'teacher', 'student', 'campus', 'graduation'
  ],
  work: [
    'job', 'boss', 'colleague', 'meeting', 'deadline', 'career',
    'office', 'workplace', 'salary', 'promotion', 'client', 'interview'
  ],
  relationship: [
    'friend', 'family', 'partner', 'date', 'love', 'spouse', 'parent',
    'child', 'relationship', 'husband', 'wife', 'girlfriend', 'boyfriend',
    'mom', 'dad', 'mother', 'father', 'miss', 'home'
  ],
  health: [
    'gym', 'exercise', 'health', 'doctor', 'sick', 'fit', 'wellness', 'diet',
    'sleep', 'workout', 'mental health', 'therapy', 'meditation', 'stress', 'anxious'
  ],
  planning: [
    'plan', 'goal', 'schedule', 'to do', 'task', 'reminder', 'future',
    'intend', 'will', 'aim', 'objective', 'deadline'
  ],
};

const topicPriority = ['education', 'work', 'relationship', 'health', 'planning'];

export function extractTopics(text: string): string[] {
  const lowerText = text.toLowerCase();
  const matchedTopics = new Set<string>();

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        matchedTopics.add(topic);
        break;
      }
    }
  }

  // If no topics matched, return a default based on sentiment? Optional: return ['general']
  // For now, return empty array.
  const topicsArray = Array.from(matchedTopics);
  topicsArray.sort((a, b) => {
    const indexA = topicPriority.indexOf(a);
    const indexB = topicPriority.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return topicsArray.slice(0, 2);
}