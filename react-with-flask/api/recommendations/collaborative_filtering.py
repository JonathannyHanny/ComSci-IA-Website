# Collaborative filtering - "people who did X also liked Y"
# Uses user signup overlap to recommend activities

from collections import defaultdict, Counter
import math


class SimpleCollaborativeFiltering:
    def __init__(self, user_item_map):
        # Build user->items and item->users mappings for quick lookups
        self.user_item_map = user_item_map
        self.item_user_map = defaultdict(set)
        for u, items in user_item_map.items():
            for i in items:
                self.item_user_map[i].add(u)

    def item_similarity(self, a, b):
        # Cosine-like score: overlap of users divided by the geometric mean of their audience sizes
        users_a = self.item_user_map.get(a, set())
        users_b = self.item_user_map.get(b, set())
        if not users_a or not users_b:
            return 0.0
        inter = len(users_a & users_b)
        denom = math.sqrt(len(users_a) * len(users_b))
        return inter / denom

    def recommend_for_user(self, user_id, top_n=10):
        # For everything the user already has, find other items seen with it and sum scores
        user_items = set(self.user_item_map.get(user_id, []))
        scores = Counter()
        for item in user_items:
            for candidate in self.item_user_map:
                if candidate in user_items:
                    continue
                scores[candidate] += self.item_similarity(item, candidate)
        return [item for item, _ in scores.most_common(top_n)]

