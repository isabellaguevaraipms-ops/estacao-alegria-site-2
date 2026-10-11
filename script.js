```javascript
// ============================================
// ESTAÇÃO ALEGRIA — SITE PÚBLICO
// Compatível com o HTML enviado
// ============================================

const SUPABASE_URL = "https://ggxhghszthcgnkecoiir.supabase.co";
const SUPABASE_KEY = "sb_publishable_EohrXK6tulCPMKavk5GQfw_OxIQkxgQ";
const MEDIA_BUCKET = "foto";

let supabaseClient = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!window.supabase?.createClient) {
    mostrarMensagem("photoGallery", "Biblioteca do Supabase não carregada.");
    mostrarMensagem("eventList", "Não foi possível conectar ao sistema.");
    mostrarMensagem("promotionList", "Não foi possível conectar ao sistema.");
    return;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  configurarMenu();

  const ano = document.getElementById("currentYear");
  if (ano) ano.textContent = new Date().getFullYear();

  carregarGaleria();
  carregarEventos();
  carregarPromocoes();
  carregarAvisos();
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function mostrarMensagem(id, mensagem) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = mensagem;
}

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;

  return elemento;
}

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

// Executa uma consulta com limite de espera.
async function consultarComLimite(consulta, milissegundos = 12000) {
  let temporizador;

  try {
    return await Promise.race([
      consulta,
      new Promise((_, rejeitar) => {
        temporizador = setTimeout(() => {
          rejeitar(new Error("Tempo limite de conexão com o Supabase."));
        }, milissegundos);
      })
    ]);
  } finally {
    clearTimeout(temporizador);
  }
}

// ============================================
// MENU
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
  const galeria = document.getElementById("photoGallery");
  if (!galeria) return;

  galeria.replaceChildren(criarElemento("p", "", "Carregando fotos..."));

  try {
    const { data, error } = await consultarComLimite(
      supabaseClient
        .from("fotos")
        .select("id, nome, imagem_url, storage_path, created_at")
        .order("created_at", { ascending: false })
    );

    if (error) throw error;

    galeria.replaceChildren();

    if (!data || data.length === 0) {
      galeria.appendChild(
        criarElemento("p", "", "Ainda não há fotos ou vídeos publicados.")
      );
      return;
    }

    let quantidade = 0;

    data.forEach((foto) => {
      let url = foto.imagem_url || "";

      if (!url && foto.storage_path) {
        const resultado = supabaseClient.storage
          .from(MEDIA_BUCKET)
          .getPublicUrl(foto.storage_path);

        url = resultado.data?.publicUrl || "";
      }

      if (!url) {
        console.warn("Foto sem URL válida:", foto.id);
        return;
      }

      const caminho = (foto.storage_path || url)
        .split("?")[0]
        .toLowerCase();

      const ehVideo = /\.(mp4|webm|mov|m4v|ogg)$/i.test(caminho);

      const card = criarElemento("article", "photo-card");
      const midia = document.createElement(ehVideo ? "video" : "img");

      midia.className = "gallery-media";
      midia.src = url;

      if (ehVideo) {
        midia.controls = true;
        midia.playsInline = true;
        midia.preload = "metadata";
      } else {
        midia.alt = foto.nome || "Estação Alegria";
        midia.loading = "lazy";
      }

      midia.addEventListener("error", () => {
        console.error("Falha ao carregar mídia:", url);
        midia.replaceWith(
          criarElemento("p", "", "Não foi possível abrir este arquivo.")
        );
      });

      const legenda = criarElemento(
        "p",
        "photo-caption",
        foto.nome || "Estação Alegria"
      );

      card.append(midia, legenda);
      galeria.appendChild(card);
      quantidade++;
    });

    if (quantidade === 0) {
      galeria.appendChild(
        criarElemento("p", "", "Nenhum arquivo válido encontrado.")
      );
    }
  } catch (erro) {
    console.error("Erro na galeria:", erro);

    galeria.replaceChildren(
      criarElemento(
        "p",
        "",
        "Não foi possível carregar as fotos. Verifique a conexão e as permissões do Supabase."
      )
    );
  }
}

// ============================================
// EVENTOS
// ============================================

async function carregarEventos() {
  const lista = document.getElementById("eventList");
  if (!lista) return;

  lista.replaceChildren(criarElemento("p", "", "Carregando eventos..."));

  try {
    const { data, error } = await consultarComLimite(
      supabaseClient
        .from("eventos")
        .select("id, titulo, descricao, data_evento, imagem_url, created_at")
        .order("data_evento", { ascending: true })
    );

    if (error) throw error;

    lista.replaceChildren();

    if (!data?.length) {
      lista.appendChild(criarElemento("p", "", "Nenhum evento anunciado."));
      return;
    }

    data.forEach((evento) => {
      const card = criarElemento("article", "event-card");

      card.appendChild(
        criarElemento("h3", "", evento.titulo || "Evento")
      );

      if (evento.data_evento) {
        card.appendChild(
          criarElemento("p", "event-date", formatarData(evento.data_evento))
        );
      }

      if (evento.descricao) {
        card.appendChild(criarElemento("p", "", evento.descricao));
      }

      if (evento.imagem_url) {
        const img = document.createElement("img");
        img.src = evento.imagem_url;
        img.alt = evento.titulo || "Evento";
        img.loading = "lazy";
        img.addEventListener("error", () => img.remove());
        card.appendChild(img);
      }

      lista.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro nos eventos:", erro);
    lista.replaceChildren(
      criarElemento("p", "", "Não foi possível carregar os eventos.")
    );
  }
}

// ============================================
// PROMOÇÕES
// ============================================

async function carregarPromocoes() {
  const lista = document.getElementById("promotionList");
  if (!lista) return;

  lista.replaceChildren(
    criarElemento("p", "", "Carregando promoções...")
  );

  try {
    const { data, error } = await consultarComLimite(
      supabaseClient
        .from("promocoes")
        .select("id, titulo, descricao, validade, imagem_url, created_at")
        .order("created_at", { ascending: false })
    );

    if (error) throw error;

    lista.replaceChildren();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const validas = (data || []).filter((promocao) => {
      if (!promocao.validade) return true;

      const validade = new Date(`${promocao.validade}T23:59:59`);
      return !Number.isNaN(validade.getTime()) && validade >= hoje;
    });

    if (!validas.length) {
      lista.appendChild(
        criarElemento("p", "", "Nenhuma promoção disponível no momento.")
      );
      return;
    }

    validas.forEach((promocao) => {
      const card = criarElemento("article", "promotion-card");

      card.appendChild(
        criarElemento("h3", "", promocao.titulo || "Promoção")
      );

      if (promocao.descricao) {
        card.appendChild(criarElemento("p", "", promocao.descricao));
      }

      if (promocao.validade) {
        card.appendChild(
          criarElemento(
            "p",
            "promotion-validity",
            `Válida até ${formatarData(promocao.validade)}`
          )
        );
      }

      if (promocao.imagem_url) {
        const img = document.createElement("img");
        img.src = promocao.imagem_url;
        img.alt = promocao.titulo || "Promoção";
        img.loading = "lazy";
        img.addEventListener("error", () => img.remove());
        card.appendChild(img);
      }

      lista.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro nas promoções:", erro);
    lista.replaceChildren(
      criarElemento("p", "", "Não foi possível carregar as promoções.")
    );
  }
}

// ============================================
// AVISOS
// ============================================

async function carregarAvisos() {
  const lista = document.getElementById("noticeList");
  if (!lista) return;

  try {
    const { data, error } = await consultarComLimite(
      supabaseClient
        .from("avisos")
        .select("id, titulo, descricao, created_at")
        .order("created_at", { ascending: false })
    );

    if (error) throw error;

    lista.replaceChildren();

    if (!data?.length) return;

    data.forEach((aviso) => {
      const card = criarElemento("article", "notice-card");

      card.appendChild(
        criarElemento("h3", "", aviso.titulo || "Aviso")
      );

      if (aviso.descricao) {
        card.appendChild(criarElemento("p", "", aviso.descricao));
      }

      lista.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro nos avisos:", erro);
    lista.replaceChildren(
      criarElemento("p", "", "Não foi possível carregar os avisos.")
    );
  }
}
```
