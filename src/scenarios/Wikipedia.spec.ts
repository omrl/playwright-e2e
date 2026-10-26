import { test } from '@playwright/test';
import { join } from 'path';
import { TheConfig } from 'sicolo';
import WikipediaPage from '../support/pages/WikipediaPage';

test.describe('Wikipédia', () => {
  const CONFIG = join(__dirname, '../support/fixtures/config.yml');
  let wikipediaPage: WikipediaPage;
  const BASE_URL = TheConfig.fromFile(CONFIG)
    .andPath('application.wikipedia')
    .retrieveData();

  test.beforeEach(async ({ page }) => {
    wikipediaPage = new WikipediaPage(page);
    await page.goto(BASE_URL);
  });

  test.describe('Página principal', () => {
    test('Carregar a página principal', async () => {
      await wikipediaPage.validarPaginaPrincipal();
    });

    test('Abrir um portal temático', async () => {
      await wikipediaPage.abrirLinkNoConteudo('Física');
      await wikipediaPage.validarArtigo('Portal:Física');
    });
  });

  test.describe('Pesquisa', () => {
    test('Pesquisar termo exato e abrir o artigo', async () => {
      await wikipediaPage.pesquisar('Brasil');
      await wikipediaPage.validarArtigo('Brasil');
    });

    test('Escolher uma sugestão do autocompletar', async () => {
      await wikipediaPage.digitarPesquisa('Florianóp');
      await wikipediaPage.validarSugestoes('Florianópolis');

      await wikipediaPage.escolherSugestao('Florianópolis');
      await wikipediaPage.validarArtigo('Florianópolis');
    });

    test('Ser redirecionado ao pesquisar uma sigla', async () => {
      await wikipediaPage.pesquisar('EUA');
      await wikipediaPage.validarRedirecionamento('EUA', 'Estados Unidos');
    });

    test('Escolher um artigo na página de desambiguação', async () => {
      await wikipediaPage.pesquisar('Mercúrio');
      await wikipediaPage.validarDesambiguacao('Mercúrio');

      await wikipediaPage.abrirLinkNoConteudo('Mercúrio (planeta)');
      await wikipediaPage.validarArtigo('Mercúrio (planeta)');
    });

    test('Pesquisar termo sem artigo próprio e exibir resultados', async () => {
      await wikipediaPage.pesquisar('linguagem de programação funcional');
      await wikipediaPage.validarResultadosPesquisa();
    });

    test('Abrir o primeiro resultado da pesquisa e voltar à página principal', async () => {
      await wikipediaPage.pesquisar('linguagem de programação funcional');
      await wikipediaPage.validarResultadosPesquisa();

      const titulo = await wikipediaPage.abrirPrimeiroResultado();
      await wikipediaPage.validarArtigo(titulo);

      await wikipediaPage.voltarParaPaginaPrincipal();
      await wikipediaPage.validarPaginaPrincipal();
    });

    test('Pesquisar termo sem nenhum resultado', async () => {
      await wikipediaPage.pesquisar('qwxzkjhvbnm');
      await wikipediaPage.validarPesquisaSemResultados();
    });
  });

  test.describe('Navegação', () => {
    test('Navegar entre artigos e usar voltar/avançar do navegador', async () => {
      await wikipediaPage.pesquisar('Brasil');
      await wikipediaPage.validarArtigo('Brasil');

      await wikipediaPage.abrirLinkNoConteudo('Brasília');
      await wikipediaPage.validarArtigo('Brasília');

      await wikipediaPage.voltarPeloNavegador();
      await wikipediaPage.validarArtigo('Brasil');

      await wikipediaPage.avancarPeloNavegador();
      await wikipediaPage.validarArtigo('Brasília');
    });

    test('Navegar pelo sumário e consultar o histórico do artigo', async () => {
      await wikipediaPage.pesquisar('Brasil');
      await wikipediaPage.validarArtigo('Brasil');

      await wikipediaPage.irParaSecao('História');
      await wikipediaPage.validarSecao('História');

      await wikipediaPage.abrirHistorico();
      await wikipediaPage.validarHistorico('Brasil');

      await wikipediaPage.voltarParaLeitura();
      await wikipediaPage.validarArtigo('Brasil');
    });

    test('Abrir uma página aleatória pelo menu principal', async () => {
      await wikipediaPage.abrirPaginaAleatoria();
      await wikipediaPage.validarArtigoQualquer();
    });
  });

  test.describe('Idiomas', () => {
    test('Ler o mesmo artigo em outro idioma', async () => {
      await wikipediaPage.pesquisar('Brasília');
      await wikipediaPage.validarArtigo('Brasília');

      await wikipediaPage.trocarIdioma('English');
      await wikipediaPage.validarIdioma('en');
      await wikipediaPage.validarArtigo('Brasília');
    });
  });

  test.describe('Aparência', () => {
    test('Ativar o modo escuro e manter a escolha ao recarregar', async () => {
      await wikipediaPage.pesquisar('Brasil');
      await wikipediaPage.escolherAparencia('Escuro');
      await wikipediaPage.validarAparencia('Escuro');

      await wikipediaPage.recarregar();
      await wikipediaPage.validarAparencia('Escuro');
    });

    test('Aumentar o texto e usar a largura total da tela', async () => {
      await wikipediaPage.pesquisar('Brasil');
      await wikipediaPage.escolherAparencia('Grande');
      await wikipediaPage.validarAparencia('Grande');

      await wikipediaPage.escolherAparencia('Largo');
      await wikipediaPage.validarAparencia('Largo');
    });
  });
});
