# Reverse content-based - finds activities with minimal tag/competency overlap
# Ranks by lowest overlap count - good for "try something new" suggestions

from collections import Counter
from typing import Dict, Iterable, List, Any, Set


class ReverseContentBasedRecommender:
    def __init__(self, activities: Iterable[Dict[str, Any]]):
        # Build lookup tables for fast overlap checks
        # Merge tags and competencies into one set per activity
        self.activities: Dict[Any, Dict[str, Any]] = {activity['id']: activity for activity in activities}
        self.activity_tags: Dict[Any, Set[str]] = {}
        for activity in activities:
            tags = set(activity.get('tags', []))
            comps = set(activity.get('competencies', []))
            self.activity_tags[activity['id']] = tags | comps

    def similarity(self, activity_id: Any, candidate_id: Any) -> int:
        # Count overlap to quantify how similar activities are
        tags_a = self.activity_tags.get(activity_id, set())
        tags_b = self.activity_tags.get(candidate_id, set())
        # Invert Jaccard: 1.0 - similarity = dissimilarity score
        return 1.0 - jaccard_similarity(tags_a, tags_b)

    # Recommends activities for user by aggregating dissimilarity across all their current activities
    def recommend_for_user(self, user_activity_ids: Any, top_n: int = 10) -> List[Any]:
        user_activities = set(user_activity_ids)
        scores = []
        # Loop through all candidate activities
        for candidate_id in self.activities:
            if candidate_id in user_activities:
                # Fallback: never recommend something the user already has
                continue
            total_dissimilarity = 0
            # Loop through user activities to sum dissimilarity scores
            for user_activity in user_activities:
                total_dissimilarity += self.similarity(user_activity, candidate_id)
            scores.append((candidate_id, total_dissimilarity))
        # Reversed sort 
        scores.sort(key=lambda pair: pair[1], reverse=True)
        top_ids = [candidate_id for candidate_id, _ in scores[:top_n]]
        return [self.activities[candidate_id] for candidate_id in top_ids]
