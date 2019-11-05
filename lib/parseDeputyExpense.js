const fs = require("fs");

// Fetch expenditure data
const expenses_data = fs.readFileSync("../data/expenses.json");
const expenses = {};

for (const obj of JSON.parse(expenses_data)) {
  const exense = obj["c"];
  expenses[exense["codDocumento"]] = exense;
}

// Fetch deputy data
const deputy = JSON.parse(expenses_data)[0]["d"];

// Generate graph
const graph = {
  nodes: [{ id: -1, name: deputy["nome"] }],
  links: []
};

for (const expense_id in expenses) {
  const expense = expenses[expense_id];

  // Party nodes
  graph["nodes"].push({
    id: expense["codDocumento"],
    name: expense["nomeFornecedor"],
    val: expense["valorDocumento"] / 100.0,
    desc: expense["valorDocumento"],
    group: expense["nomeFornecedor"]
  });

  // Edges between expense and deputy
  graph["links"].push({
    source: -1,
    target: expense["codDocumento"],
    value: expense["valorDocumento"]
  });
}

// Save graph to file
const stringified_graph = JSON.stringify(graph);
fs.writeFileSync("deputy_expense_graph.json", stringified_graph);
