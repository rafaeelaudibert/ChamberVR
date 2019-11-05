const fs = require("fs");

// Fetch parties data
const parties_data = fs.readFileSync("../data/parties.json");
const parties = {};

for (const obj of JSON.parse(parties_data)) {
  const party = obj["p"];
  parties[party["sigla"]] = party;
}

// Fetch deputies data
const deputies_data = fs.readFileSync("../data/deputies.json");
const deputies = {};

for (const obj of JSON.parse(deputies_data)) {
  const deputy = obj["d"];
  deputies[deputy["id"]] = deputy;
  deputies[deputy["id"]]["p_id"] = obj["p.id"];
}

// Generate graph
const graph = {
  nodes: [{ id: 0, name: "Camara dos Deputados", group: 0, val: 517 }],
  links: []
};

for (const party_id in parties) {
  const party = parties[party_id];

  // Party nodes
  graph["nodes"].push({
    id: party["id"],
    name: party["nome"],
    val: party["totalMembros"],
    desc: party["sigla"],
    group: 0
  });

  // Edges between parties and Deputies' Camara
  graph["links"].push({
    source: 0,
    target: party["id"],
    value: 5
  });
}

for (const deputy_id in deputies) {
  const deputy = deputies[deputy_id];

  // Deputies node
  graph["nodes"].push({
    id: deputy["id"],
    name: deputy["nome"],
    group: deputy["p_id"],
    val: 1
  });

  // Edge between the party and the deputy
  graph["links"].push({
    source: deputy["p_id"],
    target: deputy["id"],
    value: 1 // Used to create directional link effects
  });
}

// Save graph to file
const stringified_graph = JSON.stringify(graph);
fs.writeFileSync("party_deputy_graph.json", stringified_graph);
