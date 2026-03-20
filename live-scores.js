// ============================================================
// Live Scores — ESPN API Integration
// ============================================================

(function () {
  "use strict";

  const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard";
  const REFRESH_INTERVAL = 120000; // 2 minutes
  const STORAGE_KEY = "mm2026_bracket";

  // Map bracket team names to ESPN display names (add mismatches as discovered)
  const NAME_MAP = {
    // Bracket name → possible ESPN names (lowercase for matching)
    "Duke": ["duke blue devils", "duke"],
    "Siena": ["siena saints", "siena"],
    "Ohio State": ["ohio state buckeyes", "ohio st. buckeyes", "ohio state", "ohio st."],
    "TCU": ["tcu horned frogs", "tcu"],
    "St. John's": ["st. john's red storm", "st. john's (ny)", "st. john's", "st john's"],
    "Cal Baptist": ["california baptist lancers", "cal baptist", "california baptist", "cbu"],
    "Kansas": ["kansas jayhawks", "kansas"],
    "Louisville": ["louisville cardinals", "louisville"],
    "South Florida": ["south florida bulls", "south florida", "usf bulls", "usf"],
    "Michigan State": ["michigan state spartans", "michigan st. spartans", "michigan state", "michigan st."],
    "UCLA": ["ucla bruins", "ucla"],
    "UCF": ["ucf knights", "ucf"],
    "UConn": ["uconn huskies", "connecticut huskies", "uconn", "connecticut"],
    "Arizona": ["arizona wildcats", "arizona"],
    "Texas Tech": ["texas tech red raiders", "texas tech"],
    "Akron": ["akron zips", "akron"],
    "Alabama": ["alabama crimson tide", "alabama"],
    "Hawaii": ["hawai'i rainbow warriors", "hawaii rainbow warriors", "hawaii", "hawai'i"],
    "BYU": ["byu cougars", "brigham young cougars", "byu", "brigham young"],
    "Illinois": ["illinois fighting illini", "illinois"],
    "Houston": ["houston cougars", "houston"],
    "Michigan": ["michigan wolverines", "michigan"],
    "Vanderbilt": ["vanderbilt commodores", "vanderbilt"],
    "Arkansas": ["arkansas razorbacks", "arkansas"],
    "Gonzaga": ["gonzaga bulldogs", "gonzaga"],
    "Iowa State": ["iowa state cyclones", "iowa st. cyclones", "iowa state", "iowa st."],
    "Tennessee State": ["tennessee state tigers", "tennessee state", "tennessee st."],
    "Florida": ["florida gators", "florida"],
    "Villanova": ["villanova wildcats", "villanova"],
    "Utah State": ["utah state aggies", "utah st. aggies", "utah state", "utah st."],
    "Virginia": ["virginia cavaliers", "virginia"],
    "Miami": ["miami hurricanes", "miami (fl)", "miami"],
    "Missouri": ["missouri tigers", "missouri"],
    "Purdue": ["purdue boilermakers", "purdue"],
    "Texas": ["texas longhorns", "texas"],
    "NC State": ["nc state wolfpack", "north carolina state", "nc state"],
  };

  // Build reverse lookup: lowercase ESPN name → bracket name
  const espnToBracket = {};
  for (const [bracketName, espnNames] of Object.entries(NAME_MAP)) {
    for (const n of espnNames) {
      espnToBracket[n] = bracketName;
    }
  }

  function matchTeamName(espnName) {
    if (!espnName) return null;
    const lower = espnName.toLowerCase().trim();

    // Direct reverse lookup
    if (espnToBracket[lower]) return espnToBracket[lower];

    // Try partial matching against bracket team names
    const allTeams = getAllBracketTeams();
    for (const team of allTeams) {
      if (lower.includes(team.toLowerCase()) || team.toLowerCase().includes(lower)) {
        return team;
      }
    }

    return espnName; // fallback to ESPN name
  }

  function getAllBracketTeams() {
    const teams = [];
    for (const region of Object.values(TOURNAMENT_DATA.regions)) {
      for (const team of region.teams) {
        teams.push(team.name);
      }
    }
    return teams;
  }

  // Get tournament dates to query
  function getTournamentDates() {
    // NCAA Tournament 2026 dates
    const dates = [];
    // First Four: March 17-18
    // R64: March 19-20
    // R32: March 21-22
    // Sweet 16: March 26-27
    // Elite 8: March 28-29
    // Final Four: April 4
    // Championship: April 6
    const tourneyDays = [
      "20260317", "20260318", "20260319", "20260320",
      "20260321", "20260322", "20260326", "20260327",
      "20260328", "20260329", "20260404", "20260406"
    ];

    // Only query today and yesterday (to catch late games)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const fmt = (d) => d.getFullYear().toString() +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      d.getDate().toString().padStart(2, "0");

    const todayStr = fmt(today);
    const yesterdayStr = fmt(yesterday);

    // Return today + yesterday if they fall within tournament dates
    // Also always include all past tournament dates to catch completed games
    const result = [];
    for (const d of tourneyDays) {
      if (d <= todayStr) result.push(d);
    }
    return result.length > 0 ? result : [todayStr];
  }

  // Find the bracket game key for a matchup between two teams
  function findGameKey(team1, team2) {
    const regions = ["east", "south", "midwest", "west"];

    for (const regionKey of regions) {
      const regionTeams = TOURNAMENT_DATA.regions[regionKey].teams;
      const regionTeamNames = regionTeams.map(t => t.name);

      const t1InRegion = regionTeamNames.includes(team1);
      const t2InRegion = regionTeamNames.includes(team2);

      if (t1InRegion && t2InRegion) {
        // Both teams in same region — find the round and game
        return findRegionalGameKey(regionKey, team1, team2);
      }
    }

    // Check Final Four matchups
    return findFinalFourGameKey(team1, team2);
  }

  function findRegionalGameKey(regionKey, team1, team2) {
    // Check all rounds
    for (let round = 1; round <= 4; round++) {
      const gamesInRound = 8 / Math.pow(2, round - 1);
      for (let game = 1; game <= gamesInRound; game++) {
        const gameKey = `${regionKey}_${round}_${game}`;
        const teams = getTeamsForGameLive(regionKey, round, game);
        const names = teams.map(t => t.name);
        if (names.includes(team1) && names.includes(team2)) {
          return gameKey;
        }
      }
    }
    return null;
  }

  function findFinalFourGameKey(team1, team2) {
    // Check FF semis and championship
    const ffKeys = ["ff_5_1", "ff_5_2", "ff_6_1"];
    for (const key of ffKeys) {
      // We can't easily determine FF matchups without results flowing through,
      // so we'll match any FF game where both teams appear
      const state = loadCurrentState();
      const pick1 = state.userPicks[key];
      // For FF games, check if both teams are region winners or FF winners
      // This is a simplified check
    }
    return null;
  }

  function getTeamsForGameLive(regionKey, round, game) {
    const teams = TOURNAMENT_DATA.regions[regionKey].teams;
    if (round === 1) {
      const idx = (game - 1) * 2;
      return [teams[idx], teams[idx + 1]];
    }
    // For later rounds, derive from results or picks
    const state = loadCurrentState();
    const prevRound = round - 1;
    const game1 = (game - 1) * 2 + 1;
    const game2 = (game - 1) * 2 + 2;
    const key1 = `${regionKey}_${prevRound}_${game1}`;
    const key2 = `${regionKey}_${prevRound}_${game2}`;

    const t1 = getWinnerFromResults(key1, regionKey) || { seed: "?", name: "TBD" };
    const t2 = getWinnerFromResults(key2, regionKey) || { seed: "?", name: "TBD" };
    return [t1, t2];
  }

  function getWinnerFromResults(gameKey, regionKey) {
    const state = loadCurrentState();
    const result = state.results[gameKey];
    if (result && result.completed) {
      const teams = TOURNAMENT_DATA.regions[regionKey].teams;
      return teams.find(t => t.name === result.winner) || { seed: "?", name: result.winner };
    }
    return null;
  }

  function loadCurrentState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return { userPicks: { ...TOURNAMENT_DATA.userPicks }, results: {} };
  }

  function saveResults(results) {
    const state = loadCurrentState();
    let changed = false;

    for (const [key, result] of Object.entries(results)) {
      if (!state.results[key] || !state.results[key].completed) {
        state.results[key] = result;
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    }
    return false;
  }

  // Fetch scores from ESPN
  async function fetchScores() {
    const dates = getTournamentDates();
    const allGames = [];

    for (const date of dates) {
      try {
        const url = `${ESPN_BASE}?dates=${date}&groups=100&limit=100`;
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();

        if (data.events) {
          for (const event of data.events) {
            const competition = event.competitions?.[0];
            if (!competition) continue;

            const statusType = competition.status?.type?.name;
            const isComplete = statusType === "STATUS_FINAL";
            const isInProgress = statusType === "STATUS_IN_PROGRESS" || statusType === "STATUS_HALFTIME";

            if (!isComplete && !isInProgress) continue;

            const competitors = competition.competitors || [];
            if (competitors.length !== 2) continue;

            const home = competitors.find(c => c.homeAway === "home");
            const away = competitors.find(c => c.homeAway === "away");
            if (!home || !away) continue;

            const homeTeam = matchTeamName(home.team?.displayName || home.team?.name);
            const awayTeam = matchTeamName(away.team?.displayName || away.team?.name);
            const homeScore = parseInt(home.score);
            const awayScore = parseInt(away.score);

            allGames.push({
              homeTeam,
              awayTeam,
              homeScore,
              awayScore,
              isComplete,
              isInProgress,
              statusDetail: competition.status?.type?.detail || "",
              clock: competition.status?.displayClock || "",
              period: competition.status?.period || 0,
            });
          }
        }
      } catch (e) {
        console.warn("Failed to fetch ESPN scores for", date, e);
      }
    }

    return allGames;
  }

  // Process fetched games and update bracket
  async function updateLiveScores() {
    const statusEl = document.getElementById("live-status");
    const dotEl = document.getElementById("live-dot");
    const textEl = document.getElementById("live-text");

    if (statusEl) statusEl.style.display = "flex";
    if (textEl) textEl.textContent = "Fetching scores...";

    try {
      const games = await fetchScores();
      const newResults = {};
      let liveCount = 0;
      let completedCount = 0;

      for (const game of games) {
        if (game.isComplete) {
          const gameKey = findGameKey(game.homeTeam, game.awayTeam) ||
                          findGameKey(game.awayTeam, game.homeTeam);

          if (gameKey) {
            const winner = game.homeScore > game.awayScore ? game.homeTeam : game.awayTeam;
            const loser = game.homeScore > game.awayScore ? game.awayTeam : game.homeTeam;
            const winnerScore = Math.max(game.homeScore, game.awayScore);
            const loserScore = Math.min(game.homeScore, game.awayScore);

            newResults[gameKey] = {
              winner,
              loser,
              winnerScore,
              loserScore,
              completed: true,
            };
            completedCount++;
          }
        } else if (game.isInProgress) {
          liveCount++;
        }
      }

      // Save and re-render if anything changed
      if (Object.keys(newResults).length > 0) {
        const changed = saveResults(newResults);
        if (changed) {
          // Reload state and re-render (trigger the main app's render)
          window.dispatchEvent(new CustomEvent("live-scores-updated"));
        }
      }

      // Update status indicator
      const now = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      if (liveCount > 0) {
        if (dotEl) { dotEl.className = "live-dot live"; }
        if (textEl) { textEl.textContent = `LIVE — ${liveCount} game${liveCount > 1 ? "s" : ""} in progress • Updated ${now}`; }
      } else if (completedCount > 0) {
        if (dotEl) { dotEl.className = "live-dot idle"; }
        if (textEl) { textEl.textContent = `${completedCount} result${completedCount > 1 ? "s" : ""} synced • Updated ${now}`; }
      } else {
        if (dotEl) { dotEl.className = "live-dot idle"; }
        if (textEl) { textEl.textContent = `No games right now • Updated ${now}`; }
      }

    } catch (e) {
      console.error("Live scores error:", e);
      if (dotEl) { dotEl.className = "live-dot error"; }
      if (textEl) { textEl.textContent = "Failed to fetch scores"; }
    }
  }

  // Initialize
  function init() {
    // Create live status indicator in the header
    const headerMeta = document.querySelector(".header-meta");
    if (headerMeta) {
      const liveEl = document.createElement("span");
      liveEl.id = "live-status";
      liveEl.style.display = "flex";
      liveEl.style.alignItems = "center";
      liveEl.style.gap = "0.4rem";
      liveEl.innerHTML = `
        <span class="live-dot idle" id="live-dot"></span>
        <span id="live-text">Connecting to ESPN...</span>
      `;
      headerMeta.appendChild(liveEl);
    }

    // Add refresh button to toolbar
    const toolbar = document.querySelector(".toolbar");
    if (toolbar) {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.innerHTML = "📡 Refresh Scores";
      btn.onclick = () => updateLiveScores();
      toolbar.appendChild(btn);
    }

    // Fetch immediately, then on interval
    updateLiveScores();
    setInterval(updateLiveScores, REFRESH_INTERVAL);
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // Small delay to let main app initialize first
    setTimeout(init, 100);
  }

})();
