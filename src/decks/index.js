import { bollywoodCards } from './bollywood';
import { priyadarshanCards } from './priyadarshan';

export const DECKS = [
  {
    id: 'bollywood',
    name: 'Bollywood Celebrities',
    emoji: '🎬',
    description: 'Iconic stars across 5 decades — from Dilip Kumar to Gen Z',
    cards: bollywoodCards
  },
  {
    id: 'priyadarshan',
    name: 'Priyadarshan Universe',
    emoji: '🎭',
    description: 'Characters from the legendary Priyadarshan comedies',
    cards: priyadarshanCards
  }
];
