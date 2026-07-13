// Paste your Google Apps Script Web App URL here
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwbj-YsLPqKwRWyTGGhnjVqQVipmTpRaMaEsoeVwYEp7oQCb_5IKvFk2g6U62jaicNUGQ/exec";

const form = document.getElementById("rsvpForm");
const jumlahBox = document.getElementById("jumlahBox");
const message = document.getElementById("message");
const wishesBox = document.getElementById("wishes");

// Show / hide jumlah kehadiran
document.querySelectorAll('input[name="hadir"]').forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "Tidak Hadir" && radio.checked) {
            jumlahBox.style.display = "none";
        } else if (radio.value === "Hadir" && radio.checked) {
            jumlahBox.style.display = "block";
        }
    });
});

// Submit RSVP
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const hadir = document.querySelector('input[name="hadir"]:checked').value;

    const data = {
        nama: document.getElementById("nama").value.trim(),
        kehadiran: hadir,
        jumlah: hadir === "Hadir" ? document.getElementById("jumlah").value : 0,
        ucapan: document.getElementById("ucapan").value.trim() // Added trim() to clear accidental spaces
    };

    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });

        message.innerHTML = "Submited successfully ! Thank you";
        form.reset();
        jumlahBox.style.display = "block";

        // Reload wishes immediately after a successful post
        loadWishes();

        setTimeout(() => {
            message.innerHTML = "";
        }, 4000);

    } catch (error) {
        message.innerHTML = "Try Again !";
    }
});

// Load wishes from Web App
async function loadWishes() {
    try {
        const response = await fetch(SCRIPT_URL);
        const wishes = await response.json();
        displayWishes(wishes);
    } catch (error) {
        console.error("Error loading wishes:", error);
    }
}

// Safely display wishes without security bugs
function displayWishes(wishes) {
    wishesBox.innerHTML = "";

    // Guard clause: Make sure data returned is actually an array
    if (!Array.isArray(wishes)) {
        console.error("Expected an array of wishes, but got:", wishes);
        return;
    }

    wishes.slice(0, 8).forEach((wish, index) => {
        const div = document.createElement("div");
        div.className = "wish";

        if (index === 0) {
            div.classList.add("new");
        }

        // Secure Text Insertion: Using separate elements to prevent XSS attacks
        const strong = document.createElement("strong");
        strong.textContent =  wish.nama || 'Anonim';

        const p = document.createElement("p");
        p.textContent = wish.ucapan || '';

        div.appendChild(strong);
        div.appendChild(p);
        wishesBox.appendChild(div);
    });
}

// Auto refresh every 5 seconds
setInterval(loadWishes, 5000);

// First load
loadWishes();