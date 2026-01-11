# Collaborative filtering - "people who did X also liked Y"
# Uses user signup overlap to recommend activities

from collections import defaultdict, Counter
from typing import Dict, Iterable, List, Any, Set
import math


class CollaborativeFilteringRecommender:
    def __init__(self, user_item_map: Dict[Any, List[Any]], items: Iterable[Dict[str, Any]]):
        # Build user->items and item->users mappings for quick lookups
        self.user_item_map: Dict[Any, List[Any]] = user_item_map
        self.item_user_map: Dict[Any, Set[Any]] = defaultdict(set)
        self.items: Dict[Any, Dict[str, Any]] = {item['id']: item for item in items}
        for u, item_ids in user_item_map.items():
            for i in item_ids:
                self.item_user_map[i].add(u)

    def similarity(self, a: Any, b: Any) -> float:
        # Cosine-like score: overlap of users divided by the geometric mean of their audience sizes
        users_a = self.item_user_map.get(a, set())
        users_b = self.item_user_map.get(b, set())
        if not users_a or not users_b:
            return 0.0
        inter = len(users_a & users_b)
        denom = math.sqrt(len(users_a) * len(users_b))
        return inter / denom

    def recommend_for_user(self, user_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
        # For everything the user already has, find other items seen with it and sum scores
        user_items = set(self.user_item_map.get(user_id, []))
        scores: Counter = Counter()
        for item in user_items:
            for candidate in self.item_user_map:
                if candidate in user_items:
                    continue
                scores[candidate] += self.similarity(item, candidate)
        most_common = scores.most_common(top_n)
        return [self.items[item_id] for item_id, _ in most_common if item_id in self.items]

