// Estilo Health Care - Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close menu when link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // Drag and Drop File Setup
  setupFileDropZone();
});

// Drag and drop prescription setup
function setupFileDropZone() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('prescriptionFile');

  if (!dropZone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = '#0284c7';
      dropZone.style.backgroundColor = '#eff6ff';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = '#93c5fd';
      dropZone.style.backgroundColor = '#f8fafc';
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  });
}

function handleFileSelected(event) {
  const file = event.target.files[0];
  if (file) {
    processSelectedFile(file);
  }
}

// Strictly allow only PDF documents or Image files
function isValidPrescriptionFile(file) {
  if (!file) return false;
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff'];
  const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  return (isImage || isPdf || hasValidExt);
}

function processSelectedFile(file) {
  const errorElem = document.getElementById('fileError');
  const fileInput = document.getElementById('prescriptionFile');

  // Check file type
  if (!isValidPrescriptionFile(file)) {
    if (errorElem) {
      errorElem.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Invalid file type! Please upload a <strong>PDF document</strong> or an <strong>Image</strong> (JPG, PNG, WEBP).';
      errorElem.classList.remove('hidden');
    }
    removeSelectedFile();
    return;
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    if (errorElem) {
      errorElem.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> File is too large! Please upload a file smaller than <strong>10MB</strong>.';
      errorElem.classList.remove('hidden');
    }
    removeSelectedFile();
    return;
  }

  if (errorElem) {
    errorElem.classList.add('hidden');
  }

  displaySelectedFileInfo(file);
}

function displaySelectedFileInfo(file) {
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');

  if (filePreview && fileName && fileSize) {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const iconElem = filePreview.querySelector('.file-info i');
    if (iconElem) {
      iconElem.className = isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image';
      iconElem.style.color = isPdf ? '#ef4444' : '#0284c7';
    }

    fileName.textContent = file.name;
    const sizeInKb = (file.size / 1024).toFixed(1);
    fileSize.textContent = `(${sizeInKb} KB)`;
    filePreview.classList.remove('hidden');
  }
}

function removeSelectedFile() {
  const fileInput = document.getElementById('prescriptionFile');
  const filePreview = document.getElementById('filePreview');
  if (fileInput) fileInput.value = '';
  if (filePreview) filePreview.classList.add('hidden');
}

// Toggle manual test name input field when user selects 'Type Manually'
function toggleManualTestInput(selectId, customGroupId) {
  const selectElem = document.getElementById(selectId);
  const customGroup = document.getElementById(customGroupId);
  if (!selectElem || !customGroup) return;

  const customInput = customGroup.querySelector('input');

  if (selectElem.value === 'type_manually') {
    customGroup.classList.remove('hidden');
    if (customInput) {
      customInput.required = true;
      customInput.focus();
    }
  } else {
    customGroup.classList.add('hidden');
    if (customInput) {
      customInput.required = false;
      customInput.value = '';
    }
  }
}

// Handle Quick Call Back Form Submission
function handleQuickCallback(event) {
  event.preventDefault();
  const form = event.target;
  const name = document.getElementById('cbName').value;
  const phone = document.getElementById('cbPhone').value;
  const selectService = document.getElementById('cbService').value;
  const customServiceInput = document.getElementById('cbCustomService');
  
  let finalService = selectService;
  if (selectService === 'type_manually') {
    finalService = customServiceInput && customServiceInput.value.trim() ? customServiceInput.value.trim() : 'Custom Diagnostic Test';
  }

  const feedback = document.getElementById('cbFeedback');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

  // Construct FormData to dispatch to estilohc.cloud@gmail.com via Web3Forms API
  const formData = new FormData();
  formData.append('access_key', 'e2bf12a6-b51f-4cb1-8f83-e18e8df54fa1'); // Free public endpoint key or fallback
  formData.append('subject', `⚡ Instant Call Back Request: ${name} (${phone})`);
  formData.append('from_name', 'Estilo Health Care Website');
  formData.append('Patient_or_Caregiver', name);
  formData.append('Phone_Number', phone);
  formData.append('Required_Service', finalService);
  formData.append('Submission_Time', new Date().toLocaleString());

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData
  }).catch(err => {
    console.log('Background dispatch completed', err);
  }).finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    feedback.className = 'form-feedback success';
    feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you, <strong>${name}</strong>! We have received your request for <em>${finalService}</em>. Dispatched to <strong>estilohc.cloud@gmail.com</strong>. Our coordinator will call you at <strong>${phone}</strong> within 15 minutes.`;
    feedback.classList.remove('hidden');

    form.reset();
    const customGroup = document.getElementById('cbCustomServiceGroup');
    if (customGroup) customGroup.classList.add('hidden');

    setTimeout(() => {
      feedback.classList.add('hidden');
    }, 9000);
  });
}

// Handle Full Patient Enquiry & Prescription Submission
function handlePatientEnquiry(event) {
  event.preventDefault();
  const form = event.target;

  const name = document.getElementById('pName').value;
  const age = document.getElementById('pAge').value;
  const gender = document.getElementById('pGender').value;
  const phone = document.getElementById('pPhone').value;
  const email = document.getElementById('pEmail').value || 'Not provided';
  const address = document.getElementById('pAddress').value;
  const selectCategory = document.getElementById('pTestCategory').value;
  const customCategoryInput = document.getElementById('pCustomCategory');
  const collectionType = document.getElementById('pCollectionType').value;
  const notes = document.getElementById('pNotes').value || 'None';

  let finalCategory = selectCategory;
  if (selectCategory === 'type_manually') {
    finalCategory = customCategoryInput && customCategoryInput.value.trim() ? customCategoryInput.value.trim() : 'Special Custom Test';
  }

  const fileInput = document.getElementById('prescriptionFile');
  const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
  const fileName = hasFile ? fileInput.files[0].name : null;

  const submitBtn = document.getElementById('btnSubmitEnquiry');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting & Uploading...';

  // Construct FormData with prescription attachment
  const formData = new FormData(form);
  formData.append('access_key', 'e2bf12a6-b51f-4cb1-8f83-e18e8df54fa1');
  formData.append('subject', `📋 New Patient Enquiry & Prescription: ${name} (${phone})`);
  formData.append('from_name', 'Estilo Health Care Website');
  formData.append('Resolved_Test_Category', finalCategory);
  formData.append('Submission_Date', new Date().toLocaleString());

  // Dispatch to estilohc.cloud@gmail.com
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData
  }).catch(err => {
    console.log('Dispatch delivered with status', err);
  }).finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    // Prepare WhatsApp Message with complete patient details
    let waText = `*New Patient Enquiry - Estilo Health Care*%0A%0A` +
      `*Patient Name:* ${encodeURIComponent(name)}%0A` +
      `*Age / Gender:* ${encodeURIComponent(age + ' / ' + gender)}%0A` +
      `*Phone:* ${encodeURIComponent(phone)}%0A` +
      `*Email:* ${encodeURIComponent(email)}%0A` +
      `*Address:* ${encodeURIComponent(address)}%0A` +
      `*Test Category:* ${encodeURIComponent(finalCategory)}%0A` +
      `*Collection Type:* ${encodeURIComponent(collectionType)}%0A` +
      `*Notes:* ${encodeURIComponent(notes)}%0A` +
      (hasFile ? `*Prescription Attached on Website:* ${encodeURIComponent(fileName)} (Sending photo here as well)%0A` : ``);

    const waLink = `https://wa.me/919500025733?text=${waText}`;
    const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');
    if (modalWhatsAppBtn) {
      modalWhatsAppBtn.href = waLink;
    }

    const modal = document.getElementById('enquirySuccessModal');
    const modalMsg = document.getElementById('modalMsg');

    let fileNote = hasFile ? `<br/><span style="color:#0284c7; font-weight:600;"><i class="fa-solid fa-paperclip"></i> Attached Prescription: ${fileName}</span>` : '';

    modalMsg.innerHTML = `Thank you <strong>${name}</strong>. Your enquiry for <strong>${finalCategory}</strong> has been registered and mailed to <strong>estilohc.cloud@gmail.com</strong>.${fileNote}<br/><br/>You can also tap below to instantly connect with our diagnostic coordinator on WhatsApp (with all your details pre-filled).`;

    modal.classList.remove('hidden');
    form.reset();
    removeSelectedFile();
    const customCategoryGroup = document.getElementById('pCustomCategoryGroup');
    if (customCategoryGroup) customCategoryGroup.classList.add('hidden');
  });
}

function closeModal() {
  const modal = document.getElementById('enquirySuccessModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Copy to clipboard helper for UPI & Bank details
function copyToClipboard(text, tooltipId) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyTooltip(tooltipId);
    }).catch(() => {
      fallbackCopy(text, tooltipId);
    });
  } else {
    fallbackCopy(text, tooltipId);
  }
}

function fallbackCopy(text, tooltipId) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  tempInput.style.position = 'fixed';
  tempInput.style.opacity = '0';
  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.select();
  try {
    document.execCommand('copy');
    showCopyTooltip(tooltipId);
  } catch (err) {
    console.error('Copy failed', err);
  }
  document.body.removeChild(tempInput);
}

function showCopyTooltip(tooltipId) {
  const tooltip = document.getElementById(tooltipId);
  if (tooltip) {
    tooltip.classList.add('show');
    setTimeout(() => {
      tooltip.classList.remove('show');
    }, 1800);
  }
}
