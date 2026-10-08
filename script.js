/* ============================
   FIREBASE CONFIG (DEBE IR ARRIBA)
============================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, collectionGroup, addDoc, serverTimestamp, getDocs, query, where,
  getDoc, setDoc, updateDoc, doc, deleteDoc, writeBatch, limit
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDUyJYE7z2rdAZy2BAHdcz7sEArYo1_hs",
  authDomain: "premiosjosemari-bc894-f81dd.firebaseapp.com",
  projectId: "premiosjosemari-bc894-f81dd",
  storageBucket: "premiosjosemari-bc894-f81dd.firebasestorage.app",
  messagingSenderId: "534966440503",
  appId: "1:534966440503:web:c87c8abe35303ab15f25b2",
  measurementId: "G-NM0CZT7R2T"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ============================
   COLLAGE LOGIN
============================ */
(function () {
  const IMAGES = [
    "fotos/login/fotoA.jpeg","fotos/login/fotoB.jpeg","fotos/login/fotoC.jpeg",
    "fotos/login/fotoD.jpeg","fotos/login/fotoE.jpeg","fotos/login/fotoF.jpeg",
    "fotos/login/fotoG.jpeg","fotos/login/fotoH.jpeg","fotos/login/fotoI.jpeg",
    "fotos/login/fotoJ.jpeg","fotos/login/fotoK.jpeg","fotos/login/fotoL.jpeg"
  ];

  const cont = document.getElementById('loginCollage');
  if (!cont) return;

  // Barajar las fotos
  for (let i = IMAGES.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [IMAGES[i], IMAGES[j]] = [IMAGES[j], IMAGES[i]];
  }

  // Crear figuras
  IMAGES.forEach(src => {
    const fig = document.createElement('figure');
    fig.className = 'tile';
    const rot = (Math.random() * 6 - 3).toFixed(1);
    fig.style.setProperty('--r', rot + 'deg');

    const crop = document.createElement('div');
    crop.className = 'crop';

    const img = new Image();
    img.src = src;
    img.alt = '';

    crop.appendChild(img);
    fig.appendChild(crop);
    cont.appendChild(fig);
  });
})();

/* ============================
   LOGIN + USUARIOS PERMITIDOS
============================ */
// Usuario → Email + Avatar
const loginMap = {
  "Asier":   { email: "asier@premios.com",   avatar: "fotos/asieras.jpeg" },
  "Rulas":   { email: "rulas@premios.com",   avatar: "fotos/rulillas.jpeg" },
  "Fervico": { email: "fervico@premios.com", avatar: "fotos/fervico.jpeg" },
  "Maria":   { email: "maria@premios.com",   avatar: "fotos/maria.jpeg" },
  "Manu":    { email: "manu@premios.com",    avatar: "fotos/manu.jpeg" },
  "Iker":    { email: "iker@premios.com",    avatar: "fotos/iker.jpeg" },
  "Dani":    { email: "dani@premios.com",    avatar: "fotos/dani.jpeg" },
  "Ivanp":   { email: "ivanp@premios.com",   avatar: "fotos/ivanp.jpeg" },
  "Poru":    { email: "poru@premios.com",    avatar: "fotos/Poru.jpeg" },
  "Dario":   { email: "dario@premios.com",   avatar: "fotos/dario.jpeg" },
  "Ines":    { email: "ines@premios.com",    avatar: "fotos/ines.jpeg" },
  "Labrada": { email: "labrada@premios.com", avatar: "fotos/labrada.jpeg" },
  "Lucia":   { email: "lucia@premios.com",   avatar: "fotos/Lucia.jpeg" },
  "Marco":   { email: "marco@premios.com",   avatar: "fotos/marco.jpeg" },
  "Gamepro": { email: "gamepro@premios.com", avatar: "fotos/gamepro.jpeg" },
  "Mario":   { email: "mario@premios.com",   avatar: "fotos/mario.jpeg" }
};

/* ============================
   PINTAR PERFIL EN CABECERA
============================ */
function mostrarPerfil(nombre) {
  const info = loginMap[nombre] || {};
  document.getElementById("nombreUsuario").textContent = nombre;
  document.getElementById("avatarUsuario").src = info.avatar || "fotos/default-user.png";
  document.getElementById("perfilUsuario").style.display = "flex";
}

/* ============================
   LOGIN (BOTÓN)
============================ */
document.getElementById("btnLogin")?.addEventListener("click", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("loginUser")?.value.trim();
  const pass   = document.getElementById("loginPass")?.value.trim();
  const error  = document.getElementById("loginError");

  const info = loginMap[nombre];

  // Si no existe ese usuario en el mapa → error
  if (!info) {
    if (error) error.style.display = "block";
    return;
  }

  try {
    // 🔐 Login REAL contra Firebase Auth
// 🔐 Login REAL contra Firebase Auth
await signInWithEmailAndPassword(auth, info.email, pass);

// Si ha ido bien, guardamos nombre “bonito”
localStorage.setItem("usuarioLogueado", nombre);


    mostrarPerfil(nombre);
    controlarAccesoResultados();
    controlarSeccionesCerradas();

    document.getElementById("login").style.display = "none";
    document.getElementById("appContent").style.display = "block";

    mostrarSeccion("inicio");

    if (window.actualizarEstadoBotonNominaciones) {
      await window.actualizarEstadoBotonNominaciones();
    }
    if (window.actualizarEstadoBotonVotacion) {
      await window.actualizarEstadoBotonVotacion();
    }

    if (error) error.style.display = "none";
  } catch (err) {
    console.error(err);
    if (error) error.style.display = "block";
  }
});


/* ============================
   CONTROL DE ACCESO 
============================ */
function controlarAccesoResultados() {
  const user = localStorage.getItem("usuarioLogueado");
  const btn = document.getElementById("btnResultados");
  if (!btn) return;
  btn.style.display = ["Rulas", "Lucia"].includes(user) ? "" : "none";
}


/* =====================================
   MODO PREPARACIÓN — JOSEMARI III
===================================== */

// Cambiar a true cuando se abran las secciones.
const CATEGORIAS_ABIERTAS = false;
const NOMINACIONES_ABIERTAS = false;
const VOTACIONES_ABIERTAS = false;

// Nombres exactos del login.
const ORGANIZADORES = ["Rulas", "Lucia"];

function esOrganizador() {
  const usuario = localStorage.getItem("usuarioLogueado");
  return ORGANIZADORES.includes(usuario);
}

function controlarSeccionesCerradas() {
  const organizador = esOrganizador();

  const accesos = {
    categorias: CATEGORIAS_ABIERTAS,
    "votacion-nominados": NOMINACIONES_ABIERTAS,
    votacion: VOTACIONES_ABIERTAS,
    "tu-votacion": VOTACIONES_ABIERTAS
  };

  // Ocultar del menú las secciones cerradas.
  document.querySelectorAll(
    "nav.top .nav-actions button"
  ).forEach(boton => {

    const onclick = boton.getAttribute("onclick") || "";

    for (const [seccion, abierta] of Object.entries(accesos)) {

      if (onclick.includes(`'${seccion}'`)) {
        boton.hidden = !organizador && !abierta;

        // hidden puede ser anulado por otros estilos.
        boton.style.display =
          !organizador && !abierta ? "none" : "";
      }
    }
  });
}

function puedeVerSeccion(seccion) {
  if (esOrganizador()) return true;

  if (seccion === "resultados") {
  return false;
}

  if (seccion === "categorias") {
    return CATEGORIAS_ABIERTAS;
  }

  if (seccion === "votacion-nominados") {
    return NOMINACIONES_ABIERTAS;
  }

  if ([
    "votacion",
    "tu-votacion"
  ].includes(seccion)) {
    return VOTACIONES_ABIERTAS;
  }

  return true;
}

/* ============================
   UTILIDADES LOGOUT
============================ */
function closeAllModalsAndMedia() {
  const modals = [
    document.getElementById("modalParticipante"),
    document.getElementById("modalCategoria"),
    document.getElementById("videoLightbox")
  ];
  modals.forEach(m => { if (m) m.style.display = "none"; });

  const v = document.getElementById("lightboxVideo");
  if (v) {
    try { v.pause(); } catch {}
    v.removeAttribute("src");
    v.removeAttribute("poster");
    v.load?.();
  }

  document.body.style.overflow = "";
}

function stopAllInlineVideos(scope = document) {
  scope.querySelectorAll("video").forEach(vid => {
    try { vid.pause(); } catch {}
    const src = vid.getAttribute("src");
    if (src) {
      vid.removeAttribute("src");
      vid.load?.();
    }
  });
}

function hideAllSectionsExceptLogin() {
  document.querySelectorAll(".seccion").forEach(s => s.style.display = "none");

  const login = document.getElementById("login");
  login.style.display = "block";

  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
  document.getElementById("loginError").style.display = "none";
}

function resetUrlAndScroll() {
  if (history.pushState) {
    const clean = location.pathname;
    history.pushState(null, "", clean);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
  document.activeElement?.blur?.();
}

/* ============================
   LOGOUT
============================ */
async function logout() {

  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error cerrando sesión:", error);
  }

  localStorage.removeItem("usuarioLogueado");

  document.getElementById("perfilUsuario").style.display = "none";

  closeAllModalsAndMedia();
  stopAllInlineVideos();

  document.getElementById("appContent").style.display = "none";

  hideAllSectionsExceptLogin();

  resetUrlAndScroll();
}

document.getElementById("perfilUsuario")?.addEventListener("click", () => {
  if (confirm("¿Cerrar sesión?")) logout();
});

/* ============================
   NAVEGACIÓN ENTRE SECCIONES
============================ */
function mostrarSeccion(seccion) {


  if (!puedeVerSeccion(seccion)) {
  mostrarSeccion("inicio");
  return;
}

  const necesitaLogin = !["login","inicio","participantes","categorias"].includes(seccion);
  const user = localStorage.getItem("usuarioLogueado");

  if (necesitaLogin && !user) seccion = "login";

  // mostrar/ocultar cascada imágenes laterales
  const leftHero  = document.querySelector(".hero-marquee.izquierda");
  const rightHero = document.querySelector(".hero-marquee.derecha");

  if (leftHero && rightHero) {
    if (seccion === "inicio") {
      leftHero.style.display = "block";
      rightHero.style.display = "block";
    } else {
      leftHero.style.display = "none";
      rightHero.style.display = "none";
    }
  }

  document.querySelectorAll(".seccion").forEach(s => s.style.display = "none");
  document.getElementById(seccion).style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (seccion === "login") {
    document.getElementById("loginError").style.display = "none";
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";
  }

  if (seccion === "resultados") cargarResultados?.();
}

/* ============================
   SESIÓN RECORDADA
============================ */
onAuthStateChanged(auth, async (firebaseUser) => {

  if (firebaseUser) {

    const nombre = Object.keys(loginMap).find(
      nombre => loginMap[nombre].email === firebaseUser.email
    );

    if (!nombre) {
      await signOut(auth);
      localStorage.removeItem("usuarioLogueado");
      return;
    }

    localStorage.setItem("usuarioLogueado", nombre);

    mostrarPerfil(nombre);
    controlarAccesoResultados();
    controlarSeccionesCerradas();

    document.getElementById("login").style.display = "none";
    document.getElementById("appContent").style.display = "block";

    mostrarSeccion("inicio");

  } else {

    localStorage.removeItem("usuarioLogueado");

    document.getElementById("login").style.display = "block";
    document.getElementById("appContent").style.display = "none";
  }

});


/* ============================
   VIDEO LIGHTBOX — CIERRE HARD
============================ */
window.closeVideoLightboxHard = function () {
  const modal = document.getElementById("videoLightbox");
  const video = document.getElementById("lightboxVideo");
  if (!modal || !video) return;

  try { video.pause(); } catch {}

  video.removeAttribute("src");
  video.removeAttribute("poster");
  video.load?.();

  modal.hidden = true;
  document.body.style.overflow = "";
};

/* ============================
   VIDEO LIGHTBOX — LISTENERS
============================ */
(() => {
  const modal = document.getElementById("videoLightbox");
  if (!modal || modal.dataset.bound) return; 
  modal.dataset.bound = "1";

  const video = document.getElementById("lightboxVideo");

  function closeVideoLightbox() {
    try { video.pause(); } catch {}
    video.removeAttribute("src");
    video.removeAttribute("poster");
    video.load?.();
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  // Cerrar al hacer clic fuera
  modal.addEventListener("click", (e) => {
    if (e.target.id === "videoLightbox") closeVideoLightbox();
  });

  // Evitar cierre al clicar dentro del modal
  modal.querySelector(".video-modal__inner")?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Botón X
  modal.querySelector(".video-modal__close")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeVideoLightbox();
  });

  // Tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeVideoLightbox();
  });
})();


/* ============================================
   INICIO — FOTOS HORIZONTALES ARRIBA Y ABAJO
============================================ */
(function () {

  const TOTAL_FOTOS = 85;

  /* Si alguna foto tiene una extensión distinta,
     la ponemos aquí.
     Todas por defecto serán .jpeg */
  const EXTENSIONES_ESPECIALES = {
    21: ".jpg"
  };

  function obtenerRutaFoto(numero) {
    const extension =
      EXTENSIONES_ESPECIALES[numero] || ".jpeg";

    return `fotos/login/foto${numero}${extension}`;
  }

  /* Lista completa de fotos: foto1 ... foto85 */
  const TODAS_LAS_FOTOS = Array.from(
    { length: TOTAL_FOTOS },
    (_, i) => obtenerRutaFoto(i + 1)
  );

  /* Mezcla aleatoria */
  function mezclar(fotos) {
    const copia = [...fotos];

    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
  }

  /* Reparte las fotos mezcladas entre arriba y abajo
     para que queden salteadas */
  function repartirFotos(fotos) {
    const mezcladas = mezclar(fotos);

    const arriba = [];
    const abajo = [];

    mezcladas.forEach((foto, indice) => {
      if (indice % 2 === 0) {
        arriba.push(foto);
      } else {
        abajo.push(foto);
      }
    });

    return { arriba, abajo };
  }

  /* Construye una fila de fotografías */
  function crearGrupo(fotos) {
    const grupo = document.createElement("div");
    grupo.className = "hero-photo-group";

    fotos.forEach(src => {
      const marco = document.createElement("div");
      marco.className = "hero-polaroid";

      const imagen = document.createElement("img");
      imagen.src = src;
      imagen.alt = "";
      imagen.loading = "lazy";
      imagen.decoding = "async";
      marco.appendChild(imagen);
      grupo.appendChild(marco);
    });

    return grupo;
  }

  /* Rellena una cinta con dos grupos idénticos
     para conseguir un desplazamiento infinito */
  function crearCinta(selector, fotos) {
    const escenario = document.querySelector(
      selector + " .hero-stage"
    );

    if (!escenario) return;

    escenario.replaceChildren();

    const primerGrupo = crearGrupo(fotos);
    const segundoGrupo = crearGrupo(fotos);

    segundoGrupo.setAttribute("aria-hidden", "true");

    escenario.appendChild(primerGrupo);
    escenario.appendChild(segundoGrupo);
  }

  function iniciarCintas() {

    // Elegimos 36 fotos aleatorias de las 85 disponibles
    const fotosElegidas =
      mezclar(TODAS_LAS_FOTOS).slice(0, 36);

    const { arriba, abajo } =
      repartirFotos(fotosElegidas);

    crearCinta(".hero-strip-top", arriba);
    crearCinta(".hero-strip-bottom", abajo);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciarCintas
    );
  } else {
    iniciarCintas();
  }

})();


// IDs seguros para Firestore
function safeIdPart(str) {
  return encodeURIComponent(String(str).replaceAll('/', '_'));
}


/* ============================================
   CICLO GENERAL DE VOTACIONES
============================================ */
const CONFIG_DOC = doc(db, "config", "estado");

async function getCicloActual() {
  const snap = await getDoc(CONFIG_DOC);
  if (!snap.exists()) {
    await setDoc(CONFIG_DOC, { ciclo: 1 });
    return 1;
  }
  const data = snap.data();
  return typeof data.ciclo === "number" ? data.ciclo : 1;
}

async function aumentarCiclo() {
  const ciclo = await getCicloActual();
  try {
    await updateDoc(CONFIG_DOC, { ciclo: ciclo + 1 });
  } catch {
    await setDoc(CONFIG_DOC, { ciclo: ciclo + 1 });
  }
  return ciclo + 1;
}


/* ============================================
   CAMBIO DE SECCIÓN
============================================ */
window.mostrarSeccion = async function (seccion) {

  // Bloqueo de secciones cerradas
  if (!puedeVerSeccion(seccion)) {
    seccion = "inicio";
  }

  // Bloqueo por login
  const necesitaLogin = !["login","inicio","participantes","categorias"]
    .includes(seccion);

  const user = localStorage.getItem("usuarioLogueado");

  if (necesitaLogin && !user) {
    seccion = "login";
  }


  // Ocultar todas y mostrar la seleccionada
  document.querySelectorAll(".seccion").forEach(sec => sec.style.display = "none");
  const destino = document.getElementById(seccion);
  if (destino) destino.style.display = "block";

  // Scroll top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // NOMINACIONES POR LOTES
    if (seccion === "votacion-nominados") {

      await sincronizarLoteActivo();

      renderNominadosPorLotes();

    if (window.actualizarEstadoBotonNominaciones)
      await window.actualizarEstadoBotonNominaciones();

    if (typeof enhanceCategoryHeaders === "function")
      enhanceCategoryHeaders();
  }

  // RESULTADOS
  if (seccion === "resultados" && typeof cargarResultados === "function") {
    cargarResultados();
  }

  // TU VOTACIÓN
  if (seccion === "tu-votacion" && typeof cargarTuVotacion === "function") {
    cargarTuVotacion();
  }

  // Estilos especiales para la pestaña "votacion"
  if (seccion === "votacion") {
    document.body.classList.add("tab-votacion");
  } else {
    document.body.classList.remove("tab-votacion");
  }

  // Botón de votar
  if (seccion === "votacion" && window.actualizarEstadoBotonVotacion) {
    await window.actualizarEstadoBotonVotacion();
  }
};
/* ============================================
   TU VOTACIÓN — CARGA DE VOTOS Y NOMINACIONES
============================================ */

async function cargarTuVotacion() {
  const user = localStorage.getItem("usuarioLogueado");
  const sec       = document.getElementById("tu-votacion");
  const boxSimple = document.getElementById("tuVotacion-simple");
  const boxNom    = document.getElementById("tuVotacion-nominaciones");
  const emptyBox  = document.getElementById("tuVotacion-empty");
  const subtitle  = document.getElementById("tuVotacion-subtitle");

  if (!sec || !boxSimple || !boxNom || !emptyBox) return;

  // Si no hay login → manda a login
  if (!user) {
    subtitle.textContent  = "";
    boxSimple.innerHTML   = "";
    boxNom.innerHTML      = "";
    emptyBox.style.display = "block";
    emptyBox.textContent   = "Debes iniciar sesión para ver tu votación.";
    mostrarSeccion("login");
    return;
  }

  // Estado inicial
  boxSimple.innerHTML  = "<p>Cargando…</p>";
  boxNom.innerHTML      = "<p>Cargando…</p>";
  emptyBox.style.display = "none";
  subtitle.textContent = `Usuario: ${user}`;

  try {
    /* ============================================
       1) VOTACIÓN SIMPLE — ÚLTIMO VOTO POR CATEGORÍA
    ============================================= */
    const qV = query(collection(db, "votaciones"), where("usuario", "==", user));
    const snapV = await getDocs(qV);

    const ultimosPorCat = {};
    snapV.forEach(d => {
      const data = d.data() || {};
      const cat  = data.categoria || "Sin categoría";
      const ts   = data.timestamp?.seconds || 0;

      if (!ultimosPorCat[cat] || ts > ultimosPorCat[cat].ts) {
        ultimosPorCat[cat] = { voto: data.voto, ts };
      }
    });

    if (Object.keys(ultimosPorCat).length === 0) {
      boxSimple.innerHTML = "<p>No hay votos registrados aún.</p>";
    } else {
      const ul = document.createElement("ul");

      Object.entries(ultimosPorCat)
        .sort(([a],[b]) => a.localeCompare(b))
        .forEach(([categoria, { voto }]) => {
          const li = document.createElement("li");
          li.textContent = `${categoria}: ${voto}`;
          ul.appendChild(li);
        });

      boxSimple.innerHTML = "";
      boxSimple.appendChild(ul);
    }


    /* ============================================
   2) NOMINACIONES — JOSEMARI III 2026
============================================= */

const firebaseUser = auth.currentUser;

if (!firebaseUser) {
  boxNom.innerHTML = "<p>No has enviado nominaciones aún.</p>";
} else {

  const uid = firebaseUser.uid;
  const porCat = {};

  // Leer individualmente los 6 lotes del usuario.
  // Así funciona con las reglas actuales de Firestore.
  for (let lote = 1; lote <= 6; lote++) {

    const referencia = doc(
      db,
      "nominaciones_2026",
      uid,
      "lotes",
      `lote_${lote}`
    );

    const snap = await getDoc(referencia);

    if (!snap.exists()) continue;

    const data = snap.data() || {};
    const votos = data.votos || {};

    Object.entries(votos).forEach(([categoria, nominados]) => {
      porCat[categoria] = Array.isArray(nominados)
        ? nominados
        : [];
    });
  }

  if (Object.keys(porCat).length === 0) {

    boxNom.innerHTML =
      "<p>No has enviado nominaciones aún.</p>";

  } else {

    const frag = document.createDocumentFragment();

    Object.entries(porCat)
      .sort(([a], [b]) => a.localeCompare(b, "es"))
      .forEach(([categoria, nominados]) => {

        const wrap = document.createElement("div");

        const h4 = document.createElement("h4");
        h4.textContent = categoria;

        const ul = document.createElement("ul");

        (nominados.length
          ? nominados
          : ["(sin nombres)"]
        ).forEach(n => {

          const li = document.createElement("li");
          li.textContent = n;
          ul.appendChild(li);

        });

        wrap.appendChild(h4);
        wrap.appendChild(ul);
        frag.appendChild(wrap);
      });

    boxNom.innerHTML = "";
    boxNom.appendChild(frag);
  }
}


    /* ============================================
       3) ¿Está todo vacío?
    ============================================= */
    const vacioSimple = boxSimple.textContent.includes("No hay votos");
    const vacioNom    = boxNom.textContent.includes("No has enviado nominaciones");

    emptyBox.style.display = (vacioSimple && vacioNom) ? "block" : "none";

  } catch (e) {
    console.error("Error cargando 'Tu votación':", e);
    boxSimple.innerHTML = "<p>Error cargando tus votos.</p>";
    boxNom.innerHTML    = "<p>Error cargando tus nominaciones.</p>";
  }
}
/* ============================================
   REFRESCAR "TU VOTACIÓN"
============================================ */

const btnRefresh = document.getElementById("tuVotacion-refresh");
if (btnRefresh && !btnRefresh.dataset.bound) {
  btnRefresh.dataset.bound = "1";
  btnRefresh.addEventListener("click", cargarTuVotacion);
}

// Exponer función al window
window.cargarTuVotacion = cargarTuVotacion;


/* ============================================
   CABECERAS CON IMAGEN PARA CADA CATEGORÍA
============================================ */

const DEFAULT_PLACA = "fotos/placa-default.png";

const categoryImages = {

  // DÍA 1
  "Mejor jugador de pádel del año": "fotos/mejorpadelista.png",
  "Peor Playus del año": "fotos/peorplayus.png",
  "Viajero del año": "fotos/viajero.jpeg",
  "Llorón del año": "fotos/lloron.jpeg",

  // DÍA 2
  "Fiestero del año": "fotos/fiestero.jpeg",
  "Borrachera del año": "fotos/borracho.jpeg",
  "Picado del año": "fotos/picado.png",
  "Princeso del año": "fotos/princeso.png",

  // DÍA 3
  "Huella Digital": "fotos/huella.png",
  "Mensaje del año": "fotos/mensaje.jpeg",
  "Sticker del año": "fotos/sticker.png",
  "Outfit del año": "fotos/outfit.png",
  "Objeto del año": "fotos/objeto.jpg",

  // DÍA 4
  "Mejor personaje fuera de CT del año": "fotos/personaje.png",
  "Enemigo del año": "fotos/enemigo.png",
  "Palabra/Frase del año": "fotos/palabra.jpeg",
  "Mote del año": "fotos/mote.jpeg",
  "Broma del año": "fotos/broma.jpeg",

  // DÍA 5
  "Fail del año": "fotos/fail.jpeg",
  "Autistada del año": "fotos/autistada.jpg",
  "Fiesta del año": "fotos/fiesta.jpeg",
  "Foto del año": "fotos/foto.jpeg",
  "Video del año": "fotos/video.jpeg",

  // DÍA 6
  "Peor momento del año": "fotos/p_momento.jpeg",
  "Revelación del año": "fotos/revelacion.png",
  "Mejor momento del año": "fotos/m_momento.jpeg",
  "Decepción del año": "fotos/decepcion.jpeg",
  "MVP del año": "fotos/mvp.png"

};


/* ============================================
   FUNCIÓN PARA INSERTAR CABECERAS CON IMAGEN
============================================ */

function enhanceCategoryHeaders() {
  const wrap = document.getElementById("nominadosWrapper");
  if (!wrap) return;

  // Permite re-ejecutarlo cada vez que se cambia lote
  delete wrap.dataset.headersEnhanced;
  if (wrap.dataset.headersEnhanced === "1") return;

  wrap.querySelectorAll(":scope > h2").forEach(h2 => {
    const titulo = h2.textContent.trim();

    // Si ya está transformado, no repetir
    if (h2.closest(".cat-header")) return;

    const imgSrc = categoryImages[titulo] || DEFAULT_PLACA;

    const p = (h2.nextElementSibling && h2.nextElementSibling.tagName === "P")
      ? h2.nextElementSibling
      : null;

    const header = document.createElement("div");
    header.className = "cat-header";

    const img = document.createElement("img");
    img.className = "cat-badge";
    img.src = imgSrc;
    img.alt = titulo;

    const wrapTitle = document.createElement("div");
    wrapTitle.className = "title-group";
    wrapTitle.appendChild(h2.cloneNode(true));
    if (p) wrapTitle.appendChild(p.cloneNode(true));

    header.appendChild(img);
    header.appendChild(wrapTitle);

    // Insertar cabecera completa antes del viejo h2
    h2.parentNode.insertBefore(header, h2);

    if (p) p.remove();
    h2.remove();
  });

  wrap.dataset.headersEnhanced = "1";
}
/* ============================================
   VOTACIÓN FINAL — 3 LOTES x 10 CATEGORÍAS
   (igual que las nominaciones)
============================================ */

/**
 * Aquí defines los FINALISTAS de cada categoría.
 * Por ahora las dejo vacías para que tú pongas los 4 nominados finales
 * de cada una (nombre + foto).
 *
 * Ejemplo de una categoría:
 *
 * "Viajero/a del año": [
 *   { nombre: "Finalista 1", foto: "fotos/finalistas/viajero1.jpeg" },
 *   { nombre: "Finalista 2", foto: "fotos/finalistas/viajero2.jpeg" },
 *   { nombre: "Finalista 3", foto: "fotos/finalistas/viajero3.jpeg" },
 *   { nombre: "Finalista 4", foto: "fotos/finalistas/viajero4.jpeg" }
 * ],
 */

const CATEGORIAS_VOTACION = {
  // LOTE 1
  "Viajero/a del año": [ { nombre: "Ines",   foto: "fotos/ines.jpeg" },
    { nombre: "Labrada",   foto: "fotos/labrada.jpeg" },
    { nombre: "Poru",   foto: "fotos/Poru.jpeg" },
    { nombre: "Manu",   foto: "fotos/manu.jpeg" }
  ],
  "Picado/a del año": [ { nombre: "Marco",   foto: "fotos/marco.jpeg" },
    { nombre: "Rulas",   foto: "fotos/rulillas.jpeg" },
    { nombre: "Ivanp",   foto: "fotos/ivanp.jpeg" },
    { nombre: "Mario",   foto: "fotos/mario.jpeg" }
  ],
  "Guarrete del año": [ { nombre: "Iker",   foto: "fotos/iker.jpeg" },
    { nombre: "Marco",   foto: "fotos/marco.jpeg" },
    { nombre: "Darío",   foto: "fotos/dario.jpeg" },
    { nombre: "Labrada",   foto: "fotos/labrada.jpeg" }
  ],
  "Papi/Mami del año": 
  [ { nombre: "Fervico",   foto: "fotos/fervico.jpeg" },
    { nombre: "Labrada",   foto: "fotos/labrada.jpeg" },
    { nombre: "Lucía",   foto: "fotos/Lucia.jpeg" },
    { nombre: "Ines",   foto: "fotos/ines.jpeg" }
  ],
  "Meme del año": [ 
    { nombre: "Ivanp Gustavo(Poru)", video: "fotos/meme/ivanp.mp4", poster: "fotos/meme/ivanpe.jpeg" },
    { nombre: "Fer en las tetorras(Ivanp)", video: "fotos/meme/fer.mp4", poster: "fotos/meme/fervico.jpeg" },
    { nombre: "Artupa en (Rober)", video: "fotos/meme/artupa.jpeg", poster: "fotos/meme/artupa.jpeg" },
    { nombre: "Gusano saca lenguas(Iker)", video: "fotos/meme/lengua.mp4", poster: "fotos/meme/lengua.jpg" },
  ],
  "Brainhot del año": [
    { nombre: "Geimpro e geimpra", video: "fotos/brainhot/gamepro.mp4", poster: "fotos/brainhot/gamepro.jpeg" },
    { nombre: "Fermorini quesini", video: "fotos/brainhot/fermo.mp4", poster: "fotos/brainhot/fermo.jpeg" },
    { nombre: "Poru ropu sopu tropu", video: "fotos/brainhot/poru.mp4", poster: "fotos/brainhot/poru.jpeg" },
    { nombre: "Quinitu quinato", video: "fotos/brainhot/iker.mp4", poster: "fotos/brainhot/iker.jpeg" },


  ],
  "Correon del año": [
    { nombre: "La correa de Gamepro",   foto: "fotos/correon/gamepro.jpeg" },
    { nombre: "La correa de Rober",   foto: "fotos/correon/rober.jpeg" },
    { nombre: "La correa de Dani",   foto: "fotos/correon/dani.jpeg" },
    { nombre: "La correa de Manu",   foto: "fotos/correon/manu.jpeg" },

  ],
  "Trio/Cuarteto del año": [
        { nombre: "Marco, Rulas y Asier (Veterinarios)",   foto: "fotos/Trio/primes.jpeg" },
        { nombre: "Labrada, Lucia y Gamepro (Gofreros)",   foto: "fotos/Trio/gofres.jpeg" },
        { nombre: "Dani,Iker,Asier y Gamepro (Tomelloseros) ",   foto: "fotos/Trio/tomelloseros.jpeg" },
        { nombre: "Ines,Lucia y Maria (Pibardas)",   foto: "fotos/Trio/pibas.jpeg" },


  ],
  "Soltero del año": [
    { nombre: "Darío",   foto: "fotos/soltero/dario.jpeg" },
    { nombre: "Rulas",   foto: "fotos/soltero/rulas.jpeg" },
    { nombre: "Marco",   foto: "fotos/soltero/marco.jpeg" },
    { nombre: "Fervico",   foto: "fotos/soltero/fer.jpeg" },

  ],
  "El que mejor viste del año": [ { nombre: "Marco",   foto: "fotos/marco.jpeg" },
    { nombre: "Ines",   foto: "fotos/ines.jpeg" },
    { nombre: "Fervico",   foto: "fotos/fervico.jpeg" },
    { nombre: "Rober",   foto: "fotos/rober.jpeg" }
  ],

  // LOTE 2
  "Llorón del año": [
    { nombre: "Rulas",   foto: "fotos/rulillas.jpeg" },
    { nombre: "Poru",   foto: "fotos/Poru.jpeg" },
    { nombre: "Mario",   foto: "fotos/mario.jpeg" },
    { nombre: "Marco",   foto: "fotos/marco.jpeg" },
  ],

  "Fiestero/a del año": [
    { nombre: "Asier",   foto: "fotos/asieras.jpeg" },
    { nombre: "Iker",   foto: "fotos/iker.jpeg" },
    { nombre: "Rulas",   foto: "fotos/rulillas.jpeg" },
    { nombre: "Ines",   foto: "fotos/ines.jpeg" },
  ],
  "Borracho/a del año": [
  { nombre: "Asier",   foto: "fotos/asieras.jpeg" },
      { nombre: "Maria",   foto: "fotos/maria.jpeg" },
    { nombre: "Dani",   foto: "fotos/dani.jpeg" },
    { nombre: "Labrada",   foto: "fotos/labrada.jpeg" },

  ],
  "Mejor Personaje fuera de JyP del año": [
        { nombre: "Diegote cipote",   foto: "fotos/perosnajes/diego.jpeg" },
        { nombre: "Iceman",   foto: "fotos/perosnajes/iceman.jpeg" },
        { nombre: "Pepito",   foto: "fotos/perosnajes/pepito.jpeg" },
        { nombre: "Unai el guay",   foto: "fotos/perosnajes/unai.jpeg" },


  ],
  "Peor momento del año": [
          { nombre: "Desastre de la yedra(Ivanp)",   foto: "fotos/p_momento/ivanp.jpeg" },
        { nombre: "Navidades en muletas(Rulas)",   foto: "fotos/p_momento/rulasmuletas.jpeg" },
        { nombre: "Fermoriv en carnavales(Fermoriv)",   foto: "fotos/p_momento/fermo.jpeg" },
        { nombre: "Vecina nos denuncia en Londres",   foto: "fotos/p_momento/londres.jpeg" },

  ],
  "Mensaje del año": [
        { nombre: "el celoso(Gamepro)",   foto: "fotos/mensaje/gamepro.jpeg" },
        { nombre: "Haberlo Preguntado mañana(Labrada)",   foto: "fotos/mensaje/labmanu.jpeg" },
        { nombre: "Fermoriv Solitario(Fermoriv)",   foto: "fotos/mensaje/fermo.jpeg" },
        { nombre: "Erasmus(María)",   foto: "fotos/mensaje/maria.jpeg" },

  ],
  "Mote del año": [
        { nombre: "Cafetera(Poru)",   foto: "fotos/mote/cafetera.jpeg" },
        { nombre: "Fish and Chips(Darío y Rober)",   foto: "fotos/mote/fish.jpeg" },
        { nombre: "Gamepollo(Gamepro)",   foto: "fotos/mote/gamepollo.jpeg" },
        { nombre: "Dj Ventosa(Marco)",   foto: "fotos/mote/djventosa.jpeg" },

  ],
  "Palabra/Frase del año": [
        { nombre: "Sirulo",   foto: "fotos/palabra/sirulo.jpeg" },
        { nombre: "Tengo Miedo a que se me caigan las patatas(Poru)",   foto: "fotos/palabra/patatas.jpeg" },
        { nombre: "Esa peña",   foto: "fotos/palabra/peña.jpeg" },
        { nombre: "Vamos no me jodas",   foto: "fotos/palabra/vamos.jpeg" },

  ],
  "Objeto del año": [
        { nombre: "Ositopro(Gamepro)",   foto: "fotos/objeto/ositopro.jpeg" },
        { nombre: "Ana Rosa",   foto: "fotos/objeto/anarosa.jpeg" },
        { nombre: "Tequifresi(Marco y Asier)",   foto: "fotos/objeto/tequifresi.jpeg" },
        { nombre: "Pelusa(Rober)",   foto: "fotos/objeto/pelusa.jpeg" },

  ],
  "Baile del año": [
    { nombre: "Señorita Surferita(Los que estan en el Baile)", video: "fotos/bailes/Surferita.mp4", poster: "fotos/bailes/Surferita.jpeg" },
    { nombre: "Ivanp X Mozos(Ivanp)", video: "fotos/bailes/ivanp.mp4", poster: "fotos/bailes/ivanp.jpeg" },
    { nombre: "Mambo de Labrada(Labrada)", video: "fotos/bailes/labrada.mp4", poster: "fotos/bailes/labrada.jpeg" },
    { nombre: "Shiny(Lucia)", video: "fotos/bailes/lucia.mp4", poster: "fotos/bailes/lucia.jpeg" },



  ],

  // LOTE 3
  "Autistada del año": [
        { nombre: "Robo de Botellas X",   foto: "fotos/autistada/yoryo.jpeg" },
        { nombre: "Foto de perfil Fervico(Fervico)",   foto: "fotos/autistada/foto.jpeg" },
        { nombre: "Ludopatia capibara(Rulas)",   foto: "fotos/autistada/ludopatia.jpeg" },
        { nombre: "Reformas Poru y enano(Poru y Fervico)",   foto: "fotos/autistada/reformas.jpeg" },

  ],
  "Fail del año": [
        { nombre: "La mesa de Fer(Fervico)",   foto: "fotos/fail/mesa.jpeg" },
        { nombre: "Tele por la ventana(Asier)",   foto: "fotos/fail/tele.jpeg" },
        { nombre: "Ivanp contra el tomate(Ivanp)",   foto: "fotos/fail/tomate.jpeg" },
        { nombre: "Matalascañas(Marco)",   foto: "fotos/fail/matalascañas.jpeg" },


    
  ],
  "Broma del año": [
        { nombre: "Oye siri(Lucia)",   foto: "fotos/broma/lucia.jpeg" },
        { nombre: "Grabaciones de cagada(Mario y Dario)",   foto: "fotos/broma/lab.jpeg" },
        { nombre: "Patatas contra la cama de Labrada(Rober y Asier)",   foto: "fotos/broma/patata.jpeg" },
        { nombre: "Lanzamiento de Objetos a la Piscina(Dani, por jugarse la vida)",   foto: "fotos/broma/lanzamiento.jpeg" },

  ],
  "Foto del año": [
        { nombre: "Cafeteros(los de la foto)",   foto: "fotos/fotos/peruanos.jpeg" },
        { nombre: "Beso de Judas(Labrada y Fermoriv)",   foto: "fotos/fotos/ferlab.jpeg" },
        { nombre: "Porno X(Gamepro y Marco)",   foto: "fotos/fotos/marconuria.jpeg" },
        { nombre: "Paleto Bob esponja(Iker)",   foto: "fotos/fotos/bob.jpeg" },

  ],
  "Video del año": [
    { nombre: "La muerte de Ana Rosa(Iker)", video: "videos/iker.mp4", poster: "videos/posters/iker.jpeg" },
    { nombre: "Castor alimentando a castor(Mario)", video: "videos/castor.mp4", poster: "videos/posters/castor.jpeg" },
    { nombre: "Dj Ventosa en acción(Marco y Dani)", video: "videos/marcoNuria.mp4", poster: "videos/posters/marcoNuria.jpeg" },
    { nombre: "Desfase de Noblejas(Asier y Juan)", video: "videos/juan.mp4", poster: "videos/posters/juan.jpeg" },

  ],
  "Fiesta del año": [
        { nombre: "Halloween",   foto: "fotos/fiesta/Hallowen.jpeg" },
        { nombre: "Proyecto X (Los organizadores)",   foto: "fotos/fiesta/proyecto x.jpeg" },
        { nombre: "Zurra",   foto: "fotos/fiesta/zurra.jpeg" },
        { nombre: "Ferias de Ciu",   foto: "fotos/fiesta/ciu.jpeg" },

  ],
  "Mejor momento del año": [
        { nombre: "Sala Vip Chino Juan",   foto: "fotos/m_momento/chino.jpeg" },
        { nombre: "Marco Pagando(Marco)",   foto: "fotos/m_momento/marco.jpeg" },
        { nombre: "Ivanp vs Rulas(Ivanp y Rulas)",   foto: "fotos/m_momento/ivanp.jpeg" },
        { nombre: "Carrera con tio borracho",   foto: "fotos/m_momento/carrera.jpeg" },

  ],
  "Revelación del año": [       
    { nombre: "Fervico",   foto: "fotos/fervico.jpeg" },
    { nombre: "Maria",   foto: "fotos/maria.jpeg" },
    { nombre: "Poru",   foto: "fotos/Poru.jpeg" },
    { nombre: "Labrada",   foto: "fotos/labrada.jpeg" },

],
  "Decepción del año": [
        { nombre: "Manu",   foto: "fotos/manu.jpeg" },
        { nombre: "Fermo",   foto: "fotos/Fermoriv.jpeg" },
        { nombre: "Rober",   foto: "fotos/rober.jpeg" },

  ],
  "MVP del año": [
        { nombre: "Iker",   foto: "fotos/iker.jpeg" },
        { nombre: "Maria",   foto: "fotos/maria.jpeg" },
        { nombre: "Asier",   foto: "fotos/asieras.jpeg" },
        { nombre: "Lucia",   foto: "fotos/Lucia.jpeg" },

  ]
};


/* ============================
   LOTES PARA LA VOTACIÓN FINAL
   (mismas 3x10 categorías que las nominaciones)
============================ */

const LOTE_VOTACION_1 = [
  "Viajero/a del año",
  "Picado/a del año",
  "Guarrete del año",
  "Papi/Mami del año",
  "Meme del año",
  "Brainhot del año",
  "Correon del año",
  "Trio/Cuarteto del año",
  "Soltero del año",
  "El que mejor viste del año"
];

const LOTE_VOTACION_2 = [
  "Llorón del año",
  "Fiestero/a del año",
  "Borracho/a del año",
  "Mejor Personaje fuera de JyP del año",
  "Peor momento del año",
  "Mensaje del año",
  "Mote del año",
  "Palabra/Frase del año",
  "Objeto del año",
  "Baile del año"
];

const LOTE_VOTACION_3 = [
  "Autistada del año",
  "Fail del año",
  "Broma del año",
  "Foto del año",
  "Video del año",
  "Fiesta del año",
  "Mejor momento del año",
  "Revelación del año",
  "Decepción del año",
  "MVP del año"
];


const LOTES_VOTACION = [LOTE_VOTACION_1, LOTE_VOTACION_2, LOTE_VOTACION_3];

// 👇 Lote activo de la VOTACIÓN FINAL (1, 2 o 3)
// Cambias este número cuando quieras pasar de lote.
const LOTE_VOTACION_ACTIVO = 3;

// Devuelve el lote actual de la votación final
function getLoteVotacionActual() {
  return LOTE_VOTACION_ACTIVO;
}

/* ============================================
   GENERADOR DE TARJETAS DE VOTACIÓN (POR LOTE)
============================================ */

const votacionWrapper = document.getElementById("votacionWrapper");
const votosSeleccionados = {}; // {categoria: nombre}

function pintarVotacion() {
  if (!votacionWrapper) return;

  // Limpiar selección anterior
  for (const cat in votosSeleccionados) {
    delete votosSeleccionados[cat];
  }

  votacionWrapper.innerHTML = "";

  const loteActual = getLoteVotacionActual();
  const indice = loteActual - 1;
  const categoriasDelLote = LOTES_VOTACION[indice] || [];

  categoriasDelLote.forEach((categoria) => {
    const nominados = CATEGORIAS_VOTACION[categoria];

    // Si esta categoría aún no tiene finalistas definidos, la saltamos
    if (!Array.isArray(nominados) || nominados.length === 0) return;

    // ===== CABECERA CON FOTO (igual estilo que nominaciones) =====
    const header = document.createElement("div");
    header.className = "cat-header";

    const img = document.createElement("img");
    img.className = "cat-badge";
    img.src = categoryImages[categoria] || DEFAULT_PLACA;
    img.alt = categoria;

    const titleWrap = document.createElement("div");
    titleWrap.className = "title-group";

    const h3 = document.createElement("h3");
    h3.textContent = categoria;

    titleWrap.appendChild(h3);
    header.appendChild(img);
    header.appendChild(titleWrap);

    // ===== GRID DE NOMINADOS =====
    const grid = document.createElement("div");
    grid.className = "grid-nominados";

    nominados.forEach((nom) => {
      const card = document.createElement("div");
      card.className = "nominado";
      card.dataset.nombre = nom.nombre;
      card.dataset.categoria = categoria;

      // --- Media (foto o vídeo) ---
      let mediaHTML = "";

      if (nom.video) {
        mediaHTML = `
          <video
            src="${nom.video}"
            poster="${nom.poster || ""}"
            muted
            playsinline
            preload="metadata"
          ></video>
        `;
      } else {
        mediaHTML = `
          <img src="${nom.foto}" alt="${nom.nombre}">
        `;
      }

      card.innerHTML = `
        ${mediaHTML}
        <span>${nom.nombre}</span>
      `;

      // Botón lupa para vídeos
      if (nom.video) {
        const btn = document.createElement("div");
        btn.className = "btn-expand";
        btn.setAttribute("role","button");
        btn.title = "Ver en grande";

        btn.innerHTML = `
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
          </svg>
        `;

        btn.addEventListener("click", (e) => {
          e.stopPropagation();

          openVideoLightbox({
            src: nom.video,
            poster: nom.poster,
            startAt: 0,
            autoPlay: true
          });
        });

        card.appendChild(btn);
      }
      // 🔍 Botón lupa para IMÁGENES de "Mensaje del año" (votación final)
// 🔍 Botón lupa para IMÁGENES de "Mensaje del año" y "Foto del año" (votación final)
if (!nom.video && (categoria === "Mensaje del año" || categoria === "Foto del año") && nom.foto) {
        const btnZoom = document.createElement("div");
        btnZoom.className = "btn-zoom";
        btnZoom.setAttribute("role", "button");
        btnZoom.setAttribute("aria-label", "Ver imagen en grande");
        btnZoom.title = "Ver imagen en grande";

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "18");
        svg.setAttribute("height", "18");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("viewBox", "0 0 16 16");

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute(
          "d",
          "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
        );

        svg.appendChild(path);
        btnZoom.appendChild(svg);

        btnZoom.addEventListener("click", (e) => {
          e.stopPropagation();
          openImageLightbox(nom.foto, nom.nombre);
        });

        card.appendChild(btnZoom);
      }

      // Activar controles de vídeo
      wireLightboxForVideos(card);

      // SOLO 1 voto por categoría
      card.addEventListener("click", () => {
        const ya = card.classList.contains("selected");

        // Desmarcar todos los de esa categoría
        grid.querySelectorAll(".nominado")
            .forEach(c => c.classList.remove("selected"));

        if (ya) {
          delete votosSeleccionados[categoria];
        } else {
          card.classList.add("selected");
          votosSeleccionados[categoria] = nom.nombre;
        }
      });

      grid.appendChild(card);
    });

    // Añadir al wrapper en orden: cabecera + grid
    votacionWrapper.appendChild(header);
    votacionWrapper.appendChild(grid);
  });

  // Aviso "Próximamente lote X", igual que en nominaciones
  if (indice < LOTES_VOTACION.length - 1) {
    const sep = document.createElement("div");
    sep.className = "lote-separador";
    sep.textContent = `🔒 Próximamente: Lote ${loteActual + 1}`;
    votacionWrapper.appendChild(sep);
  }
}

// Pintamos al cargar
pintarVotacion();


/* ============================================
   ENVÍO A FIRESTORE (POR LOTE)
============================================ */

document.getElementById("enviarVotacion")?.addEventListener("click", async () => {
  const usuario = localStorage.getItem("usuarioLogueado");

  if (!usuario) {
    alert("Debes iniciar sesión para votar.");
    mostrarSeccion("login");
    return;
  }
  // Categorías del lote actual que están ACTIVAS (tienen finalistas definidos)
  const loteActual = getLoteVotacionActual();
  const indice = loteActual - 1;
  const categoriasDelLote = LOTES_VOTACION[indice] || [];
  const categoriasActivas = categoriasDelLote.filter(
    cat => Array.isArray(CATEGORIAS_VOTACION[cat]) && CATEGORIAS_VOTACION[cat].length > 0
  );

  const pendientes = categoriasActivas.filter(cat => !votosSeleccionados[cat]);
  if (pendientes.length) {
    alert(`Te falta votar en: ${pendientes.join(", ")}`);
    return;
  }

  try {
    const ciclo = await getCicloActual();

    // Guardamos solo las categorías de este lote
    for (const categoria of categoriasActivas) {
      const nominado = votosSeleccionados[categoria];
      if (!nominado) continue;

      await addDoc(collection(db, "votaciones"), {
        usuario,
        categoria,
        voto: nominado,
        ciclo,
        timestamp: serverTimestamp()
      });
    }

    alert("✅ Tus votos de este lote se han registrado correctamente.");

    document.querySelectorAll(".nominado").forEach(c => c.classList.remove("selected"));

    if (window.actualizarEstadoBotonVotacion) {
      await window.actualizarEstadoBotonVotacion();
    }

  } catch (err) {
    console.error(err);
    alert("❌ Error al guardar los votos.");
  }
});

/* =======================================================
   NOMINADOS ESPECIALES 2026
   Aquí iremos metiendo las categorías que NO usen
   automáticamente a todos los participantes.
======================================================= */

const NOMINADOS_ESPECIALES = {};

/* ============================================
   MÁXIMO DE SELECCIÓN POR CATEGORÍA
============================================ */

const MAX_SELECCION_POR_CATEGORIA = {
  // Ejemplos:
  // "Personaje del año": 1,
  // "Trío del año": 3,
};


/* ============================================
   NOMINACIONES POR USUARIO (ESTRUCTURA)
============================================ */

const nominacionesPorCategoria = {};


/* ============================================
   CREAR TARJETAS DE UNA CATEGORÍA
============================================ */

function crearApartadoNominaciones(idLista, categoriaNombre) {
  const contenedor = document.getElementById(idLista);
  nominacionesPorCategoria[categoriaNombre] = [];

  const override = NOMINADOS_ESPECIALES[categoriaNombre];
  let lista = [];

  // 1) Usar nominados especiales si existen
  if (Array.isArray(override) && override.length > 0) {
    lista = override.map(o => ({
      nombre: o.nombre,
      foto:   o.foto ?? null,
      video:  o.video ?? null,
      poster: o.poster ?? null
    }));
  } 
  // 2) Si no, usar participantes del grid
  else {
    document.querySelectorAll("#participantes .participante").forEach(part => {
      const nombre = part.querySelector("h3").innerText.trim();
      const foto   = part.querySelector("img").src;
      lista.push({ nombre, foto });
    });
  }

  /* === 3) Pintar tarjetas === */
  lista.forEach(item => {
    const { nombre, foto, video, poster } = item;

    const div = document.createElement("div");
    div.classList.add("nominado");
    div.dataset.nombre = nombre;

    const media = video
      ? `<video ${poster ? `poster="${poster}"` : ""} src="${video}" muted playsinline></video>`
      : `<img src="${foto || "fotos/default-user.png"}" alt="${nombre}">`;

    div.innerHTML = `${media}<span>${nombre}</span>`;
    contenedor.appendChild(div);

    /* Botón lupa SOLO para “Mensaje del año” */
// 🔍 Botón lupa para IMÁGENES de "Mensaje del año" y "Foto del año" (votación final)
if (!video && (categoriaNombre === "Mensaje del año" || categoriaNombre === "Foto del año") && foto) {
      const btn = document.createElement("div");
      btn.className = "btn-zoom";
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-label", "Ver imagen en grande");

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "18");
      svg.setAttribute("height", "18");
      svg.setAttribute("fill", "currentColor");
      svg.setAttribute("viewBox", "0 0 16 16");

      const path = document.createElementNS(svgNS, "path");
      path.setAttribute(
        "d",
        "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
      );

      

      svg.appendChild(path);
      btn.appendChild(svg);

      btn.addEventListener("click", e => {
        e.stopPropagation();
        openImageLightbox(foto, nombre);
      });

      div.appendChild(btn);
    }


  });

  /* 4) Activar vídeos dentro de esas tarjetas */
  wireLightboxForVideos(contenedor);

  /* 5) Selección con máximo */
  const maxSeleccion = MAX_SELECCION_POR_CATEGORIA[categoriaNombre] ?? 3;

  contenedor.querySelectorAll(".nominado").forEach(item => {
    item.addEventListener("click", () => {
      const nombre = item.dataset.nombre;

      if (item.classList.contains("selected")) {
        item.classList.remove("selected");
        nominacionesPorCategoria[categoriaNombre] =
          nominacionesPorCategoria[categoriaNombre].filter(x => x !== nombre);
      } else {
        if (nominacionesPorCategoria[categoriaNombre].length >= maxSeleccion) {
          alert(`Solo puedes seleccionar ${maxSeleccion} nominados en esta categoría.`);
          return;
        }
        item.classList.add("selected");
        nominacionesPorCategoria[categoriaNombre].push(nombre);
      }
    });
  });
}



/* ============================================
   LIGHTBOX DE VÍDEO (ABRIR)
============================================ */

function openVideoLightbox(arg1, title = "") {
  const modal = document.getElementById("videoLightbox");
  const video = document.getElementById("lightboxVideo");
  if (!modal || !video) return;

  let src, poster, startAt = 0, autoPlay = false;

  if (typeof arg1 === "object" && arg1) {
    src      = arg1.src;
    poster   = arg1.poster || null;
    startAt  = Number(arg1.startAt || 0);
    autoPlay = !!arg1.autoPlay;
    title    = arg1.title || title || "";
  } else {
    src = arg1;
  }

  if (!src) return;

  try { video.pause(); } catch {}

  video.removeAttribute("src");
  if (poster) video.setAttribute("poster", poster);
  else video.removeAttribute("poster");

  video.src = src;
  video.load();

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  if (title) video.setAttribute("aria-label", title);

  if (startAt > 0) {
    const onMeta = () => {
      video.currentTime = Math.min(startAt, video.duration || startAt);
      if (autoPlay) video.play().catch(() => {});
      video.removeEventListener("loadedmetadata", onMeta);
    };
    video.addEventListener("loadedmetadata", onMeta);
  } else if (autoPlay) {
    video.play().catch(() => {});
  }
}



/* ============================================
   LIGHTBOX DE VÍDEO (CERRAR)
============================================ */

function closeVideoLightbox() {
  const modal = document.getElementById("videoLightbox");
  const video = document.getElementById("lightboxVideo");
  if (!modal || !video) return;

  try { video.pause(); } catch {}

  video.removeAttribute("src");
  video.removeAttribute("poster");
  video.load();

  modal.hidden = true;
  document.body.style.overflow = "";
}



/* ============================================
   LISTENERS DEL LIGHTBOX (X / ESC / CLIC FUERA)
============================================ */

(() => {
  const modal = document.getElementById("videoLightbox");
  if (!modal || modal.dataset.bound) return;
  modal.dataset.bound = "1";

  modal.addEventListener("click", e => {
    if (e.target.id === "videoLightbox") closeVideoLightbox();
  });

  modal.querySelector(".video-modal__inner")
    ?.addEventListener("click", e => e.stopPropagation());

  modal.querySelector(".video-modal__close")
    ?.addEventListener("click", closeVideoLightbox);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !modal.hidden) closeVideoLightbox();
  });
})();
/* =======================================================
   LIGHTBOX GLOBAL — DELEGACIÓN PARA data-video-src
======================================================= */

document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-video-src]");
  if (!trigger) return;

  e.preventDefault();

  const src   = trigger.getAttribute("data-video-src");
  const title = trigger.getAttribute("aria-label") || trigger.getAttribute("title") || "";

  if (src) openVideoLightbox(src, title);
});


/* =======================================================
   ACTIVADOR DE LIGHTBOX PARA VIDEOS EN TARJETAS
======================================================= */

function wireLightboxForVideos(scope = document) {
  // 1) Configuración de vídeos pequeños
  scope.querySelectorAll(".grid-nominados .nominado video").forEach((v) => {
    v.controls = true;
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("preload", "metadata");

    v.addEventListener("play", () => {
      v.muted = false;
    });
  });

  // 2) Añadir botón “Expandir vídeo”
  scope.querySelectorAll(".grid-nominados .nominado").forEach((card) => {
    const v = card.querySelector("video");
    if (!v) return;
    if (card.querySelector(".btn-expand")) return;

    const btn = document.createElement("div");
    btn.className = "btn-expand";
    btn.setAttribute("role", "button");
    btn.setAttribute("tabindex", "0");
    btn.title = "Ver en grande";
    btn.setAttribute("aria-label", "Ver en grande");

    // ICONO lupa
    const svgNS = "http://www.w3.org/2000/svg";
    const svg   = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("viewBox", "0 0 16 16");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute(
      "d",
      "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
    );

    svg.appendChild(path);
    btn.appendChild(svg);

    // Abrir lightbox de vídeo
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const wasPlaying = !v.paused && !v.ended;
      const t       = v.currentTime || 0;
      const src     = v.currentSrc || v.src;
      const poster  = v.getAttribute("poster");

      try { v.pause(); } catch {}

      openVideoLightbox({
        src,
        poster,
        startAt: t,
        autoPlay: true,
        sourceEl: v,
        wasPlaying
      });
    });

    card.appendChild(btn);
  });
}


/* =======================================================
   LIGHTBOX DE IMAGEN (Abrir + Cerrar)
======================================================= */

function openImageLightbox(src, alt = "") {
  const modal = document.getElementById("imageLightbox");
  const img   = document.getElementById("lightboxImage");
  if (!modal || !img) return;

  img.src = src;
  img.alt = alt;

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeImageLightbox() {
  const modal = document.getElementById("imageLightbox");
  const img   = document.getElementById("lightboxImage");
  if (!modal || !img) return;

  img.removeAttribute("src");
  modal.hidden = true;
  document.body.style.overflow = "";
}


/* =======================================================
   LISTENERS: cerrar por fondo, X, ESC
======================================================= */

(() => {
  const modal = document.getElementById("imageLightbox");
  if (!modal) return;

  modal.addEventListener("click", (e) => {
    if (e.target.id === "imageLightbox") closeImageLightbox();
  });

  const btn = modal.querySelector(".image-modal__close");
  if (btn) btn.addEventListener("click", closeImageLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeImageLightbox();
  });
})();

/* ============================================================
   NOMINACIONES 2026 — 6 DÍAS x 5 CATEGORÍAS
============================================================ */

const LOTE_1 = [
  "Mejor jugador de pádel del año",
  "Peor Playus del año",
  "PENDIENTE 1",
  "Viajero del año",
  "Llorón del año"
];

const LOTE_2 = [
  "PENDIENTE 2",
  "Fiestero del año",
  "Borrachera del año",
  "Picado del año",
  "Princeso del año"
];

const LOTE_3 = [
  "Huella Digital",
  "Mensaje del año",
  "Sticker del año",
  "Outfit del año",
  "Objeto del año"
];

const LOTE_4 = [
  "Mejor personaje fuera de CT del año",
  "Enemigo del año",
  "Palabra/Frase del año",
  "Mote del año",
  "Broma del año"
];

const LOTE_5 = [
  "Fail del año",
  "Autistada del año",
  "Fiesta del año",
  "Foto del año",
  "Video del año"
];

const LOTE_6 = [
  "Peor momento del año",
  "Revelación del año",
  "Mejor momento del año",
  "Decepción del año",
  "MVP del año"
];

const LOTES = [
  LOTE_1,
  LOTE_2,
  LOTE_3,
  LOTE_4,
  LOTE_5,
  LOTE_6
];

// ============================================
// DÍA ACTIVO DE NOMINACIONES
// Cambiar manualmente del 1 al 6
// ============================================

let LOTE_ACTIVO = null;

async function sincronizarLoteActivo() {

  const snap = await getDocs(
    collection(db, "lotes_nominaciones_2026")
  );

  const lotesAbiertos = [];

  snap.forEach(docSnap => {

    const data = docSnap.data();

    const match =
      docSnap.id.match(/^lote_([1-6])$/);

    if (
      data.abierto === true &&
      match
    ) {
      lotesAbiertos.push(
        Number(match[1])
      );
    }

  });

  // Exactamente un lote abierto
  if (lotesAbiertos.length === 1) {

    LOTE_ACTIVO = lotesAbiertos[0];

  } else {

    LOTE_ACTIVO = null;

    if (lotesAbiertos.length > 1) {
      console.error(
        "ERROR: hay varios lotes de nominaciones abiertos:",
        lotesAbiertos
      );
    }
  }

  return LOTE_ACTIVO;
}

window.getLoteActual = function () {
  return LOTE_ACTIVO;
};

function getLoteFromQuery() {
  return null; // 👈 SIEMPRE devuelve null, da igual ?lote=1, 2, 27…
}

/* ============================================================
   Crear bloque de categoría dinámico
============================================================ */
function addCategoriaBlock(titulo, indice) {
  const wrap = document.getElementById("nominadosWrapper");
  if (!wrap) return;

  const h2 = document.createElement("h2");
  h2.textContent = titulo;

  const max = MAX_SELECCION_POR_CATEGORIA[titulo] ?? 3;
  const p = document.createElement("p");
  p.innerHTML = `Selecciona exactamente <strong>${max}</strong> candidatos.`;

  const grid = document.createElement("div");
  grid.id = `lista-nominados-dyn-${indice}`;
  grid.className = "grid-nominados";

  wrap.appendChild(h2);
  wrap.appendChild(p);
  wrap.appendChild(grid);

  crearApartadoNominaciones(grid.id, titulo);
}

/* ============================================================
   Limpiar contenido dinámico del wrapper
============================================================ */
function limpiarNominadosDinamicos() {
  const wrap = document.getElementById("nominadosWrapper");
  if (wrap) wrap.innerHTML = "";
}

/* ============================================================
   Insertar mensaje “Próximamente lote X”
============================================================ */
function insertarSeparador(texto) {
  const wrap = document.getElementById("nominadosWrapper");
  if (!wrap) return;

  const sep = document.createElement("div");
  sep.className = "lote-separador";
  sep.textContent = texto;

  wrap.appendChild(sep);
}

/* ============================================================
   Renderizar categorías del lote activo
============================================================ */
function renderNominadosPorLotes() {
  const activo = getLoteFromQuery() ?? LOTE_ACTIVO;

  if (activo === null) {
    limpiarNominadosDinamicos();
    insertarSeparador("🔒 No hay ningún lote de nominaciones abierto ahora mismo.");
    return;
  }

  limpiarNominadosDinamicos();

  const lote = LOTES[activo - 1] || [];
  lote.forEach((titulo, i) => addCategoriaBlock(titulo, i));

  if (activo < LOTES.length) {
    insertarSeparador(`🔒 Próximamente: Lote ${activo + 1}`);
  }

  if (typeof enhanceCategoryHeaders === "function") {
    enhanceCategoryHeaders();
  }

  if (window.actualizarEstadoBotonNominaciones) {
    window.actualizarEstadoBotonNominaciones();
  }
}

/* ============================================================
   Comprobar si ya envió nominaciones en este ciclo y lote
============================================================ */
async function yaHaEnviadoNominaciones(lote = window.getLoteActual()) {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) return false;

  const uid = firebaseUser.uid;
  const loteId = `lote_${lote}`;

  const referencia = doc(
    db,
    "nominaciones_2026",
    uid,
    "lotes",
    loteId
  );

  const snap = await getDoc(referencia);

  return snap.exists();
}


/* ============================================================
   BOTÓN “ENVIAR TODAS LAS NOMINACIONES”
============================================================ */

const btnEnviarTodas = document.getElementById("enviarTodasNominaciones");

if (btnEnviarTodas && !btnEnviarTodas.dataset.bound) {
  btnEnviarTodas.dataset.bound = "1";
  btnEnviarTodas.addEventListener("click", onEnviarTodasNominaciones);
}

let enviandoNominaciones = false;

/* ============================================================
   Enviar nominaciones a Firestore
============================================================ */
async function onEnviarTodasNominaciones(e) {
  e.preventDefault();

  if (enviandoNominaciones) return;
  enviandoNominaciones = true;

  const btn = document.getElementById("enviarTodasNominaciones");

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Enviando…";
  }

  try {

    const usuario = localStorage.getItem("usuarioLogueado");
    const firebaseUser = auth.currentUser;

    if (!usuario || !firebaseUser) {
      alert("Debes iniciar sesión para enviar nominaciones.");
      mostrarSeccion("login");
      return;
    }

    const uid = firebaseUser.uid;
    const lote = window.getLoteActual();

    if (lote === null) {
      alert("No hay ningún lote de nominaciones abierto ahora mismo.");
      return;
    }

    const loteId = `lote_${lote}`;

    const categoriasDelLote = LOTES[lote - 1] || [];

    if (categoriasDelLote.length === 0) {
      alert("Este lote no contiene categorías.");
      return;
    }

    // Comprobar exactamente 3 nominados
    // en cada categoría del lote activo.
    for (const categoria of categoriasDelLote) {

      const seleccion =
        nominacionesPorCategoria[categoria] || [];

      if (seleccion.length !== 3) {
        alert(
          `Debes seleccionar exactamente 3 nominados en la categoría: ${categoria}`
        );
        return;
      }
    }

    // Un único mapa con todos los votos del lote.
    const votos = {};

    categoriasDelLote.forEach(categoria => {
      votos[categoria] = [
        ...nominacionesPorCategoria[categoria]
      ];
    });

    // Un único documento por usuario + lote.
    const referencia = doc(
      db,
      "nominaciones_2026",
      uid,
      "lotes",
      loteId
    );

    await setDoc(referencia, {
      edicion: 2026,
      loteId,
      usuario,
      votos,
      enviadoEn: serverTimestamp()
    });

    alert(
      `¡Tus nominaciones del Lote ${lote} han sido registradas!`
    );

    document
      .querySelectorAll(".nominado")
      .forEach(n => n.classList.remove("selected"));

    categoriasDelLote.forEach(categoria => {
      nominacionesPorCategoria[categoria] = [];
    });

  } catch (err) {

    console.error("Error guardando nominaciones:", err);

    if (err?.code === "permission-denied") {
      alert(
        "No se pueden modificar estas nominaciones. Puede que ya hayas enviado este lote."
      );
    } else {
      alert("Hubo un error al guardar tus nominaciones.");
    }

  } finally {

    enviandoNominaciones = false;

    const lote = window.getLoteActual();
    const btn =
      document.getElementById("enviarTodasNominaciones");

      if (lote === null) {
        if (btn) {
          btn.disabled = true;
          btn.innerText = "No hay nominaciones abiertas";
        }
        return;
      }

    if (btn) {

      try {

        const enviado =
          await yaHaEnviadoNominaciones(lote);

        btn.disabled = enviado;

        btn.innerText = enviado
          ? `Ya has enviado tus nominaciones del Lote ${lote}`
          : `Enviar todas las nominaciones (Lote ${lote})`;

      } catch {

        btn.disabled = false;
        btn.innerText =
          "Enviar todas las nominaciones";

      }
    }
  }
}
/* ============================================================
   ESTADO DEL BOTÓN – NOMINACIONES
============================================================ */
async function actualizarEstadoBotonNominaciones() {
  const usuario = localStorage.getItem('usuarioLogueado');
  const btn = document.getElementById('enviarTodasNominaciones');
  if (!btn) return;

  const lote = window.getLoteActual();

  if (lote === null) {
    btn.disabled = true;
    btn.innerText = "No hay nominaciones abiertas";
    return;
  }

  if (!usuario) {
    btn.disabled = true;
    btn.innerText = "Inicia sesión para nominar";
    return;
  }

  const enviado = await yaHaEnviadoNominaciones(lote);
  btn.disabled = enviado;
  btn.innerText = enviado
    ? `Ya has enviado tus nominaciones del Lote ${lote}`
    : `Enviar todas las nominaciones (Lote ${lote})`;
}
window.actualizarEstadoBotonNominaciones = actualizarEstadoBotonNominaciones;


/* ============================================================
   ¿YA HA VOTADO EN ESTE CICLO?
============================================================ */
async function yaHaVotadoEnCiclo(usuario) {
  if (!usuario) return false;

  const ciclo = await getCicloActual();
  const loteActual = getLoteVotacionActual();
  const indice = loteActual - 1;
  const categoriasDelLote = LOTES_VOTACION[indice] || [];

  // Solo consideramos categorías que realmente tengan finalistas definidos
  const categoriasActivas = categoriasDelLote.filter(
    cat => Array.isArray(CATEGORIAS_VOTACION[cat]) && CATEGORIAS_VOTACION[cat].length > 0
  );

  if (!categoriasActivas.length) return false;

  const q = query(
    collection(db, "votaciones"),
    where("usuario", "==", usuario),
    where("ciclo", "==", ciclo)
  );
  const snap = await getDocs(q);
  if (snap.empty) return false;

  const categoriasVotadas = new Set();

  snap.forEach(d => {
    const data = d.data() || {};
    const cat = data.categoria;
    if (cat && categoriasActivas.includes(cat)) {
      categoriasVotadas.add(cat);
    }
  });

  // "Ya ha votado" si tiene al menos un voto en TODAS las categorías activas de este lote
  return categoriasActivas.every(cat => categoriasVotadas.has(cat));
}



/* ============================================================
   ESTADO BOTÓN – VOTACIÓN
============================================================ */
async function actualizarEstadoBotonVotacion() {
  const btn = document.getElementById('enviarVotacion');
  if (!btn) return;

  const usuario = localStorage.getItem('usuarioLogueado');
  if (!usuario) {
    btn.disabled = true;
    btn.textContent = "Inicia sesión para votar";
    return;
  }

  const enviado = await yaHaVotadoEnCiclo(usuario);
  btn.disabled = enviado;
  btn.textContent = enviado
    ? "Ya has enviado tu votación"
    : "Enviar votación";
}
window.actualizarEstadoBotonVotacion = actualizarEstadoBotonVotacion;



/* ============================================================
   RESULTADOS – ADMIN
============================================================ */
let _cargandoResultados = false;

async function cargarResultados() {
  const contenedor = document.getElementById('tabla-resultados');
  if (!contenedor) return;          // 👈 añadido
  if (_cargandoResultados) return;
  _cargandoResultados = true

  try {
    contenedor.innerHTML = "<p>Cargando resultados...</p>";

    const ciclo = await getCicloActual();

    const snapVotos = await getDocs(
  query(
    collection(db, "votaciones"),
    where("ciclo", "==", ciclo)
  )
);

   // ============================================
// NOMINACIONES 2026
// ============================================

const snapNom = await getDocs(
  collectionGroup(db, "lotes")
);

contenedor.innerHTML = "";
const frag = document.createDocumentFragment();

const bloqueNom = document.createElement("section");

bloqueNom.innerHTML = `
  <h3>🏅 Nominaciones Josemari III</h3>
  <p style="opacity:.8">
    Cuenta cuántas veces ha sido nominado cada candidato.
  </p>
`;

if (snapNom.empty) {

  bloqueNom.insertAdjacentHTML(
    "beforeend",
    "<p>No hay nominaciones aún.</p>"
  );

} else {

  const conteo = {};
  const nominadores = {};
  const participacionPorLote = {};

  snapNom.forEach(docSnap => {

    const data = docSnap.data() || {};

    // Solo documentos del sistema 2026
    if (data.edicion !== 2026) return;

    const usuario = data.usuario || "Desconocido";
    const votos = data.votos || {};

    const loteId = data.loteId || "lote_desconocido";

    participacionPorLote[loteId] ||= new Set();
    participacionPorLote[loteId].add(usuario);

    Object.entries(votos).forEach(
      ([categoria, nominados]) => {

        if (!Array.isArray(nominados)) return;

        conteo[categoria] ||= {};
        nominadores[categoria] ||= {};

        nominados.forEach(nominado => {

          conteo[categoria][nominado] =
            (conteo[categoria][nominado] || 0) + 1;

          (
            nominadores[categoria][nominado] ||= new Set()
          ).add(usuario);

        });
      }
    );
  });

  const todosLosUsuarios = Object.keys(loginMap);

LOTES.forEach((categoriasDelLote, indiceLote) => {

  const categoriasConResultados = categoriasDelLote.filter(
    categoria => conteo[categoria]
  );

  // Si este lote todavía no tiene resultados, no lo mostramos.
  if (categoriasConResultados.length === 0) return;

  const tituloLote = document.createElement("h3");
  tituloLote.textContent = `❄️ Lote ${indiceLote + 1}`;
  tituloLote.className = "resultado-titulo-lote";

  bloqueNom.appendChild(tituloLote);

  const loteId = `lote_${indiceLote + 1}`;

const hanParticipado =
  participacionPorLote[loteId] || new Set();

const faltan = todosLosUsuarios.filter(
  usuario => !hanParticipado.has(usuario)
);

const resumen = document.createElement("div");
resumen.className = "resultado-resumen-lote";

resumen.innerHTML = `
  <p>
    <strong>Participación:</strong>
    ${hanParticipado.size}/${todosLosUsuarios.length}
  </p>

  <p>
    <strong>Han enviado:</strong>
    ${
      hanParticipado.size
        ? Array.from(hanParticipado).join(", ")
        : "Nadie todavía"
    }
  </p>

  <p>
    <strong>Faltan:</strong>
    ${
      faltan.length
        ? faltan.join(", ")
        : "Nadie ✅"
    }
  </p>
`;

bloqueNom.appendChild(resumen);

  categoriasConResultados.forEach(categoria => {

    const mapa = conteo[categoria];

    const div = document.createElement("div");
    div.className = "resultado-categoria";

    const h4 = document.createElement("h4");
    h4.textContent = categoria;

    const ul = document.createElement("ul");

    const maxVotos = Math.max(
      ...Object.values(mapa),
      1
    );

    const ranking = Object.entries(mapa)
  .sort((a, b) => b[1] - a[1]);

    const votosCuarto =
      ranking.length >= 4
        ? ranking[3][1]
        : null;

    ranking.forEach(([nominado, total], indice) => {

        const li = document.createElement("li");

        const esTop4 =
          indice < 4 ||
          (votosCuarto !== null && total === votosCuarto);

        const hayEmpateEnCorte =
          votosCuarto !== null &&
          ranking.filter(([, votos]) => votos === votosCuarto).length > 1;

        li.className =
          esTop4
            ? "resultado-candidato resultado-top4"
            : "resultado-candidato";

        const quienes = Array.from(
          nominadores[categoria][nominado]
        ).join(", ");

        const porcentaje =
          Math.round((total / maxVotos) * 100);

        li.innerHTML = `
          <div class="resultado-linea">

            <span class="resultado-nombre">
              ${esTop4 ? "🏆 " : ""}
              ${nominado}
              ${
                esTop4
                  ? `<span class="resultado-finalista">
                  ${hayEmpateEnCorte && total === votosCuarto
                    ? "EMPATE TOP 4"
                    : "TOP 4"}
              </span>`
              : ""
            }
            </span>

            <strong>${total}</strong>

          </div>

          <div class="resultado-barra">
            <div
              class="resultado-barra-relleno"
              style="width:${porcentaje}%"
            ></div>
          </div>

          <div class="resultado-detalle">
            Nominado por: ${quienes}
          </div>
        `;

        ul.appendChild(li);
      });

    div.appendChild(h4);
    div.appendChild(ul);

    bloqueNom.appendChild(div);
  });

});

}

frag.appendChild(bloqueNom);

    /* =======================
       BLOQUE — VOTACIÓN FINAL
    ======================= */
    const bloqueVot = document.createElement('section');
    bloqueVot.innerHTML = `
      <h3>🗳️ Votación Final Ciclo ${ciclo}</h3>
      <p style="opacity:.8">Ganadores por votos.</p>
    `;

    if (snapVotos.empty) {
      bloqueVot.insertAdjacentHTML('beforeend', `<p>No hay votos aún.</p>`);
    } else {
      const votosPorCat = {};
      const votantes = new Set();

      snapVotos.forEach(d => {
        const data = d.data();
        votosPorCat[data.categoria] ||= [];
        votosPorCat[data.categoria].push({ voto: data.voto, user: data.usuario });
        votantes.add(data.usuario);
      });

      bloqueVot.insertAdjacentHTML(
        'beforeend',
        `<p>Han votado: ${Array.from(votantes).join(', ')}</p>`
      );

      Object.entries(votosPorCat).forEach(([cat, lista]) => {
        const div = document.createElement('div');
        div.innerHTML = `<h4>${cat}</h4>`;

        const cuenta = {};
        const detalle = {};

        lista.forEach(({voto, user}) => {
          cuenta[voto] = (cuenta[voto] || 0) + 1;
          (detalle[voto] ||= new Set()).add(user);
        });

        const ul = document.createElement('ul');
        Object.entries(cuenta).sort((a,b)=>b[1]-a[1]).forEach(([opcion, n]) => {
          const li = document.createElement('li');
          li.innerHTML = `${opcion}: ${n} voto(s)<br>
                          <span style="opacity:.8">Votaron: ${Array.from(detalle[opcion]).join(', ')}</span>`;
          ul.appendChild(li);
        });

        div.appendChild(ul);
        bloqueVot.appendChild(div);
      });
    }

    frag.appendChild(bloqueVot);

    contenedor.replaceChildren(frag);

  } catch (error) {
    console.error("Error cargando resultados:", error);
    contenedor.innerHTML = "<p>Error al cargar resultados.</p>";
  } finally {
    _cargandoResultados = false;
  }
}

window.cargarResultados = cargarResultados;



/* ============================================================
   BORRADO MASIVO
============================================================ */
async function borrarColeccion(nombreColeccion) {
  try {
    let borrados = 0;
    
    while (true) {
      const q = query(collection(db, nombreColeccion), limit(400));
      const snap = await getDocs(q);
      if (snap.empty) break;

      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      borrados += snap.size;
      await new Promise(r => setTimeout(r, 50));
    }

    alert(`Se han borrado ${borrados} documentos de "${nombreColeccion}".`);
    if (typeof cargarResultados === 'function') cargarResultados();

  } catch (error) {
    console.error(`Error borrando ${nombreColeccion}:`, error);
    alert(`Error al borrar "${nombreColeccion}".`);
  }
}

async function borrarNominaciones2026() {

  try {

    let borrados = 0;

    while (true) {

      const q = query(
        collectionGroup(db, "lotes"),
        where("edicion", "==", 2026),
        limit(400)
      );

      const snap = await getDocs(q);

      if (snap.empty) break;

      const batch = writeBatch(db);

      snap.docs.forEach(d => {
        batch.delete(d.ref);
      });

      await batch.commit();

      borrados += snap.size;
    }

    alert(
      `Se han borrado ${borrados} documentos de nominaciones 2026.`
    );

    if (typeof cargarResultados === "function") {
      cargarResultados();
    }

  } catch (error) {

    console.error(
      "Error borrando nominaciones 2026:",
      error
    );

    alert(
      "Error al borrar las nominaciones 2026."
    );
  }
}


/* Helpers botón de carga */
function setBtnLoading(btn, txt) {
  if (!btn) return;
  btn.dataset.prev = btn.innerText;
  btn.disabled = true;
  btn.innerText = txt;
}

function unsetBtnLoading(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.innerText = btn.dataset.prev || btn.innerText;
  delete btn.dataset.prev;
}
// Listeners de los 3 botones del panel de resultados
const btnBorrarVotos = document.getElementById('borrarVotos');
const btnBorrarNomin = document.getElementById('borrarNominaciones');
const btnReset       = document.getElementById('restaurarVotaciones');

if (btnBorrarVotos && !btnBorrarVotos.dataset.bound) {
  btnBorrarVotos.dataset.bound = "1";
  btnBorrarVotos.addEventListener('click', async () => {
    if (!confirm("Vas a BORRAR definitivamente TODOS los votos de la votación final. ¿Continuar?")) return;
    setBtnLoading(btnBorrarVotos, 'Borrando…');
    await borrarColeccion('votaciones');

    unsetBtnLoading(btnBorrarVotos);
    if (typeof cargarResultados === 'function') cargarResultados();
  });
}

if (btnBorrarNomin && !btnBorrarNomin.dataset.bound) {
  btnBorrarNomin.dataset.bound = "1";
  btnBorrarNomin.addEventListener('click', async () => {
    if (!confirm("Vas a BORRAR definitivamente TODAS las nominaciones. ¿Continuar?")) return;
    setBtnLoading(btnBorrarNomin, 'Borrando…');
    await borrarNominaciones2026();
    unsetBtnLoading(btnBorrarNomin);
    if (typeof cargarResultados === 'function') cargarResultados();
  });
}

if (btnReset && !btnReset.dataset.bound) {
  btnReset.dataset.bound = "1";
  btnReset.addEventListener('click', async () => {
    if (!confirm("Iniciar una NUEVA ronda de votaciones. Los registros anteriores se conservarán. ¿Continuar?")) return;
    try {
      const nuevoCiclo = await aumentarCiclo();
      alert(`¡Listo! Se ha iniciado el ciclo ${nuevoCiclo}. Todos pueden volver a votar.`);
      if (typeof cargarResultados === 'function') cargarResultados();
      if (window.actualizarEstadoBotonNominaciones) await window.actualizarEstadoBotonNominaciones();
      if (window.actualizarEstadoBotonVotacion) await window.actualizarEstadoBotonVotacion();
    } catch (e) {
      console.error(e);
      alert("No se pudo iniciar la nueva ronda.");
    }
  });
}


// ===============================
// Modal de categorías
// ===============================
const modalCategoria = document.getElementById("modalCategoria");
const modalImgCat = document.getElementById("modalImagenCategoria");
const modalDescCat = document.getElementById("modalDescripcionCategoria");
const modalTituloCat = document.getElementById("modalTituloCategoria");
const cerrarCat = modalCategoria.querySelector(".cerrar");

document.querySelectorAll(".categoria").forEach(cat => {
  cat.addEventListener("click", () => {
    const titulo = cat.querySelector("h3").textContent.trim();

    modalImgCat.src = cat.querySelector("img").src;
    modalImgCat.alt = titulo;

    modalTituloCat.textContent = titulo;
    modalDescCat.textContent = cat.dataset.descripcion;
    modalCategoria.style.display = "block";
  });
});

cerrarCat.addEventListener("click", () => {
  modalCategoria.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalCategoria) {
    modalCategoria.style.display = "none";
  }
});
// ===============================
// DESCRIPCIONES DE PARTICIPANTES
// ===============================
const descripciones = {
  "Asieras": "",
  "Rulillas": "",
  "Darawayas": "",
  "Ivanpechotes": "",
  "DaniGG": "",
  "Lusilu": "",
  "Almansa": "",
  "Robertuki": "",
  "Toñaco": "",
  "Manolo": "",
  "Kastor": "",
  "Maria": "",
  "Gamepro": "",
  "El Enano": "",
  "Poru": "",
  "Ikardo": "",
  "Fermoriv": "",
  "Lab el Viejo": ""
};



/* ==========================================
   PALMARÉS HISTÓRICO — JOSEMARI I Y II
========================================== */

/*
  Formato de cada premio:
  ["Categoría", año, "nombre-del-archivo", "detalle opcional"]

  Los archivos se buscan en:
  fotos/Palmares/2024/
  fotos/Palmares/2025/
*/

const palmaresJosemari = {

  "Asieras": [
    ["Fiestero del Año", 2024, "fiestero2024"],
    ["Mote del Año", 2024, "mote2024", "Chichotas"],
    ["Dúo del Año", 2024, "duo2024"],
    ["Pareja del Año", 2024, "pareja2024"],
    ["MVP del Año", 2024, "mvp2024"],

    ["Palabra/Frase del Año", 2025, "palabra", "Vamos No Me Jodas"],
    ["Fiesta del Año", 2025, "fiesta", "Proyecto X"],
    ["Fail del Año", 2025, "fail", "Tele por la Ventana"],
    ["MVP del Año", 2025, "mvp"]
  ],

  "Rulillas": [
    ["Cuñao del Año", 2024, "cuñao2024"],
    ["Palabra/Frase del Año", 2024, "palabrafrase2024", "A veeeeeer"],
    ["Dúo del Año", 2024, "duo2024"],

    ["Picado del Año", 2025, "picado2025"],
    ["Soltero del Año", 2025, "soltero"],
    ["Palabra/Frase del Año", 2025, "palabra", "Vamos No Me Jodas"],
    ["Fiesta del Año", 2025, "fiesta", "Proyecto X"]
  ],

  "Darawayas": [
    ["Más Atractivo del Año", 2024, "atractivo2024"],
    ["Fail del Año", 2024, "fail2024", "Azulejo Roto"],

    ["Broma del Año", 2025, "broma", "Grabaciones Cagada"]
  ],

  "Ivanpechotes": [
    ["Ludópata del Año", 2024, "ludopata2024"],
    ["Más Gracioso del Año", 2024, "gracioso2024"],

    ["Meme del Año", 2025, "meme", "Fer en las Tetorras de Clara"],
    ["Baile del Año", 2025, "Baile", "Ivanpe x Mozos"],
    ["Palabra/Frase del Año", 2025, "palabra", "Vamos No Me Jodas"]
  ],

  "DaniGG": [
    ["Salido del Año", 2024, "salido2024"],
    ["Borracho del Año", 2024, "borracho2024"],

    ["Fiesta del Año", 2025, "fiesta", "Proyecto X"],
    ["Broma del Año", 2025, "broma", "Lanzamiento de Objetos a Piscina"]
  ],

  "Lusilu": [
    ["Viajero del Año", 2024, "viajero2024"],
    ["Piba del Año", 2024, "piba2024"],

    ["Trío/Cuarteto del Año", 2025, "trio"],
    ["Papi/Mami del Año", 2025, "papi"]
  ],

  "Almansa": [
    ["Piba del Año", 2024, "piba2024"],

    ["Trío/Cuarteto del Año", 2025, "trio"],
    ["Viajero del Año", 2025, "viajero"]
  ],

  "Toñaco": [
    ["Rayado del Año", 2024, "rayado2024"],
    ["Mote del Año", 2024, "mote2024", "Pocoyo"],

    ["Picado del Año", 2025, "picado2025"],
    ["Fiesta del Año", 2025, "fiesta", "Proyecto X"],
    ["Foto del Año", 2025, "foto", "Porno X"]
  ],

  "Manolo": [
    ["Autistada del Año", 2024, "autistada2024", "Un Verano Sin Manu"],
    ["Decepción del Año", 2024, "decepcion2024"],

    ["Correón del Año", 2025, "correon"]
  ],

  "Kastor": [
    ["Mejor Imitador de Rulas", 2024, "imitador2024"],

    ["Vídeo del Año", 2025, "video", "Castor alimentando a Castor"],
    ["Broma del Año", 2025, "broma", "Grabaciones Cagada"]
  ],

  "Maria": [
    ["Piba del Año", 2024, "piba2024"],

    ["Trío/Cuarteto del Año", 2025, "trio"],
    ["Borracho del Año", 2025, "borracho"],
    ["MVP del Año", 2025, "mvp"]
  ],

  "Gamepro": [
    ["Ligón del Año", 2024, "ligon2024"],
    ["Revelación del Año", 2024, "revelacion2024"],

    ["Foto del Año", 2025, "foto", "Porno X"]
  ],

  "El Enano": [
    ["Soltero del Año", 2024, "soltero2024"],

    ["El Que Mejor Viste del Año", 2025, "mejorviste"]
  ],

  "Poru": [
    ["Chef del Año", 2024, "chef2024"],
    ["Mote del Año", 2024, "mote2024", "Puro, Ropu, Forgotten"],

    ["Braihot del Año", 2025, "braihot"],
    ["Llorón del Año", 2025, "lloron"],
    ["Mote del Año", 2025, "mote", "Cafetera"],
    ["Revelación del Año", 2025, "revelacion"]
  ],

  "Ikardo": [
    ["Mejor Personaje Fuera de JYP", 2024, "personaje2024"],

    ["Guarrete del Año", 2025, "guarrete"],
    ["Fiestero del Año", 2025, "fiestero"],
    ["Fiesta del Año", 2025, "fiesta", "Proyecto X"]
  ],

  "Lab el Viejo": [
    ["Viajero del Año", 2024, "viajero2024"],
    ["Salido del Año", 2024, "salido2024"],
    ["Foto del Año", 2024, "foto2024",
      "Labrada recogiendo la mesa en Boombastic"],

    ["Mensaje del Año", 2025, "mensaje",
      "Haberlo Preguntado Mañana"],
    ["Foto del Año", 2025, "foto", "Beso de Judas"]
  ]

};


/* ==========================================
   ABRIR EL MODAL CON EL PALMARÉS
========================================== */

const modal = document.getElementById("modalParticipante");
const modalImg = document.getElementById("modalImagen");
const modalNombre = document.getElementById("modalNombre");
const modalPalmares = document.getElementById("modalPalmares");
const modalDescripcion = document.getElementById("modalDescripcion");
const spanCerrar = modal.querySelector(".cerrar");


/* Buscar automáticamente la extensión real */

function buscarImagenPremio(img, año, archivo) {

  const extensiones = [".png", ".jpg", ".jpeg", ".webp"];

  const carpeta = `fotos/Palmares/${año}/`;

  let intento = 0;

  function probarSiguiente() {

    if (intento >= extensiones.length) {
      // No se encontró la diapositiva
      img.style.display = "none";
      return;
    }

    img.src = carpeta + archivo + extensiones[intento];

    intento++;
  }

  img.onerror = probarSiguiente;

  probarSiguiente();
}


/* Crear el HTML de un premio */

function crearTarjetaPremio(premio) {

  const [categoria, año, archivo, detalle] = premio;

  const tarjeta = document.createElement("div");
  tarjeta.className = "premio-item";

  const miniatura = document.createElement("img");

  miniatura.alt = `Diapositiva de ${categoria} (${año})`;
  miniatura.loading = "lazy";

  buscarImagenPremio(miniatura, año, archivo);

  const texto = document.createElement("p");

  const detalleTexto = detalle ? ` (${detalle})` : "";

  texto.textContent =
    `Ganador de ${categoria}${detalleTexto} (${año})`;

  tarjeta.append(miniatura, texto);

  return tarjeta;
}


/* Rellenar la ventana al pulsar una fotografía */

document.querySelectorAll("#participantes .participante").forEach(part => {

  part.addEventListener("click", () => {

    const img = part.querySelector("img");
    const nombre = part.querySelector("h3").textContent.trim();

    // Fotografía original
    modalImg.src = img.src;
    modalImg.alt = nombre;

    // Nombre en la parte derecha
    modalNombre.textContent = nombre;

    // Eliminar premios del participante anterior
    modalPalmares.replaceChildren();

    // Buscar el palmarés correspondiente
    const premios = palmaresJosemari[nombre] || [];

    if (premios.length === 0) {

      const mensaje = document.createElement("p");

      mensaje.textContent =
        "Todavía no tiene premios en su palmarés.";

      modalPalmares.appendChild(mensaje);

    } else {

      // Los premios más antiguos aparecen primero
      premios.forEach(premio => {

        const tarjeta = crearTarjetaPremio(premio);

        modalPalmares.appendChild(tarjeta);

      });
    }

    // Ocultamos la descripción antigua
    if (modalDescripcion) {
      modalDescripcion.hidden = true;
      modalDescripcion.textContent = "";
    }

    // Abrir la ventana
    modal.style.display = "block";

    // Empezar siempre arriba
    modal.querySelector(".modal-contenido").scrollTop = 0;

  });

});


/* CERRAR LA VENTANA */

spanCerrar.onclick = () => {
  modal.style.display = "none";
};

window.addEventListener("click", evento => {
  if (evento.target === modal) {
    modal.style.display = "none";
  }
});

document.addEventListener("keydown", evento => {
  if (evento.key === "Escape" &&
      modal.style.display === "block") {

    modal.style.display = "none";
  }
});

/* ==========================================
   ABRIR Y CERRAR EL MENÚ MÓVIL
========================================== */

const btnMenuMovil = document.getElementById("btnMenuMovil");
const menuPrincipal = document.getElementById("menuPrincipal");

if (btnMenuMovil && menuPrincipal) {

  function cerrarMenuMovil() {
    menuPrincipal.classList.remove("menu-abierto");

    btnMenuMovil.textContent = "☰";
    btnMenuMovil.setAttribute("aria-expanded", "false");
    btnMenuMovil.setAttribute("aria-label", "Abrir menú");
  }

  btnMenuMovil.addEventListener("click", () => {
    const abierto = menuPrincipal.classList.toggle("menu-abierto");

    btnMenuMovil.textContent = abierto ? "✕" : "☰";
    btnMenuMovil.setAttribute("aria-expanded", String(abierto));
    btnMenuMovil.setAttribute(
      "aria-label",
      abierto ? "Cerrar menú" : "Abrir menú"
    );
  });

  // Cerrar automáticamente cuando se elige una sección
  menuPrincipal.addEventListener("click", (evento) => {
    if (evento.target.closest("button")) {
      cerrarMenuMovil();
    }
  });

  // También se puede cerrar con Escape
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrarMenuMovil();
    }
  });
}


/* RESALTAR EL APARTADO ACTIVO */

const botonesNavegacion = document.querySelectorAll(
  "nav.top .nav-actions .btn"
);

botonesNavegacion.forEach((boton) => {
  boton.addEventListener("click", () => {
    botonesNavegacion.forEach((otroBoton) => {
      otroBoton.classList.remove("nav-activo");
    });

    boton.classList.add("nav-activo");
  });
});

// Inicio seleccionado al cargar la página
const botonInicio = [...botonesNavegacion].find(
  (boton) => boton.textContent.trim() === "Inicio"
);

if (botonInicio) {
  botonInicio.classList.add("nav-activo");
}




/* ==========================================
   MUSEO DEL HIELO — EXPOSICIÓN DEFINITIVA
========================================== */

/* Fotografías de los participantes */

const fotosMuseo = {
  "Asieras": "fotos/asieras.jpeg",
  "Rulillas": "fotos/rulillas.jpeg",
  "Darawayas": "fotos/dario.jpeg",
  "Ivanpechotes": "fotos/ivanp.jpeg",
  "DaniGG": "fotos/dani.jpeg",
  "Lusilu": "fotos/Lucia.jpeg",
  "Almansa": "fotos/ines.jpeg",
  "Toñaco": "fotos/marco.jpeg",
  "Manolo": "fotos/manu.jpeg",
  "Kastor": "fotos/mario.jpeg",
  "Maria": "fotos/maria.jpeg",
  "Gamepro": "fotos/gamepro.jpeg",
  "El Enano": "fotos/fervico.jpeg",
  "Poru": "fotos/Poru.jpeg",
  "Ikardo": "fotos/iker.jpeg",
  "Lab el Viejo": "fotos/labrada.jpeg",
  "Rober": "fotos/rober.jpeg",
  "Fermoriv": "fotos/Fermoriv.jpeg"
};


/* ==========================================
   GANADORES HISTÓRICOS ADICIONALES
========================================== */

const extrasMuseo = {

  2024: [
    ["Rober", "El Que Mejor Viste del Año"],
    ["Fergo", "Vídeo del Año"],
    ["Piedrabuena", "Fiesta del Año"],
    ["La Eurocopa", "Mejor Momento del Año"]
  ],

  2025: [
    ["Ana Rosa", "Objeto del Año"],
    ["Fermoriv", "Peor Momento del Año"],
    ["Pepito", "Mejor Personaje Fuera de JYP"],
    ["Carrera con tío borracho", "Mejor Momento del Año"],
    ["Fermoriv", "Foto del Año", "Beso de Judas"],
    ["Rober", "Decepción del Año"],
    ["Robo de Botellas X", "Autistada del Año"]
  ]

};


/* ==========================================
   FOTOGRAFÍAS DE CADA CATEGORÍA
========================================== */

/*
  Estos nombres corresponden a los archivos
  de fotos/Museo/2024 y fotos/Museo/2025.

  No escribimos aquí la extensión, porque
  se buscará automáticamente.
*/

const imagenesMuseo = {

  2024: {
    "Autistada del Año": "autistada",
    "Borracho del Año": "borracho",
    "Chef del Año": "chef",
    "Cuñao del Año": "cuñao",
    "Decepción del Año": "decepcion",
    "Dúo del Año": "duo",
    "Fail del Año": "fail",
    "Fiesta del Año": "fiesta",
    "Fiestero del Año": "fiestero",
    "Foto del Año": "foto",
    "Ligón del Año": "ligon",
    "Ludópata del Año": "ludopata",
    "Más Atractivo del Año": "atractivo",
    "Más Gracioso del Año": "gracioso",
    "Mejor Imitador de Rulas": "imitador",
    "Mejor Momento del Año": "momento",
    "Mejor Personaje Fuera de JYP": "personaje",
    "El Que Mejor Viste del Año": "mejorviste",
    "MVP del Año": "mvp",
    "Palabra/Frase del Año": "palabra",
    "Pareja del Año": "pareja",
    "Piba del Año": "piba",
    "Rayado del Año": "rayado",
    "Revelación del Año": "revelacion",
    "Soltero del Año": "soltero",
    "Vídeo del Año": "video"
  },

  2025: {
    "Autistada del Año": "autistada",
    "Baile del Año": "baile",
    "Braihot del Año": "brainhot",
    "Borracho del Año": "borracho",
    "Correón del Año": "correa",
    "Decepción del Año": "decepcion",
    "El Que Mejor Viste del Año": "mejorviste",
    "Fail del Año": "fail",
    "Fiesta del Año": "fiesta",
    "Fiestero del Año": "fiestero",
    "Guarrete del Año": "guarrete",
    "Llorón del Año": "lloron",
    "Mejor Momento del Año": "mejormomento",
    "Mejor Personaje Fuera de JYP": "personaje",
    "Meme del Año": "meme",
    "Mensaje del Año": "mensaje",
    "Mote del Año": "mote",
    "Objeto del Año": "objeto",
    "Papi/Mami del Año": "papimami",
    "Palabra/Frase del Año": "palabra",
    "Peor Momento del Año": "peormomento",
    "Revelación del Año": "revelacion",
    "Soltero del Año": "soltero",
    "Trío/Cuarteto del Año": "trio",
    "Viajero del Año": "viajero",
    "Vídeo del Año": "videos"
  }

};


/* ==========================================
   FOTOGRAFÍAS DE PREMIOS COMPARTIDOS
========================================== */

function elegirImagenMuseo(año, categoria, ganador, detalle) {

  if (año === 2024) {

    if (categoria === "Mote del Año") {
      if (ganador === "Asieras") return "mote1";
      if (ganador === "Toñaco") return "mote2";
      if (ganador === "Poru") return "mote3";
    }

    if (categoria === "Salido del Año") {
      return ganador === "DaniGG"
        ? "salido1"
        : "salido2";
    }

    if (categoria === "Viajero del Año") {
      return ganador === "Lab el Viejo"
        ? "viajero1"
        : "viajero2";
    }

  }

  if (año === 2025) {

    if (categoria === "Foto del Año") {
      return detalle === "Beso de Judas"
        ? "foto2"
        : "foto1";
    }

    if (categoria === "Broma del Año") {
      return detalle === "Grabaciones Cagada"
        ? "broma2"
        : "broma1";
    }

    if (categoria === "MVP del Año") {
      return ganador === "Maria"
        ? "mvp1"
        : "mvp2";
    }

    if (categoria === "Picado del Año") {
      return ganador === "Toñaco"
        ? "picado1"
        : "picado2";
    }

  }

  return imagenesMuseo[año]?.[categoria] || null;
}


/* ==========================================
   RECOPILAR TODOS LOS GANADORES
========================================== */

function obtenerGanadoresMuseo(año) {

  const resultado = [];

  // Los 16 participantes y sus premios.
  Object.entries(palmaresJosemari).forEach(
    ([nombre, premios]) => {

      premios.forEach(premio => {

        const [categoria, añoPremio, archivo, detalle] = premio;

        if (añoPremio !== año) return;

        resultado.push({
          nombre,
          categoria,
          detalle: detalle || "",
          foto: fotosMuseo[nombre] || null
        });

      });

    }
  );

  // Ganadores históricos adicionales.
  (extrasMuseo[año] || []).forEach(
    ([nombre, categoria, detalle = ""]) => {

      resultado.push({
        nombre,
        categoria,
        detalle,
        foto: fotosMuseo[nombre] || null
      });

    }
  );

  return resultado;
}


/* ==========================================
   CARGAR FOTOS Y VÍDEOS DEL MUSEO
========================================== */

function crearMedioMuseo(año, archivo, titulo) {

  const contenedor = document.createElement("div");
  contenedor.className = "mh-medio";

  if (!archivo) {
    contenedor.textContent = "🏆";
    contenedor.classList.add("mh-sin-foto");
    return contenedor;
  }

  const base = `fotos/Museo/${año}/${archivo}`;

  // Archivos que aparecen como vídeo en tus carpetas.
  const esVideo =
    (año === 2024 && archivo === "video") ||
    (año === 2025 &&
      ["baile","brainhot", "meme", "videos"].includes(archivo));

  if (esVideo) {

    const video = document.createElement("video");

    video.controls = true;
    video.preload = "none";
    video.playsInline = true;
    video.setAttribute("aria-label", titulo);

    const extensiones = [".mp4", ".webm", ".mov"];
    let intento = 0;

    video.addEventListener("error", () => {
      if (intento < extensiones.length) {
        video.src = base + extensiones[intento++];
        video.load();
      } else {
        contenedor.textContent =
          "Vídeo no disponible. Comprueba su formato.";
      }
    });

    video.src = base + extensiones[intento++];

    contenedor.appendChild(video);

    return contenedor;
  }

  // Fotografías.
  const img = document.createElement("img");

  img.alt = titulo;
  img.loading = "lazy";

  const extensiones = [".jpg", ".jpeg", ".png", ".webp"];
  let intento = 0;

  img.onerror = () => {

    if (intento < extensiones.length) {
      img.src = base + extensiones[intento++];
    } else {
      contenedor.textContent = "Fotografía no disponible";
    }

  };

  img.src = base + extensiones[intento++];

  contenedor.appendChild(img);

  // Abrir la fotografía en grande.
  img.addEventListener("click", () => {
    if (!img.naturalWidth) return;

    const visor = document.getElementById("mhVisorFoto");
    const imagenGrande = document.getElementById("mhImagenGrande");

    imagenGrande.src = img.src;
    imagenGrande.alt = titulo;

    if (!visor.open) visor.showModal();
  });

  img.title = "Pulsar para ampliar";

  return contenedor;
}


/* ==========================================
   CONSTRUIR VITRINAS POR CATEGORÍA
========================================== */

function construirSalaMuseo(año) {

  const contenedor = document.getElementById(
    `museoGanadores${año}`
  );

  if (!contenedor) return;

  contenedor.replaceChildren();

  const ganadores = obtenerGanadoresMuseo(año);

  // Agrupar por categoría.
  const grupos = new Map();

  ganadores.forEach(ganador => {

    if (!grupos.has(ganador.categoria)) {
      grupos.set(ganador.categoria, []);
    }

    grupos.get(ganador.categoria).push(ganador);

  });

  // Orden alfabético de las categorías.
  const categoriasOrdenadas = [...grupos.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "es"));

  categoriasOrdenadas.forEach(([categoria, personas]) => {

    const vitrina = document.createElement("article");
    vitrina.className = "mh-vitrina";

    const titulo = document.createElement("h4");
    titulo.textContent = "🏆 " + categoria;

    const galeria = document.createElement("div");
    galeria.className = "mh-galeria";

    /*
      Agrupamos los premios compartidos que
      tienen la misma fotografía y detalle.
    */
    const momentos = new Map();

    personas.forEach(persona => {

      const archivo = elegirImagenMuseo(
        año,
        categoria,
        persona.nombre,
        persona.detalle
      );

      const clave = `${archivo || "sin-foto"}|${persona.detalle}`;

      if (!momentos.has(clave)) {
        momentos.set(clave, {
          archivo,
          detalle: persona.detalle,
          ganadores: []
        });
      }

      momentos.get(clave).ganadores.push(persona);

    });

    momentos.forEach(momento => {

      const pieza = document.createElement("div");
      pieza.className = "mh-momento";

      const medio = crearMedioMuseo(
        año,
        momento.archivo,
        categoria
      );

      const lista = document.createElement("div");
      lista.className = "mh-nombres";

      momento.ganadores.forEach(ganador => {

        const nombre = document.createElement("span");
        nombre.className = "mh-nombre";
        nombre.textContent = ganador.nombre;

        lista.appendChild(nombre);

      });

      pieza.appendChild(medio);

      if (momento.detalle) {
        const detalle = document.createElement("p");
        detalle.className = "mh-detalle";
        detalle.textContent = momento.detalle;
        pieza.appendChild(detalle);
      }

      pieza.appendChild(lista);

      galeria.appendChild(pieza);

    });

    vitrina.append(titulo, galeria);
    contenedor.appendChild(vitrina);

  });

}


/* ==========================================
   NAVEGACIÓN DEL MUSEO
========================================== */

function mostrarVistaMuseo(año = null) {

  const vestibulo = document.getElementById("museoVestibulo");
  const sala2024 = document.getElementById("museoSala2024");
  const sala2025 = document.getElementById("museoSala2025");

  vestibulo.hidden = año !== null;
  sala2024.hidden = año !== 2024;
  sala2025.hidden = año !== 2025;

  document.getElementById("museo").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}

document.querySelectorAll("[data-museo-abrir]")
  .forEach(boton => {

    boton.addEventListener("click", () => {
      mostrarVistaMuseo(Number(boton.dataset.museoAbrir));
    });

  });

document.querySelectorAll(".mh-volver")
  .forEach(boton => {

    boton.addEventListener("click", () => {
      mostrarVistaMuseo();
    });

  });


/* ==========================================
   VISOR DE FOTOGRAFÍAS
========================================== */

const visorMuseo = document.createElement("dialog");

visorMuseo.id = "mhVisorFoto";
visorMuseo.className = "mh-visor-foto";

visorMuseo.innerHTML = `
  <button type="button" class="mh-cerrar-foto"
          aria-label="Cerrar fotografía">✕</button>
  <img id="mhImagenGrande" alt="">
`;

document.body.appendChild(visorMuseo);

visorMuseo.querySelector(".mh-cerrar-foto")
  .addEventListener("click", () => visorMuseo.close());

visorMuseo.addEventListener("click", evento => {
  if (evento.target === visorMuseo) {
    visorMuseo.close();
  }
});


/* CONSTRUIR LAS DOS SALAS */

construirSalaMuseo(2024);
construirSalaMuseo(2025);

/* ==========================================
   CONTADOR HASTA LA GALA
========================================== */

(() => {

  const dias = document.getElementById("contadorDias");
  const horas = document.getElementById("contadorHoras");
  const minutos = document.getElementById("contadorMinutos");
  const segundos = document.getElementById("contadorSegundos");

  if (!dias || !horas || !minutos || !segundos) return;

  // Fecha provisional de la gala
  const fechaGala = new Date("2026-12-26T20:00:00");

  function actualizarContador() {

    const ahora = new Date();

    let diferencia =
      fechaGala.getTime() - ahora.getTime();

    if (diferencia <= 0) {

      dias.textContent = "00";
      horas.textContent = "00";
      minutos.textContent = "00";
      segundos.textContent = "00";

      return;
    }

    const d = Math.floor(
      diferencia / (1000 * 60 * 60 * 24)
    );

    diferencia %= (1000 * 60 * 60 * 24);

    const h = Math.floor(
      diferencia / (1000 * 60 * 60)
    );

    diferencia %= (1000 * 60 * 60);

    const m = Math.floor(
      diferencia / (1000 * 60)
    );

    diferencia %= (1000 * 60);

    const s = Math.floor(
      diferencia / 1000
    );

    dias.textContent = String(d).padStart(2, "0");
    horas.textContent = String(h).padStart(2, "0");
    minutos.textContent = String(m).padStart(2, "0");
    segundos.textContent = String(s).padStart(2, "0");
  }

  actualizarContador();

  setInterval(
    actualizarContador,
    1000
  );

})();

/* ==========================================
   SISTEMA DE EASTER EGGS
========================================== */

(() => {

  const TOTAL_EASTER_EGGS = 5;

  let encontrados = JSON.parse(
    localStorage.getItem("easterEggsJosemari") || "[]"
  );

  const contador =
    document.getElementById("easterEggCounter");


  /* ==========================================
     ACTUALIZAR PÁGINA EASTER EGGS
  ========================================== */

  function actualizarPaginaEasterEggs() {

    const datos = {

      "logo": {
        nombre: "Bienvenido al hielo",
        descripcion:
          "Has descubierto uno de los secretos de la expedición."
      },

      "cartel": {
        nombre: "El cartel se ha descongelado",
        descripcion:
          "Algo extraño escondía el cartel oficial."
      },

      "codigo-josemari": {
        nombre: "Código Josemari",
        descripcion:
          "Has activado el protocolo secreto Josemari."
      },

      "pinguinos": {
        nombre: "Expedición Polar",
        descripcion:
          "Los pingüinos escondían más de lo que parecía."
      },

      "secuencia-menu": {
        nombre: "Ruta secreta",
        descripcion:
          "Has completado la ruta oculta de los Josemari."
      }

    };


    document
      .querySelectorAll(".easter-card")
      .forEach(card => {

        const id = card.dataset.easter;

        const encontrado =
          encontrados.includes(id);

        const icono =
          card.querySelector(".easter-card-icono");

        const titulo =
          card.querySelector("h3");

        const descripcion =
          card.querySelector("p");

        const estado =
          card.querySelector(".easter-card-estado");


        if (encontrado) {

          card.classList.add("encontrado");

          icono.textContent = "🥚";
          titulo.textContent = datos[id].nombre;
          descripcion.textContent =
            datos[id].descripcion;

          estado.textContent = "1/1 ✅";

        } else {

          card.classList.remove("encontrado");

          icono.textContent = "🔒";
          titulo.textContent = "???";

          descripcion.textContent =
            "Secreto todavía sin descubrir.";

          estado.textContent = "0/1";

        }

      });


    const total =
      document.getElementById(
        "easterTotalEncontrados"
      );

    if (total) {
      total.textContent =
        `${encontrados.length}/${TOTAL_EASTER_EGGS}`;
    }


    const recompensa =
      document.getElementById(
        "easterRecompensaFinal"
      );

    if (recompensa) {

      recompensa.hidden =
        encontrados.length !==
        TOTAL_EASTER_EGGS;

    }

  }


  /* ==========================================
     ACTUALIZAR CONTADOR
  ========================================== */

  function actualizarContador() {

    if (contador) {

      contador.textContent =
        `🥚 ${encontrados.length}/${TOTAL_EASTER_EGGS} encontrados`;

    }

    actualizarPaginaEasterEggs();

  }


  /* ==========================================
     MENSAJE DE EASTER EGG
  ========================================== */

  function mostrarMensaje(texto) {

    let mensaje =
      document.querySelector(".easter-mensaje");

    if (!mensaje) {

      mensaje =
        document.createElement("div");

      mensaje.className =
        "easter-mensaje";

      document.body.appendChild(mensaje);

    }

    mensaje.textContent = texto;

    mensaje.classList.add("visible");

    setTimeout(() => {

      mensaje.classList.remove("visible");

    }, 2600);

  }


  /* ==========================================
     REGISTRAR EASTER EGG
  ========================================== */

  function encontrarEasterEgg(id, nombre) {

    if (encontrados.includes(id)) {

      mostrarMensaje(
        `🥚 Ya habías encontrado: ${nombre}`
      );

      return;

    }

    encontrados.push(id);

    localStorage.setItem(
      "easterEggsJosemari",
      JSON.stringify(encontrados)
    );

    actualizarContador();

    mostrarMensaje(
      `🥚 Easter egg encontrado: ${nombre}`
    );

  }


  /* ==========================================
     ESTADO INICIAL
  ========================================== */

  actualizarContador();


  /* ==========================================
     CONTADOR → ABRIR PÁGINA EASTER EGGS
  ========================================== */

  if (contador) {

    contador.style.cursor = "pointer";

    contador.addEventListener("click", () => {

      window.mostrarSeccion?.(
        "easter-eggs"
      );

    });

  }


  /* ==========================================
     EASTER EGG 1 — LOGO
     5 CLICS RÁPIDOS
  ========================================== */

  const logo =
    document.querySelector(
      "nav.top .logo"
    );

  if (logo) {

    let clicksLogo = 0;
    let temporizadorLogo;

    logo.style.cursor = "pointer";

    logo.addEventListener("click", () => {

      clicksLogo++;

      clearTimeout(
        temporizadorLogo
      );

      temporizadorLogo =
        setTimeout(() => {

          clicksLogo = 0;

        }, 1800);


      if (clicksLogo >= 5) {

        clicksLogo = 0;

        encontrarEasterEgg(
          "logo",
          "Bienvenido al hielo"
        );

      }

    });

  }


  /* ==========================================
     EASTER EGG 2 — CARTEL
     DOBLE CLIC
  ========================================== */

  const cartel =
    document.querySelector(
      ".inicio-poster"
    );

  if (cartel) {

    cartel.style.cursor = "pointer";

    cartel.addEventListener(
      "dblclick",
      () => {

        cartel.classList.remove(
          "easter-cartel-activo"
        );

        void cartel.offsetWidth;

        cartel.classList.add(
          "easter-cartel-activo"
        );

        encontrarEasterEgg(
          "cartel",
          "El cartel se ha descongelado"
        );

        setTimeout(() => {

          cartel.classList.remove(
            "easter-cartel-activo"
          );

        }, 800);

      }
    );

  }


  /* ==========================================
     EASTER EGG 3 — CÓDIGO JOSEMARI
  ========================================== */

  let codigoEscrito = "";

  const CODIGO_SECRETO =
    "JOSEMARI";

  document.addEventListener(
    "keydown",
    evento => {

      const etiqueta =
        evento.target.tagName;

      if (
        etiqueta === "INPUT" ||
        etiqueta === "TEXTAREA"
      ) {
        return;
      }

      codigoEscrito +=
        evento.key.toUpperCase();

      codigoEscrito =
        codigoEscrito.slice(
          -CODIGO_SECRETO.length
        );


      if (
        codigoEscrito ===
        CODIGO_SECRETO
      ) {

        encontrarEasterEgg(
          "codigo-josemari",
          "Código Josemari activado"
        );

        document.body.classList.add(
          "modo-josemari-secreto"
        );

        setTimeout(() => {

          document.body.classList.remove(
            "modo-josemari-secreto"
          );

        }, 5000);

        codigoEscrito = "";

      }

    }
  );


  /* ==========================================
     EASTER EGG 3 — ALTERNATIVA MÓVIL
     PULSACIÓN LARGA EN EL CONTADOR
  ========================================== */

  if (contador) {

    let pulsacionLarga;
    let fuePulsacionLarga = false;


    const activarModoJosemari = () => {

      fuePulsacionLarga = true;

      encontrarEasterEgg(
        "codigo-josemari",
        "Código Josemari activado"
      );

      document.body.classList.add(
        "modo-josemari-secreto"
      );

      setTimeout(() => {

        document.body.classList.remove(
          "modo-josemari-secreto"
        );

      }, 5000);

    };


    contador.addEventListener(
      "pointerdown",
      () => {

        fuePulsacionLarga = false;

        pulsacionLarga =
          setTimeout(() => {

            activarModoJosemari();

          }, 2000);

      }
    );


    contador.addEventListener(
      "pointerup",
      () => {

        clearTimeout(
          pulsacionLarga
        );

      }
    );


    contador.addEventListener(
      "pointerleave",
      () => {

        clearTimeout(
          pulsacionLarga
        );

      }
    );


    contador.addEventListener(
      "pointercancel",
      () => {

        clearTimeout(
          pulsacionLarga
        );

      }
    );

  }


  /* ==========================================
     EASTER EGG 4 — PINGÜINOS
     3 CLICS
  ========================================== */

  const pinguinos =
    document.querySelector(
      ".pinguinos-decoracion"
    );

  if (pinguinos) {

    let clicksPinguinos = 0;
    let temporizadorPinguinos;

    pinguinos.style.cursor =
      "pointer";


    pinguinos.addEventListener(
      "click",
      () => {

        clicksPinguinos++;

        clearTimeout(
          temporizadorPinguinos
        );

        temporizadorPinguinos =
          setTimeout(() => {

            clicksPinguinos = 0;

          }, 1600);


        if (
          clicksPinguinos >= 3
        ) {

          clicksPinguinos = 0;

          pinguinos.classList.remove(
            "easter-pinguinos-activo"
          );

          void pinguinos.offsetWidth;

          pinguinos.classList.add(
            "easter-pinguinos-activo"
          );

          encontrarEasterEgg(
            "pinguinos",
            "Expedición Polar"
          );

          setTimeout(() => {

            pinguinos.classList.remove(
              "easter-pinguinos-activo"
            );

          }, 900);

        }

      }
    );

  }


  /* ==========================================
     EASTER EGG 5 — SECUENCIA DEL MENÚ
  ========================================== */

  const SECUENCIA_SECRETA = [
    "Inicio",
    "Museo",
    "Participantes",
    "Casino Polar",
    "Inicio"
  ];

  let progresoSecuencia = 0;


  document.querySelectorAll(
    "nav.top .nav-actions .btn"
  ).forEach(boton => {

    boton.addEventListener(
      "click",
      () => {

        const textoBoton =
          boton.textContent.trim();

        const esperado =
          SECUENCIA_SECRETA[
            progresoSecuencia
          ];


        if (
          textoBoton === esperado
        ) {

          progresoSecuencia++;

          if (
            progresoSecuencia ===
            SECUENCIA_SECRETA.length
          ) {

            progresoSecuencia = 0;

            encontrarEasterEgg(
              "secuencia-menu",
              "Ruta secreta completada"
            );

            document.body.classList.add(
              "easter-final-activo"
            );

            setTimeout(() => {

              document.body.classList.remove(
                "easter-final-activo"
              );

            }, 5000);

          }

        } else {

          progresoSecuencia =
            textoBoton ===
            SECUENCIA_SECRETA[0]
              ? 1
              : 0;

        }

      }
    );

  });


})();

