document.addEventListener("DOMContentLoaded", async () => {
  // ==========================================
  // 1. CONFIGURAÇÃO DO SUPABASE
  // ==========================================

  const SUPABASE_URL = "https://ggxhghszthcgnkecoiir.supabase.co";
  const SUPABASE_KEY = "sb_publishable_EohrXK6tulCPMKavk5GQfw_OxIQkxgQ";

  let supabaseClient = null;

  try {
    if (window.supabase?.createClient) {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );
    } else {
      console.error("A biblioteca do Supabase não foi carregada.");
    }
  } catch (error) {
    console.error("Erro ao iniciar o Supabase:", error);
  }

  // ==========================================
  // 2. MENU E ANO DO RODAPÉ
  // ==========================================

  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");
  const navLinks = document.querySelectorAll("#navigation a");
  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu" : "Abrir menu"
      );
      menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    const closeMenu = () => {
      navigation.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      menuToggle.textContent = "☰";
    };

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // ==========================================
  // 3. FUNÇÕES AUXILIARES
  // ==========================================

  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
  }

  function formatarData(data) {
    if (!data) return "";

    const dataValida = new Date(`${data}T12:00:00`);

    if (Number.isNaN(dataValida.getTime())) return "";

    return dataValida.toLocaleDateString("pt-BR");
  }

  function mostrarMensagem(container, mensagem) {
    if (!container) return;

    container.replaceChildren(
      criarElemento("p", "empty-message", mensagem)
    );
  }

  // Detecta o formato pela extensão do arquivo ou URL.
  function obterExtensao(valor) {
    if (!valor || typeof valor !== "string") return "";

    try {
      const url = new URL(valor, window.location.href);
      const caminho = decodeURIComponent(url.pathname);
      const nome = caminho.split("/").pop() || "";
      const ponto = nome.lastIndexOf(".");

      return ponto >= 0 ? nome.slice(ponto + 1).toLowerCase() : "";
    } catch {
      const nome = valor.split("?")[0].split("#")[0];
      const ponto = nome.lastIndexOf(".");

      return ponto >= 0 ? nome.slice(ponto + 1).toLowerCase() : "";
    }
  }

  function ehVideo(item) {
    const extensoesVideo = [
      "mp4",
      "webm",
      "mov",
      "m4v",
      "ogv",
      "ogg"
    ];

    const mime = (item?.mime_type || item?.tipo || "").toLowerCase();

    if (mime.startsWith("video/")) return true;

    const arquivo = item?.storage_path || item?.imagem_url || "";

    return extensoesVideo.includes(obterExtensao(arquivo));
  }

  // Cria o elemento certo para cada tipo de arquivo.
  function criarMidia(item, opcoes = {}) {
    const video = ehVideo(item);
    const url = item?.imagem_url;
    const titulo = item?.nome || "Conteúdo da Estação Alegria";

    if (!url) {
      return criarElemento(
        "p",
        "media-error",
        "Este conteúdo não possui uma URL disponível."
      );
    }

    let midia;

    if (video) {
      midia = document.createElement("video");
      midia.controls = true;
      midia.playsInline = true;
      midia.preload = "metadata";
      midia.setAttribute("aria-label", titulo);

      // Evita reprodução automática e consumo desnecessário de dados.
      midia.muted = false;

      const extensao = obterExtensao(item.storage_path || url);

      if (extensao === "mp4" || extensao === "m4v") {
        midia.setAttribute("type", "video/mp4");
      } else if (extensao === "webm") {
        midia.setAttribute("type", "video/webm");
      } else if (extensao === "ogv" || extensao === "ogg") {
        midia.setAttribute("type", "video/ogg");
      }

      midia.src = url;

      midia.addEventListener("error", () => {
        console.error("Falha ao carregar vídeo:", url);

        const erro = criarElemento(
          "p",
          "media-error",
          "Não foi possível carregar este vídeo. Verifique o arquivo e o acesso no Supabase."
        );

        midia.replaceWith(erro);
      }, { once: true });
    } else {
      midia = document.createElement("img");
      midia.src = url;
      midia.alt = titulo;
      midia.loading = "lazy";
      midia.decoding = "async";

      midia.addEventListener("error", () => {
        console.error("Falha ao carregar imagem:", url);

        const erro = criarElemento(
          "p",
          "media-error",
          "Não foi possível carregar esta imagem."
        );

        midia.replaceWith(erro);
      }, { once: true });
    }

    midia.classList.add("gallery-media");

    if (opcoes.destaque) {
      midia.classList.add("gallery-media-featured");
    }

    return midia;
  }

  // ==========================================
  // 4. CARTÕES DE EVENTOS E PROMOÇÕES
  // ==========================================

  function criarCartao(titulo, descricao, data, imagem, tipo) {
    const artigo = criarElemento("article", "feature-card");

    if (imagem) {
      const itemMidia = {
        nome: titulo,
        imagem_url: imagem,
        storage_path: imagem
      };

      artigo.appendChild(criarMidia(itemMidia));
    }

    const conteudo = criarElemento("div", "card-content");
    const emoji = criarElemento(
      "span",
      "card-emoji",
      tipo === "evento" ? "📅" : "🎁"
    );

    conteudo.appendChild(emoji);
    conteudo.appendChild(
      criarElemento("h3", "", titulo || "Novidade")
    );

    if (data) {
      conteudo.appendChild(
        criarElemento(
          "p",
          "item-date",
          `${tipo === "evento" ? "Data do evento" : "Válido até"}: ${formatarData(data)}`
        )
      );
    }

    if (descricao) {
      conteudo.appendChild(criarElemento("p", "", descricao));
    }

    artigo.appendChild(conteudo);

    return artigo;
  }

  // ==========================================
  // 5. CARREGAR EVENTOS
  // ==========================================

  async function carregarEventos() {
    const container = document.getElementById("eventList");
    if (!container) return;

    if (!supabaseClient) {
      mostrarMensagem(container, "Não foi possível conectar aos eventos.");
      return;
    }

    const { data, error } = await supabaseClient
      .from("eventos")
      .select("id, titulo, descricao, data_evento, imagem_url, created_at")
      .order("data_evento", {
        ascending: true,
        nullsFirst: false
      });

    if (error) {
      console.error("Erro ao carregar eventos:", error);
      mostrarMensagem(container, "Não foi possível carregar os eventos.");
      return;
    }

    container.replaceChildren();

    if (!data?.length) {
      mostrarMensagem(
        container,
        "Ainda não há eventos publicados. Fique de olho nas novidades!"
      );
      return;
    }

    data.forEach((evento) => {
      container.appendChild(
        criarCartao(
          evento.titulo,
          evento.descricao,
          evento.data_evento,
          evento.imagem_url,
          "evento"
        )
      );
    });
  }

  // ==========================================
  // 6. CARREGAR PROMOÇÕES
  // ==========================================

  async function carregarPromocoes() {
    const container = document.getElementById("promotionList");
    if (!container) return;

    if (!supabaseClient) {
      mostrarMensagem(container, "Não foi possível conectar às promoções.");
      return;
    }

    const { data, error } = await supabaseClient
      .from("promocoes")
      .select("id, titulo, descricao, validade, imagem_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar promoções:", error);
      mostrarMensagem(container, "Não foi possível carregar as promoções.");
      return;
    }

    container.replaceChildren();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const ativas = (data || []).filter((promocao) => {
      if (!promocao.validade) return true;

      const validade = new Date(`${promocao.validade}T23:59:59`);

      return !Number.isNaN(validade.getTime()) && validade >= hoje;
    });

    if (!ativas.length) {
      mostrarMensagem(container, "No momento, não há promoções ativas.");
      return;
    }

    ativas.forEach((promocao) => {
      container.appendChild(
        criarCartao(
          promocao.titulo,
          promocao.descricao,
          promocao.validade,
          promocao.imagem_url,
          "promocao"
        )
      );
    });
  }

  // ==========================================
  // 7. CARREGAR AVISOS
  // ==========================================

  async function carregarAvisos() {
    const container = document.getElementById("noticeList");
    if (!container) return;

    if (!supabaseClient) {
      mostrarMensagem(container, "Não foi possível carregar os avisos.");
      return;
    }

    const { data, error } = await supabaseClient
      .from("avisos")
      .select("id, titulo, descricao, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar avisos:", error);
      mostrarMensagem(container, "Não foi possível carregar os avisos.");
      return;
    }

    container.replaceChildren();

    if (!data?.length) {
      mostrarMensagem(container, "Não há avisos publicados no momento.");
      return;
    }

    data.forEach((aviso) => {
      const cartao = criarElemento("article", "announcement-card");
      const icone = criarElemento("div", "announcement-icon", "📢");
      const conteudo = criarElemento("div");
      const titulo = criarElemento("h3", "", aviso.titulo || "Aviso");

      conteudo.appendChild(titulo);

      if (aviso.descricao) {
        conteudo.appendChild(criarElemento("p", "", aviso.descricao));
      }

      cartao.append(icone, conteudo);
      container.appendChild(cartao);
    });
  }

  // ==========================================
  // 8. CARREGAR FOTOS E VÍDEOS DA GALERIA
  // ==========================================

  async function carregarGaleria() {
    const galeria = document.getElementById("photoGallery");
    if (!galeria) return;

    if (!supabaseClient) {
      mostrarMensagem(galeria, "Não foi possível conectar à galeria.");
      return;
    }

    const { data, error } = await supabaseClient
      .from("fotos")
      .select("id, nome, imagem_url, storage_path, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar a galeria:", error);
      mostrarMensagem(
        galeria,
        "Não foi possível carregar a galeria. Tente novamente mais tarde."
      );
      return;
    }

    galeria.replaceChildren();

    if (!data?.length) {
      mostrarMensagem(galeria, "Ainda não há fotos ou vídeos na galeria.");
      return;
    }

    data.forEach((item) => {
      if (!item.imagem_url) {
        console.warn("Item da galeria sem imagem_url:", item);
        return;
      }

      const card = criarElemento(
        "article",
        ehVideo(item) ? "gallery-item gallery-item-video" : "gallery-item"
      );

      card.appendChild(criarMidia(item));

      if (item.nome) {
        const legenda = criarElemento("p", "gallery-caption", item.nome);
        card.appendChild(legenda);
      }

      galeria.appendChild(card);
    });

    if (!galeria.children.length) {
      mostrarMensagem(galeria, "Nenhum arquivo válido foi encontrado na galeria.");
    }
  }

  // ==========================================
  // 9. INICIALIZAR CONTEÚDOS
  // ==========================================

  await Promise.allSettled([
    carregarEventos(),
    carregarPromocoes(),
    carregarAvisos(),
    carregarGaleria()
  ]);
});
// Alternância entre modo claro e noturno
(() => {
  const botaoTema = document.getElementById("themeToggle");

  if (!botaoTema) return;

  function aplicarTema(escuro) {
    document.body.classList.toggle("dark-mode", escuro);

    botaoTema.textContent = escuro ? "☀️" : "🌙";

    botaoTema.setAttribute(
      "aria-label",
      escuro ? "Ativar modo claro" : "Ativar modo noturno"
    );
  }

  let temaSalvo = null;

  try {
    temaSalvo = localStorage.getItem("estacaoAlegriaTema");
  } catch (erro) {
    // O site continua funcionando mesmo se o armazenamento estiver bloqueado.
  }

  aplicarTema(temaSalvo === "escuro");

  botaoTema.addEventListener("click", () => {
    const escuro = !document.body.classList.contains("dark-mode");

    aplicarTema(escuro);

    try {
      localStorage.setItem(
        "estacaoAlegriaTema",
        escuro ? "escuro" : "claro"
      );
    } catch (erro) {
      // A troca de tema continua funcionando nesta visita.
    }
  });
})();
