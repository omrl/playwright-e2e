import { Locator, Page } from '@playwright/test';
import BaseElements from './BaseElements';

export default class WikipediaElements extends BaseElements {
  constructor(readonly page: Page) {
    super(page);
    this.page = page;
  }

  getLogo(): Locator {
    return this.page
      .getByRole('banner')
      .getByRole('link', { name: 'Wikipédia' });
  }

  getBotaoMenuPrincipal(): Locator {
    return this.page.getByRole('button', { name: 'Menu principal' });
  }

  getLinkPaginaAleatoria(): Locator {
    return this.page
      .getByRole('navigation', { name: 'Site' })
      .getByRole('link', { name: 'Página aleatória' });
  }

  // Ao receber foco, a Wikipédia troca o campo de pesquisa (searchbox) por
  // outro com autocompletar (combobox). O placeholder encontra os dois.
  getCampoPesquisa(): Locator {
    return this.page
      .getByRole('search')
      .getByPlaceholder('Pesquisar na Wikipédia');
  }

  getCampoPesquisaComAutocompletar(): Locator {
    return this.page.getByRole('combobox', { name: 'Pesquisar na Wikipédia' });
  }

  getSugestoesPesquisa(): Locator {
    return this.page
      .getByRole('listbox', { name: 'Resultados da pesquisa' })
      .getByRole('option');
  }

  getLinkBoasVindas(): Locator {
    return this.page.getByRole('link', { name: 'Boas-vindas' });
  }

  getTituloPagina(): Locator {
    return this.page.locator('#firstHeading');
  }

  getResultadosPesquisa(): Locator {
    return this.page.locator('.mw-search-result-heading');
  }

  getPrimeiroResultadoPesquisa(): Locator {
    return this.page.locator('.mw-search-result-heading a').first();
  }

  getMensagemSemResultados(): Locator {
    return this.page.getByText('A pesquisa não produziu resultados.');
  }

  getAvisoRedirecionamento(): Locator {
    return this.page.locator('.mw-redirectedfrom');
  }

  getAvisoDesambiguacao(): Locator {
    return this.page.getByText('Esta é uma página de desambiguação');
  }

  getLinkNoConteudo(nome: string): Locator {
    return this.page
      .locator('#mw-content-text')
      .getByRole('link', { name: nome, exact: true })
      .first();
  }

  getBotaoIdiomas(): Locator {
    return this.page.getByRole('button', { name: /idiomas/ });
  }

  // O menu de idiomas lista o mesmo idioma em "sugeridos" e na lista completa
  getLinkIdioma(idioma: string): Locator {
    return this.page.getByRole('link', { name: idioma, exact: true }).first();
  }

  getLinkSumario(secao: string): Locator {
    return this.page
      .getByRole('navigation', { name: 'Conteúdos' })
      .getByRole('link', { name: secao, exact: true });
  }

  getTituloSecao(secao: string): Locator {
    return this.page.getByRole('heading', { name: secao, level: 2 });
  }

  getAbaLer(): Locator {
    return this.page
      .getByRole('navigation', { name: 'Visualizações' })
      .getByRole('link', { name: 'Ler' });
  }

  getAbaVerHistorico(): Locator {
    return this.page
      .getByRole('navigation', { name: 'Visualizações' })
      .getByRole('link', { name: 'Ver histórico' });
  }

  getRevisoes(): Locator {
    return this.page.locator('#pagehistory li');
  }

  getOpcaoAparencia(opcao: string): Locator {
    return this.page
      .getByRole('navigation', { name: 'Aparência' })
      .getByRole('radio', { name: opcao });
  }
}
