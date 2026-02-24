# Content-based recommendations using Jaccard similarity over tags + competencies
from collections import Counter
from typing import Dict, Iterable, List, Set, Any


def jaccard_similarity(tags_a: Set[str], tags_b: Set[str]) -> float:
    # Jaccard = overlap / total unique tags, normalized between 0 and 1
    # Edge-case handling: if both are empty treat as identical to avoid divide-by-zero error 
    if not tags_a and not tags_b:
        return 1.0
    # Fallback: if only one is empty, similarity is 0 by definition
    if not tags_a or not tags_b:
        return 0.0
    intersection = len(tags_a & tags_b)
    union = len(tags_a | tags_b)
    #Jaccard formula normalised
    return intersection / union


class ContentBasedRecommender:

    #Setup with a list of activities, precomputing tag/competency sets for similarity checks
    def __init__(self, activities: Iterable[Dict[str, Any]]):
        # Build lookup tables for similarity checks
        self.activities: Dict[Any, Dict[str, Any]] = {activity['id']: activity for activity in activities}
        self.activity_tags: Dict[Any, Set[str]] = {}
        #Loop through activities to merge tags and competencies into one set for each activity
        for activity in activities:
            tags = set(activity.get('tags', []))
            comps = set(activity.get('competencies', []))
            self.activity_tags[activity['id']] = tags | comps

    # Wrapper for jaccard similarity
    def similarity(self, activity_id: Any, candidate_id: Any) -> float:
        # Fallback: uses empty sets if an ID is missing, which returns 0.0 from Jaccard
        tags_a = self.activity_tags.get(activity_id, set())
        tags_b = self.activity_tags.get(candidate_id, set())
        return jaccard_similarity(tags_a, tags_b)

    #Reccomends activities similar to a given activity by comparing tag/competency sets
    def recommend_for_activity(self, activity_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
        # Fallback: if the activity_id is unknown
        if activity_id not in self.activities:
            return []
        scores = []
        # Loops through all activities to compute similarity scores against the given activity
        for candidate_id in self.activities:
            if candidate_id == activity_id:
                # Guard clause skips self
                continue
            # Aggregate similarity scores for each candidate activity, calls similarity subfunction
            scores.append((candidate_id, self.similarity(activity_id, candidate_id)))
        # Sort highest similarity first so top_n is the most relevant
        scores.sort(key=lambda pair: pair[1], reverse=True)
        top_ids = [activity_id for activity_id, _ in scores[:top_n]]
        return [self.activities[activity_id] for activity_id in top_ids]

    #Reccomends activities for user by aggregating similarity across all their current activities
    def recommend_for_user(self, user_activity_ids: Iterable[Any], top_n: int = 10) -> List[Dict[str, Any]]:
        user_activities = set(user_activity_ids)
        scores: Counter = Counter()
        # Loop through user activities
        for user_activity in user_activities:
            # Loop through recommended activities by calling recommend_for_activity subfunction
            for activity in self.recommend_for_activity(user_activity, top_n=top_n * 2):
                if activity['id'] in user_activities:
                    # Fallback: never recommend something the user already has
                    continue
                scores[activity['id']] += 1
        # Keep only the top_n highest-scored activities
        most_common = scores.most_common(top_n)
        return [self.activities[activity_id] for activity_id, _ in most_common]


