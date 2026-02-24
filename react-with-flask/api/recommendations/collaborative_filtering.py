# Collaborative reccomendation based off of what similiar users are signed up for
from collections import defaultdict, Counter
from typing import Dict, Iterable, List, Any, Set
import math


class CollaborativeFilteringRecommender:
    # Builds user activity map and scores
    def __init__(self, user_activity_map: Dict[Any, List[Any]], activities: Iterable[Dict[str, Any]]):
        # Build user->activities and activity->users mappings for lookups
        self.user_activity_map: Dict[Any, List[Any]] = user_activity_map
        self.activity_user_map: Dict[Any, Set[Any]] = defaultdict(set)
        self.activities: Dict[Any, Dict[str, Any]] = {activity['id']: activity for activity in activities}
        for user_id, activity_ids in user_activity_map.items():
            for activity_id in activity_ids:
                # Invert the mapping to find users per activity
                self.activity_user_map[activity_id].add(user_id)

    # Calculates overlap similarity
    def similarity(self, activity_a: Any, activity_b: Any) -> float:
        users_a = self.activity_user_map.get(activity_a, set())
        users_b = self.activity_user_map.get(activity_b, set())
        # Fallback: if either activity has no audience, similarity is 0
        if not users_a or not users_b:
            return 0.0
        # Cosine score = overlap of users divided by the geometric mean of sizes
        inter = len(users_a & users_b)
        denom = math.sqrt(len(users_a) * len(users_b))
        return inter / denom

    # Given one activity, find other activities that share audiences
    def recommend_for_activity(self, activity_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
        # Fallback: unknown activity returns no recommendations
        if activity_id not in self.activity_user_map:
            return []
        scores: Counter = Counter()
        # Loop through all activities 
        for candidate_id in self.activity_user_map:
            if candidate_id == activity_id:
                # Guard clause skips self 
                continue
            scores[candidate_id] = self.similarity(activity_id, candidate_id)
        # Higher similarity means more shared audience
        most_common = scores.most_common(top_n)
        # Filter out activities that aren't in the activity catalog
        return [self.activities[candidate_id] for candidate_id, _ in most_common if candidate_id in self.activities]

    # For each of the user's activities, gather related activities and accumulate scores
    def recommend_for_user(self, user_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
        # Fallback: default to empty set if the user is unknown
        user_activities = set(self.user_activity_map.get(user_id, []))
        scores: Counter = Counter() # Counter library used so .most_common can be called at the end
        # Loop through users activities 
        for user_activity in user_activities:
            # loop through reccomend activites using subfunction
            for activity in self.recommend_for_activity(user_activity, top_n=top_n * 2):
                if activity['id'] in user_activities:
                    continue
                # Fallback: never recommend something the user already has
                scores[activity['id']] += 1
        # Finds most common to return
        most_common = scores.most_common(top_n)
        return [self.activities[activity_id] for activity_id, _ in most_common if activity_id in self.activities]

