
document.addEventListener("DOMContentLoaded", async () => {
  // ==========================================
  // 1. CONFIGURAÇÃO DO SUPABASE
  // ==========================================

  const SUPABASE_URL = "https://ggxhghszthcgnkecoiir.supabase.co";
const SUPABASE_KEY = "sb_publishable_EohrXK6tulCPMKavk5GQfw_OxIQkxgQ";

  let supabaseClient = null;

  try {
    if (window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );
    } else {
      console.error("A biblioteca do Supabase não foi carregada.");
    }
  } catch (error) {
    console.error("Erro ao conectar ao Supabase:", error);
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

  function criarCartao(titulo, descricao, data, imagem, tipo) {
    const artigo = criarElemento("article", "feature-card");

    if (imagem) {
      const img = criarElemento("img");
      img.src = imagem;
      img.alt = titulo || "Imagem de divulgação";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.onerror = () => img.remove();
      artigo.appendChild(img);
    }

    const conteudo = criarElemento("div", "card-content");

    const emoji = criarElemento(
      "span",
      "card-emoji",
      tipo === "evento" ? "📅" : "🎁"
    );

    conteudo.appendChild(emoji);
    conteudo.appendChild(criarElemento("h3", "", titulo || "Novidade"));

    if (data) {
      const dataElemento = criarElemento(
        "p",
        "item-date",
        `${tipo === "evento" ? "Data do evento" : "Válido até"}: ${formatarData(data)}`
      );
      conteudo.appendChild(dataElemento);
    }

    if (descricao) {
      conteudo.appendChild(criarElemento("p", "", descricao));
    }

    artigo.appendChild(conteudo);

    return artigo;
  }

  function mostrarMensagem(container, mensagem) {
    if (!container) return;

    container.replaceChildren(
      criarElemento("p", "empty-message", mensagem)
    );
  }

  // ==========================================
  // 4. CARREGAR EVENTOS
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
      .order("data_evento", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Erro ao carregar eventos:", error);
      mostrarMensagem(container, "Não foi possível carregar os eventos.");
      return;
    }

    container.replaceChildren();

    if (!data || data.length === 0) {
      mostrarMensagem(container, "Ainda não há eventos publicados. Fique de olho nas novidades!");
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
  // 5. CARREGAR PROMOÇÕES
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

    if (ativas.length === 0) {
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
  // 6. CARREGAR AVISOS
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

    if (!data || data.length === 0) {
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
        conteudo.appendChild(
          criarElemento("p", "", aviso.descricao)
        );
      }

      cartao.appendChild(icone);
      cartao.appendChild(conteudo);
      container.appendChild(cartao);
    });
  }

  // ==========================================
  // 7. INICIALIZAR CONTEÚDOS
  // ==========================================

  await Promise.allSettled([
    carregarEventos(),
    carregarPromocoes(),
    carregarAvisos()
  ]);
});
