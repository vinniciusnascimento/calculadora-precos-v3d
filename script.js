let product = document.querySelector("#product");
let price = document.querySelector("#price-add");
let quantity = document.querySelector("#quantity-add");
let button_add = document.querySelector("#add");

let table = document.querySelector("table");

let adds = [];

button_add.addEventListener("click", () => {

    // cria o novo produto
    let newProduct = {
        id: adds.length + 1,
        product: product.value,
        price: Number(price.value),
        quantity: Number(quantity.value)
    };

    // adiciona ao array
    adds.push(newProduct);

    // adiciona na tabela
    table.innerHTML += `
        <tr>
            <td>${newProduct.id}</td>
            <td>${newProduct.product}</td>
            <td>R$ ${newProduct.price.toFixed(2)}</td>
            <td>${newProduct.quantity}</td>
            <td class="action-column">
                <button class="delete-btn" type="button">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `;

    calcular()
});

table.addEventListener("click", (event) => {

    let deleteButton = event.target.closest(".delete-btn");

    if (deleteButton) {
        deleteButton.closest("tr").remove();
    }
});


// Cálculos

let totalText = document.querySelector("span")

function calcular(){
    let timePrint = document.querySelector("#time");
    let qtdFilamento = document.querySelector("#quantity");
    let priceFilamento = document.querySelector("#price");
    let profit = Number(document.querySelector("#profit").value)

    let custoTimePrint = Number(timePrint.value) * 0.2;
    let custoFilamento = (Number(qtdFilamento.value) / 1000) * Number(priceFilamento.value);

    let totalAdds = adds.reduce((total, item) => {
        return total + (item.price * item.quantity)
    }, 0)

    let custoTotal = (custoFilamento + custoTimePrint + totalAdds) * (1 + profit / 100);

    console.log("Custo tempo:", custoTimePrint);
    console.log("Custo filamento:", custoFilamento);
    console.log(custoTotal)

    totalText.textContent = `R$${custoTotal.toFixed(2)}`;

}

document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", calcular);
});

let profitInput = document.querySelector("#profit");

profitInput.addEventListener("input", () => {
    if (Number(profitInput.value) > 100) {
        profitInput.value = 100;
    }

    if (Number(profitInput.value) < 0) {
        profitInput.value = 0;
    }

    calcular();
});

document.querySelectorAll('input[type="number"]').forEach(input => {
    input.min = 0;

    input.addEventListener("input", () => {
        if (Number(input.value) < 0) {
            input.value = 0;
        }

        calcular();
    });
});