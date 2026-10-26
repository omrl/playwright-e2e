import { Page, expect } from '@playwright/test';
import WikipediaElements from '../elements/WikipediaElements';
import BasePage from './BasePage';

// A Wikipédia troca espaços por "_" e codifica acentos na URL (Brasília -> Bras%C3%ADlia)
const paraUrl = (texto: string): string => texto.replace(/ /g, '_');

type OpcaoAparencia = 'Escuro' | 'Grande' | 'Largo';

// Classe que a Wikipédia aplica no <html> para cada opção do menu Aparência
const CLASSE_APARENCIA: Record<OpcaoAparencia, string> = {
  Escuro: 'skin-theme-clientpref-night',
  Grande: 'vector-feature-custom-font-size-clientpref-2',
  Largo: 'vector-feature-limited-width-clientpref-0'
};

export default class WikipediaPage extends BasePage {
  readonly wikipediaElements: WikipediaElements;

  constructor(readonly page: Page) {
    super(page);
    this.page = page;
    this.wikipediaElements = new WikipediaElements(page);
  }

  async digitarPesquisa(termo: string): Promise<void> {
    // O clique carrega o autocompletar; digitar só depois evita usar um campo
    // que vai ser substituído no meio da ação
    await this.wikipediaElements.getCampoPesquisa().click();
    await this.wikipediaElements.getCampoPesquisaComAutocompletar().fill(termo);
  }

  async pesquisar(termo: string): Promise<void> {
    await this.digitarPesquisa(termo);
    await this.wikipediaElements
      .getCampoPesquisaComAutocompletar()
      .press('Enter');
  }

  async escolherSugestao(titulo: string): Promise<void> {
    await this.wikipediaElements
      .getSugestoesPesquisa()
      .filter({ hasText: titulo })
      .first()
      .click();
  }

  async abrirPrimeiroResultado(): Promise<string> {
    const resultado = this.wikipediaElements.getPrimeiroResultadoPesquisa();
    const titulo = (await resultado.getAttribute('title')) ?? '';
    await resultado.click();
    return titulo;
  }

  async abrirLinkNoConteudo(nome: string): Promise<void> {
    await this.wikipediaElements.getLinkNoConteudo(nome).click();
  }

  async abrirPaginaAleatoria(): Promise<void> {
    await this.wikipediaElements.getBotaoMenuPrincipal().click();
    await this.wikipediaElements.getLinkPaginaAleatoria().click();
  }

  async voltarPeloNavegador(): Promise<void> {
    await this.page.goBack();
  }

  async avancarPeloNavegador(): Promise<void> {
    await this.page.goForward();
  }

  async trocarIdioma(idioma: string): Promise<void> {
    await this.wikipediaElements.getBotaoIdiomas().click();
    await this.wikipediaElements.getLinkIdioma(idioma).click();
  }

  async irParaSecao(secao: string): Promise<void> {
    await this.wikipediaElements.getLinkSumario(secao).click();
  }

  async abrirHistorico(): Promise<void> {
    await this.wikipediaElements.getAbaVerHistorico().click();
  }

  async voltarParaLeitura(): Promise<void> {
    await this.wikipediaElements.getAbaLer().click();
  }

  async voltarParaPaginaPrincipal(): Promise<void> {
    await this.wikipediaElements.getLogo().click();
  }

  async escolherAparencia(opcao: OpcaoAparencia): Promise<void> {
    await this.wikipediaElements.getOpcaoAparencia(opcao).check();
  }

  async recarregar(): Promise<void> {
    await this.page.reload();
  }

  async validarPaginaPrincipal(): Promise<void> {
    await this.verifyTitle('Wikipédia, a enciclopédia livre');
    await expect(this.wikipediaElements.getLinkBoasVindas()).toBeVisible();
    await expect(this.wikipediaElements.getCampoPesquisa()).toBeVisible();
  }

  async validarArtigo(titulo: string): Promise<void> {
    await expect(this.page).toHaveURL(
      url => decodeURIComponent(url.pathname) === `/wiki/${paraUrl(titulo)}`
    );
    await expect(this.wikipediaElements.getTituloPagina()).toHaveText(titulo);
  }

  async validarArtigoQualquer(): Promise<void> {
    await expect(this.page).toHaveURL(
      url =>
        url.pathname.startsWith('/wiki/') &&
        !decodeURIComponent(url.pathname).includes('Especial:') &&
        !decodeURIComponent(url.pathname).includes('Página_principal')
    );
    await expect(this.wikipediaElements.getTituloPagina()).toHaveText(/\S/);
  }

  async validarSugestoes(titulo: string): Promise<void> {
    await expect(
      this.wikipediaElements.getSugestoesPesquisa().first()
    ).toBeVisible();
    await expect(
      this.wikipediaElements.getSugestoesPesquisa().filter({ hasText: titulo })
    ).not.toHaveCount(0);
  }

  async validarRedirecionamento(
    origem: string,
    destino: string
  ): Promise<void> {
    await expect(this.wikipediaElements.getTituloPagina()).toHaveText(destino);
    await expect(this.wikipediaElements.getAvisoRedirecionamento()).toHaveText(
      `(Redirecionado de ${origem})`
    );
  }

  async validarDesambiguacao(titulo: string): Promise<void> {
    await expect(this.wikipediaElements.getTituloPagina()).toHaveText(titulo);
    await expect(this.wikipediaElements.getAvisoDesambiguacao()).toBeVisible();
  }

  async validarIdioma(codigo: string): Promise<void> {
    await expect(this.page).toHaveURL(
      url => url.hostname === `${codigo}.wikipedia.org`
    );
    await expect(this.page.locator('html')).toHaveAttribute('lang', codigo);
  }

  async validarSecao(secao: string): Promise<void> {
    await expect(this.page).toHaveURL(
      url => decodeURIComponent(url.hash) === `#${paraUrl(secao)}`
    );
    await expect(this.wikipediaElements.getTituloSecao(secao)).toBeInViewport();
  }

  async validarHistorico(titulo: string): Promise<void> {
    await expect(this.page).toHaveURL(
      url => url.searchParams.get('action') === 'history'
    );
    await expect(this.wikipediaElements.getTituloPagina()).toContainText(
      titulo
    );
    await expect(this.wikipediaElements.getRevisoes().first()).toBeVisible();
  }

  async validarResultadosPesquisa(): Promise<void> {
    await expect(this.page).toHaveURL(/Especial%3APesquisar/);
    await expect(this.wikipediaElements.getTituloPagina()).toHaveText(
      'Resultados da pesquisa'
    );
    await expect(
      this.wikipediaElements.getResultadosPesquisa().first()
    ).toBeVisible();
  }

  async validarPesquisaSemResultados(): Promise<void> {
    await expect(this.wikipediaElements.getTituloPagina()).toHaveText(
      'Resultados da pesquisa'
    );
    await expect(
      this.wikipediaElements.getMensagemSemResultados()
    ).toBeVisible();
    await expect(this.wikipediaElements.getResultadosPesquisa()).toHaveCount(0);
  }

  async validarAparencia(opcao: OpcaoAparencia): Promise<void> {
    await expect(this.wikipediaElements.getOpcaoAparencia(opcao)).toBeChecked();
    await expect(this.page.locator('html')).toContainClass(
      CLASSE_APARENCIA[opcao]
    );
  }
}
