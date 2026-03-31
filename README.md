# Testes Automatizados com Playwright - Sauce Demo

Projeto de testes automatizados desenvolvido como trabalho da disciplina de Qualidade de Software.

## Site testado

**Sauce Demo** — https://www.saucedemo.com  
É um site de e-commerce fictício feito justamente pra praticar automação de testes.

## Funcionalidades cobertas

| Funcionalidade | Cenários | Feature |
|---|---|---|
| Login | 4 cenários | `features/login.feature` |
| Listagem e Ordenação de Produtos | 5 cenários | `features/produtos.feature` |
| Carrinho de Compras | 4 cenários | `features/carrinho.feature` |
| Checkout | 4 cenários | `features/checkout.feature` |

## Estrutura do projeto

```
playwright-testes/
├── .github/
│   └── workflows/
│       └── playwright.yml       # Pipeline de CI com GitHub Actions
├── features/                    # Cenários escritos em Gherkin (BDD)
│   ├── login.feature
│   ├── produtos.feature
│   ├── carrinho.feature
│   └── checkout.feature
├── tests/
│   ├── pages/                   # Page Objects de cada tela
│   │   ├── LoginPage.ts
│   │   ├── ProdutosPage.ts
│   │   └── CheckoutPage.ts
│   ├── login.spec.ts            # Testes de login
│   ├── produtos.spec.ts         # Testes de produtos
│   ├── carrinho.spec.ts         # Testes de carrinho
│   └── checkout.spec.ts         # Testes de checkout
├── playwright.config.ts
└── package.json
```

## Como rodar localmente

**Pré-requisito:** Node.js instalado (versão 18 ou superior)

```bash
# instalar dependências
npm install

# instalar os browsers
npx playwright install

# rodar todos os testes
npm test

# rodar com interface gráfica (mais visual)
npm run test:headed

# ver relatório após rodar
npm run test:report
```

## CI/CD

Os testes rodam automaticamente via GitHub Actions em todo push ou pull request para a branch `main`. O relatório HTML fica disponível como artifact no workflow.
