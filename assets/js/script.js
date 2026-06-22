'use strict';

/* ==========================================================
   THEME TOGGLE — dark / light mode
   ========================================================== */

const themeToggleBtn = document.getElementById('themeToggle');
const html = document.documentElement;

// Apply saved theme on load (default: dark)
html.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');

themeToggleBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});


/* ==========================================================
   THEME TOGGLE — auto hide on scroll down, show on scroll up
   ========================================================== */

let lastScrollY = window.scrollY;
let scrollTicking = false;

const handleThemeToggleVisibility = () => {
  const currentScrollY = window.scrollY;
  const scrollingDown  = currentScrollY > lastScrollY;
  const pastThreshold  = currentScrollY > 80;

  if (scrollingDown && pastThreshold) {
    themeToggleBtn.classList.add('theme-toggle--hidden');
  } else {
    themeToggleBtn.classList.remove('theme-toggle--hidden');
  }

  lastScrollY = currentScrollY;
  scrollTicking = false;
};

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(handleThemeToggleVisibility);
    scrollTicking = true;
  }
});


/* ==========================================================
   UTILITY
   ========================================================== */

const elementToggleFunc = (elem) => elem.classList.toggle('active');


/* ==========================================================
   SIDEBAR TOGGLE
   ========================================================== */

const sidebar    = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');

sidebarBtn.addEventListener('click', () => elementToggleFunc(sidebar));


/* ==========================================================
   TESTIMONIALS MODAL
   ========================================================== */

const modalContainer = document.querySelector('[data-modal-container]');
const modalCloseBtn  = document.querySelector('[data-modal-close-btn]');
const overlay        = document.querySelector('[data-overlay]');
const modalImg       = document.querySelector('[data-modal-img]');
const modalTitle     = document.querySelector('[data-modal-title]');
const modalText      = document.querySelector('[data-modal-text]');
const modalDate      = document.querySelector('[data-modal-date]');

const toggleModal = () => {
  modalContainer.classList.toggle('active');
  overlay.classList.toggle('active');
};

// Catatan: testimonials sekarang dimuat dari Supabase (lihat blok SUPABASE
// di bagian bawah file ini), jadi binding klik dilakukan di sana setiap kali
// daftar testimonial baru selesai dirender — bukan di sini lagi.

modalCloseBtn.addEventListener('click', toggleModal);
overlay.addEventListener('click', toggleModal);


/* ==========================================================
   PORTFOLIO FILTER
   ========================================================== */

const select      = document.querySelector('[data-select]');
const selectItems = document.querySelectorAll('[data-select-item]');
const selectValue = document.querySelector('[data-selecct-value]');
const filterBtns  = document.querySelectorAll('[data-filter-btn]');
const filterItems = document.querySelectorAll('[data-filter-item]');

select.addEventListener('click', () => elementToggleFunc(select));

const filterFunc = (selectedValue) => {
  filterItems.forEach((item) => {
    const match = selectedValue === 'all' || selectedValue === item.dataset.category;
    item.classList.toggle('active', match);
  });
};

selectItems.forEach((item) => {
  item.addEventListener('click', () => {
    const val = item.innerText.toLowerCase();
    selectValue.innerText = item.innerText;
    elementToggleFunc(select);
    filterFunc(val);
  });
});

let lastClickedBtn = filterBtns[0];

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const val = btn.innerText.toLowerCase();
    selectValue.innerText = btn.innerText;
    filterFunc(val);
    lastClickedBtn.classList.remove('active');
    btn.classList.add('active');
    lastClickedBtn = btn;
  });
});


/* ==========================================================
   CONTACT FORM VALIDATION
   ========================================================== */

const form       = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn    = document.querySelector('[data-form-btn]');

formInputs.forEach((input) => {
  input.addEventListener('input', () => {
    formBtn.disabled = !form.checkValidity();
  });
});


/* ==========================================================
   PAGE NAVIGATION
   ========================================================== */

const navLinks = document.querySelectorAll('[data-nav-link]');
const pages    = document.querySelectorAll('[data-page]');

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const target = link.innerHTML.toLowerCase();
    pages.forEach((page, i) => {
      const isMatch = target === page.dataset.page;
      page.classList.toggle('active', isMatch);
      navLinks[i].classList.toggle('active', isMatch);
    });
    window.scrollTo(0, 0);
  });
});


/* ==========================================================
   SUPABASE — COMMENTS & TESTIMONIALS (data asli, bukan dummy)
   ==========================================================
   Membutuhkan assets/js/supabase-config.js yang sudah diisi
   dengan URL & anon key dari project Supabase kamu sendiri.
   Tanpa itu, bagian ini hanya menampilkan pesan error di
   console dan tidak merusak bagian lain dari website.
   ========================================================== */

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

// Avatar generik (SVG inline) dipakai kalau orang tidak upload foto
// sendiri saat mengisi comment / testimonial.
const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">' +
  '<rect width="60" height="60" rx="14" fill="#2c2c2c"/>' +
  '<circle cx="30" cy="23" r="11" fill="#3ddc97"/>' +
  '<path d="M10 52c2-13 12-19 20-19s18 6 20 19" fill="#3ddc97"/>' +
  '</svg>'
);

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

if (typeof sb !== 'undefined' && sb) {

  // Tampilkan preview foto langsung di form saat user pilih file
  const setupAvatarPreview = (inputSelector, previewSelector) => {
    const input   = document.querySelector(inputSelector);
    const preview = document.querySelector(previewSelector);
    if (!input || !preview) return;

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) { preview.hidden = true; return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.hidden = false;
      };
      reader.readAsDataURL(file);
    });
  };

  setupAvatarPreview('[data-comment-avatar-input]', '[data-comment-avatar-preview]');
  setupAvatarPreview('[data-testimonial-avatar-input]', '[data-testimonial-avatar-preview]');

  // Upload foto ke Supabase Storage (bucket "avatars"), balikin URL publiknya.
  // return null = tidak ada foto dipilih (lanjut tanpa foto)
  // return undefined = upload gagal / file kebesaran (batalkan submit)
  const uploadAvatar = async (file) => {
    if (!file) return null;

    if (file.size > MAX_AVATAR_SIZE) {
      alert('Ukuran foto maksimal 2MB ya.');
      return undefined;
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const randomId = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const fileName = `${randomId}.${ext}`;

    const { error: uploadError } = await sb.storage.from('avatars').upload(fileName, file);
    if (uploadError) {
      console.error('Gagal upload foto:', uploadError);
      alert('Foto gagal diupload. Pastikan bucket "avatars" sudah dibuat di Supabase Storage, atau coba kirim tanpa foto.');
      return undefined;
    }

    const { data } = sb.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  };

  /* ---------- SEND MESSAGE (halaman Contact) ---------- */
  
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullname = form.fullname.value;
    const email = form.email.value;
    const message = form.message.value;

    const { error } = await sb
      .from("contacts")
      .insert([
        {
          fullname,
          email,
          message,
        },
      ]);

    if (error) {
      alert("Failed to send message!");
      console.error(error);
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Message Sent!",
      text: "Thank you for contacting me.",
      confirmButtonColor: "#22c55e"
    });

    form.reset();
  });


  /* ---------- COMMENTS (halaman Contact) ---------- */

  const commentForm  = document.querySelector('[data-comment-form]');
  const commentList  = document.querySelector('[data-comment-list]');
  const commentBtn   = document.querySelector('[data-comment-btn]');
  const commentAvatarInput = document.querySelector('[data-comment-avatar-input]');

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderComment = (row) => {
    const li = document.createElement('li');
    li.className = 'comment-item';
    li.innerHTML = `
      <div class="comment-card">
        <div class="comment-head">
          <figure class="comment-avatar">
            <img src="${row.avatar_url || DEFAULT_AVATAR}" alt="${escapeHtml(row.name)}" width="36" height="36">
          </figure>
          <div class="comment-meta">
            <span class="comment-name">${escapeHtml(row.name)}</span>
            <time class="comment-date">${formatDate(row.created_at)}</time>
          </div>
        </div>
        <p class="comment-text">${escapeHtml(row.message)}</p>
      </div>
    `;
    return li;
  };

  const loadComments = async () => {
    if (!commentList) return;
    const { data, error } = await sb
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Gagal memuat komentar:', error);
      commentList.innerHTML = '<li class="comments-empty">Komentar belum bisa dimuat. Cek konfigurasi Supabase di assets/js/supabase-config.js.</li>';
      return;
    }

    commentList.innerHTML = '';
    if (!data || data.length === 0) {
      commentList.innerHTML = '<li class="comments-empty">No comments yet. Be the first to comment!</li>';
      return;
    }
    data.forEach((row) => commentList.appendChild(renderComment(row)));
  };

  loadComments();

  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = commentForm.querySelector('[name="commentName"]').value.trim();
      const message = commentForm.querySelector('[name="commentMessage"]').value.trim();
      if (!name || !message) return;

      commentBtn.disabled = true;

      const file = commentAvatarInput && commentAvatarInput.files[0];
      const avatarUrl = await uploadAvatar(file);
      if (avatarUrl === undefined) { commentBtn.disabled = false; return; }

      const { error } = await sb.from('comments').insert({ name, message, avatar_url: avatarUrl });
      commentBtn.disabled = false;

      if (error) {
        console.error('Failed to send comment:', error);
        alert('Failed to send comment, please try again later.');
        return;
      }
      commentForm.reset();
      const preview = document.querySelector('[data-comment-avatar-preview]');
      if (preview) preview.hidden = true;
      loadComments();
    });
  }


  /* ---------- TESTIMONIALS (halaman About) ---------- */

  const testimonialsList  = document.querySelector('[data-testimonials-list]');
  const testimonialsEmpty = document.querySelector('[data-testimonials-empty]');
  const testimonialForm   = document.querySelector('[data-testimonial-form]');
  const testimonialBtn    = document.querySelector('[data-testimonial-btn]');
  const testimonialAvatarInput = document.querySelector('[data-testimonial-avatar-input]');

  const renderTestimonial = (row) => {
    const li = document.createElement('li');
    li.className = 'testimonials-item';
    li.innerHTML = `
      <div class="content-card" data-testimonials-item data-date="${row.created_at}">
        <figure class="testimonials-avatar-box">
          <img src="${row.avatar_url || DEFAULT_AVATAR}" alt="${escapeHtml(row.name)}" width="60" data-testimonials-avatar>
        </figure>
        <h4 class="h4 testimonials-item-title" data-testimonials-title>${escapeHtml(row.name)}</h4>
        <div class="testimonials-text" data-testimonials-text>
          <p>${escapeHtml(row.message)}</p>
        </div>
      </div>
    `;
    return li;
  };

  const bindTestimonialClicks = () => {
    document.querySelectorAll('[data-testimonials-item]').forEach((item) => {
      item.addEventListener('click', () => {
        modalImg.src         = item.querySelector('[data-testimonials-avatar]').src;
        modalImg.alt         = item.querySelector('[data-testimonials-avatar]').alt;
        modalTitle.innerHTML = item.querySelector('[data-testimonials-title]').innerHTML;
        modalText.innerHTML  = `<p>${item.querySelector('[data-testimonials-text]').innerHTML}</p>`;
        if (modalDate) {
          const isoDate = item.dataset.date;
          modalDate.setAttribute('datetime', isoDate);
          modalDate.textContent = formatDate(isoDate);
        }
        toggleModal();
      });
    });
  };

  const loadTestimonials = async () => {
    if (!testimonialsList) return;
    const { data, error } = await sb
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Gagal memuat testimonials:', error);
      testimonialsList.innerHTML = '<li class="testimonials-loading">Testimonials belum bisa dimuat. Cek konfigurasi Supabase di assets/js/supabase-config.js.</li>';
      return;
    }

    testimonialsList.innerHTML = '';
    if (!data || data.length === 0) {
      if (testimonialsEmpty) testimonialsEmpty.style.display = 'block';
      return;
    }
    if (testimonialsEmpty) testimonialsEmpty.style.display = 'none';
    data.forEach((row) => testimonialsList.appendChild(renderTestimonial(row)));
    bindTestimonialClicks();
  };

  loadTestimonials();

  if (testimonialForm) {
    testimonialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = testimonialForm.querySelector('[name="testimonialName"]').value.trim();
      const message = testimonialForm.querySelector('[name="testimonialMessage"]').value.trim();
      if (!name || !message) return;

      testimonialBtn.disabled = true;

      const file = testimonialAvatarInput && testimonialAvatarInput.files[0];
      const avatarUrl = await uploadAvatar(file);
      if (avatarUrl === undefined) { testimonialBtn.disabled = false; return; }

      const { error } = await sb.from('testimonials').insert({ name, message, avatar_url: avatarUrl, approved: false });
      testimonialBtn.disabled = false;

      if (error) {
        console.error('Gagal mengirim testimonial:', error);
        alert('Testimonial failed to send, please try again later.');
        return;
      }
      testimonialForm.reset();
      const preview = document.querySelector('[data-testimonial-avatar-preview]');
      if (preview) preview.hidden = true;
      alert('Thank you! Your testimonial will be posted after it is approved by the admin.');
    });
  }

} else {
  console.warn('Supabase belum dikonfigurasi — isi assets/js/supabase-config.js supaya Comments & Testimonials aktif.');
}

/* ==========================================================
   CERTIFICATES — filter + detail modal
   ========================================================== */

(function () {

  /* ── data: sertifikat kamu ── */
  const CERTS = [
    {
      id: 'cert-1',
      cat: 'web',
      catLabel: 'Web Dev',
      title: 'Web Frontend level Beginner',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/03/00002',
      img: './assets/images/cert-1.jpeg',
      link: '#',
    },
    {
      id: 'cert-2',
      cat: 'web',
      catLabel: 'Web Dev',
      title: 'Laravel Filament Web Backend level Beginner',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/01/00002',
      img: './assets/images/cert-2.jpeg',
      link: '#',
    },
    {
      id: 'cert-3',
      cat: 'database',
      catLabel: 'Database',
      title: 'Database MySQL level Beginner',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/02/00001',
      img: './assets/images/cert-3.jpeg',
      link: '#',
    },
    {
      id: 'cert-4',
      cat: 'other',
      catLabel: 'Other',
      title: 'Fotografi dan Penguasaan Kamera level Beginner',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/12/00008',
      img: './assets/images/cert-4.jpg',
      link: '#',
    },
    {
      id: 'cert-5',
      cat: 'other',
      catLabel: 'Other',
      title: 'Mengoperasikan Microsoft Word',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/09/00010',
      img: './assets/images/cert-5.jpg',
      link: '#',
    },
    {
      id: 'cert-6',
      cat: 'other',
      catLabel: 'Other',
      title: 'Mengoperasikan Web Browser',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/07/00026',
      img: './assets/images/cert-6.jpg',
      link: '#',
    },
    {
      id: 'cert-7',
      cat: 'other',
      catLabel: 'Other',
      title: 'Mengoperasikan Windows level Beginner',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/06/00023',
      img: './assets/images/cert-7.jpg',
      link: '#',
    },
    {
      id: 'cert-8',
      cat: 'other',
      catLabel: 'Other',
      title: 'Produksi, Motion Grafis, dan Presentasi Karya level Beginner',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/13/00012',
      img: './assets/images/cert-8.jpg',
      link: '#',
    },
    {
      id: 'cert-9',
      cat: 'other',
      catLabel: 'Other',
      title: 'Perancangan dan Konsep Desain Visual level Beginner',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/11/00008',
      img: './assets/images/cert-9.jpg',
      link: '#',
    },
    {
      id: 'cert-10',
      cat: 'other',
      catLabel: 'Other',
      title: 'Pengelolaan pada Platform Scribd level Beginner',
      issuer: 'SMK Skill Village Islamic School',
      date: '13 December 2025',
      credentialId: 'SKILLAGE-2025/14/00008',
      img: './assets/images/cert-10.jpeg',
      link: '#',
    },
    {
      id: 'cert-11',
      cat: 'other',
      catLabel: 'Other',
      title: 'Hafalan juz 30',
      issuer: 'SMK Skill Village Islamic School',
      date: '18 August 2025',
      credentialId: '-',
      img: './assets/images/cert-11.jpg',
      link: '#',
    },
    {
      id: 'cert-12',
      cat: 'other',
      catLabel: 'Other',
      title: 'The Smartest Student',
      issuer: 'SMK Skill Village Islamic School',
      date: '18 August 2025',
      credentialId: '-',
      img: './assets/images/cert-12.jpeg',
      link: '#',
    },
  ];

  /* ── build cards ── */
  const grid    = document.querySelector('.cert-grid');
  const countEl = document.getElementById('certCount');

  if (!grid) return;

  grid.innerHTML = '';

  CERTS.forEach(c => {
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.dataset.certCat = c.cat;
    card.dataset.certId  = c.id;
    card.innerHTML = `
      <div class="cert-img-box">
        <img src="${c.img}" alt="${c.title}" loading="lazy">
        <div class="cert-overlay">
          <button class="cert-eye-btn" aria-label="View details">
            <ion-icon name="eye-outline"></ion-icon>
          </button>
        </div>
        <div class="cert-tag"><span>${c.catLabel}</span></div>
      </div>
      <div class="cert-info">
        <h3 class="cert-title">${c.title}</h3>
        <p class="cert-meta-row"><ion-icon name="business-outline"></ion-icon>${c.issuer}</p>
        <p class="cert-meta-row"><ion-icon name="calendar-outline"></ion-icon>${c.date}</p>
      </div>
    `;
    card.addEventListener('click', () => openCertModal(c));
    grid.appendChild(card);
  });

  if (countEl) countEl.innerHTML = `Showing <strong>${CERTS.length}</strong> certificates`;


  /* ── detail modal ── */
  const overlay = document.createElement('div');
  overlay.className = 'cert-modal-overlay';
  overlay.innerHTML = `
    <div class="cert-modal" id="certModal" role="dialog" aria-modal="true">
      <button class="cert-modal-close" id="certModalClose" aria-label="Close">
        <ion-icon name="close-outline"></ion-icon>
      </button>
      <img class="cert-modal-img" id="certModalImg" src="" alt="">
      <div class="cert-modal-body">
        <span class="cert-modal-tag" id="certModalTag"></span>
        <h2 class="cert-modal-title" id="certModalTitle"></h2>
        <div class="cert-modal-info">
          <div class="cert-modal-info-row">
            <ion-icon name="business-outline"></ion-icon>
            <span><strong>Issuer:</strong> <span id="certModalIssuer"></span></span>
          </div>
          <div class="cert-modal-info-row">
            <ion-icon name="calendar-outline"></ion-icon>
            <span><strong>Date:</strong> <span id="certModalDate"></span></span>
          </div>
          <div class="cert-modal-info-row">
            <ion-icon name="ribbon-outline"></ion-icon>
            <span><strong>Credential ID:</strong> <span id="certModalCred"></span></span>
          </div>
        </div>
        <p class="cert-modal-desc" id="certModalDesc"></p>
        <div class="cert-modal-actions">
          <button class="cert-modal-btn primary" id="certModalLink">
            <ion-icon name="open-outline"></ion-icon>
            View Certificate
          </button>
          <button class="cert-modal-btn secondary" id="certModalCloseBtn">
            <ion-icon name="close-outline"></ion-icon>
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ── image lightbox (full-size certificate photo) ── */
  const lightbox = document.createElement('div');
  lightbox.className = 'cert-lightbox-overlay';
  lightbox.innerHTML = `
    <button class="cert-lightbox-close" id="certLightboxClose" aria-label="Close">
      <ion-icon name="close-outline"></ion-icon>
    </button>
    <img class="cert-lightbox-img" id="certLightboxImg" src="" alt="">
  `;
  document.body.appendChild(lightbox);

  function openLightbox(src, alt) {
    document.getElementById('certLightboxImg').src = src;
    document.getElementById('certLightboxImg').alt = alt;
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
  }

  document.getElementById('certLightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox(); });

  function openCertModal(c) {
    document.getElementById('certModalImg').src      = c.img;
    document.getElementById('certModalImg').alt      = c.title;
    document.getElementById('certModalTag').textContent    = c.catLabel;
    document.getElementById('certModalTitle').textContent  = c.title;
    document.getElementById('certModalIssuer').textContent = c.issuer;
    document.getElementById('certModalDate').textContent   = c.date;
    document.getElementById('certModalCred').textContent   = c.credentialId;
    document.getElementById('certModalDesc').textContent   = c.desc;

    const linkBtn = document.getElementById('certModalLink');
    linkBtn.onclick = () => openLightbox(c.img, c.title);

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCertModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('certModalClose').addEventListener('click', closeCertModal);
  document.getElementById('certModalCloseBtn').addEventListener('click', closeCertModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCertModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCertModal(); });


  /* ── filter ── */
  const desktopBtns = document.querySelectorAll('[data-cert-filter]');
  const mobileBtns  = document.querySelectorAll('[data-cert-mobile]');
  const certSelect  = document.getElementById('certSelect');
  const certSelVal  = document.getElementById('certSelectValue');

  function applyFilter(cat, label) {
    desktopBtns.forEach(b => b.classList.toggle('active', b.dataset.certFilter === cat));
    if (certSelVal) certSelVal.textContent = label;

    let visible = 0;
    grid.querySelectorAll('.cert-card').forEach(card => {
      const match = cat === 'all' || card.dataset.certCat === cat;
      card.style.display = match ? '' : 'none';
      if (match) {
        card.style.animation = 'none';
        requestAnimationFrame(() => { card.style.animation = 'certFadeIn 0.35s ease both'; });
        visible++;
      }
    });

    if (countEl) countEl.innerHTML = `Showing <strong>${visible}</strong> certificate${visible !== 1 ? 's' : ''}`;
  }

  desktopBtns.forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.certFilter, b.textContent)));

  if (certSelect) {
    certSelect.addEventListener('click', () => certSelect.classList.toggle('active'));
  }

  mobileBtns.forEach(b => {
    b.addEventListener('click', () => {
      applyFilter(b.dataset.certMobile, b.textContent);
      if (certSelect) certSelect.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (certSelect && !certSelect.parentElement.contains(e.target)) {
      certSelect.classList.remove('active');
    }
  });

}());