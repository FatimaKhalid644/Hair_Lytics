window.onload = function () {

  const slides = [
    "images/slide2.png", // First hero
    "images/slide1.png"  // Last hero
  ];

  let index = 0;

  const heroImg  = document.getElementById("heroSlide");
  const caption  = document.getElementById("heroText1");
  const heroText = document.querySelector(".hero-text");

  function showSlide() {
    heroImg.style.opacity = 0;
    caption.style.display = "none";
    heroText.style.display = "none";

    setTimeout(() => {
      heroImg.src = slides[index];
      heroImg.style.opacity = 1;

      if (index === 0) caption.style.display = "block";
      if (index === 1) heroText.style.display = "block";

    }, 300);
  }

  showSlide();

  const slider = setInterval(() => {
    index++;
    if (index >= slides.length) {
      clearInterval(slider);
      return;
    }
    showSlide();
  }, 3000);
};
/* ===================== 1. HOME PAGE SLIDER CODE ===================== */
window.addEventListener('DOMContentLoaded', () => {
    // Images ka path '/static/' se shuru kiya taake Flask dhoond sake
    const slides = [
        "/static/images/slide2.png", 
        "/static/images/slide1.png"  
    ];

    let index = 0;
    const heroImg  = document.getElementById("heroSlide");
    const caption  = document.getElementById("heroText1");
    const heroText = document.querySelector(".hero-text");

    if (heroImg) {
        function showSlide() {
            heroImg.style.opacity = 0;
            if(caption) caption.style.display = "none";
            if(heroText) heroText.style.display = "none";

            setTimeout(() => {
                heroImg.src = slides[index];
                heroImg.style.opacity = 1;
                if (index === 0 && caption) caption.style.display = "block";
                if (index === 1 && heroText) heroText.style.display = "block";
            }, 300);
        }

        showSlide();

        setInterval(() => {
            index++;
            if (index >= slides.length) {
                index = 0; // Loop chalane ke liye restart kiya
            }
            showSlide();
        }, 8000); // 8 seconds standard timing slider ke liye
    }
});

/* ===================== 2. ANALYZE FORM CODE WITH BACKEND CONNECT ===================== */
const analyzeForm = document.getElementById('analyzeForm');
if (analyzeForm) {
    analyzeForm.onsubmit = (e) => {
        e.preventDefault();

        // Check imagesArray (Jo analyze page par upload hone wali image hold karega)
        if(typeof imagesArray === 'undefined' || imagesArray.length === 0){
            alert("Please upload at least 1 image.");
            return;
        }

        // Form fields ka data normal storage ke liye
        const hairData = {
            oil: document.getElementById("oil_balance") ? document.getElementById("oil_balance").value : "Normal",
            porosity: document.getElementById("porosity") ? document.getElementById("porosity").value : "Normal",
            strength: document.getElementById("strength") ? document.getElementById("strength").value : "Normal",
            hairFall: document.getElementById("hair_fall") ? document.getElementById("hair_fall").value : "None",
            scalp: document.getElementById("scalp_health") ? document.getElementById("scalp_health").value : "Normal",
            concern: (document.getElementById("concernBox") && document.getElementById("concernBox").value) || "None"
        };

        localStorage.setItem("userHairData", JSON.stringify(hairData));

        // Pehle interface ko loading screen par le kar jayein
        window.location.href = "/loading";

        // Image file ko backend code ki taraf bhejna (POST Request)
        const formData = new FormData();
        
        fetch(imagesArray[0])
        .then(res => res.blob())
        .then(blob => {
            formData.append('image', blob, 'user_scalp.png');
            
            return fetch('/predict', {
                method: 'POST',
                body: formData
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Agar AI data successfully analyze karle to seedha result page run ho jaye
                window.location.href = "/result";
            } else {
                alert("AI Analysis Failed: " + data.message);
                window.location.href = "/analyze";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            // Backup handle agar api response slow ho tab bhi user result dekh sake
            window.location.href = "/result";
        });
    };
}

/* ===================== 3. RECOMMENDATIONS & UTILITIES ===================== */
// Dynamic view handle karne ke liye global variable load ho sake
const hairData = JSON.parse(localStorage.getItem("userHairData")) || { scalp: "Normal", oil: "Normal", hairFall: "None", strength: "Normal" };

function toggleView(type, img) {
    const box = document.getElementById("recommendationBox");
    if (!box) return;

    let content = "";
    const s = hairData.scalp;
    const o = hairData.oil;
    const f = hairData.hairFall;

    if (type === "shampoo") {
        if (s === "Dandruff" || o === "Oily") {
            content = `<h4>🧴 Deep Cleansing Shampoo</h4><ul><li>Salicylic Acid base formula</li><li>Hafte mein 3 baar dhoyen</li></ul>`;
        } else if (hairData.strength && hairData.strength.includes("Damage")) {
            content = `<h4>... 🧴 Repairing Shampoo</h4><ul><li>Keratin & Protein infused</li><li>Sulfate-free formulation</li></ul>`;
        } else {
            content = `<h4>🧴 Balanced Shampoo</h4><p>Aapka scalp normal hai, koi bhi mild herbal shampoo use karein.</p>`;
        }
    } 
    else if (type === "oil") {
        if (f && f.includes("Fall")) {
            content = `<h4>🪔 Growth Oil</h4><ul><li>Rosemary + Castor Oil blend</li><li>Scalp massage for 5 mins</li></ul>`;
        } else {
            content = `<h4>🪔 Nourishing Oil</h4><ul><li>Argan Oil for shine</li><li>Ends par zyada lagayein</li></ul>`;
        }
    }

    box.innerHTML = content;
    box.style.display = "block";
}

// Function for Download PDF Report
function downloadPDF() {
    const element = document.getElementById('result-content');
    if (!element) return;
    const opt = {
        margin: 10,
        filename: 'HairLytics_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
}

// Function for WhatsApp Share
function shareWhatsApp() {
    const msg = `Check out my AI Hair Report on HairLytics!\nScalp: ${hairData.scalp}\nOil: ${hairData.oil}\nGet your analysis here!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
}