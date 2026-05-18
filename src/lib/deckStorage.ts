import { PitchDeck } from "../types";
import { getCurrentUser } from "./auth";

function getDeckStorageKey() {
  const user = getCurrentUser();
  return user ? `pitchDecks:${user.email}` : "pitchDecks";
}

export function getSavedDecks(): PitchDeck[] {
  return JSON.parse(localStorage.getItem(getDeckStorageKey()) || "[]");
}

export function saveDecks(decks: PitchDeck[]) {
  localStorage.setItem(getDeckStorageKey(), JSON.stringify(decks));
}

export function saveDeck(deck: PitchDeck) {
  saveDecks([deck, ...getSavedDecks()]);
}
