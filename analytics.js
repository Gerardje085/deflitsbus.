let lastPath = null;
function sendVirtual(path, title) {
  if (path === lastPath) return;
  lastPath = path;
  if (window.gtag) {
    gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.origin + path
    });
  }
}

function replacePath(path) {
  if (window.location.hash) return;
  history.replaceState({}, '', path);
}

document.querySelectorAll('nav a[data-path]').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const path = a.dataset.path || '/';
    const id = path === '/' ? 'home' : path.replace('/','');
    const sec = document.getElementById(id);
    if (sec) sec.scrollIntoView({behavior:'smooth'});
    sendVirtual(path, a.textContent.trim());
    replacePath(path);
  });
});

const obs = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      const id = en.target.id;
      const path = id === 'home' ? '/' : '/' + id;
      sendVirtual(path, id.charAt(0).toUpperCase()+id.slice(1));
    }
  });
},{ threshold: 0.5 });

document.querySelectorAll('section[id]').forEach(s=>obs.observe(s));
