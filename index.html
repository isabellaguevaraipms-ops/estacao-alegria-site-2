```javascript
// ============================================
// ESTAÇÃO ALEGRIA — SITE PÚBLICO
// ============================================

const SUPABASE_URL = "https://ggxhghszthcgnkecoiir.supabase.co";
const SUPABASE_KEY = "sb_publishable_EohrXK6tulCPMKavk5GQfw_OxIQkxgQ";
const MEDIA_BUCKET = "foto";

let supabaseClient = null;

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  if (!window.supabase?.createClient) {
    console.error("Biblioteca Supabase não carregada.");
    mostrarErroGeral("Não foi possível conectar ao sistema.");
    return;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  configurarMenu();

  const ano = document.getElementById("currentYear");
  if (ano) ano.textContent = new Date().getFullYear();

  // Cada seção carrega separadamente.
  carregarGaleria();
  carregarEventos();
  carregarPromocoes();
  carregarAvisos();
});

// ============================================
// ELEMENTOS E MENSAGENS
// ============================================

function encontrarElemento(ids) {
  for (const id of ids) {
    const elemento = document.getElementById(id);
    if (elemento) return elemento;
  }
  return null;
}

function mostrarErroGeral(mensagem) {
  const galeria = encontrarElemento([
    "photoGallery",
    "photo-gallery",
    "galeria"
  ]);

  if (galeria) galeria.textContent = mensagem;
}

function criarMensagem(texto) {
  const p = document.createElement("p");
  p.textContent = texto;
  return p;
}

// ============================================
// MENU RESPONSIVO
// ============================================

function configurarMenu() {
  const botao = document.getElementById("menuToggle");
  const navegacao = document.getElementById("navigation");

  if (!botao || !navegacao) return;

  botao.addEventListener("click", () => {
    const aberto = navegacao.classList.toggle("active");
    botao.setAttribute("aria-expanded", String(aberto));
  });

  navegacao.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navegacao.classList.remove("active");
      botao.setAttribute("aria-expanded", "false");
    });
  });
}

// ============================================
// GALERIA DE FOTOS E VÍDEOS
// ============================================

async function carregarGaleria() {
  const galeria = encontrarElemento([
    "photoGallery",
    "photo-gallery",
    "galeria"
  ]);

  if (!galeria) {
    console.error(
      'Galeria não encontrada. Confira o ID no HTML.'
    );
    return;
  }

  galeria.textContent = "Carregando fotos...";

  let temporizador;

  try {
    if (!supabaseClient) {
      throw new Error("Cliente Supabase não inicializado.");
    }

    // Evita aguardar indefinidamente pela consulta.
    const consulta = supabaseClient
      .from("fotos")
      .select("id, nome, imagem_url, storage_path, created_at")
      .order("created_at", { ascending: false });

    const resultado = await Promise.race([
      consulta,
      new Promise((resolve) => {
        temporizador = setTimeout(() => {
          resolve({
            data: null,
            error: new Error("Tempo limite ao consultar a galeria.")
          });
        }, 10000);
      })
    ]);

    if (resultado.error) throw resultado.error;

    const fotos = resultado.data || [];
    galeria.replaceChildren();

    if (fotos.length === 0) {
      galeria.appendChild(
        criarMensagem("Nenhuma foto cadastrada na galeria.")
      );
      return;
    }

    let exibidas = 0;

    fotos.forEach((foto) => {
      let url = foto.imagem_url || "";

      // Gera a URL usando o caminho do Storage, se necessário.
      if (!url && foto.storage_path) {
        const resultadoUrl = supabaseClient.storage
          .from(MEDIA_BUCKET)
          .getPublicUrl(foto.storage_path);

        url = resultadoUrl.data?.publicUrl || "";
      }

      if (!url) {
        console.warn("Foto sem URL válida:", foto.id);
        return;
      }

      const card = document.createElement("article");
      card.className = "photo-card";

      const caminho = (foto.storage_path || url)
        .split("?")[0]
        .toLowerCase();

      const ehVideo = /\.(mp4|webm|mov|m4v|ogg)$/i.test(caminho);

      const midia = document.createElement(ehVideo ? "video" : "img");

      midia.src = url;
      midia.className = "gallery-media";

      if (ehVideo) {
        midia.controls = true;
        midia.playsInline = true;
        midia.preload = "metadata";
      } else {
        midia.alt = foto.nome || "Estação Alegria";
        midia.loading = "lazy";
      }

      midia.onerror = () => {
        console.error("Não foi possível carregar a mídia:", url);

        const aviso = criarMensagem(
          "Arquivo indisponível. Verifique as permissões do Storage."
        );

        card.replaceChildren(aviso);
      };

      const legenda = document.createElement("p");
      legenda.className = "photo-caption";
      legenda.textContent = foto.nome || "Estação Alegria";

      card.appendChild(midia);
      card.appendChild(legenda);
      galeria.appendChild(card);

      exibidas++;
    });

    if (exibidas === 0) {
      galeria.replaceChildren(
        criarMensagem(
          "Nenhum arquivo possui uma URL válida para exibição."
        )
      );
    }
  } catch (erro) {
    console.error("Erro ao carregar a galeria:", erro);

    galeria.replaceChildren(
      criarMensagem(
        erro.message === "Tempo limite ao consultar a galeria."
          ? "A consulta demorou demais. Verifique a conexão e as permissões do Supabase."
          : "Erro ao consultar as fotos. Verifique a tabela fotos e suas permissões."
      )
    );
  } finally {
    clearTimeout(temporizador);
  }
}

// ============================================
// EVENTOS
// ============================================

async function carregarEventos() {
  const container = encontrarElemento([
    "eventsContainer",
    "eventosContainer",
    "eventos"
  ]);

  if (!container) return;

  container.textContent = "Carregando eventos...";

  try {
    const { data, error } = await supabaseClient
      .from("eventos")
      .select("id, titulo, descricao, data_evento, imagem_url, created_at")
      .order("data_evento", { ascending: true });

    if (error) throw error;

    container.replaceChildren();

    if (!data?.length) {
      container.appendChild(criarMensagem("Nenhum evento anunciado."));
      return;
    }

    data.forEach((evento) => {
      const card = document.createElement("article");
      card.className = "event-card";

      const titulo = document.createElement("h3");
      titulo.textContent = evento.titulo || "Evento";

      const descricao = document.createElement("p");
      descricao.textContent = evento.descricao || "";

      card.appendChild(titulo);

      if (evento.data_evento) {
        const dataEvento = document.createElement("p");
        dataEvento.textContent = formatarData(evento.data_evento);
        card.appendChild(dataEvento);
      }

      card.appendChild(descricao);

      if (evento.imagem_url) {
        const img = document.createElement("img");
        img.src = evento.imagem_url;
        img.alt = evento.titulo || "Evento";
        img.loading = "lazy";
        img.onerror = () => img.remove();
        card.appendChild(img);
      }

      container.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao carregar eventos:", erro);
    container.replaceChildren(
      criarMensagem("Não foi possível carregar os eventos.")
    );
  }
}

// ============================================
// PROMOÇÕES
// ============================================

async function carregarPromocoes() {
  const container = encontrarElemento([
    "promotionsContainer",
    "promocoesContainer",
    "promocoes"
  ]);

  if (!container) return;

  container.textContent = "Carregando promoções...";

  try {
    const { data, error } = await supabaseClient
      .from("promocoes")
      .select("id, titulo, descricao, validade, imagem_url, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    container.replaceChildren();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const validas = (data || []).filter((promocao) => {
      if (!promocao.validade) return true;

      const validade = new Date(`${promocao.validade}T23:59:59`);

      return !Number.isNaN(validade.getTime()) && validade >= hoje;
    });

    if (!validas.length) {
      container.appendChild(
        criarMensagem("Nenhuma promoção disponível no momento.")
      );
      return;
    }

    validas.forEach((promocao) => {
      const card = document.createElement("article");
      card.className = "promotion-card";

      const titulo = document.createElement("h3");
      titulo.textContent = promocao.titulo || "Promoção";

      const descricao = document.createElement("p");
      descricao.textContent = promocao.descricao || "";

      card.appendChild(titulo);
      card.appendChild(descricao);

      if (promocao.validade) {
        const validade = document.createElement("p");
        validade.textContent =
          `Válida até ${formatarData(promocao.validade)}`;
        card.appendChild(validade);
      }

      if (promocao.imagem_url) {
        const img = document.createElement("img");
        img.src = promocao.imagem_url;
        img.alt = promocao.titulo || "Promoção";
        img.loading = "lazy";
        img.onerror = () => img.remove();
        card.appendChild(img);
      }

      container.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao carregar promoções:", erro);
    container.replaceChildren(
      criarMensagem("Não foi possível carregar as promoções.")
    );
  }
}

// ============================================
// AVISOS
// ============================================

async function carregarAvisos() {
  const container = encontrarElemento([
    "noticesContainer",
    "avisosContainer",
    "avisos"
  ]);

  if (!container) return;

  container.textContent = "Carregando avisos...";

  try {
    const { data, error } = await supabaseClient
      .from("avisos")
      .select("id, titulo, descricao, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    container.replaceChildren();

    if (!data?.length) {
      container.appendChild(criarMensagem("Nenhum aviso no momento."));
      return;
    }

    data.forEach((aviso) => {
      const card = document.createElement("article");
      card.className = "notice-card";

      const titulo = document.createElement("h3");
      titulo.textContent = aviso.titulo || "Aviso";

      const descricao = document.createElement("p");
      descricao.textContent = aviso.descricao || "";

      card.appendChild(titulo);
      card.appendChild(descricao);
      container.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao carregar avisos:", erro);
    container.replaceChildren(
      criarMensagem("Não foi possível carregar os avisos.")
    );
  }
}

// ============================================
// FORMATAÇÃO DE DATA
// ============================================

function formatarData(valor) {
  if (!valor) return "";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return valor;

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
```
