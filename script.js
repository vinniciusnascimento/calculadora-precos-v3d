let product = document.querySelector("#product");
let price = document.querySelector("#price-add");
let quantity = document.querySelector("#quantity-add");
let button_add = document.querySelector("#add");

let table = document.querySelector("table");
let totalText = document.querySelector("span");

let adds = [];

button_add.addEventListener("click", () => {

    let newProduct = {
        id: Date.now(),
        product: product.value,
        price: Number(price.value),
        quantity: Number(quantity.value)
    };

    adds.push(newProduct);

    table.innerHTML += `
        <tr data-id="${newProduct.id}">
            <td>${adds.length}</td>
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

    product.value = "";
    price.value = "";
    quantity.value = "";

    calcular();
});


// EXCLUIR PRODUTO
table.addEventListener("click", (event) => {

    let deleteButton = event.target.closest(".delete-btn");

    if (deleteButton) {

        let row = deleteButton.closest("tr");

        let id = Number(row.dataset.id);

        // remove do array
        adds = adds.filter(item => item.id !== id);

        // remove da tabela
        row.remove();

        // recalcula
        calcular();
    }
});


// CÁLCULOS
function calcular() {

    let timePrint = Number(document.querySelector("#time").value);
    let qtdFilamento = Number(document.querySelector("#quantity").value);
    let priceFilamento = Number(document.querySelector("#price").value);
    let profit = Number(document.querySelector("#profit").value);
    let labor = Number(document.querySelector("#labor").value);

    let custoTimePrint = timePrint * 0.2;

    let custoFilamento =
        (qtdFilamento / 1000) * priceFilamento;

    let totalAdds = adds.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    let custoSemLabor =
        (custoFilamento + custoTimePrint + totalAdds)
        * (1 + profit / 100);

    let custoFinal = custoSemLabor + labor;

    totalText.textContent = `R$ ${custoFinal.toFixed(2)}`;
}


// ATUALIZAR AUTOMATICAMENTE
document.querySelectorAll("input").forEach(input => {

    input.addEventListener("input", () => {

        // impede números negativos
        if (
            input.type === "number" &&
            Number(input.value) < 0
        ) {
            input.value = 0;
        }

        calcular();
    });
});


// LUCRO ENTRE 0 E 100
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


// DEFINE MIN=0 NOS INPUTS NUMBER
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.min = 0;
});

calcular();