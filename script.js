// Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwbj-YsLPqKwRWyTGGhnjVqQVipmTpRaMaEsoeVwYEp7oQCb_5IKvFk2g6U62jaicNUGQ/exec";

const form = document.getElementById("rsvpForm");
const jumlahBox = document.getElementById("jumlahBox");
const message = document.getElementById("message");
const wishesBox = document.getElementById("wishes");
const submitBtn = document.getElementById("submitBtn");
const wishCountBadge = document.getElementById("wishCount");

// Toggle Total Attendance box when attendance choice changes
document.querySelectorAll('input[name="hadir"]').forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "Tidak Hadir" && radio.checked) {
            jumlahBox.style.display = "none";
        } else if (radio.value === "Hadir" && radio.checked) {
            jumlahBox.style.display = "block";
        }
    });
});

// Form Submit Handler
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const hadir = document.querySelector('input[name="hadir"]:checked').value;
    const namaInput = document.getElementById("nama").value.trim();
    const ucapanInput = document.getElementById("ucapan").value.trim();
    const jumlahInput = hadir === "Hadir" ? document.getElementById("jumlah").value : 0;

    if (!namaInput || !ucapanInput) return;

    // Button Loading UI
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    submitBtn.querySelector("span").textContent = "Submitting...";

    const data = {
        nama: namaInput,
        kehadiran: hadir,
        jumlah: jumlahInput,
        ucapan: ucapanInput
    };

    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });

        showMessage("Submitted successfully! Thank you.", "success");
        form.reset();
        jumlahBox.style.display = "block"; // Reset attendance count visibility

        // Refresh wishes wall immediately
        await loadWishes();

    } catch (error) {
        console.error("Error submitting RSVP:", error);
        showMessage("Try Again! Unable to submit.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        submitBtn.querySelector("span").textContent = "Submit RSVP & Wishes";
    }
});

// Show status message banner
function showMessage(msgText, type) {
    message.textContent = msgText;
    message.className = `message-banner ${type} show`;

    setTimeout(() => {
        message.className = "message-banner";
    }, 4000);
}

// Fetch wishes from backend
async function loadWishes() {
    try {
        const response = await fetch(SCRIPT_URL);
        const wishes = await response.json();
        displayWishes(wishes);
    } catch (error) {
        console.error("Error loading wishes:", error);
        wishesBox.innerHTML = `<div class="empty-state">Unable to load wishes right now.</div>`;
    }
}

// Render wishes onto the wall
function displayWishes(wishes) {
    wishesBox.innerHTML = "";

    if (!Array.isArray(wishes) || wishes.length === 0) {
        wishCountBadge.textContent = "0 Wishes";
        wishesBox.innerHTML = `<div class="empty-state">Be the first to leave a wish for Siti & Harith! ✨</div>`;
        return;
    }

    const validWishes = wishes.filter(w => w && (w.nama || w.ucapan));
    wishCountBadge.textContent = `${validWishes.length} ${validWishes.length === 1 ? 'Wish' : 'Wishes'}`;

    validWishes.forEach((wish, index) => {
        const div = document.createElement("div");
        div.className = "wish-item";

        if (index === 0) {
            div.classList.add("is-new");
        }

        const headerDiv = document.createElement("div");
        headerDiv.className = "wish-item-header";

        const strong = document.createElement("strong");
        strong.textContent = wish.nama || "Anonymous";

        headerDiv.appendChild(strong);

        const p = document.createElement("p");
        p.textContent = wish.ucapan || "";

        div.appendChild(headerDiv);
        div.appendChild(p);
        wishesBox.appendChild(div);
    });
}

// Refresh wishes every 7 seconds
setInterval(loadWishes, 7000);

// Initial Load
loadWishes();
