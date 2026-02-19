/* =========================================================
   PL DIGITAL GROUP — INSTITUCIONAL PREMIUM JS
   - Menu ativo (cara de site)
   - Drawer mobile
   - Reveal suave
   - WhatsApp CTA global
   - Questionário de serviços => monta mensagem e envia WhatsApp
   ========================================================= */

const SITE = {
  brand: "PL Digital Group",
  email: "PLdigitalG@gmail.com",
  phoneLabel: "(31) 99883-2407",
  whatsapp: "5531998832407",
  city: "Belo Horizonte • MG",
  hours: "Seg–Sex • 08:00–18:00"
};

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

function waLink(message){
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${SITE.whatsapp}?text=${text}`;
}

function setActiveMenu(){
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$('[data-page]').forEach(a=>{
    const p = (a.getAttribute("href") || "").toLowerCase();
    a.classList.toggle("active", p.endsWith(path));
  });
}

function revealOnView(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){
        ent.target.classList.add("in");
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el=>io.observe(el));
}

function initGlobal(){
  // Preenche topo/rodapé (se existirem)
  const email = $("#siteEmail"); if(email) email.textContent = SITE.email;
  const city = $("#siteCity"); if(city) city.textContent = `${SITE.city} • ${SITE.hours}`;

  const year = $("#year"); if(year) year.textContent = new Date().getFullYear();

  // Menu ativo
  setActiveMenu();

  // Drawer
  const drawer = $("#drawer");
  $("#btnMenu")?.addEventListener("click", ()=> drawer?.classList.add("open"));
  $("#btnClose")?.addEventListener("click", ()=> drawer?.classList.remove("open"));
  drawer?.addEventListener("click", (e)=>{ if(e.target === drawer) drawer.classList.remove("open"); });

  // WhatsApp botões
  const msgDefault = "Olá! Quero um orçamento para organizar meu digital (Instagram + tráfego + site).";
  $$("[data-wa]").forEach(el=>{
    const custom = el.getAttribute("data-wa");
    const msg = (custom && custom !== "1") ? custom : msgDefault;
    el.setAttribute("href", waLink(msg));
    el.setAttribute("target","_blank");
    el.setAttribute("rel","noopener");
  });

  revealOnView();
}

function initContactForm(){
  const form = $("#contactForm");
  if(!form) return;

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = $("#fName")?.value.trim() || "-";
    const phone = $("#fPhone")?.value.trim() || "-";
    const goal = $("#fGoal")?.value.trim() || "-";
    const msg = $("#fMsg")?.value.trim() || "-";

    const composed =
`Olá! Quero um orçamento.
Nome: ${name}
WhatsApp: ${phone}
Objetivo: ${goal}
Mensagem: ${msg}`;

    window.open(waLink(composed), "_blank", "noopener");
  });
}

function initQuiz(){
  const quiz = $("#serviceQuiz");
  if(!quiz) return;

  quiz.addEventListener("submit", (e)=>{
    e.preventDefault();

    const name = $("#qName")?.value.trim() || "-";
    const phone = $("#qPhone")?.value.trim() || "-";
    const city = $("#qCity")?.value.trim() || "Belo Horizonte";

    const objective = ($$('input[name="objective"]:checked')[0]?.value) || "-";
    const urgency = ($$('input[name="urgency"]:checked')[0]?.value) || "-";

    const services = $$('input[name="services"]:checked').map(i=>i.value);
    const budget = $("#qBudget")?.value || "-";

    const extra = $("#qExtra")?.value.trim() || "-";

    const composed =
`Olá! Fiz o questionário no site e quero um orçamento.
Nome: ${name}
WhatsApp: ${phone}
Cidade: ${city}

Objetivo principal: ${objective}
Urgência: ${urgency}
Serviços de interesse: ${services.length ? services.join(", ") : "-"}
Faixa de investimento: ${budget}

Detalhes: ${extra}`;

    window.open(waLink(composed), "_blank", "noopener");
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  initGlobal();
  initContactForm();
  initQuiz();
});
