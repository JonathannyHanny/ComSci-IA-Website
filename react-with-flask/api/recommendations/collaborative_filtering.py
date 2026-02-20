# Collaborative filtering - "people who did X also liked Y"
# Uses user signup overlap to recommend activities

from collections import defaultdict, Counter
from typing import Dict, Iterable, List, Any, Set
import math


class CollaborativeFilteringRecommender:
    def __init__(self, user_activity_map: Dict[Any, List[Any]], activities: Iterable[Dict[str, Any]]):
        # Build user->activities and activity->users mappings for quick lookups
        self.user_activity_map: Dict[Any, List[Any]] = user_activity_map
        self.activity_user_map: Dict[Any, Set[Any]] = defaultdict(set)
        self.activities: Dict[Any, Dict[str, Any]] = {activity['id']: activity for activity in activities}
        for user_id, activity_ids in user_activity_map.items():
            for activity_id in activity_ids:
                self.activity_user_map[activity_id].add(user_id)

    def similarity(self, activity_a: Any, activity_b: Any) -> float:
        # Cosine-like score: overlap of users divided by the geometric mean of their audience sizes
        users_a = self.activity_user_map.get(activity_a, set())
        users_b = self.activity_user_map.get(activity_b, set())
        if not users_a or not users_b:
            return 0.0
        inter = len(users_a & users_b)
        denom = math.sqrt(len(users_a) * len(users_b))
        return inter / denom

    def recommend_for_activity(self, activity_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
        # Given one activity, find other activities that share audiences
        if activity_id not in self.activity_user_map:
            return []
        scores: Counter = Counter()
        for candidate_id in self.activity_user_map:
            if candidate_id == activity_id:
                continue
            scores[candidate_id] = self.similarity(activity_id, candidate_id)
        most_common = scores.most_common(top_n)
        return [self.activities[candidate_id] for candidate_id, _ in most_common if candidate_id in self.activities]

    def recommend_for_user(self, user_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
        # For everything the user already has, find other activities seen with it and sum scores
        user_activities = set(self.user_activity_map.get(user_id, []))
        scores: Counter = Counter()
        for user_activity in user_activities:
            for activity in self.recommend_for_activity(user_activity, top_n=top_n * 2):
                if activity['id'] in user_activities:
                    continue
                scores[activity['id']] += 1
        most_common = scores.most_common(top_n)
        return [self.activities[activity_id] for activity_id, _ in most_common if activity_id in self.activities]

