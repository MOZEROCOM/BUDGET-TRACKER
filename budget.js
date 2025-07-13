let balance = 0;
let incomeTotal=0;
let expenseTotal=0;
let filterKeyword = "";
let incomeChart = null;
let expenseChart = null;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const balanceEl = document.getElementById("balance");
const transaction_list = document.getElementById("transactions");
const form = document.getElementById("entryForm");
const formex = document.getElementById("entryFormex");
const descInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const amountInputex = document.getElementById("amountex");
const descInputex = document.getElementById("descriptionex");
const IT=document.getElementById("incomeTotal");
const ET=document.getElementById("expenseTotal");


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = descInput.value;
  const amount = parseFloat(amountInput.value);
  const category = document.getElementById("category").value;


  if (desc && !isNaN(amount)) {
    transactions.push({ desc, amount, date: new Date().toLocaleDateString() ,category});
    descInput.value = "";
    amountInput.value = "";
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateDOM();
  }
});

formex.addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = descInputex.value;
  const amount = parseFloat(amountInputex.value);
  const category = document.getElementById("categoryex").value;


  if (desc && !isNaN(amount)) {
    transactions.push({ desc, amount: -Math.abs(amount) ,date: new Date().toLocaleDateString(),category});
    descInputex.value = "";
    amountInputex.value = "";
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateDOM();
  }
});

function updateDOM() {
  transaction_list.innerHTML = "";
  balance = 0; 
  let filteredTransactions = transactions.filter(function (item) {
  return item && item.desc && item.desc.toLowerCase().includes(filterKeyword.toLowerCase());
}); 
  
  filteredTransactions.forEach((item, index) => {
    
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.padding = "5px";
    li.style.marginBottom = "5px";
    const text = document.createElement("span");
    text.textContent = `${item.desc} : ${Math.abs(item.amount)}   on ${item.date}`;

    text.style.marginRight = "10px";
    text.style.color = item.amount >= 0 ? "green" : "red";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Delete";
    deleteBtn.style.padding = "4px 8px";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.cursor = "pointer";

    deleteBtn.onclick = () => {
  if (confirm("Delete this transaction?")) {
    transactions.splice(index, 1);
localStorage.setItem("transactions", JSON.stringify(transactions));
    updateDOM();  }
};


    if (item.desc!=null&&item.amount!=null){
     li.appendChild(text);
     li.appendChild(deleteBtn);

    };
 incomeTotal = transactions
  .filter(t => t.amount > 0)
  .reduce((sum, t) => sum + t.amount, 0);
 expenseTotal = transactions
  .filter(t => t.amount < 0)
  .reduce((sum, t) => sum + Math.abs(t.amount), 0);


    transaction_list.appendChild(li);
    balance +=item.amount;
  });
  
  IT.textContent =`${incomeTotal.toFixed(2)}`;
  ET.textContent = `${expenseTotal.toFixed(2)}`;
  balanceEl.textContent = balance.toFixed(2);
  drawCharts();

}
updateDOM();

function exportToCSV() {
  let csv = "Description,Amount,Date\n" + 
    transactions.map(t => `${t.desc},${t.amount},${t.date || ""}`).join("\n");

  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "budget_data.csv";
  a.click();
}
function filterTransactions() {
  const input = document.getElementById("searchInput").value;
  filterKeyword = input;
  updateDOM();
}





function drawCharts() {
  console.log(transactions)
  const incomeCategories = {};
  const expenseCategories = {};

  transactions.forEach(t => {
    if (t.category) {
      const cat = t.category;
      if (t.amount >= 0) {
        incomeCategories[cat] = (incomeCategories[cat] || 0) + t.amount;
      } else {
        expenseCategories[cat] = (expenseCategories[cat] || 0) + Math.abs(t.amount);
      }
    }
  });

  // Income Chart: No Data Check
  if (Object.keys(incomeCategories).length === 0) {
    const incomeCtx = document.getElementById("incomeChart").getContext("2d");
    incomeCtx.clearRect(0, 0, 400, 400);
    incomeCtx.font = '20px Arial';
    incomeCtx.fillStyle = 'gray';
    incomeCtx.textAlign = 'center';
    incomeCtx.fillText('No income data yet', 200, 200);
    if (incomeChart) {
      incomeChart.destroy();
      incomeChart = null;
    }
  } else {
    if (incomeChart) incomeChart.destroy();
    const incomeCtx = document.getElementById("incomeChart").getContext("2d");
    incomeChart = new Chart(incomeCtx, {
      type: "pie",
      data: {
        labels: Object.keys(incomeCategories),
        datasets: [{
          data: Object.values(incomeCategories),
          backgroundColor: ["#4bc0c0", "#36a2eb", "#9966ff", "#00a676"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#000" }
          },
          title: {
            display: true,
            text: "Income by Category",
            color: "#000"
          }
        }
      }
    });
  }

  // Expense Chart: No Data Check
  if (Object.keys(expenseCategories).length === 0) {
    const expenseCtx = document.getElementById("expenseChart").getContext("2d");
    expenseCtx.clearRect(0, 0, 400, 400);
    expenseCtx.font = '20px Arial';
    expenseCtx.fillStyle = 'gray';
    expenseCtx.textAlign = 'center';
    expenseCtx.fillText('No expense data yet', 200, 200);
    if (expenseChart) {
      expenseChart.destroy();
      expenseChart = null;
    }
  } else {
    if (expenseChart) expenseChart.destroy();
    const expenseCtx = document.getElementById("expenseChart").getContext("2d");
    expenseChart = new Chart(expenseCtx, {
      type: "pie",
      data: {
        labels: Object.keys(expenseCategories),
        datasets: [{
          data: Object.values(expenseCategories),
          backgroundColor: ["#ff6384", "#ffcd56", "#ff9f40", "#ff6384"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#000" }
          },
          title: {
            display: true,
            text: "Expenses by Category",
            color: "#000"
          }
        }
      }
    });
  }
}
