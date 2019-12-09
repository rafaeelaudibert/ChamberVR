const fs = require("fs");

// Fetch expenditure data
const expenses_data = fs
  .readFileSync("../assets/data/despesas.json")
  .toString()
  .slice(1);
// console.log(expenses_data);
const expenses = JSON.parse(expenses_data);

// Fetch deputies data
const deputies_data = fs
  .readFileSync("../assets/data/deputies.json")
  .toString()
  .slice(1);
const deputies_raw = JSON.parse(deputies_data).map(d => d["d"]["properties"]);
const deputies = {};
for (let deputy of deputies_raw) {
  deputies[deputy["id"]] = deputy;
  deputies[deputy["id"]]["expenses"] = [];
}

// Add each expense for their correspondent deputy
const errors = {};
for (let expense of expenses) {
  const deputy_id = expense["d.id"];
  deputies[deputy_id]["expenses"].push(expense);
}

// For each deputy, create its file with its expenses
for (let deputy_id in deputies) {
  const deputy = deputies[deputy_id];
  // Generate graph
  const graph = {
    nodes: [
      { id: -100, name: deputy["nome"] },
      { id: -4, name: "Voltar", val: 50000 },
      { id: -3, name: "Placeholder", val: 1 },
      { id: -3, name: "Visualizar fichas", val: 50000 }
    ],
    links: []
  };

  const fornecedores = {};

  for (const expense of deputy["expenses"]) {
    const fornecedor = expense["des"]["properties"]["nomeFornecedor"];
    if (fornecedor in fornecedores) {
      fornecedores[fornecedor].push(expense);
    } else {
      fornecedores[fornecedor] = [expense];
    }
  }

  let totalExpense = 0;
  for (const fornecedor in fornecedores) {
    const expenses = fornecedores[fornecedor];
    const totalValue = expenses.reduce(
      (acc, val) =>
        acc + parseFloat(val["des"]["properties"]["valorDocumento"]),
      0
    );
    totalExpense += totalValue;

    // Fornecedor nodes
    graph["nodes"].push({
      id: fornecedor,
      name: fornecedor,
      val: Math.sqrt(totalValue) * Math.max(1, totalValue / 1000),
      desc: totalValue.toFixed(2),
      group: fornecedor
    });

    // Edges between fornecedor and deputy
    graph["links"].push({
      source: -100,
      target: fornecedor,
      value: totalValue
    });

    // For each expense
    for (const expense of expenses) {
      // console.log(expense);
      const expenseValue = expense["des"]["properties"]["valorDocumento"];
      const identity = expense["des"]["identity"];

      // Expense nodes
      graph["nodes"].push({
        id: identity,
        name: expenseValue.toFixed(2),
        val: (Math.sqrt(expenseValue) * 1.5) / 2,
        group: fornecedor
      });

      // Edges between expense and fornecedores
      graph["links"].push({
        source: fornecedor,
        target: identity,
        value: expenseValue
      });
    }
  }

  // Accumulate value for deputy
  graph["nodes"][0].desc = totalExpense.toFixed(2);

  // Save graph to file
  const stringified_graph = JSON.stringify(graph, null, "\t");
  fs.writeFileSync(
    `../assets/data/deputy_expense_graph.${deputy_id}.json`,
    stringified_graph
  );
}
