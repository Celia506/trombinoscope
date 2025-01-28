document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants"; // URL de l'API
    const container = document.getElementById("apprenants-container");
    const searchInput = document.getElementById("search");
    const promotionFilter = document.getElementById("promotion-filter");
    const skillFilter = document.getElementById("skill-filter");
  
    let allApprenants = []; // Stocker les apprenants récupérés
  
    // Récupérer les données de l'API
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error("Erreur lors de la récupération des données.");
        return response.json();
      })
      .then(data => {
        allApprenants = data; // Stocker les données
        displayApprenants(allApprenants); // Afficher les apprenants
      })
      .catch(error => console.error("Erreur : ", error));
  
    // Afficher les apprenants dans le conteneur
    function displayApprenants(apprenants) {
      container.innerHTML = ""; // Réinitialiser le conteneur
      if (apprenants.length === 0) {
        container.innerHTML = "<p>Aucun apprenant trouvé.</p>";
        return;
      }
  
      apprenants.forEach(apprenant => {
        const card = document.createElement("div");
        card.classList.add("apprenant-card");
        card.innerHTML = `
          <img src="${apprenant.photo || "https://via.placeholder.com/100"}" alt="Photo de ${apprenant.nom}">
          <h3>${apprenant.nom}</h3>
          <p><strong>Promotion :</strong> ${apprenant.promotion}</p>
          <p><strong>Compétences :</strong> ${apprenant.competences ? apprenant.competences.join(", ") : "Aucune"}</p>
        `;
        container.appendChild(card);
      });
    }
  
    // Filtrer les apprenants
    function filterApprenants() {
      const searchValue = searchInput.value.toLowerCase();
      const promotionValue = promotionFilter.value;
      const skillValue = skillFilter.value.toLowerCase();
  
      const filteredApprenants = allApprenants.filter(apprenant => {
        const matchesSearch = apprenant.nom.toLowerCase().includes(searchValue);
        const matchesPromotion = promotionValue === "" || apprenant.promotion === promotionValue;
        const matchesSkill = skillValue === "" || apprenant.competences.some(comp => comp.toLowerCase().includes(skillValue));
  
        return matchesSearch && matchesPromotion && matchesSkill;
      });
  
      displayApprenants(filteredApprenants);
    }
  
    // Écouteurs d'événements pour filtrer
    searchInput.addEventListener("input", filterApprenants);
    promotionFilter.addEventListener("change", filterApprenants);
    skillFilter.addEventListener("change", filterApprenants);
  });
  