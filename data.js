// ============================================================
// 2026 NCAA March Madness Tournament Data
// ============================================================

const TOURNAMENT_DATA = {
  year: 2026,
  dates: {
    firstFour: "March 17-18",
    firstRound: "March 19-20",
    secondRound: "March 21-22",
    sweet16: "March 26-27",
    elite8: "March 28-29",
    finalFour: "April 4",
    championship: "April 6"
  },

  // Scoring system (ESPN standard)
  scoring: {
    1: 10,   // Round of 64
    2: 20,   // Round of 32
    3: 40,   // Sweet 16
    4: 80,   // Elite 8
    5: 160,  // Final Four
    6: 320   // Championship
  },

  roundNames: {
    1: "R64",
    2: "R32",
    3: "Sweet 16",
    4: "Elite 8",
    5: "Final Four",
    6: "Championship"
  },

  roundNamesFull: {
    1: "Round of 64",
    2: "Round of 32",
    3: "Sweet 16",
    4: "Elite Eight",
    5: "Final Four",
    6: "Championship"
  },

  // All 4 regions with seeded teams
  // Teams are ordered for bracket matchups: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
  regions: {
    east: {
      name: "East",
      teams: [
        { seed: 1,  name: "Duke",            record: "32-2" },
        { seed: 16, name: "Siena",           record: "" },
        { seed: 8,  name: "Ohio State",      record: "" },
        { seed: 9,  name: "TCU",             record: "" },
        { seed: 5,  name: "St. John's",      record: "" },
        { seed: 12, name: "Cal Baptist",     record: "" },
        { seed: 4,  name: "Kansas",          record: "" },
        { seed: 13, name: "East 13 Seed",    record: "" },
        { seed: 6,  name: "Louisville",      record: "" },
        { seed: 11, name: "South Florida",   record: "" },
        { seed: 3,  name: "Michigan State",  record: "" },
        { seed: 14, name: "East 14 Seed",    record: "" },
        { seed: 7,  name: "UCLA",            record: "" },
        { seed: 10, name: "UCF",             record: "" },
        { seed: 2,  name: "UConn",           record: "" },
        { seed: 15, name: "East 15 Seed",    record: "" }
      ]
    },
    south: {
      name: "South",
      teams: [
        { seed: 1,  name: "Arizona",         record: "32-2" },
        { seed: 16, name: "South 16 Seed",   record: "" },
        { seed: 8,  name: "South 8 Seed",    record: "" },
        { seed: 9,  name: "South 9 Seed",    record: "" },
        { seed: 5,  name: "Texas Tech",      record: "" },
        { seed: 12, name: "Akron",           record: "" },
        { seed: 4,  name: "Alabama",         record: "" },
        { seed: 13, name: "Hawaii",          record: "" },
        { seed: 6,  name: "BYU",             record: "" },
        { seed: 11, name: "Texas/NC State",  record: "" },
        { seed: 3,  name: "Illinois",        record: "" },
        { seed: 14, name: "South 14 Seed",   record: "" },
        { seed: 7,  name: "South 7 Seed",    record: "" },
        { seed: 10, name: "South 10 Seed",   record: "" },
        { seed: 2,  name: "Houston",         record: "" },
        { seed: 15, name: "South 15 Seed",   record: "" }
      ]
    },
    midwest: {
      name: "Midwest",
      teams: [
        { seed: 1,  name: "Michigan",          record: "31-3" },
        { seed: 16, name: "Midwest 16 Seed",   record: "" },
        { seed: 8,  name: "Midwest 8 Seed",    record: "" },
        { seed: 9,  name: "Midwest 9 Seed",    record: "" },
        { seed: 5,  name: "Vanderbilt",        record: "" },
        { seed: 12, name: "Midwest 12 Seed",   record: "" },
        { seed: 4,  name: "Arkansas",          record: "" },
        { seed: 13, name: "Midwest 13 Seed",   record: "" },
        { seed: 6,  name: "Midwest 6 Seed",    record: "" },
        { seed: 11, name: "Midwest 11 Seed",   record: "" },
        { seed: 3,  name: "Gonzaga",           record: "" },
        { seed: 14, name: "Midwest 14 Seed",   record: "" },
        { seed: 7,  name: "Midwest 7 Seed",    record: "" },
        { seed: 10, name: "Midwest 10 Seed",   record: "" },
        { seed: 2,  name: "Iowa State",        record: "" },
        { seed: 15, name: "Tennessee State",   record: "" }
      ]
    },
    west: {
      name: "West",
      teams: [
        { seed: 1,  name: "Florida",         record: "26-7" },
        { seed: 16, name: "West 16 Seed",    record: "" },
        { seed: 8,  name: "Villanova",       record: "" },
        { seed: 9,  name: "Utah State",      record: "" },
        { seed: 5,  name: "West 5 Seed",     record: "" },
        { seed: 12, name: "West 12 Seed",    record: "" },
        { seed: 4,  name: "West 4 Seed",     record: "" },
        { seed: 13, name: "West 13 Seed",    record: "" },
        { seed: 6,  name: "West 6 Seed",     record: "" },
        { seed: 11, name: "West 11 Seed",    record: "" },
        { seed: 3,  name: "Virginia",        record: "" },
        { seed: 14, name: "West 14 Seed",    record: "" },
        { seed: 7,  name: "Miami",           record: "" },
        { seed: 10, name: "Missouri",        record: "" },
        { seed: 2,  name: "Purdue",          record: "" },
        { seed: 15, name: "West 15 Seed",    record: "" }
      ]
    }
  },

  // User's bracket picks for each round
  // Format: region_round_game
  userPicks: {
    // EAST - Round of 64 (8 games: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
    east_1_1: "Duke",
    east_1_2: "Ohio State",
    east_1_3: "St. John's",
    east_1_4: "Kansas",
    east_1_5: "Louisville",
    east_1_6: "Michigan State",
    east_1_7: "UCLA",
    east_1_8: "UConn",
    // EAST - Round of 32
    east_2_1: "Duke",
    east_2_2: "Kansas",
    east_2_3: "Michigan State",
    east_2_4: "UConn",
    // EAST - Sweet 16
    east_3_1: "Duke",
    east_3_2: "UConn",
    // EAST - Elite 8
    east_4_1: "Duke",

    // SOUTH - Round of 64
    south_1_1: "Arizona",
    south_1_2: "South 8 Seed",
    south_1_3: "Texas Tech",
    south_1_4: "Alabama",
    south_1_5: "BYU",
    south_1_6: "Illinois",
    south_1_7: "South 7 Seed",
    south_1_8: "Houston",
    // SOUTH - Round of 32
    south_2_1: "Arizona",
    south_2_2: "Alabama",
    south_2_3: "Illinois",
    south_2_4: "Houston",
    // SOUTH - Sweet 16
    south_3_1: "Arizona",
    south_3_2: "Houston",
    // SOUTH - Elite 8
    south_4_1: "Houston",

    // MIDWEST - Round of 64
    midwest_1_1: "Michigan",
    midwest_1_2: "Midwest 8 Seed",
    midwest_1_3: "Vanderbilt",
    midwest_1_4: "Arkansas",
    midwest_1_5: "Midwest 6 Seed",
    midwest_1_6: "Gonzaga",
    midwest_1_7: "Midwest 7 Seed",
    midwest_1_8: "Iowa State",
    // MIDWEST - Round of 32
    midwest_2_1: "Michigan",
    midwest_2_2: "Arkansas",
    midwest_2_3: "Gonzaga",
    midwest_2_4: "Iowa State",
    // MIDWEST - Sweet 16
    midwest_3_1: "Michigan",
    midwest_3_2: "Iowa State",
    // MIDWEST - Elite 8
    midwest_4_1: "Michigan",

    // WEST - Round of 64
    west_1_1: "Florida",
    west_1_2: "Villanova",
    west_1_3: "West 5 Seed",
    west_1_4: "West 4 Seed",
    west_1_5: "West 6 Seed",
    west_1_6: "Virginia",
    west_1_7: "Miami",
    west_1_8: "Purdue",
    // WEST - Round of 32
    west_2_1: "Florida",
    west_2_2: "West 4 Seed",
    west_2_3: "Virginia",
    west_2_4: "Purdue",
    // WEST - Sweet 16
    west_3_1: "Florida",
    west_3_2: "Purdue",
    // WEST - Elite 8
    west_4_1: "Florida",

    // FINAL FOUR
    // Semifinal 1: East vs South
    ff_5_1: "Duke",
    // Semifinal 2: Midwest vs West
    ff_5_2: "Arizona",

    // CHAMPIONSHIP
    ff_6_1: "Arizona"
  },

  // Final Four display picks
  finalFourPicks: {
    east: "Duke",
    south: "Houston",
    midwest: "Michigan",
    west: "Florida"
  },

  // Championship: Arizona over Duke
  championshipMatchup: {
    team1: "Duke",
    team2: "Arizona",
    pick: "Arizona"
  },

  championPick: "Arizona",

  // Actual results - filled in as games are played
  // Format: { winner: "Team", loser: "Team", winnerScore: 75, loserScore: 68, completed: true }
  results: {}
};

Object.freeze(TOURNAMENT_DATA.scoring);
Object.freeze(TOURNAMENT_DATA.roundNames);
