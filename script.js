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

document.querySelector("#generatePdf").addEventListener("click", () => {

    const clientName =
        document.querySelector("#clientName").value || "Não informado";

    const clientPhone =
        document.querySelector("#clientPhone").value || "Não informado";

    const deliveryDate =
        document.querySelector("#deliveryDate").value || "A combinar";


    // =========================
    // CÁLCULOS
    // =========================

    const timePrint =
        Number(document.querySelector("#time").value);

    const qtdFilamento =
        Number(document.querySelector("#quantity").value);

    const priceFilamento =
        Number(document.querySelector("#price").value);

    const profit =
        Number(document.querySelector("#profit").value);

    const labor =
        Number(document.querySelector("#labor").value);


    const custoTimePrint = timePrint * 0.2;

    const custoFilamento =
        (qtdFilamento / 1000) * priceFilamento;


    const totalAdds = adds.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);


    const custoSemLabor =
        (custoFilamento + custoTimePrint + totalAdds)
        * (1 + profit / 100);


    const custoFinal =
        custoSemLabor + labor;


    // =========================
    // DATA
    // =========================

    const dataAtual =
        new Date().toLocaleDateString("pt-BR");


    // =========================
    // PRODUTOS ADICIONAIS
    // =========================

    let produtosHTML = "";

    if (adds.length > 0) {

        produtosHTML = adds.map((item, index) => {

            const subtotal =
                item.price * item.quantity;

            return `
                <tr>
                    <td>${index + 1}</td>

                    <td>
                        ${item.product}
                    </td>

                    <td>
                        ${item.quantity}
                    </td>

                    <td>
                        R$ ${item.price.toFixed(2)}
                    </td>

                    <td>
                        R$ ${subtotal.toFixed(2)}
                    </td>
                </tr>
            `;

        }).join("");

    } else {

        produtosHTML = `
            <tr>
                <td colspan="5">
                    Nenhum item adicional
                </td>
            </tr>
        `;
    }


    // =========================
    // CRIA O PDF
    // =========================

    const pdf = document.createElement("div");

    pdf.innerHTML = `

        <div class="pdf-document">

            <div class="pdf-header">

                <img
                    src="src/Logo_V3D.png"
                    class="pdf-logo"
                >

                <div>
                    <h1>PROPOSTA COMERCIAL</h1>
                    <p>Impressão 3D personalizada</p>
                </div>

            </div>


            <div class="pdf-line"></div>


            <div class="pdf-info">

                <div>
                    <span>CLIENTE</span>
                    <strong>${clientName}</strong>
                </div>

                <div>
                    <span>TELEFONE</span>
                    <strong>${clientPhone}</strong>
                </div>

                <div>
                    <span>DATA</span>
                    <strong>${dataAtual}</strong>
                </div>

            </div>


            <h2>Detalhes do projeto</h2>


            <div class="pdf-details">

                <div>
                    <span>Tempo de impressão</span>
                    <strong>${timePrint} horas</strong>
                </div>

                <div>
                    <span>Material utilizado</span>
                    <strong>${qtdFilamento} g</strong>
                </div>

                <div>
                    <span>Prazo de entrega</span>
                    <strong>${deliveryDate}</strong>
                </div>

            </div>


            <h2>Itens</h2>


            <table>

                <thead>

                    <tr>
                        <th>#</th>
                        <th>Descrição</th>
                        <th>Qtd.</th>
                        <th>Valor</th>
                        <th>Subtotal</th>
                    </tr>

                </thead>

                <tbody>

                    ${produtosHTML}

                </tbody>

            </table>


            <div class="pdf-total">

                <span>VALOR TOTAL</span>

                <strong>
                    R$ ${custoFinal.toFixed(2)}
                </strong>

            </div>


            <div class="pdf-terms">

                <h2>Termos e condições</h2>

                <p>
                    • O prazo de produção começa após a
                    confirmação do pedido.
                </p>

                <p>
                    • Alterações solicitadas após o início
                    da produção poderão gerar custos adicionais.
                </p>

                <p>
                    • As características de peças produzidas
                    por impressão 3D podem apresentar pequenas
                    variações decorrentes do processo de fabricação.
                </p>

                <p>
                    • Esta proposta está sujeita à disponibilidade
                    de materiais no momento da confirmação.
                </p>

            </div>


            <div class="pdf-signatures">

                <div>
                    <div class="signature-line"></div>
                    <p>V3D</p>
                </div>

                <div>
                    <div class="signature-line"></div>
                    <p>${clientName}</p>
                </div>

            </div>


            <div class="pdf-footer">

                <strong>V3D</strong>

                <span>
                    Soluções em Impressão 3D
                </span>

            </div>

        </div>
    `;


    // =========================
    // ESTILO DO PDF
    // =========================

    const style = document.createElement("style");

    style.innerHTML = `

        .pdf-document {

            width: 794px;
            min-height: 1123px;

            background: white;

            color: #171717;

            padding: 55px;

            font-family: Arial, sans-serif;

        }


        .pdf-header {

            display: flex;

            justify-content: space-between;
            align-items: center;

        }


        .pdf-logo {

            width: 110px;

        }


        .pdf-header h1 {

            color: #171717;

            font-family: Arial, sans-serif;

            font-size: 25px;

            margin: 0;

            text-align: right;

        }


        .pdf-header p {

            color: #777;

            text-align: right;

            margin-top: 5px;

        }


        .pdf-line {

            height: 4px;

            background: #60F637;

            margin: 25px 0 30px;

        }


        .pdf-info {

            display: grid;

            grid-template-columns: 2fr 1fr 1fr;

            gap: 20px;

            margin-bottom: 35px;

        }


        .pdf-info div,
        .pdf-details div {

            display: flex;

            flex-direction: column;

            gap: 5px;

        }


        .pdf-info span,
        .pdf-details span {

            font-size: 10px;

            color: #777;

            font-weight: bold;

        }


        .pdf-info strong,
        .pdf-details strong {

            font-size: 14px;

        }


        .pdf-document h2 {

            color: #171717;

            font-family: Arial, sans-serif;

            font-size: 16px;

            margin:

                25px 0 12px;

        }


        .pdf-details {

            display: grid;

            grid-template-columns:

                repeat(3, 1fr);

            gap: 15px;

            padding: 18px;

            background: #f5f5f5;

            border-radius: 8px;

        }


        .pdf-document table {

            width: 100%;

            border-collapse: collapse;

            margin: 0;

            background: white;

            border: none;

        }


        .pdf-document th {

            background: #171717;

            color: white;

            padding: 10px;

            font-size: 11px;

        }


        .pdf-document td {

            color: #333;

            padding: 10px;

            font-size: 11px;

            border-bottom:

                1px solid #ddd;

        }


        .pdf-total {

            margin-top: 25px;

            padding: 18px;

            background: #171717;

            color: white;

            display: flex;

            align-items: center;

            justify-content: space-between;

            border-radius: 8px;

        }


        .pdf-total span {

            font-size: 12px;

        }


        .pdf-total strong {

            font-size: 24px;

            color: #60F637;

        }


        .pdf-terms {

            margin-top: 30px;

        }


        .pdf-terms p {

            font-size: 11px;

            line-height: 1.6;

            color: #555;

            margin: 4px 0;

        }


        .pdf-signatures {

            display: grid;

            grid-template-columns:

                1fr 1fr;

            gap: 80px;

            margin-top: 65px;

        }


        .pdf-signatures div {

            text-align: center;

        }


        .signature-line {

            border-top:

                1px solid #555;

        }


        .pdf-signatures p {

            font-size: 11px;

            margin-top: 8px;

        }


        .pdf-footer {

            margin-top: 45px;

            border-top:

                1px solid #ddd;

            padding-top: 15px;

            display: flex;

            justify-content: space-between;

            font-size: 10px;

            color: #777;

        }

    `;


    pdf.appendChild(style);

    document.body.appendChild(pdf);


    // =========================
    // CONFIGURAÇÃO HTML2PDF
    // =========================

    const options = {

        margin: 0,

        filename:
            `Proposta-V3D-${clientName}.pdf`,

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {

            scale: 2,

            useCORS: true,

            backgroundColor: "#ffffff"

        },

        jsPDF: {

            unit: "mm",

            format: "a4",

            orientation: "portrait"

        },

        pagebreak: {

            mode: ["avoid-all", "css", "legacy"]

        }

    };


    html2pdf()
        .set(options)
        .from(pdf)
        .save()
        .then(() => {

            pdf.remove();

        });

});