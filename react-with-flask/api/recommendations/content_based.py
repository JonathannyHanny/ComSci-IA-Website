#Uses Jaccard similarity over tags + competencies

from collections import Counter
from typing import Dict, Iterable, List, Set, Any


def jaccard_similarity(tags_a: Set[str], tags_b: Set[str]) -> float:
    # Jaccard = overlap / total unique tags
    if not tags_a and not tags_b:
        return 1.0
    if not tags_a or not tags_b:
        return 0.0
    intersection = len(tags_a & tags_b)
    union = len(tags_a | tags_b)
    return intersection / union


class ContentBasedRecommender:

    def __init__(self, activities: Iterable[Dict[str, Any]]):
        # Build lookup tables for fast similarity checks
        # Merge tags and competencies into one set per activity
        self.activities: Dict[Any, Dict[str, Any]] = {activity['id']: activity for activity in activities}
        self.activity_tags: Dict[Any, Set[str]] = {}
        for activity in activities:
            tags = set(activity.get('tags', []))
            comps = set(activity.get('competencies', []))
            self.activity_tags[activity['id']] = tags | comps

    def similarity(self, activity_id: Any, candidate_id: Any) -> float:
        # Compare two activities by how similar their tag+competency sets are
        tags_a = self.activity_tags.get(activity_id, set())
        tags_b = self.activity_tags.get(candidate_id, set())
        return jaccard_similarity(tags_a, tags_b)

    def recommend_for_activity(self, activity_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
        # Given one activity, find the most similar other activities
        if activity_id not in self.activities:
            return []
        scores = []
        for candidate_id in self.activities:
            if candidate_id == activity_id:
                continue
            scores.append((candidate_id, self.similarity(activity_id, candidate_id)))
        scores.sort(key=lambda pair: pair[1], reverse=True)
        top_ids = [activity_id for activity_id, _ in scores[:top_n]]
        return [self.activities[activity_id] for activity_id in top_ids]

    def recommend_for_user(self, user_activity_ids: Iterable[Any], top_n: int = 10) -> List[Dict[str, Any]]:
        # Recommend by summing similarity scores from all activities the user already likes
        user_activities = set(user_activity_ids)
        scores: Counter = Counter()
        for user_activity in user_activities:
            for activity in self.recommend_for_activity(user_activity, top_n=top_n * 2):
                if activity['id'] in user_activities:
                    continue
                scores[activity['id']] += 1
        most_common = scores.most_common(top_n)
        return [self.activities[activity_id] for activity_id, _ in most_common]


