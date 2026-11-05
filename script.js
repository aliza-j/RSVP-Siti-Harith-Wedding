// Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwbj-YsLPqKwRWyTGGhnjVqQVipmTpRaMaEsoeVwYEp7oQCb_5IKvFk2g6U62jaicNUGQ/exec";

const form = document.getElementById("wishForm");
const message = document.getElementById("message");
const wishesBox = document.getElementById("wishes");
const submitBtn = document.getElementById("submitBtn");
const wishCountBadge = document.getElementById("wishCount");

// Submit Wishes Form
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const namaInput = document.getElementById("nama").value.trim();
    const ucapanInput = document.getElementById("ucapan").value.trim();

    if (!namaInput || !ucapanInput) return;

    // Loading State UI
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    submitBtn.querySelector("span").textContent = "Sending...";

    const data = {
        nama: namaInput,
        ucapan: ucapanInput
    };

    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });

        showMessage("Thank you! Your wish has been posted.", "success");
        form.reset();

        // Reload wishes wall immediately
        await loadWishes();

    } catch (error) {
        console.error("Error submitting wish:", error);
        showMessage("Failed to submit. Please try again!", "error");
    } finally {
        // Reset Button UI
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        submitBtn.querySelector("span").textContent = "Send Wishes";
    }
});

// Helper for temporary status messages
function showMessage(msgText, type) {
    message.textContent = msgText;
    message.className = `message-banner ${type} show`;

    setTimeout(() => {
        message.className = "message-banner";
    }, 4000);
}

// Load wishes from Google Web App
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

// Render wishes safely
function displayWishes(wishes) {
    wishesBox.innerHTML = "";

    if (!Array.isArray(wishes) || wishes.length === 0) {
        wishCountBadge.textContent = "0 Wishes";
        wishesBox.innerHTML = `<div class="empty-state">Be the first to leave a wish for Siti & Harith! ✨</div>`;
        return;
    }

    // Filter out invalid items and get total count
    const validWishes = wishes.filter(w => w && (w.nama || w.ucapan));
    wishCountBadge.textContent = `${validWishes.length} ${validWishes.length === 1 ? 'Wish' : 'Wishes'}`;

    validWishes.forEach((wish, index) => {
        const div = document.createElement("div");
        div.className = "wish-item";

        // Add badge for newest post
        if (index === 0) {
            div.classList.add("is-new");
        }

        const headerDiv = document.createElement("div");
        headerDiv.className = "wish-item-header";

        const strong = document.createElement("strong");
        strong.textContent = wish.nama || "Anonymous";

        headerDiv.appendChild(strong);

        if (index === 0) {
            const badge = document.createElement("span");
            badge.className = "new-badge";
            badge.textContent = "Latest";
            headerDiv.appendChild(badge);
        }

        const p = document.createElement("p");
        p.textContent = wish.ucapan || "";

        div.appendChild(headerDiv);
        div.appendChild(p);
        wishesBox.appendChild(div);
    });
}

// Auto refresh every 7 seconds
setInterval(loadWishes, 7000);

// Initial Load
loadWishes();
