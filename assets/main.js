/* Bosch Systems: script compartido por todas las páginas. */
(function () {
  "use strict";

  /* ===== AJUSTES =====
     bookingUrl:   enlace de tu agenda (Cal.com, Calendly...). Si lo rellenas, aparecen los enlaces opcionales "Prefiero hablarlo primero".
     formEndpoint: URL del webhook de n8n que recibe las solicitudes. Si está vacío, el formulario abre el correo del visitante. */
  var CONFIG = {
    email: "damia@boschsystems.net",
    phone: "+34 621 237 118",
    bookingUrl: "https://cal.com/damia-bosch-masanas-p4kf6e",
    formEndpoint: "https://n8n.boschsystems.net/webhook/auditoria-boschsystems"
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Contacto */
  $$(".js-email").forEach(function (a) { a.textContent = CONFIG.email; a.href = "mailto:" + CONFIG.email; });
  $$(".js-phone").forEach(function (a) { a.textContent = CONFIG.phone; a.href = "tel:" + CONFIG.phone.replace(/\s+/g, ""); });
  $$(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Botón opcional de llamada */
  if (CONFIG.bookingUrl) {
    $$(".js-booking").forEach(function (a) { a.href = CONFIG.bookingUrl; a.target = "_blank"; a.rel = "noopener"; a.hidden = false; });
    $$(".js-no-booking").forEach(function (a) { a.hidden = true; });
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Menú móvil: se cierra con un enlace, con Escape, tocando fuera o al pasar a escritorio */
  var top = $(".top"), menuBtn = $(".menu-btn");
  if (top && menuBtn) {
    var setMenu = function (open) {
      top.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.documentElement.classList.toggle("menu-open", open);
    };
    menuBtn.addEventListener("click", function () { setMenu(!top.classList.contains("open")); });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && top.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (top.classList.contains("open") && !top.contains(e.target)) setMenu(false);
    });
    if (window.matchMedia) {
      var desktop = window.matchMedia("(min-width: 901px)");
      var onDesktop = function () { if (desktop.matches) setMenu(false); };
      if (desktop.addEventListener) desktop.addEventListener("change", onDesktop);
    }

  }

  /* Sección activa en el menú (solo enlaces a esta misma página) */
  if ("IntersectionObserver" in window) {
    var spyLinks = {};
    $$('.nav a[href^="#"]:not(.nav-cta)').forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (id && document.getElementById(id)) spyLinks[id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { spyLinks[e.target.id].classList.toggle("is-active", e.isIntersecting); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(spyLinks).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* Aparición suave al hacer scroll. Solo se aplica a lo que todavía no está en pantalla,
     así que sin JavaScript o con movimiento reducido todo se ve desde el principio.
     Se prepara justo después del primer pintado para no retrasarlo. */
  if (!reduceMotion && "IntersectionObserver" in window && window.requestAnimationFrame) {
    var setupReveal = function () {
      var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); revealer.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      var fold = window.innerHeight, blocks = [];
      [".head", ".procs > .proc", ".sectors > li", ".calc > *", ".steps", ".pricing > .plan", ".pricing-note",
       ".trust > div", ".audit > *", ".faq > details", ".about > *", ".final-panel", ".compare > *", ".feat > div"
      ].forEach(function (sel) { blocks = blocks.concat($$(sel)); });
      /* Primero se leen todas las posiciones y después se escriben las clases: una sola maquetación */
      var tops = blocks.map(function (el) { return el.getBoundingClientRect().top; });
      blocks.forEach(function (el, k) {
        if (tops[k] < fold) return;
        var i = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.setProperty("--d", Math.min(i, 4) * 70 + "ms");
        el.classList.add("reveal");
        revealer.observe(el);
      });
    };
    window.requestAnimationFrame(function () { setTimeout(setupReveal, 0); });
  }

  /* Luz que sigue al cursor en las tarjetas de procesos */
  if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".proc").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* Formato */
  var eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });
  var num = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1, useGrouping: "always" });
  var val = function (id) { var el = document.getElementById(id); return Math.max(0, parseFloat(el && el.value) || 0); };
  var set = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };

  /* Deslizadores: relleno de la barra hasta el valor actual */
  $$('input[type="range"]').forEach(function (r) {
    var paint = function () {
      var min = parseFloat(r.min) || 0, max = parseFloat(r.max) || 100;
      r.style.setProperty("--p", ((parseFloat(r.value) - min) / (max - min) * 100) + "%");
    };
    r.addEventListener("input", paint);
    paint();
  });

  /* Calculadora de horas (portada) */
  if (document.getElementById("calc-horas")) {
    var calcHoras = function () {
      var horasMes = val("h-horas") * 52 / 12 * val("h-pct") / 100;
      var euroMes = horasMes * val("h-coste");
      set("h-horas-v", num.format(val("h-horas")) + " h");
      set("h-coste-v", eur.format(val("h-coste")));
      set("h-pct-v", val("h-pct") + " %");
      set("h-mes-h", num.format(Math.round(horasMes)) + " h");
      set("h-mes-e", eur.format(euroMes));
      set("h-anio", eur.format(euroMes * 12));
    };
    ["h-horas", "h-coste", "h-pct"].forEach(function (id) { document.getElementById(id).addEventListener("input", calcHoras); });
    calcHoras();
  }

  /* Calculadora de clínicas */
  if (document.getElementById("calc-clinica")) {
    var calcClinica = function () {
      var p = Math.min(100, val("c-perdidas"));
      var perdidos = val("c-consultas") * p / 100;
      var mes = perdidos * val("c-valor");
      set("c-consultas-v", num.format(val("c-consultas")));
      set("c-valor-v", eur.format(val("c-valor")));
      set("c-perdidas-v", p + " %");
      set("c-pac", num.format(perdidos));
      set("c-mes", eur.format(mes));
      set("c-anio", eur.format(mes * 12));
    };
    ["c-consultas", "c-perdidas", "c-valor"].forEach(function (id) { document.getElementById(id).addEventListener("input", calcClinica); });
    calcClinica();
  }

  /* Panel de flujos (portada) */
  var FLOWS = {
    citas: { name: "Reserva de citas", total: "6 pasos · 41 s", steps: [
      ["Llega una solicitud", "WhatsApp, formulario web o email", "0 s"],
      ["La IA entiende qué necesita", "Tipo de servicio, urgencia y preferencia horaria", "2 s"],
      ["Consulta la agenda real", "Google Calendar, Outlook o tu programa de citas", "3 s"],
      ["Ofrece huecos y reserva", "El cliente elige y la cita queda creada", "38 s"],
      ["Confirma y programa recordatorios", "Mensaje inmediato y aviso el día antes", "40 s"],
      ["Tu equipo lo ve todo", "Resumen en el CRM y aviso si algo necesita a una persona", "41 s", 1]
    ]},
    leads: { name: "Captación de leads", total: "6 pasos · 1 min", steps: [
      ["Entra un contacto nuevo", "Web, portal, anuncio o formulario", "0 s"],
      ["Se completa la ficha", "Empresa, sector, tamaño y origen del contacto", "5 s"],
      ["La IA lo cualifica", "Según los criterios que definas: presupuesto, urgencia, zona", "8 s"],
      ["Respuesta personalizada", "Email o WhatsApp con la información que pidió", "20 s"],
      ["Se asigna al comercial", "Con el resumen y una propuesta de llamada", "30 s"],
      ["Seguimiento hasta que responde", "Recordatorios espaciados y aviso si contesta", "1 min", 1]
    ]},
    email: { name: "Gestión del email", total: "5 pasos · 15 s", steps: [
      ["Llega un correo", "Bandeja general, de soporte o de pedidos", "0 s"],
      ["Se clasifica", "Consulta, pedido, factura, incidencia o spam", "3 s"],
      ["Se extraen los datos", "Cliente, número de pedido, importes y fechas", "6 s"],
      ["Se prepara la respuesta", "Borrador listo con la información correcta", "12 s"],
      ["Una persona revisa y envía", "Lo urgente aparece primero, con todo el contexto", "15 s", 1]
    ]},
    facturas: { name: "Registro de facturas", total: "5 pasos · 30 s", steps: [
      ["Llega una factura", "Adjunta en un email o subida a una carpeta", "0 s"],
      ["Se leen los datos", "Proveedor, NIF, fecha, base, IVA y total", "8 s"],
      ["Se validan", "Cuadre de importes, duplicados y pedido asociado", "15 s"],
      ["Se registra", "En tu Excel, ERP o programa de contabilidad", "25 s"],
      ["Las dudosas, a revisión", "Lo que no cuadra queda marcado para una persona", "30 s", 1]
    ]}
  };
  var flow = $("#flow");
  if (flow) {
    var list = $("#flow-steps"), panel = $("#flow-panel"), tabs = $$(".flow-tabs button"), timers = [];
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var progress = function (v) { flow.style.setProperty("--flow-p", v); };
    var show = function (key) {
      var f = FLOWS[key]; if (!f) return;
      timers.forEach(clearTimeout); timers = [];
      set("flow-name", f.name); set("flow-total", f.total);
      list.innerHTML = f.steps.map(function (s) {
        return '<li class="' + (s[3] ? "human" : "") + '"><span class="dot"></span><div><strong>' + esc(s[0]) + "</strong><small>" + esc(s[1]) + '</small></div><span class="mono">' + esc(s[2]) + "</span></li>";
      }).join("");
      var items = $$("li", list);
      if (reduceMotion) { items.forEach(function (li) { li.classList.add("done"); }); progress(1); return; }
      flow.classList.add("playing");
      progress(0);
      items.forEach(function (li, i) {
        timers.push(setTimeout(function () {
          li.classList.add("done");
          progress((i + 1) / items.length);
          if (i === items.length - 1) flow.classList.remove("playing");
        }, 250 + i * 380));
      });
    };
    /* Pestañas accesibles: clic, flechas, Inicio y Fin */
    var select = function (b, focus) {
      tabs.forEach(function (x) {
        var on = x === b;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
      });
      if (panel && b.id) panel.setAttribute("aria-labelledby", b.id);
      if (focus) b.focus();
      show(b.getAttribute("data-flow"));
    };
    tabs.forEach(function (b, i) {
      b.tabIndex = b.getAttribute("aria-selected") === "true" ? 0 : -1;
      b.addEventListener("click", function () { select(b); });
      b.addEventListener("keydown", function (e) {
        var k = e.key, n = tabs.length;
        var j = k === "ArrowRight" ? i + 1 : k === "ArrowLeft" ? i - 1 : k === "Home" ? 0 : k === "End" ? n - 1 : null;
        if (j === null) return;
        e.preventDefault();
        select(tabs[(j + n) % n], true);
      });
    });
    /* El ejemplo inicial se reproduce una vez, cuando el panel entra en pantalla */
    if (!reduceMotion && "IntersectionObserver" in window) {
      var firstPlay = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        firstPlay.disconnect();
        var current = tabs.filter(function (x) { return x.getAttribute("aria-selected") === "true"; })[0];
        show(current ? current.getAttribute("data-flow") : "citas");
      }, { threshold: 0.35 });
      firstPlay.observe(flow);
    }
  }

  /* Formularios de contacto */
  $$(".js-lead-form").forEach(function (form) {
    var status = $(".status", form), button = $("button[type=submit]", form);
    var setStatus = function (t, k) { status.textContent = t; status.className = "status" + (k ? " " + k : ""); };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus("Revisa los campos obligatorios y acepta la política de privacidad.", "err");
        return;
      }
      if (form.elements["contacto_extra"] && form.elements["contacto_extra"].value) return;
      var get = function (n) { var el = form.elements[n]; return el ? String(el.value).trim() : ""; };
      var data = {
        nombre: get("nombre"), email: get("email"), empresa: get("empresa"), sector: get("sector"),
        telefono: get("telefono"), mensaje: get("mensaje"), origen: get("origen") || "portada",
        pagina: location.pathname, consentimiento: true, fecha: new Date().toISOString()
      };
      if (CONFIG.formEndpoint) {
        button.disabled = true;
        setStatus("Enviando…");
        fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); setStatus("Solicitud enviada. Te responderemos por email en un plazo de 24 horas laborables.", "ok"); form.reset(); })
          .catch(function () { setStatus("No se ha podido enviar. Escríbenos a " + CONFIG.email + " y lo resolvemos.", "err"); })
          .then(function () { button.disabled = false; });
      } else {
        var body = [
          "Nombre: " + data.nombre, "Email: " + data.email, "Empresa: " + data.empresa + " (" + data.sector + ")",
          "Teléfono: " + (data.telefono || "-"), "", data.mensaje, "",
          "He leído la política de privacidad y acepto el tratamiento de mis datos para responder a esta solicitud."
        ].join("\n");
        setStatus("Hemos preparado el correo con tu solicitud. Envíalo desde tu programa de correo. Si no se abre, escríbenos a " + CONFIG.email + ".", "ok");
        location.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent((form.getAttribute("data-subject") || "Solicitud") + ": " + data.empresa) + "&body=" + encodeURIComponent(body);
      }
    });
  });
})();
