"""Basic collaborative filtering prototype.

This implementation uses user-item interaction sets to compute simple
item-item similarity and recommend items for a single user. The
implementation is minimal and intended for demonstration/testing.
"""

from collections import defaultdict, Counter
import math


class SimpleCollaborativeFiltering:
    def __init__(self, user_item_map):
        """Build user->items and item->users mappings.

        user_item_map should be a dict mapping user_id -> iterable(item_id).
        """
        self.user_item_map = user_item_map
        self.item_user_map = defaultdict(set)
        for u, items in user_item_map.items():
            for i in items:
                self.item_user_map[i].add(u)

    def item_similarity(self, a, b):
        # Cosine-like co-occurrence: |users_a ∩ users_b| / sqrt(|A|*|B|)
        users_a = self.item_user_map.get(a, set())
        users_b = self.item_user_map.get(b, set())
        if not users_a or not users_b:
            return 0.0
        inter = len(users_a & users_b)
        denom = math.sqrt(len(users_a) * len(users_b))
        return inter / denom

    def recommend_for_user(self, user_id, top_n=10):
        # Recommend items by summing similarity scores from the user's items
        user_items = set(self.user_item_map.get(user_id, []))
        scores = Counter()
        for item in user_items:
            for candidate in self.item_user_map:
                if candidate in user_items:
                    continue
                scores[candidate] += self.item_similarity(item, candidate)
        return [item for item, _ in scores.most_common(top_n)]


if __name__ == '__main__':
    users = {
        'u1': [1, 2],
        'u2': [2, 3],
        'u3': [1, 3, 4]
    }
    cf = SimpleCollaborativeFiltering(users)
    print(cf.recommend_for_user('u1'))
