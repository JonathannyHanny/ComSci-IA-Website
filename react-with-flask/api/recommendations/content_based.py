"""Simple tag-based content recommender utilities.

Provides a tiny content-based recommender using Jaccard similarity over
sets of tags. This is intended as a readable prototype for experimentation
and tests rather than a production-grade recommender.
"""

from collections import Counter
from typing import Dict, Iterable, List, Set, Any


def jaccard_similarity(tags_a: Set[str], tags_b: Set[str]) -> float:
    """Return Jaccard similarity between two tag sets.

    - If both sets are empty, return 1.0 (perfect match).
    - If one is empty and the other is not, return 0.0.
    """

    if not tags_a and not tags_b:
        return 1.0
    if not tags_a or not tags_b:
        return 0.0
    intersection = len(tags_a & tags_b)
    union = len(tags_a | tags_b)
    return intersection / union


class ContentBasedRecommender:

    def __init__(self, items: Iterable[Dict[str, Any]]):
        """Build in-memory lookup structures.

        `items` should be an iterable of dicts with at least `id` and
        optional `tags`. The class stores a mapping of id -> item and
        id -> set(tags) for efficient similarity computations.
        """
        self.items: Dict[Any, Dict[str, Any]] = {item['id']: item for item in items}
        self.item_tags: Dict[Any, Set[str]] = {
            item['id']: set(item.get('tags', [])) for item in items
        }

    def similarity(self, item_id: Any, candidate_id: Any) -> float:
        # Compute similarity score between two items by comparing tag sets.
        tags_a = self.item_tags.get(item_id, set())
        tags_b = self.item_tags.get(candidate_id, set())
        return jaccard_similarity(tags_a, tags_b)

    def recommend_for_item(self, item_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
        """Return top_n most similar items to the given item_id.

        If the item_id is not found this returns an empty list.
        """

        if item_id not in self.items:
            return []
        scores = []
        for candidate_id in self.items:
            if candidate_id == item_id:
                continue
            scores.append((candidate_id, self.similarity(item_id, candidate_id)))
        scores.sort(key=lambda pair: pair[1], reverse=True)
        top_ids = [cid for cid, _ in scores[:top_n]]
        return [self.items[cid] for cid in top_ids]

    def recommend_for_user(self, user_item_ids: Iterable[Any], top_n: int = 10) -> List[Dict[str, Any]]:
        """Recommend items for a user based on their item history.

        Scores for unseen candidates are the sum of similarities to each
        item in the user's history. Returns the top_n items.
        """

        user_items = set(user_item_ids)
        scores: Counter = Counter()
        for user_item in user_items:
            for candidate_id in self.items:
                if candidate_id in user_items:
                    continue
                scores[candidate_id] += self.similarity(user_item, candidate_id)
        most_common = scores.most_common(top_n)
        return [self.items[cid] for cid, _ in most_common]


if __name__ == '__main__':

    sample_items = [
        {'id': 1, 'name': 'A', 'tags': ['math', 'logic']},
        {'id': 2, 'name': 'B', 'tags': ['art', 'drawing']},
        {'id': 3, 'name': 'C', 'tags': ['math', 'algorithms']},
        {'id': 4, 'name': 'D', 'tags': ['art', 'design']},
    ]
    recommender = ContentBasedRecommender(sample_items)
    print('For item 1 ->', [i['id'] for i in recommender.recommend_for_item(1)])
    print('For user [1,2] ->', [i['id'] for i in recommender.recommend_for_user([1, 2])])
