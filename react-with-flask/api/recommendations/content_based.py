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

    def __init__(self, items: Iterable[Dict[str, Any]]):
        # Build lookup tables for fast similarity checks
        # Merge tags and competencies into one set per item
        self.items: Dict[Any, Dict[str, Any]] = {item['id']: item for item in items}
        self.item_tags: Dict[Any, Set[str]] = {}
        for item in items:
            tags = set(item.get('tags', []))
            comps = set(item.get('competencies', []))
            self.item_tags[item['id']] = tags | comps

    def similarity(self, item_id: Any, candidate_id: Any) -> float:
        # Compare two items by how similar their tag+competency sets are
        tags_a = self.item_tags.get(item_id, set())
        tags_b = self.item_tags.get(candidate_id, set())
        return jaccard_similarity(tags_a, tags_b)

    def recommend_for_item(self, item_id: Any, top_n: int = 10) -> List[Dict[str, Any]]:
        # Given one item, find the most similar other items
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
        # Recommend by summing similarity scores from all items the user already likes
        user_items = set(user_item_ids)
        scores: Counter = Counter()
        for user_item in user_items:
            for candidate_id in self.items:
                if candidate_id in user_items:
                    continue
                scores[candidate_id] += self.similarity(user_item, candidate_id)
        most_common = scores.most_common(top_n)
        return [self.items[cid] for cid, _ in most_common]


