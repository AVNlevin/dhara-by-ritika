import './style.css'; // Import style.css for Vite asset bundling and live reloads

document.addEventListener('DOMContentLoaded', () => {
  const gateScreen = document.getElementById('admin-gate');
  const dashboard = document.getElementById('admin-dashboard');
  
  const gateForm = document.getElementById('gate-form');
  const passcodeField = document.getElementById('passcode');
  const gateStatus = document.getElementById('gate-status');
  
  const btnLogout = document.getElementById('btn-logout');

  // Verify stored session login state
  if (sessionStorage.getItem('dhara_admin_logged_in') === 'true') {
    showDashboard();
  }

  // Passcode verification logic
  gateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = passcodeField.value;
    
    if (entered === 'admin123') {
      sessionStorage.setItem('dhara_admin_logged_in', 'true');
      gateStatus.className = 'gate-status success';
      gateStatus.textContent = 'Verification successful. Welcome to Dhara atelier...';
      
      setTimeout(() => {
        showDashboard();
      }, 1000);
    } else {
      gateStatus.className = 'gate-status error';
      gateStatus.textContent = 'Incorrect passcode. Access denied.';
      passcodeField.value = '';
      passcodeField.focus();
    }
  });

  // Lock panel logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('dhara_admin_logged_in');
      hideDashboard();
    });
  }

  function showDashboard() {
    gateScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    initDashboard();
  }

  function hideDashboard() {
    dashboard.classList.add('hidden');
    gateScreen.classList.remove('hidden');
    passcodeField.value = '';
    passcodeField.focus();
  }
});

// Dashboard interactions
function initDashboard() {
  const dragDropZone = document.getElementById('drag-drop-zone');
  const imageInput = document.getElementById('image-input');
  const preview = document.getElementById('upload-preview');
  const dropContent = document.getElementById('drag-drop-content');
  
  const uploadForm = document.getElementById('upload-form');
  const designTitle = document.getElementById('design-title');
  const designCategory = document.getElementById('design-category');
  const designDesc = document.getElementById('design-desc');
  const uploadStatus = document.getElementById('upload-status');
  
  const designList = document.getElementById('design-list');

  let base64Image = '';

  // Setup drag and drop events
  if (dragDropZone && imageInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dragDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dragDropZone.classList.add('highlight');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dragDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dragDropZone.classList.remove('highlight');
      }, false);
    });

    dragDropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length) {
        handleImageFile(files[0]);
      }
    }, false);

    dragDropZone.addEventListener('click', (e) => {
      // Fire browse trigger unless clicking input/preview directly
      if (e.target !== imageInput && !preview.contains(e.target)) {
        imageInput.click();
      }
    });

    imageInput.addEventListener('change', () => {
      if (imageInput.files.length) {
        handleImageFile(imageInput.files[0]);
      }
    });
  }

  // Handle uploaded file mapping to base64
  function handleImageFile(file) {
    if (!file.type.match('image.*')) {
      alert('Please upload a valid image file (PNG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      base64Image = e.target.result;
      preview.src = base64Image;
      preview.classList.remove('hidden');
      dropContent.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  // Render designs list inside dashboard manager
  function renderUploadedDesigns() {
    designList.innerHTML = '';
    const saved = localStorage.getItem('dhara_custom_portfolio');
    let items = [];

    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    if (!items.length) {
      designList.innerHTML = `
        <div class="empty-list-state">
          <p>No custom designs uploaded yet. Use the form on the left to add your first creation!</p>
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'dashboard-item';
      card.innerHTML = `
        <div class="item-thumb-wrapper">
          <img src="${item.image}" alt="${item.title}" class="item-thumb">
        </div>
        <div class="item-details">
          <h3>${item.title}</h3>
          <span class="item-badge">${item.tag}</span>
          <p class="item-desc-clip">${item.description}</p>
        </div>
        <button class="btn btn-delete" data-id="${item.id}">Delete</button>
      `;

      card.querySelector('.btn-delete').addEventListener('click', () => {
        deleteDesign(item.id);
      });

      designList.appendChild(card);
    });
  }

  function deleteDesign(id) {
    if (confirm('Are you sure you want to delete this design? It will immediately disappear from your live portfolio.')) {
      const saved = localStorage.getItem('dhara_custom_portfolio');
      if (!saved) return;

      try {
        let items = JSON.parse(saved);
        items = items.filter(item => item.id !== id);
        localStorage.setItem('dhara_custom_portfolio', JSON.stringify(items));
        renderUploadedDesigns();
      } catch (e) {
        console.error(e);
      }
    }
  }

  // Form submit publication
  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!base64Image) {
      uploadStatus.className = 'upload-status error';
      uploadStatus.textContent = 'Please choose or drag an image first.';
      return;
    }

    const title = designTitle.value.trim();
    const category = designCategory.value;
    const tag = category === 'bridal' ? 'Bridal Couture' : 'Evening Wear';
    const description = designDesc.value.trim();

    const newDesign = {
      id: `design_${Date.now()}`,
      title,
      category,
      tag,
      description,
      image: base64Image
    };

    const saved = localStorage.getItem('dhara_custom_portfolio');
    let items = [];
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    items.unshift(newDesign);
    localStorage.setItem('dhara_custom_portfolio', JSON.stringify(items));

    // Reset Form
    uploadForm.reset();
    base64Image = '';
    preview.src = '';
    preview.classList.add('hidden');
    dropContent.classList.remove('hidden');

    uploadStatus.className = 'upload-status success';
    uploadStatus.textContent = '✨ Design published successfully! Check the homepage to view it.';
    
    renderUploadedDesigns();

    setTimeout(() => {
      uploadStatus.textContent = '';
    }, 4500);
  });

  // Render received client inquiries/messages
  const inquiryList = document.getElementById('inquiry-list');

  function renderInquiries() {
    if (!inquiryList) return;
    inquiryList.innerHTML = '';
    
    const saved = localStorage.getItem('dhara_consultation_messages');
    let items = [];

    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    if (!items.length) {
      inquiryList.innerHTML = `
        <div class="empty-list-state" style="grid-column: 1 / -1; width: 100%;">
          <p>No client inquiries received yet. When users submit the contact form, their requests will appear here!</p>
        </div>
      `;
      return;
    }

    items.forEach(inquiry => {
      const card = document.createElement('div');
      card.className = 'inquiry-card';
      card.innerHTML = `
        <div class="inquiry-header">
          <div class="inquiry-client-info">
            <h3>${escapeHtml(inquiry.name)}</h3>
            <span class="inquiry-date">${escapeHtml(inquiry.date)}</span>
          </div>
        </div>
        <div class="inquiry-details">
          <p>✉️ <strong>Email:</strong> <a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></p>
          <p>📞 <strong>Phone:</strong> <a href="tel:${escapeHtml(inquiry.phone)}">${escapeHtml(inquiry.phone)}</a></p>
        </div>
        <div class="inquiry-message">${escapeHtml(inquiry.message)}</div>
        <div class="inquiry-actions">
          <button class="btn btn-delete" data-id="${inquiry.id}">Archive Message</button>
        </div>
      `;

      card.querySelector('.btn-delete').addEventListener('click', () => {
        deleteInquiry(inquiry.id);
      });

      inquiryList.appendChild(card);
    });
  }

  function deleteInquiry(id) {
    if (confirm('Are you sure you want to archive and delete this inquiry? This cannot be undone.')) {
      const saved = localStorage.getItem('dhara_consultation_messages');
      if (!saved) return;

      try {
        let items = JSON.parse(saved);
        items = items.filter(item => item.id !== id);
        localStorage.setItem('dhara_consultation_messages', JSON.stringify(items));
        renderInquiries();
      } catch (e) {
        console.error(e);
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  renderUploadedDesigns();
  renderInquiries();
}
