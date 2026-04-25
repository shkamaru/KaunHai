# Kaun Hai?

A team-based Bollywood celebrity guessing game for parties. Two teams take turns describing celebrities using clues — without saying any of the forbidden words.

## How to Play

1. **Pick a deck** — Bollywood stars or the Priyadarshan universe
2. **Choose rounds** — 1 to 5 rounds (both teams play once per round)
3. **Take turns** — Each team gets 60 seconds per turn. One player describes the celebrity on the card to their teammates using any words *except* the forbidden ones listed
4. **Score points:**
   - +1 for each correct guess
   - 0 for skipping a card
   - -1 if the opposing team catches you saying a forbidden word
5. **Win** — The team with the most points after all rounds wins

## Cards

Each card has a celebrity name, a hint clue, and 5–7 forbidden words the describer cannot say.

```
Celebrity: Shah Rukh Khan
Hint: Known for iconic romantic poses
Forbidden: King Khan, Bollywood, DDLJ, arms, romance ...
```

## Project Structure

```
src/
├── main.jsx              # App entry point, PostHog analytics init
├── KaunHai.jsx           # All game logic and UI
└── decks/
    ├── index.js          # Exports all available decks
    ├── bollywood.js      # Bollywood celebrity cards
    └── priyadarshan.js   # Priyadarshan film character cards
```

The entire game runs as a single React component with screen-based state — Home → Deck Select → Round Select → Game → Turn Result → Final Result.
