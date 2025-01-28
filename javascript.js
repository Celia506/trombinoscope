document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://portfolios.ruki5964.odns.fr/?post_type=apprenants&#038;p=216";
    const container = document.getElementById("apprenants-container");
    const yearFilter = document.getElementById("year-filter");
    const skillFilter = document.getElementById("skill-filter");
    const searchInput = document.getElementById("search");
  
    let allApprenants = []; // Stocke les données récupérées
  
    // Récupération des données
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error("Erreur lors de la récupération des données.");
        return response.json();
      })
      .then(data => {
        allApprenants = data;
        displayApprenants(allApprenants); // Affiche tous les apprenants par défaut
      })
      .catch(error => console.error("Erreur : ", error));
  
    // Fonction pour afficher les apprenants
    function displayApprenants(apprenants) {
      container.innerHTML = ""; // Vide la grille
      apprenants.forEach(apprenant => {
        // Création de la carte
        const card = document.createElement("div");
        card.classList.add("apprenant-card");
        card.innerHTML = `
          <img src="${apprenant.photo || "placeholder.jpg"}" alt="Photo de ${apprenant.nom}">
          <h3>${apprenant.nom}</h3>
          <p><strong>Promotion :</strong> ${apprenant.promotion || "Inconnue"}</p>
          <p><strong>Compétences :</strong> ${(apprenant.competences || []).join(", ")}</p>
        `;
        container.appendChild(card);
      });
    }
  
    // Fonction pour filtrer les apprenants
    function filterApprenants() {
      const year = yearFilter.value;
      const skill = skillFilter.value.toLowerCase();
      const search = searchInput.value.toLowerCase();
  
      const filtered = allApprenants.filter(apprenant => {
        const matchesYear = !year || apprenant.promotion === year;
        const matchesSkill =
          !skill || (apprenant.competences || []).some(comp => comp.toLowerCase().includes(skill));
        const matchesSearch =
          !search || apprenant.nom.toLowerCase().includes(search);
  
        return matchesYear && matchesSkill && matchesSearch;
      });
  
      displayApprenants(filtered); // Affiche les apprenants filtrés
    }
  
    // Ajout des écouteurs d'événements pour les filtres
    yearFilter.addEventListener("change", filterApprenants);
    skillFilter.addEventListener("change", filterApprenants);
    searchInput.addEventListener("input", filterApprenants);
  });
  