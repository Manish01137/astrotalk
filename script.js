// Basic interactions for the Astro Talk demo site
document.addEventListener('DOMContentLoaded', () => {
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
  
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        const href = a.getAttribute('href');
        if(href.length > 1){
          e.preventDefault();
          const el = document.querySelector(href);
          if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
        }
      });
    });
  
    // CTA handlers
    document.getElementById('ctaDemo').addEventListener('click', ()=> {
      document.getElementById('contact').scrollIntoView({behavior:'smooth'});
    });
    document.getElementById('learnBtn').addEventListener('click', ()=> {
      document.getElementById('features').scrollIntoView({behavior:'smooth'});
    });
  
    // Contact form basic validation & demo submit
    const form = document.getElementById('contactForm');
    const statusEl = document.getElementById('formStatus');
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      statusEl.textContent = '';
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
  
      if(!name || !email || !message){
        statusEl.textContent = 'Please fill in all fields.';
        return;
      }
      if(!validateEmail(email)){
        statusEl.textContent = 'Please enter a valid email address.';
        return;
      }
  
      // Demo behaviour: show 'sent' message and reset
      statusEl.textContent = 'Sending message...';
      setTimeout(() => {
        statusEl.textContent = 'Thank you — your message has been sent (demo).';
        form.reset();
      }, 700);
    });
  
    function validateEmail(email){
      // simple email regex (demo)
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  });