// ============================================================
// 2026 NCAA March Madness Tournament Data
// Elliott Kunkel's Bracket
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
  // Teams ordered for bracket matchups: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
  regions: {
    east: {
      name: "East",
      teams: [
        { seed: 1,  name: "Duke" },
        { seed: 16, name: "Siena" },
        { seed: 8,  name: "Ohio State" },
        { seed: 9,  name: "TCU" },
        { seed: 5,  name: "St. John's" },
        { seed: 12, name: "Northern Iowa" },
        { seed: 4,  name: "Kansas" },
        { seed: 13, name: "Cal Baptist" },
        { seed: 6,  name: "Louisville" },
        { seed: 11, name: "South Florida" },
        { seed: 3,  name: "Michigan State" },
        { seed: 14, name: "North Dakota St." },
        { seed: 7,  name: "UCLA" },
        { seed: 10, name: "UCF" },
        { seed: 2,  name: "UConn" },
        { seed: 15, name: "Furman" }
      ]
    },
    south: {
      name: "South",
      teams: [
        { seed: 1,  name: "Florida" },
        { seed: 16, name: "Prairie View A&M" },
        { seed: 8,  name: "Clemson" },
        { seed: 9,  name: "Iowa" },
        { seed: 5,  name: "Vanderbilt" },
        { seed: 12, name: "McNeese" },
        { seed: 4,  name: "Nebraska" },
        { seed: 13, name: "Troy" },
        { seed: 6,  name: "North Carolina" },
        { seed: 11, name: "VCU" },
        { seed: 3,  name: "Illinois" },
        { seed: 14, name: "Penn" },
        { seed: 7,  name: "Saint Mary's" },
        { seed: 10, name: "Texas A&M" },
        { seed: 2,  name: "Houston" },
        { seed: 15, name: "Idaho" }
      ]
    },
    west: {
      name: "West",
      teams: [
        { seed: 1,  name: "Arizona" },
        { seed: 16, name: "LIU" },
        { seed: 8,  name: "Villanova" },
        { seed: 9,  name: "Utah State" },
        { seed: 5,  name: "Wisconsin" },
        { seed: 12, name: "High Point" },
        { seed: 4,  name: "Arkansas" },
        { seed: 13, name: "Hawaii" },
        { seed: 6,  name: "BYU" },
        { seed: 11, name: "Texas" },
        { seed: 3,  name: "Gonzaga" },
        { seed: 14, name: "Kennesaw St." },
        { seed: 7,  name: "Miami" },
        { seed: 10, name: "Missouri" },
        { seed: 2,  name: "Purdue" },
        { seed: 15, name: "Queens" }
      ]
    },
    midwest: {
      name: "Midwest",
      teams: [
        { seed: 1,  name: "Michigan" },
        { seed: 16, name: "Howard" },
        { seed: 8,  name: "Georgia" },
        { seed: 9,  name: "Saint Louis" },
        { seed: 5,  name: "Texas Tech" },
        { seed: 12, name: "Akron" },
        { seed: 4,  name: "Alabama" },
        { seed: 13, name: "Hofstra" },
        { seed: 6,  name: "Tennessee" },
        { seed: 11, name: "Miami (OH)" },
        { seed: 3,  name: "Virginia" },
        { seed: 14, name: "Wright State" },
        { seed: 7,  name: "Kentucky" },
        { seed: 10, name: "Santa Clara" },
        { seed: 2,  name: "Iowa State" },
        { seed: 15, name: "Tennessee State" }
      ]
    }
  },

  // Elliott's bracket picks for each round
  // Format: region_round_game
  userPicks: {
    // ========== EAST ==========
    // R64: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
    east_1_1: "Duke",
    east_1_2: "TCU",
    east_1_3: "St. John's",
    east_1_4: "Kansas",
    east_1_5: "Louisville",
    east_1_6: "Michigan State",
    east_1_7: "UCF",
    east_1_8: "UConn",
    // R32
    east_2_1: "Duke",          // Duke vs TCU
    east_2_2: "Kansas",         // St. John's vs Kansas
    east_2_3: "Michigan State", // Louisville vs Michigan State
    east_2_4: "UConn",         // UCF vs UConn
    // Sweet 16
    east_3_1: "Duke",          // Duke vs Kansas
    east_3_2: "UConn",         // Michigan State vs UConn
    // Elite 8
    east_4_1: "UConn",         // Duke vs UConn

    // ========== SOUTH ==========
    // R64: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
    south_1_1: "Florida",
    south_1_2: "Iowa",
    south_1_3: "McNeese",       // 12 over 5 upset
    south_1_4: "Nebraska",
    south_1_5: "VCU",           // 11 over 6 upset
    south_1_6: "Illinois",
    south_1_7: "Texas A&M",
    south_1_8: "Houston",
    // R32
    south_2_1: "Florida",      // Florida vs Iowa
    south_2_2: "McNeese",      // McNeese vs Nebraska (12 seed run!)
    south_2_3: "Illinois",     // VCU vs Illinois
    south_2_4: "Houston",      // Texas A&M vs Houston
    // Sweet 16
    south_3_1: "Florida",      // Florida vs McNeese
    south_3_2: "Houston",      // Illinois vs Houston
    // Elite 8
    south_4_1: "Houston",      // Florida vs Houston

    // ========== WEST ==========
    // R64: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
    west_1_1: "Arizona",
    west_1_2: "Utah State",    // 9 over 8
    west_1_3: "Wisconsin",
    west_1_4: "Hawaii",        // 13 over 4 upset!
    west_1_5: "Texas",         // 11 over 6 upset
    west_1_6: "Gonzaga",
    west_1_7: "Missouri",      // 10 over 7
    west_1_8: "Purdue",
    // R32
    west_2_1: "Arizona",       // Arizona vs Utah State
    west_2_2: "Hawaii",        // Wisconsin vs Hawaii (13 seed run!)
    west_2_3: "Gonzaga",       // Texas vs Gonzaga
    west_2_4: "Purdue",        // Missouri vs Purdue
    // Sweet 16
    west_3_1: "Arizona",       // Arizona vs Hawaii
    west_3_2: "Gonzaga",       // Gonzaga vs Purdue
    // Elite 8
    west_4_1: "Gonzaga",       // Arizona vs Gonzaga

    // ========== MIDWEST ==========
    // R64: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
    midwest_1_1: "Michigan",
    midwest_1_2: "Saint Louis", // 9 over 8
    midwest_1_3: "Texas Tech",
    midwest_1_4: "Alabama",
    midwest_1_5: "Tennessee",
    midwest_1_6: "Virginia",
    midwest_1_7: "Santa Clara", // 10 over 7 upset
    midwest_1_8: "Iowa State",
    // R32
    midwest_2_1: "Michigan",    // Michigan vs Saint Louis
    midwest_2_2: "Alabama",     // Texas Tech vs Alabama
    midwest_2_3: "Tennessee",   // Tennessee vs Virginia
    midwest_2_4: "Iowa State",  // Santa Clara vs Iowa State
    // Sweet 16
    midwest_3_1: "Michigan",    // Michigan vs Alabama
    midwest_3_2: "Tennessee",   // Tennessee vs Iowa State
    // Elite 8
    midwest_4_1: "Michigan",    // Michigan vs Tennessee

    // ========== FINAL FOUR ==========
    // Semi 1: East vs South
    ff_5_1: "Houston",          // UConn vs Houston
    // Semi 2: West vs Midwest
    ff_5_2: "Michigan",         // Gonzaga vs Michigan

    // ========== CHAMPIONSHIP ==========
    ff_6_1: "Michigan"          // Houston vs Michigan
  },

  // Final Four display picks
  finalFourPicks: {
    east: "UConn",
    south: "Houston",
    west: "Gonzaga",
    midwest: "Michigan"
  },

  // Championship: Michigan over Houston
  championshipMatchup: {
    team1: "Houston",
    team2: "Michigan",
    pick: "Michigan"
  },

  championPick: "Michigan",

  // Actual results - filled in as games are played
  // Format: { winner: "Team", loser: "Team", winnerScore: 75, loserScore: 68, completed: true }
  results: {}
};

Object.freeze(TOURNAMENT_DATA.scoring);
Object.freeze(TOURNAMENT_DATA.roundNames);
