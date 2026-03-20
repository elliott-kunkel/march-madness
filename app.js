// ============================================================
// 2026 March Madness Bracket Tracker — App Logic
// ============================================================

(function () {
  "use strict";

  // ---- State ----
  const STORAGE_KEY = "mm2026_bracket";
  let state = loadState();
  let editMode = false;
  let resultsMode = false;
  let currentModalGame = null;

  // ---- Initialization ----
  document.addEventListener("DOMContentLoaded", () => {
    renderAll();
    updateTimestamp();
  });

  // ---- State Persistence ----
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults so new fields are available
        return {
          userPicks: { ...TOURNAMENT_DATA.userPicks, ...parsed.userPicks },
          results: { ...parsed.results },
          finalFourPicks: { ...TOURNAMENT_DATA.finalFourPicks, ...parsed.finalFourPicks },
          championPick: parsed.championPick || TOURNAMENT_DATA.championPick,
          championshipMatchup: parsed.championshipMatchup || TOURNAMENT_DATA.championshipMatchup
        };
      }
    } catch (e) { /* ignore */ }
    return {
      userPicks: { ...TOURNAMENT_DATA.userPicks },
      results: {},
      finalFourPicks: { ...TOURNAMENT_DATA.finalFourPicks },
      championPick: TOURNAMENT_DATA.championPick,
      championshipMatchup: { ...TOURNAMENT_DATA.championshipMatchup }
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateTimestamp();
  }

  // ---- Render Everything ----
  function renderAll() {
    renderBracket();
    renderFinalFour();
    renderPicksBanner();
    renderScoreboard();
    renderProgress();
  }

  // ---- Picks Banner ----
  function renderPicksBanner() {
    setText("pick-east-team", state.finalFourPicks.east);
    setText("pick-south-team", state.finalFourPicks.south);
    setText("pick-midwest-team", state.finalFourPicks.midwest);
    setText("pick-west-team", state.finalFourPicks.west);
    setText("pick-champion-team", state.championPick);

    const cm = state.championshipMatchup;
    setText("pick-championship-team", cm.team1 + " vs " + cm.team2);

    // Color picks based on alive/eliminated
    ["east", "south", "midwest", "west"].forEach(r => {
      const card = document.getElementById("pick-" + r);
      const team = state.finalFourPicks[r];
      card.classList.remove("eliminated-pick", "alive-pick");
      if (isEliminated(team)) {
        card.style.borderColor = "var(--red)";
        card.style.opacity = "0.5";
      } else {
        card.style.borderColor = "";
        card.style.opacity = "";
      }
    });
  }

  // ---- Scoreboard ----
  function renderScoreboard() {
    const stats = calculateStats();
    setText("stat-points", stats.points);
    setText("stat-correct", stats.correct);
    setText("stat-wrong", stats.wrong);
    setText("stat-pending", stats.pending);
    setText("stat-alive", stats.alive);
    setText("stat-max", stats.maxPossible);
  }

  function calculateStats() {
    let points = 0, correct = 0, wrong = 0, pending = 0, alive = 0;
    const totalGames = 63; // 32+16+8+4+2+1

    // Go through all picks
    const allPickKeys = Object.keys(state.userPicks);
    allPickKeys.forEach(key => {
      const pick = state.userPicks[key];
      const result = state.results[key];
      const round = getRoundFromKey(key);
      const pts = TOURNAMENT_DATA.scoring[round] || 0;

      if (result && result.completed) {
        if (result.winner === pick) {
          correct++;
          points += pts;
        } else {
          wrong++;
        }
      } else {
        pending++;
        if (!isEliminated(pick)) {
          alive++;
        }
      }
    });

    // Max possible: current points + all alive pending picks
    let maxPossible = points;
    allPickKeys.forEach(key => {
      const pick = state.userPicks[key];
      const result = state.results[key];
      const round = getRoundFromKey(key);
      const pts = TOURNAMENT_DATA.scoring[round] || 0;
      if (!result || !result.completed) {
        if (!isEliminated(pick)) {
          maxPossible += pts;
        }
      }
    });

    return { points, correct, wrong, pending, alive, maxPossible };
  }

  function getRoundFromKey(key) {
    // key format: region_round_game or ff_round_game
    const parts = key.split("_");
    if (parts[0] === "ff") return parseInt(parts[1]);
    return parseInt(parts[1]);
  }

  function isEliminated(teamName) {
    // A team is eliminated if they appear as a loser in any result
    for (const key in state.results) {
      const r = state.results[key];
      if (r.completed && r.loser === teamName) return true;
    }
    return false;
  }

  // ---- Progress ----
  function renderProgress() {
    const completedGames = Object.values(state.results).filter(r => r.completed).length;
    const totalGames = 63;
    const pct = Math.round((completedGames / totalGames) * 100);
    setText("progress-pct", pct + "%");
    const fill = document.getElementById("progress-fill");
    if (fill) fill.style.width = pct + "%";
  }

  // ---- Bracket Rendering ----
  function renderBracket() {
    const bracketEl = document.getElementById("bracket");
    bracketEl.innerHTML = "";

    const regionOrder = ["east", "south", "midwest", "west"];
    regionOrder.forEach(regionKey => {
      const region = TOURNAMENT_DATA.regions[regionKey];
      const regionEl = document.createElement("div");
      regionEl.className = "region";
      regionEl.id = "region-" + regionKey;

      const headerEl = document.createElement("div");
      headerEl.className = "region-header";
      headerEl.innerHTML = `
        <h3>${region.name} Region</h3>
        <span class="seed-badge">#1 ${region.teams[0].name}</span>
      `;
      regionEl.appendChild(headerEl);

      const bracketInner = document.createElement("div");
      bracketInner.className = "region-bracket";

      // 4 rounds: R64(8 games), R32(4), S16(2), E8(1)
      for (let round = 1; round <= 4; round++) {
        const roundEl = document.createElement("div");
        roundEl.className = "round";

        const labelEl = document.createElement("div");
        labelEl.className = "round-label";
        labelEl.textContent = TOURNAMENT_DATA.roundNames[round];
        roundEl.appendChild(labelEl);

        const gamesInRound = 8 / Math.pow(2, round - 1);
        for (let game = 1; game <= gamesInRound; game++) {
          const gameKey = `${regionKey}_${round}_${game}`;
          const gameEl = createGameElement(gameKey, regionKey, round, game);
          roundEl.appendChild(gameEl);
        }

        bracketInner.appendChild(roundEl);
      }

      regionEl.appendChild(bracketInner);
      bracketEl.appendChild(regionEl);
    });
  }

  function createGameElement(gameKey, regionKey, round, game) {
    const teams = getTeamsForGame(regionKey, round, game);
    const result = state.results[gameKey];
    const pick = state.userPicks[gameKey];

    const gameEl = document.createElement("div");
    gameEl.className = "game";
    gameEl.dataset.key = gameKey;

    if (result && result.completed) {
      gameEl.classList.add("completed");
    }

    teams.forEach((team, idx) => {
      const teamEl = document.createElement("div");
      teamEl.className = "game-team";
      teamEl.dataset.team = team.name;
      teamEl.dataset.gameKey = gameKey;

      // Is this team the user's pick?
      if (team.name === pick) {
        teamEl.classList.add("picked");
      }

      // Winner/loser styling
      if (result && result.completed) {
        if (team.name === result.winner) {
          teamEl.classList.add("winner");
        } else {
          teamEl.classList.add("loser");
        }
        // If user picked right/wrong
        if (team.name === pick && team.name === result.winner) {
          teamEl.classList.add("correct");
        } else if (team.name === pick && team.name !== result.winner) {
          teamEl.classList.add("wrong");
        }
      } else if (isEliminated(team.name)) {
        teamEl.classList.add("eliminated");
        teamEl.style.opacity = "0.4";
      }

      teamEl.innerHTML = `
        <span class="seed">${team.seed || ""}</span>
        <span class="name" title="${team.name}">${team.name}</span>
        <span class="score">${getScoreDisplay(result, team.name)}</span>
      `;

      teamEl.addEventListener("click", () => handleTeamClick(gameKey, team));
      gameEl.appendChild(teamEl);
    });

    return gameEl;
  }

  function getScoreDisplay(result, teamName) {
    if (!result || !result.completed) return "";
    if (teamName === result.winner) return result.winnerScore || "";
    return result.loserScore || "";
  }

  function getTeamsForGame(regionKey, round, game) {
    const teams = TOURNAMENT_DATA.regions[regionKey].teams;

    if (round === 1) {
      // Round of 64: game N uses teams at index (N-1)*2 and (N-1)*2+1
      const idx = (game - 1) * 2;
      return [teams[idx], teams[idx + 1]];
    }

    // Later rounds: derive from previous round picks/results
    const prevRound = round - 1;
    const game1 = (game - 1) * 2 + 1;
    const game2 = (game - 1) * 2 + 2;
    const key1 = `${regionKey}_${prevRound}_${game1}`;
    const key2 = `${regionKey}_${prevRound}_${game2}`;

    const team1 = getWinnerOrPick(key1, regionKey, prevRound, game1);
    const team2 = getWinnerOrPick(key2, regionKey, prevRound, game2);

    return [team1, team2];
  }

  function getWinnerOrPick(gameKey, regionKey, round, game) {
    // If result exists, use the winner
    const result = state.results[gameKey];
    if (result && result.completed) {
      const winnerTeam = findTeamByName(regionKey, result.winner);
      return winnerTeam || { seed: "?", name: result.winner };
    }
    // Otherwise use the pick or show TBD
    const pick = state.userPicks[gameKey];
    if (pick) {
      const pickTeam = findTeamByName(regionKey, pick);
      return pickTeam || { seed: "?", name: pick };
    }
    return { seed: "?", name: "TBD" };
  }

  function findTeamByName(regionKey, name) {
    const teams = TOURNAMENT_DATA.regions[regionKey].teams;
    return teams.find(t => t.name === name) || null;
  }

  // ---- Final Four Rendering ----
  function renderFinalFour() {
    const ffEl = document.getElementById("ff-bracket");
    ffEl.innerHTML = "";

    // Semifinal round
    const sfRound = document.createElement("div");
    sfRound.className = "ff-round";

    const sfLabel = document.createElement("div");
    sfLabel.className = "round-label";
    sfLabel.textContent = "FINAL FOUR";
    sfRound.appendChild(sfLabel);

    // Semifinal 1: East vs South
    const sf1 = createFFGame("ff_5_1", [
      getRegionWinner("east"),
      getRegionWinner("south")
    ]);
    sfRound.appendChild(sf1);

    // Semifinal 2: Midwest vs West
    const sf2 = createFFGame("ff_5_2", [
      getRegionWinner("midwest"),
      getRegionWinner("west")
    ]);
    sfRound.appendChild(sf2);

    ffEl.appendChild(sfRound);

    // Championship round
    const champRound = document.createElement("div");
    champRound.className = "ff-round";

    const champLabel = document.createElement("div");
    champLabel.className = "round-label";
    champLabel.textContent = "CHAMPIONSHIP";
    champRound.appendChild(champLabel);

    const champGame = createFFGame("ff_6_1", [
      getFFWinner("ff_5_1"),
      getFFWinner("ff_5_2")
    ]);
    champRound.appendChild(champGame);

    ffEl.appendChild(champRound);

    // Champion display
    setText("champion-name", state.championPick);
  }

  function getRegionWinner(regionKey) {
    const key = `${regionKey}_4_1`;
    const result = state.results[key];
    if (result && result.completed) {
      return { seed: "", name: result.winner, region: regionKey };
    }
    // Use pick
    const pick = state.userPicks[key] || state.finalFourPicks[regionKey];
    return { seed: "", name: pick || "TBD", region: regionKey };
  }

  function getFFWinner(gameKey) {
    const result = state.results[gameKey];
    if (result && result.completed) {
      return { seed: "", name: result.winner };
    }
    const pick = state.userPicks[gameKey];
    return { seed: "", name: pick || "TBD" };
  }

  function createFFGame(gameKey, teams) {
    const result = state.results[gameKey];
    const pick = state.userPicks[gameKey];

    const gameEl = document.createElement("div");
    gameEl.className = "game";
    gameEl.dataset.key = gameKey;

    if (result && result.completed) gameEl.classList.add("completed");

    teams.forEach(team => {
      const teamEl = document.createElement("div");
      teamEl.className = "game-team";
      teamEl.dataset.team = team.name;
      teamEl.dataset.gameKey = gameKey;

      if (team.name === pick) teamEl.classList.add("picked");

      if (result && result.completed) {
        if (team.name === result.winner) teamEl.classList.add("winner");
        else teamEl.classList.add("loser");
      } else if (isEliminated(team.name)) {
        teamEl.style.opacity = "0.4";
      }

      const regionLabel = team.region ? `<span class="seed" style="font-size:.55rem;color:var(--text-muted);">${team.region.toUpperCase()}</span>` : '<span class="seed"></span>';

      teamEl.innerHTML = `
        ${regionLabel}
        <span class="name" title="${team.name}">${team.name}</span>
        <span class="score">${getScoreDisplay(result, team.name)}</span>
      `;

      teamEl.addEventListener("click", () => handleTeamClick(gameKey, team));
      gameEl.appendChild(teamEl);
    });

    return gameEl;
  }

  // ---- Click Handlers ----
  function handleTeamClick(gameKey, team) {
    if (editMode) {
      // Set this team as the pick for this game
      state.userPicks[gameKey] = team.name;

      // Update downstream picks if needed
      propagatePick(gameKey, team.name);

      saveState();
      renderAll();
      showToast(`Picked ${team.name}`, "success");
    } else if (resultsMode) {
      openResultModal(gameKey);
    }
  }

  function propagatePick(gameKey, teamName) {
    // No automatic propagation — user picks each round manually in edit mode
  }

  // ---- Edit & Results Mode ----
  window.toggleEditMode = function () {
    editMode = !editMode;
    resultsMode = false;
    document.body.classList.toggle("edit-mode", editMode);
    const btn = document.getElementById("btn-edit");
    btn.classList.toggle("active", editMode);
    document.getElementById("btn-results").classList.remove("active");
    showToast(editMode ? "Edit mode ON — click a team to pick them" : "Edit mode OFF", "success");
  };

  window.toggleResultsMode = function () {
    resultsMode = !resultsMode;
    editMode = false;
    document.body.classList.remove("edit-mode");
    const btn = document.getElementById("btn-results");
    btn.classList.toggle("active", resultsMode);
    document.getElementById("btn-edit").classList.remove("active");
    showToast(resultsMode ? "Results mode ON — click a game to enter scores" : "Results mode OFF", "success");
  };

  window.resetData = function () {
    if (!confirm("Reset all picks and results to defaults? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    editMode = false;
    resultsMode = false;
    document.body.classList.remove("edit-mode");
    document.getElementById("btn-edit").classList.remove("active");
    document.getElementById("btn-results").classList.remove("active");
    renderAll();
    showToast("All data reset to defaults", "success");
  };

  // ---- Modal for Results Entry ----
  function openResultModal(gameKey) {
    currentModalGame = gameKey;
    const parts = gameKey.split("_");
    let regionKey, round, game;

    if (parts[0] === "ff") {
      round = parseInt(parts[1]);
      game = parseInt(parts[2]);
      regionKey = null;
    } else {
      regionKey = parts[0];
      round = parseInt(parts[1]);
      game = parseInt(parts[2]);
    }

    // Get the two teams
    let teams;
    if (regionKey) {
      teams = getTeamsForGame(regionKey, round, game);
    } else {
      // Final Four / Championship
      if (round === 5 && game === 1) {
        teams = [getRegionWinner("east"), getRegionWinner("south")];
      } else if (round === 5 && game === 2) {
        teams = [getRegionWinner("midwest"), getRegionWinner("west")];
      } else {
        teams = [getFFWinner("ff_5_1"), getFFWinner("ff_5_2")];
      }
    }

    const roundName = TOURNAMENT_DATA.roundNamesFull[round] || ("Round " + round);
    setText("modal-title", roundName + " — Enter Result");
    setText("modal-team1-label", teams[0].name);
    setText("modal-team2-label", teams[1].name);

    document.getElementById("modal-score1").value = "";
    document.getElementById("modal-score2").value = "";

    // Pre-fill if result exists
    const existing = state.results[gameKey];
    if (existing && existing.completed) {
      if (existing.winner === teams[0].name) {
        document.getElementById("modal-score1").value = existing.winnerScore || "";
        document.getElementById("modal-score2").value = existing.loserScore || "";
      } else {
        document.getElementById("modal-score1").value = existing.loserScore || "";
        document.getElementById("modal-score2").value = existing.winnerScore || "";
      }
    }

    document.getElementById("modal-overlay").classList.add("active");
    document.getElementById("modal-score1").focus();

    // Store team names on modal for submission
    document.getElementById("score-modal").dataset.team1 = teams[0].name;
    document.getElementById("score-modal").dataset.team2 = teams[1].name;
  }

  window.closeModal = function () {
    document.getElementById("modal-overlay").classList.remove("active");
    currentModalGame = null;
  };

  window.submitResult = function () {
    if (!currentModalGame) return;

    const score1 = parseInt(document.getElementById("modal-score1").value);
    const score2 = parseInt(document.getElementById("modal-score2").value);
    const modal = document.getElementById("score-modal");
    const team1 = modal.dataset.team1;
    const team2 = modal.dataset.team2;

    if (isNaN(score1) || isNaN(score2)) {
      showToast("Please enter both scores", "error");
      return;
    }

    if (score1 === score2) {
      showToast("Scores cannot be tied", "error");
      return;
    }

    const winner = score1 > score2 ? team1 : team2;
    const loser = score1 > score2 ? team2 : team1;
    const winnerScore = Math.max(score1, score2);
    const loserScore = Math.min(score1, score2);

    state.results[currentModalGame] = {
      winner,
      loser,
      winnerScore,
      loserScore,
      completed: true
    };

    saveState();
    closeModal();
    renderAll();

    const pick = state.userPicks[currentModalGame];
    if (pick === winner) {
      showToast(`${winner} wins! Your pick was correct!`, "success");
    } else {
      showToast(`${winner} wins. Your pick (${pick}) was wrong.`, "error");
    }
  };

  // Close modal on overlay click
  document.addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });

  // Close modal on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // ---- Helpers ----
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function updateTimestamp() {
    const now = new Date();
    const str = now.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit"
    });
    setText("last-updated", "Updated: " + str);
  }

  function showToast(msg, type) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.className = "toast " + (type || "") + " show";
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

})();
