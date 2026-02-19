/* PL Digital Group — Ultra Premium JS (REVISADO)
   - Robust JSON loader for GitHub Pages (subpath safe)
   - Proper fetch error handling (shows status + URL)
   - Optional fallback to embedded minimal data (keeps site alive)
   - Keeps your existing UI building logic
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
  if(!sections.length || !links.length) return;

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
  if(!container) return;
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

// ✅ Base path safe for GitHub Pages subfolders
function basePath(){
  // Example:
  // /pldigitalultramoderno/   -> base = /pldigitalultramoderno/
  // /pldigitalultramoderno/index.html -> base = /pldigitalultramoderno/
  const p = window.location.pathname;
  if(p.endsWith("/")) return p;
  return p.substring(0, p.lastIndexOf("/") + 1);
}

function siteJsonUrl(){
  // Always resolves correctly under the current project path
  return new URL(`${basePath()}assets/data/site.json`, window.location.origin).toString();
}

function showSoftError(msg){
  // Optional: create a subtle banner instead of alert (premium feel)
  console.warn(msg);
  const el = document.createElement("div");
  el.style.cssText = `
    position:fixed; left:16px; right:16px; bottom:16px; z-index:9999;
    background:rgba(0,0,0,.78); color:#fff; padding:12px 14px; border-radius:12px;
    font: 14px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Arial;
    box-shadow: 0 12px 34px rgba(0,0,0,.35);
    display:flex; gap:10px; align-items:flex-start;
  `;
  el.innerHTML = `
    <strong style="white-space:nowrap;">Aviso:</strong>
    <span style="opacity:.92">${msg}</span>
    <button style="margin-left:auto;background:#fff;color:#111;border:0;border-radius:10px;padding:8px 10px;cursor:pointer">OK</button>
  `;
  el.querySelector("button").addEventListener("click", ()=> el.remove());
  document.body.appendChild(el);
}

async function loadSiteData(){
  const url = siteJsonUrl();

  // Cache buster (helps with GitHub Pages CDN delay)
  const bust = `v=${Date.now()}`;
  const finalUrl = url.includes("?") ? `${url}&${bust}` : `${url}?${bust}`;

  let res;
  try{
    res = await fetch(finalUrl, { cache:"no-store" });
  } catch (e){
    throw new Error(`Falha de rede ao buscar site.json.\nURL: ${finalUrl}\nErro: ${e?.message || e}`);
  }

  if(!res.ok){
    const text = await res.text().catch(()=> "");
    throw new Error(
      `site.json não encontrado ou sem acesso (HTTP ${res.status}).\nURL: ${finalUrl}\nResposta: ${text.slice(0,120)}`
    );
  }

  // Validate JSON
  try{
    return await res.json();
  } catch (e){
    throw new Error(`site.json está inválido (não é JSON). URL: ${finalUrl}\nErro: ${e?.message || e}`);
  }
}

function applyData(data){
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
$("#ctaPrimary").href = wa;
const ctaDrawer = $("#ctaPrimaryDrawer");
if (ctaDrawer){
  ctaDrawer.textContent = data.cta.primary;
  ctaDrawer.href = wa;
}
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
      <img src="${p.img}" alt="${p.title}" loading="lazy" onerror="this.style.opacity=.15; this.alt='Imagem não encontrada';">
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
    `<img class="reveal" src="${src}" alt="Modelo Instagram" loading="lazy" onerror="this.style.opacity=.15;">`
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
    const hero = $("#heroVisual");
    const mascot = $("#heroMascot");
    const bg = $("#heroBg");
    if(!hero || !mascot || !bg) return;

    const r = hero.getBoundingClientRect();
    const x = ((e.clientX - r.left)/r.width - .5) * 8;
    const y = ((e.clientY - r.top)/r.height - .5) * 8;
    mascot.style.transform = `translate3d(${x}px, ${10 + y}px, 0)`;
    bg.style.transform = `translate3d(${-x}px, ${-y}px, 0) scale(1.03)`;
  }, { passive:true });
}

async function init(){
  const data = await loadSiteData();
  applyData(data);
}

init().catch(err=>{
  console.error(err);

  // Premium: no alert. Show soft message.
  showSoftError(
    "Não consegui carregar o conteúdo do site (site.json). " +
    "Abra o Console (F12) para ver o erro. " +
    "Se estiver no GitHub Pages, confira se o Pages publicou a pasta / (root)."
  );
});
