import { useState, useEffect, useRef } from "react";
import { DECKS } from "./decks/index";

/* ── Design tokens ── */
const C = {
  bg: "#1c1a17",
  surface: "#252320",
  surfaceUp: "#2e2b27",
  border: "rgba(255,255,255,0.07)",
  borderUp: "rgba(255,255,255,0.13)",
  text: "#d6d0c8",
  sub: "rgba(214,208,200,0.52)",
  muted: "rgba(214,208,200,0.32)",
  correct: "#5a9e72",
  correctBg: "rgba(90,158,114,0.13)",
  caught: "#b05454",
  caughtBg: "rgba(176,84,84,0.12)",
};

const TEAM = {
  A: { color: "#c47a4e", bg: "rgba(196,122,78,0.1)", border: "rgba(196,122,78,0.22)" },
  B: { color: "#5a90aa", bg: "rgba(90,144,170,0.1)", border: "rgba(90,144,170,0.22)" },
};

const TIMER = 60;

/* ── Reusable style helpers ── */
const font = {
  display: "'Playfair Display', Georgia, serif",
  body: "Inter, -apple-system, system-ui, sans-serif",
};

const btnBase = {
  fontFamily: font.body,
  border: "none",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
};

/* ── Component ── */
export default function KaunHai() {
  const [screen, setScreen] = useState("home");
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentCard, setCurrentCard] = useState(null);
  const [currentTeam, setCurrentTeam] = useState("A");
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [timeLeft, setTimeLeft] = useState(TIMER);
  const [isRunning, setIsRunning] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [buzz, setBuzz] = useState(false);
  const [celebrateAnim, setCelebrateAnim] = useState(false);
  const [turnsCompleted, setTurnsCompleted] = useState(0);
  const [justFinishedTeam, setJustFinishedTeam] = useState("A");
  const [lastTurnStats, setLastTurnStats] = useState({ correct: 0, skipped: 0 });

  const intervalRef = useRef(null);
  const shuffledCards = useRef([]);
  const cardIndex = useRef(0);

  const isRoundComplete = turnsCompleted % 2 === 0;
  const completedRoundsCount = Math.floor(turnsCompleted / 2);
  const currentRoundDisplay = Math.ceil(turnsCompleted / 2) || 1;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      endTurn();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  function initGame() {
    shuffledCards.current = [...selectedDeck.cards].sort(() => Math.random() - 0.5);
    cardIndex.current = 0;
    setCurrentCard(shuffledCards.current[0]);
    setScores({ A: 0, B: 0 });
    setCurrentTeam("A");
    setTimeLeft(TIMER);
    setCorrect(0);
    setSkipped(0);
    setIsRunning(false);
    setTurnsCompleted(0);
    setScreen("game");
  }

  function startTurn() { setIsRunning(true); }

  function advanceCard() {
    cardIndex.current += 1;
    if (cardIndex.current >= shuffledCards.current.length) {
      shuffledCards.current = [...selectedDeck.cards].sort(() => Math.random() - 0.5);
      cardIndex.current = 0;
    }
    setCurrentCard(shuffledCards.current[cardIndex.current]);
  }

  function nextCard(wasCorrect) {
    if (wasCorrect) {
      setCelebrateAnim(true);
      setTimeout(() => setCelebrateAnim(false), 600);
      setCorrect(c => c + 1);
      setScores(s => ({ ...s, [currentTeam]: s[currentTeam] + 1 }));
    } else {
      setSkipped(s => s + 1);
    }
    advanceCard();
  }

  function caughtPressed() {
    setBuzz(true);
    setTimeout(() => setBuzz(false), 700);
    setScores(s => ({ ...s, [currentTeam]: Math.max(0, s[currentTeam] - 1) }));
    advanceCard();
  }

  function endTurn() {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    const newTurnsCompleted = turnsCompleted + 1;
    const newRoundsCompleted = Math.floor(newTurnsCompleted / 2);
    const isGameOver = newTurnsCompleted % 2 === 0 && newRoundsCompleted >= totalRounds;
    setJustFinishedTeam(currentTeam);
    setLastTurnStats({ correct, skipped });
    setTurnsCompleted(newTurnsCompleted);
    setCurrentTeam(t => (t === "A" ? "B" : "A"));
    setTimeLeft(TIMER);
    setCorrect(0);
    setSkipped(0);
    // Advance past the card that was on screen when this turn ended,
    // so the next team always starts fresh and never sees a repeated card.
    cardIndex.current += 1;
    if (cardIndex.current >= shuffledCards.current.length) {
      shuffledCards.current = [...selectedDeck.cards].sort(() => Math.random() - 0.5);
      cardIndex.current = 0;
    }
    setCurrentCard(shuffledCards.current[cardIndex.current]);
    setScreen(isGameOver ? "finalResult" : "turnResult");
  }

  const tc = TEAM[currentTeam];
  const timerPct = (timeLeft / TIMER) * 100;
  const timerColor = timeLeft > 15 ? tc.color : C.caught;

  /* ── Shell ── */
  return (
    <div style={{
      minHeight: "100dvh", background: C.bg, color: C.text,
      fontFamily: font.body, display: "flex", flexDirection: "column",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=Inter:wght@400;500;600&display=swap');
        @keyframes buzz { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
        @keyframes pop  { 0%{transform:scale(1)} 40%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .buzz    { animation: buzz 0.5s ease; }
        .pop     { animation: pop 0.45s ease; }
        .fade-in { animation: fadeIn 0.35s ease both; }
        button:active { opacity: 0.8; transform: scale(0.97); }
      `}</style>

      {/* ─── HOME ─── */}
      {screen === "home" && (
        <div className="fade-in" style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "40px 24px",
          maxWidth: 480, width: "100%", margin: "0 auto",
        }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 style={{
              fontFamily: font.display, fontSize: "clamp(3rem, 10vw, 4.5rem)",
              fontWeight: 900, margin: "0 0 12px", lineHeight: 1,
              background: "linear-gradient(140deg, #d4a96a, #c47a4e)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Kaun Hai?
            </h1>
            <p style={{ color: C.sub, fontSize: "clamp(0.9rem, 3.5vw, 1rem)", lineHeight: 1.4 }}>
              Describe the personality.<br/>Skip the forbidden words.
            </p>
          </div>

          {/* Rules */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 14,
            padding: "20px 20px", marginBottom: 48,
            background: C.surface, borderRadius: 14,
            border: `1px solid ${C.border}`,
          }}>
            {[
              ["✓", C.correct, "Got It", "+1 point"],
              ["→", C.sub,     "Skip",   "no penalty"],
              ["✕", C.caught,   "Caught!", "−1 point"],
            ].map(([icon, color, label, desc]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: color === C.correct ? C.correctBg : color === C.caught ? C.caughtBg : C.surfaceUp,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color, fontWeight: 700, fontSize: "0.95rem" }}>{icon}</span>
                </div>
                <div>
                  <span style={{ color: C.text, fontWeight: 600, fontSize: "0.9rem" }}>{label}</span>
                  <span style={{ color: C.muted, fontSize: "0.85rem", marginLeft: 8 }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => setScreen("deckSelect")}
            style={{
              ...btnBase, width: "100%", background: C.text, borderRadius: 14,
              padding: "18px", color: C.bg, fontSize: "1.05rem", fontWeight: 600,
            }}
          >
            Choose a deck →
          </button>
        </div>
      )}

      {/* ─── DECK SELECT ─── */}
      {screen === "deckSelect" && (
        <div className="fade-in" style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: "24px 20px", maxWidth: 480, width: "100%", margin: "0 auto",
        }}>
          {/* Back */}
          <button onClick={() => setScreen("home")} style={{
            ...btnBase, background: "none", color: C.muted, fontSize: "0.85rem",
            padding: "4px 0", alignSelf: "flex-start", marginBottom: 20,
          }}>
            ← Back
          </button>

          <h2 style={{
            fontFamily: font.display, fontSize: "clamp(1.6rem, 6vw, 2.2rem)",
            fontWeight: 700, margin: "0 0 6px",
          }}>
            Choose a deck
          </h2>
          <p style={{ color: C.muted, margin: "0 0 24px", fontSize: "0.9rem" }}>
            Pick a category to play with
          </p>

          {/* Deck list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DECKS.map(deck => (
              <button
                key={deck.id}
                onClick={() => { setSelectedDeck(deck); setScreen("roundSelect"); }}
                style={{
                  ...btnBase, background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "20px", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 16,
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: C.surfaceUp, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 28, flexShrink: 0,
                }}>
                  {deck.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: font.display, fontSize: "1.05rem",
                    fontWeight: 700, color: C.text, marginBottom: 2,
                  }}>
                    {deck.name}
                  </div>
                  <div style={{ color: C.muted, fontSize: "0.8rem", lineHeight: 1.4 }}>
                    {deck.description}
                  </div>
                </div>
                <div style={{
                  background: C.surfaceUp, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "4px 10px", flexShrink: 0,
                  color: C.sub, fontSize: "0.75rem", fontWeight: 500,
                }}>
                  {deck.cards.length}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── ROUND SELECT ─── */}
      {screen === "roundSelect" && selectedDeck && (
        <div className="fade-in" style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "24px 24px",
          maxWidth: 420, width: "100%", margin: "0 auto",
        }}>
          <button onClick={() => setScreen("deckSelect")} style={{
            ...btnBase, background: "none", color: C.muted, fontSize: "0.85rem",
            padding: "4px 0", alignSelf: "flex-start", marginBottom: 28,
          }}>
            ← Back
          </button>

          {/* Selected deck pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "10px 16px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: 12,
            alignSelf: "flex-start", marginBottom: 32,
          }}>
            <span style={{ fontSize: 22 }}>{selectedDeck.emoji}</span>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: C.text }}>
              {selectedDeck.name}
            </span>
            <span style={{ color: C.muted, fontSize: "0.78rem" }}>
              · {selectedDeck.cards.length} cards
            </span>
          </div>

          <h2 style={{
            fontFamily: font.display, fontSize: "clamp(1.6rem, 6vw, 2rem)",
            fontWeight: 700, margin: "0 0 6px",
          }}>
            How many rounds?
          </h2>
          <p style={{ color: C.muted, margin: "0 0 28px", fontSize: "0.875rem" }}>
            Both teams play once per round
          </p>

          {/* Round picker */}
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setTotalRounds(n)}
                style={{
                  ...btnBase, flex: 1, height: 56, borderRadius: 12,
                  border: totalRounds === n ? `2px solid ${C.text}` : `1px solid ${C.border}`,
                  background: totalRounds === n ? C.surfaceUp : C.surface,
                  color: totalRounds === n ? C.text : C.sub,
                  fontSize: "1.15rem", fontWeight: 600,
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <p style={{ color: C.muted, fontSize: "0.78rem", marginBottom: 36 }}>
            {totalRounds * 2} turns · ~{totalRounds * 2} min
          </p>

          <button
            onClick={initGame}
            style={{
              ...btnBase, width: "100%", background: C.text, borderRadius: 14,
              padding: "18px", color: C.bg, fontSize: "1.05rem", fontWeight: 600,
            }}
          >
            Start game →
          </button>
        </div>
      )}

      {/* ─── GAME ─── */}
      {screen === "game" && (
        <div className="fade-in" style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: "20px 16px env(safe-area-inset-bottom, 16px) 16px",
          maxWidth: 480, width: "100%", margin: "0 auto",
        }}>

          {/* Top bar */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 16,
            padding: "12px 16px", background: C.surface,
            borderRadius: 12, border: `1px solid ${C.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", background: tc.color,
              }} />
              <span style={{ fontWeight: 600, fontSize: "0.88rem", color: tc.color }}>
                Team {currentTeam}
              </span>
            </div>
            <span style={{
              color: C.muted, fontSize: "0.72rem", fontWeight: 500,
              letterSpacing: "0.08em",
            }}>
              R{Math.floor(turnsCompleted / 2) + 1}/{totalRounds}
            </span>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: TEAM.A.color }}>
                A:{scores.A}
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: TEAM.B.color }}>
                B:{scores.B}
              </span>
            </div>
          </div>

          {/* Timer */}
          <div style={{ marginBottom: 16, padding: "0 4px" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "baseline", marginBottom: 6,
            }}>
              <span style={{ color: C.muted, fontSize: "0.7rem", letterSpacing: "0.1em", fontWeight: 500 }}>
                TIME
              </span>
              <span style={{
                color: timerColor, fontWeight: 700, fontSize: "1.1rem",
                fontVariantNumeric: "tabular-nums",
              }}>
                {timeLeft}s
              </span>
            </div>
            <div style={{ height: 4, background: C.surface, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2, width: `${timerPct}%`,
                background: timerColor, transition: "width 1s linear, background 0.5s",
              }} />
            </div>
          </div>

          {/* Card area — takes remaining space */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {!isRunning ? (
              /* Hidden card */
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, marginBottom: 12,
              }}>
                <div style={{
                  width: 52, height: 68, border: `2px dashed ${C.borderUp}`,
                  borderRadius: 10, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <span style={{ color: C.muted, fontSize: "1.6rem", fontWeight: 300 }}>?</span>
                </div>
                <p style={{
                  color: C.muted, fontSize: "0.8rem", fontWeight: 500,
                  letterSpacing: "0.06em",
                }}>
                  Press start to reveal
                </p>
              </div>
            ) : currentCard && (
              /* Active card */
              <div
                className={buzz ? "buzz" : celebrateAnim ? "pop" : ""}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  background: C.surface, border: `1px solid ${tc.border}`,
                  borderRadius: 16, marginBottom: 12,
                  position: "relative", overflow: "hidden",
                }}
              >
                {/* Team accent bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: 3, background: tc.color, opacity: 0.6,
                }} />

                {/* Card content — scrollable if long */}
                <div style={{
                  flex: 1, overflow: "auto", padding: "24px 20px 20px",
                  display: "flex", flexDirection: "column",
                }}>
                  <div style={{
                    fontSize: "0.65rem", letterSpacing: "0.2em",
                    color: C.muted, marginBottom: 14, fontWeight: 500,
                  }}>
                    WHO AM I?
                  </div>

                  <h2 style={{
                    fontFamily: font.display,
                    fontSize: "clamp(1.5rem, 7vw, 2.2rem)",
                    fontWeight: 900, color: C.text,
                    margin: "0 0 6px", lineHeight: 1.15,
                  }}>
                    {currentCard.celeb}
                  </h2>

                  <p style={{
                    color: C.muted, fontSize: "0.82rem",
                    margin: "0 0 20px", fontStyle: "italic", lineHeight: 1.4,
                  }}>
                    {currentCard.hint}
                  </p>

                  <div style={{ height: 1, background: C.border, marginBottom: 16 }} />

                  <div style={{
                    fontSize: "0.65rem", letterSpacing: "0.18em",
                    color: C.caught, marginBottom: 10, fontWeight: 600,
                  }}>
                    FORBIDDEN WORDS
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {currentCard.forbidden.map((w, i) => (
                      <span key={i} style={{
                        background: C.caughtBg, border: `1px solid rgba(176,84,84,0.2)`,
                        borderRadius: 8, padding: "6px 12px",
                        color: C.caught, fontSize: "0.84rem", fontWeight: 500,
                      }}>
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom action area — always pinned */}
          <div style={{ flexShrink: 0, paddingTop: 4 }}>
            {!isRunning ? (
              <button
                onClick={startTurn}
                style={{
                  ...btnBase, width: "100%", background: tc.color,
                  borderRadius: 14, padding: "18px", color: "#fff",
                  fontSize: "1.05rem", fontWeight: 600,
                }}
              >
                Start Team {currentTeam}'s turn
              </button>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr 1fr", gap: 8 }}>
                  <button
                    onClick={() => nextCard(false)}
                    style={{
                      ...btnBase, background: C.surface,
                      border: `1px solid ${C.border}`, borderRadius: 12,
                      padding: "16px 6px", color: C.sub,
                      fontSize: "0.88rem", fontWeight: 500,
                    }}
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => nextCard(true)}
                    style={{
                      ...btnBase, background: C.correct, borderRadius: 12,
                      padding: "16px", color: "#fff",
                      fontSize: "1.05rem", fontWeight: 600,
                    }}
                  >
                    ✓ Got It
                  </button>
                  <button
                    onClick={caughtPressed}
                    style={{
                      ...btnBase, background: C.caughtBg,
                      border: `1px solid rgba(176,84,84,0.25)`,
                      borderRadius: 12, padding: "16px 6px",
                      color: C.caught, fontSize: "0.88rem", fontWeight: 500,
                    }}
                  >
                    Caught!
                  </button>
                </div>
                <button
                  onClick={endTurn}
                  style={{
                    ...btnBase, background: "none", color: C.muted,
                    fontSize: "0.78rem", padding: "14px", width: "100%",
                    textAlign: "center",
                  }}
                >
                  End turn early
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── TURN RESULT ─── */}
      {screen === "turnResult" && (
        <div className="fade-in" style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "32px 24px",
          maxWidth: 420, width: "100%", margin: "0 auto",
        }}>
          <h2 style={{
            fontFamily: font.display,
            fontSize: "clamp(1.6rem, 6vw, 2.2rem)",
            fontWeight: 700, margin: "0 0 6px",
          }}>
            {isRoundComplete ? `Round ${completedRoundsCount} done` : `Team ${justFinishedTeam} done`}
          </h2>
          <p style={{ color: C.muted, margin: "0 0 28px", fontSize: "0.875rem" }}>
            {isRoundComplete
              ? `${completedRoundsCount} of ${totalRounds} round${totalRounds > 1 ? "s" : ""} complete`
              : `Round ${currentRoundDisplay} of ${totalRounds}`}
          </p>

          {/* Turn stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div style={{
              background: C.correctBg, border: `1px solid rgba(90,158,114,0.18)`,
              borderRadius: 14, padding: "20px 16px", textAlign: "center",
            }}>
              <div style={{
                fontFamily: font.display, fontSize: "2.4rem",
                fontWeight: 700, color: C.correct, lineHeight: 1,
              }}>
                {lastTurnStats.correct}
              </div>
              <div style={{ color: C.muted, fontSize: "0.78rem", marginTop: 6, fontWeight: 500 }}>
                correct
              </div>
            </div>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "20px 16px", textAlign: "center",
            }}>
              <div style={{
                fontFamily: font.display, fontSize: "2.4rem",
                fontWeight: 700, color: C.sub, lineHeight: 1,
              }}>
                {lastTurnStats.skipped}
              </div>
              <div style={{ color: C.muted, fontSize: "0.78rem", marginTop: 6, fontWeight: 500 }}>
                skipped
              </div>
            </div>
          </div>

          {/* Score rows */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, overflow: "hidden", marginBottom: 28,
          }}>
            {["A", "B"].map((team, i) => (
              <div key={team} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "18px 20px",
                borderBottom: i === 0 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: TEAM[team].color,
                  }} />
                  <span style={{ fontWeight: 600, fontSize: "0.92rem", color: TEAM[team].color }}>
                    Team {team}
                  </span>
                  {scores[team] > scores[team === "A" ? "B" : "A"] && (
                    <span style={{ fontSize: "0.72rem", color: C.muted, fontWeight: 500 }}>
                      leading
                    </span>
                  )}
                </div>
                <span style={{
                  fontFamily: font.display, fontSize: "1.5rem",
                  fontWeight: 700, color: C.text,
                }}>
                  {scores[team]}
                </span>
              </div>
            ))}
          </div>

          {/* Next up */}
          <p style={{ color: C.sub, fontSize: "0.9rem", marginBottom: 24, lineHeight: 1.4 }}>
            {isRoundComplete && completedRoundsCount < totalRounds
              ? "Starting round " + (completedRoundsCount + 1) + " — "
              : "Round " + currentRoundDisplay + " — "}
            <span style={{ color: TEAM[currentTeam].color, fontWeight: 600 }}>
              Team {currentTeam}'s turn
            </span>
          </p>

          {/* Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
            <button
              onClick={() => setScreen("home")}
              style={{
                ...btnBase, background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: "16px",
                color: C.sub, fontSize: "0.9rem", fontWeight: 500,
              }}
            >
              Quit
            </button>
            <button
              onClick={() => { setScreen("game"); setIsRunning(false); }}
              style={{
                ...btnBase, background: TEAM[currentTeam].color,
                borderRadius: 14, padding: "16px",
                color: "#fff", fontSize: "0.95rem", fontWeight: 600,
              }}
            >
              Team {currentTeam}'s turn →
            </button>
          </div>
        </div>
      )}

      {/* ─── FINAL RESULT ─── */}
      {screen === "finalResult" && (() => {
        const winner = scores.A > scores.B ? "A" : scores.B > scores.A ? "B" : null;
        const loser = winner === "A" ? "B" : winner === "B" ? "A" : null;
        return (
          <div className="fade-in" style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "center", padding: "32px 24px",
            maxWidth: 420, width: "100%", margin: "0 auto",
          }}>
            <p style={{
              color: C.muted, fontSize: "0.75rem", letterSpacing: "0.12em",
              margin: "0 0 10px", fontWeight: 500,
            }}>
              GAME OVER · {totalRounds} ROUND{totalRounds > 1 ? "S" : ""}
            </p>

            <h1 style={{
              fontFamily: font.display,
              fontSize: "clamp(2rem, 8vw, 3rem)",
              fontWeight: 900, margin: "0 0 4px", lineHeight: 1.1,
            }}>
              {winner ? `Team ${winner} wins` : "It's a tie"}
            </h1>

            <p style={{ color: C.muted, margin: "0 0 32px", fontSize: "0.88rem" }}>
              {selectedDeck?.name}
            </p>

            {/* Score cards */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 10, marginBottom: 36,
            }}>
              {["A", "B"].map(team => {
                const isWinner = winner === team;
                return (
                  <div key={team} style={{
                    background: isWinner ? TEAM[team].bg : C.surface,
                    border: `${isWinner ? "2px" : "1px"} solid ${isWinner ? TEAM[team].border : C.border}`,
                    borderRadius: 16, padding: "24px 16px", textAlign: "center",
                  }}>
                    <div style={{
                      fontSize: "0.72rem", letterSpacing: "0.1em",
                      color: isWinner ? TEAM[team].color : C.muted,
                      fontWeight: 600, marginBottom: 10,
                    }}>
                      TEAM {team}{isWinner ? " · WINNER" : ""}
                    </div>
                    <div style={{
                      fontFamily: font.display,
                      fontSize: isWinner ? "3.2rem" : "2.6rem",
                      fontWeight: 900, lineHeight: 1,
                      color: isWinner ? TEAM[team].color : C.sub,
                    }}>
                      {scores[team]}
                    </div>
                    <div style={{
                      color: C.muted, fontSize: "0.72rem",
                      marginTop: 6, fontWeight: 500,
                    }}>
                      points
                    </div>
                    {winner && loser && team === winner && (
                      <div style={{
                        marginTop: 10, fontSize: "0.72rem",
                        color: TEAM[team].color, fontWeight: 600,
                      }}>
                        +{scores[winner] - scores[loser]} ahead
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
              <button
                onClick={() => setScreen("home")}
                style={{
                  ...btnBase, background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "16px",
                  color: C.sub, fontSize: "0.9rem", fontWeight: 500,
                }}
              >
                Home
              </button>
              <button
                onClick={() => { setSelectedDeck(null); setScreen("deckSelect"); }}
                style={{
                  ...btnBase, background: C.text, borderRadius: 14,
                  padding: "16px", color: C.bg,
                  fontSize: "0.95rem", fontWeight: 600,
                }}
              >
                Play again →
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
