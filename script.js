let product = document.querySelector("#product");
let price = document.querySelector("#price-add");
let quantity = document.querySelector("#quantity-add");
let button_add = document.querySelector("#add");

let table = document.querySelector("table");
let totalText = document.querySelector("#total");

let adds = [];

// Constantes de cálculo
const CUSTO_HORA_IMPRESSAO = 0.2; // R$ por hora de impressão
const TAXA_GARANTIA_FALHA = 0.05; // 5% sobre o custo do filamento

console.log("Version: 1.0")

// Arredonda valores monetários para 2 casas (evita diferenças de centavos)
function arredondar(valor) {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// Escapa texto digitado pelo usuário antes de inserir no HTML
function escapeHTML(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Lê um input numérico; valores vazios, inválidos ou negativos viram 0
function lerNumero(selector) {
    const valor = Number(document.querySelector(selector).value);
    return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

// Redesenha as linhas de adicionais (mantém a numeração sequencial)
function renderAdds() {
    table.querySelectorAll("tr[data-id]").forEach(row => row.remove());

    const tbody = table.querySelector("tbody") || table;

    adds.forEach((item, index) => {
        tbody.insertAdjacentHTML("beforeend", `
            <tr data-id="${item.id}">
                <td>${index + 1}</td>
                <td>${escapeHTML(item.product)}</td>
                <td>R$ ${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td class="action-column">
                    <button class="delete-btn" type="button">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

button_add.addEventListener("click", () => {

    const nome = product.value.trim();
    const preco = Number(price.value);
    // Quantidade em branco assume 1 unidade
    const qtd = quantity.value === "" ? 1 : Number(quantity.value);

    if (!nome) {
        alert("Informe o nome do produto adicional.");
        product.focus();
        return;
    }

    if (price.validity.badInput || price.value === "" || !Number.isFinite(preco) || preco <= 0) {
        alert("Informe um preço válido (maior que zero) para o adicional.");
        price.focus();
        return;
    }

    if (quantity.validity.badInput || !Number.isFinite(qtd) || qtd <= 0) {
        alert("Informe uma quantidade válida (maior que zero) para o adicional.");
        quantity.focus();
        return;
    }

    let newProduct = {
        id: Date.now() + Math.random(),
        product: nome,
        price: arredondar(preco),
        quantity: qtd
    };

    adds.push(newProduct);
    renderAdds();

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

        // redesenha a tabela (renumera os IDs)
        renderAdds();

        // recalcula
        calcular();
    }
});


// CÁLCULOS (fonte única usada pela tela e pelo PDF)
function calcularValores() {

    const timePrint = lerNumero("#time");
    const qtdFilamento = lerNumero("#quantity");
    const priceFilamento = lerNumero("#price");
    const profit = Math.min(lerNumero("#profit"), 100);
    const labor = arredondar(lerNumero("#labor"));

    const custoTimePrint = arredondar(timePrint * CUSTO_HORA_IMPRESSAO);

    const custoFilamento = arredondar((qtdFilamento / 1000) * priceFilamento);

    const garantiaFalha = arredondar(custoFilamento * TAXA_GARANTIA_FALHA);

    // Soma os subtotais já arredondados, igual ao que aparece no PDF
    const totalAdds = arredondar(adds.reduce((total, item) => {
        return total + arredondar(item.price * item.quantity);
    }, 0));

    const custoSemLabor = arredondar(
        (custoFilamento + custoTimePrint + totalAdds) * (1 + profit / 100)
    );

    const custoFinal = arredondar(custoSemLabor + labor + garantiaFalha);

    return {
        timePrint,
        qtdFilamento,
        priceFilamento,
        profit,
        labor,
        custoTimePrint,
        custoFilamento,
        garantiaFalha,
        totalAdds,
        custoSemLabor,
        custoFinal
    };
}

function calcular() {
    const { custoFinal } = calcularValores();

    totalText.textContent =
        `R$ ${custoFinal.toFixed(2)}`;
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

document.querySelector("#generatePdf").addEventListener("click", async () => {

    const clientName =
        document.querySelector("#clientName").value || "Não informado";

    const clientPhone =
        document.querySelector("#clientPhone").value || "Não informado";

    const deliveryDate =
        document.querySelector("#deliveryDate").value || "A combinar";


    // =========================
    // CÁLCULOS
    // =========================

    const {
        timePrint,
        qtdFilamento,
        priceFilamento,
        custoFilamento,
        garantiaFalha,
        custoFinal
    } = calcularValores();


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
                arredondar(item.price * item.quantity);

            return `
                <tr>
                    <td>${index + 1}</td>

                    <td>
                        ${escapeHTML(item.product)}
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
                    <strong>${escapeHTML(clientName)}</strong>
                </div>

                <div>
                    <span>TELEFONE</span>
                    <strong>${escapeHTML(clientPhone)}</strong>
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
                <span>Preço do filamento</span>
                <strong>R$ ${Number(priceFilamento).toFixed(2)} / kg</strong>
            </div>

            <div>
                <span>Custo do filamento</span>
                <strong>R$ ${Number(custoFilamento).toFixed(2)}</strong>
            </div>

            <div>
                <span>Garantia de falha (5%)</span>
                <strong>R$ ${garantiaFalha.toFixed(2)}</strong>
            </div>

            <div>
                <span>Prazo de entrega</span>
                <strong>${escapeHTML(deliveryDate)}</strong>
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
                    <p>${escapeHTML(clientName)}</p>
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

            box-sizing: border-box;
            overflow: hidden;
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
            display: table;       
            overflow: visible;    
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            background: white;
            border: none;
            border-radius: 0;  
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

        .pdf-document tr { page-break-inside: avoid; }


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

    const logo = pdf.querySelector(".pdf-logo");
    await new Promise(res => {
        if (logo.complete) return res();
        logo.onload = logo.onerror = res;
    });


    // =========================
    // CONFIGURAÇÃO HTML2PDF
    // =========================

    pdf.style.width = "794px";

    const options = {
        margin: 0,
        filename: `Proposta-V3D-${clientName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            windowWidth: 794,   
            scrollX: 0,         
            scrollY: 0          
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    };


    html2pdf()
        .set(options)
        .from(pdf)
        .save()
        .then(() => {

            pdf.remove();

        });

});