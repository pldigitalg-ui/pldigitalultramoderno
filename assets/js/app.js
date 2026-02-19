/* PL Digital Group — Ultra Premium JS
   - Loads data from JSON
   - Builds nav/services/portfolio/instagram
   - Smooth active nav highlight
   - IntersectionObserver reveal animations
   - WhatsApp CTA builder (no number shown)
*/

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

function waLink(whatsDDI, message){
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${whatsDDI}?text=${text}`;
}

function setActiveNav(){
  const sections = $$("section[id]");
  const links = $$("[data-nav]");

  let current = sections[0]?.id || "";
  const y = window.scrollY + 140;

  for(const sec of sections){
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    if(y >= top && y < bottom){ current = sec.id; break; }
  }

  links.forEach(a=>{
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
}

function makeParticles(container, count=14){
  const wrap = document.createElement("div");
  wrap.className = "particles";
  for(let i=0;i<count;i++){
    const s = document.createElement("span");
    s.style.left = `${Math.random()*100}%`;
    s.style.animationDelay = `${Math.random()*8}s`;
    s.style.opacity = (0.25 + Math.random()*0.45).toFixed(2);
    s.style.transform = `translateY(${Math.random()*120}vh)`;
    wrap.appendChild(s);
  }
  container.appendChild(wrap);
}

async function init(){
  const data = await fetch("assets/data/site.json", { cache:"no-store" }).then(r=>r.json());

  // Header brand
  $("#brandName").textContent = data.brand;

  // Top strip
  $("#stripEmail").textContent = data.email;
  $("#stripCity").textContent = data.city;

  // Nav
  const nav = $("#nav");
  nav.innerHTML = data.nav.map(n=>(
    `<a data-nav href="${n.href}">${n.label}</a>`
  )).join("");

  // Drawer nav
  const dnav = $("#drawerNav");
  dnav.innerHTML = data.nav.map(n=>(
    `<a class="drawer-link" href="${n.href}">${n.label}</a>`
  )).join("");

  // CTAs
  $("#ctaPrimary").textContent = data.cta.primary;
  $("#ctaSecondary").textContent = data.cta.secondary;
  $("#ctaBudget").textContent = data.cta.budget;

  const wa = waLink(data.whatsapp.ddiPhone, data.whatsapp.defaultMessage);

  // CTA actions (no number shown)
  $("#ctaPrimary").href = wa;
  $("#ctaBudget").href = wa;
  $("#waFloat").href = wa;

  // Hero texts
  $("#heroTagline").textContent = data.tagline;
  $("#heroHeadline").innerHTML = `${data.headline} <span class="grad">Premium.</span>`;
  $("#heroSub").textContent = data.subheadline;

  // badges
  $("#badges").innerHTML = data.badges.map(b=>(
    `<span class="pill"><span class="spark"></span>${b}</span>`
  )).join("");

  // Hero imagery
  $("#heroBg").style.backgroundImage = `url("assets/img/hero.jpg")`;
  $("#heroMascot").src = "assets/img/mascot.png";
  $("#heroMascot").alt = data.brand;

  // Services
  $("#servicesGrid").innerHTML = data.services.map(s=>(
    `<article class="card reveal">
      <div class="inner">
        <div class="tag">${s.tag}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <span class="link">Saiba mais <span class="arrow"></span></span>
      </div>
    </article>`
  )).join("");

  // Portfolio
  $("#portfolioGrid").innerHTML = data.portfolio.map(p=>(
    `<div class="work reveal">
      <img src="${p.img}" alt="${p.title}" loading="lazy">
      <div class="cap">
        <strong>${p.title}</strong>
        <a href="${p.href}" target="_blank" rel="noopener">${p.label}</a>
      </div>
    </div>`
  )).join("");

  // Instagram
  $("#igTitle").textContent = data.instagram.title;
  $("#igDesc").textContent = data.instagram.desc;

  const igWrap = $("#igMosaic");
  igWrap.innerHTML = data.instagram.imgs.map(src => (
    `<img class="reveal" src="${src}" alt="Modelo Instagram" loading="lazy">`
  )).join("");

  // Contact
  $("#contactTitle").textContent = data.contact.title;
  $("#contactDesc").textContent = data.contact.desc;

  // Contact form → WhatsApp
  $("#contactForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = $("#fName").value.trim();
    const phone = $("#fPhone").value.trim();
    const msg = $("#fMsg").value.trim();

    const composed =
`Olá! Quero um orçamento.
Nome: ${name || "-"}
WhatsApp: ${phone || "-"}
Mensagem: ${msg || "-"}`;

    window.open(waLink(data.whatsapp.ddiPhone, composed), "_blank", "noopener");
  });

  // Secondary CTA
  $("#ctaSecondary").addEventListener("click", (e)=>{
    // allow href behavior default
  });

  // Footer
  $("#footerEmail").textContent = data.email;
  $("#footerCity").textContent = data.city;

  // Reveal animations
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){
        ent.target.classList.add("in");
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach(el=>io.observe(el));

  // Active nav on scroll
  window.addEventListener("scroll", setActiveNav, { passive:true });
  setActiveNav();

  // Drawer open/close
  const drawer = $("#drawer");
  $("#burger").addEventListener("click", ()=> drawer.classList.add("open"));
  $("#drawerClose").addEventListener("click", ()=> drawer.classList.remove("open"));
  drawer.addEventListener("click", (e)=>{ if(e.target === drawer) drawer.classList.remove("open"); });
  $$(".drawer-link").forEach(a=>a.addEventListener("click", ()=> drawer.classList.remove("open")));

  // Add subtle particles to hero
  makeParticles($("#heroVisual"), 16);

  // Parallax-ish on hero background
  window.addEventListener("mousemove", (e)=>{
    const r = $("#heroVisual").getBoundingClientRect();
    const x = ((e.clientX - r.left)/r.width - .5) * 8;
    const y = ((e.clientY - r.top)/r.height - .5) * 8;
    $("#heroMascot").style.transform = `translate3d(${x}px, ${10 + y}px, 0)`;
    $("#heroBg").style.transform = `translate3d(${-x}px, ${-y}px, 0) scale(1.03)`;
  }, { passive:true });
}

init().catch(err=>{
  console.error(err);
  alert("Erro carregando site.json. Confira o caminho: assets/data/site.json");
});

