export function flattenCards(board) {
  if (!board) return [];
  const result = [];
  board.lists.forEach((list) => {
    list.cardIds.forEach((cardId) => {
      const card = board.cards[cardId];
      if (card) result.push({ ...card, listId: list.id, listTitle: list.title });
    });
  });
  return result;
}
