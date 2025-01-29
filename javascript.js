document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants"; // URL de l'API
  const container = document.getElementById("apprenants-container");
  const searchInput = document.getElementById("search");
  const promotionFilter = document.getElementById("promotion-filter");
  const skillFilter = document.getElementById("skill-filter");

  let allApprenants = []; // Stocke tous les apprenants récupérés

  // Fonction pour récupérer les données de l'API
  async function fetchApprenants() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Erreur lors de la récupération des données.");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Les données ne sont pas au format attendu.");
      allApprenants = data;
      displayApprenants(allApprenants);
    } catch (error) {
      console.error("Erreur : ", error);
      container.innerHTML = "<p>Erreur lors du chargement des données.</p>";
    }
  }

  // Fonction pour afficher les apprenants
  function displayApprenants(apprenants) {
    container.innerHTML = ""; // Vider le conteneur
    if (apprenants.length === 0) {
      container.innerHTML = "<p>Aucun apprenant trouvé.</p>";
      return;
    }

    apprenants.forEach((apprenant) => {
      const card = createApprenantCard(apprenant);
      container.appendChild(card);
    });
  }

  // Fonction pour créer une carte d'apprenant
  function createApprenantCard(apprenant) {
    const card = document.createElement("div");
    card.classList.add("apprenant-card");

    const imageUrl = apprenant.image || "https://via.placeholder.com/100";
    const name = apprenant.title?.rendered || "Nom inconnu";
    const promotion = apprenant.acf?.promotion || "Non précisé";
    const competences = apprenant.acf?.competences ? apprenant.acf.competences.join(", ") : "Aucune";
    const portfolioLink = apprenant.acf?.portfolio || "#";
    const linkedinLink = apprenant.acf?.linkedin || "#";
    const githubLink = apprenant.acf?.github || "#";

    card.innerHTML = `
      <img src="${imageUrl}" alt="Photo de ${name}">
      <h3>${name}</h3>
      <p><strong>Promotion :</strong> ${promotion}</p>
      <p><strong>Compétences :</strong> ${competences}</p>
      <div class="links">
        <a href="${portfolioLink}" target="_blank">Portfolio</a>
        <a href="${linkedinLink}" target="_blank">LinkedIn</a>
        <a href="${githubLink}" target="_blank">GitHub</a>
      </div>
    `;

    return card;
  }

  // Fonction pour filtrer les apprenants
  function filterApprenants() {
    const searchValue = searchInput.value.toLowerCase();
    const promotionValue = promotionFilter.value;
    const skillValue = skillFilter.value.toLowerCase();

    const filteredApprenants = allApprenants.filter((apprenant) => {
      const matchesSearch = apprenant.title?.rendered.toLowerCase().includes(searchValue);
      const matchesPromotion = promotionValue === "" || apprenant.acf?.promotion === promotionValue;
      const matchesSkill =
        skillValue === "" ||
        (apprenant.acf?.competences && apprenant.acf.competences.some((comp) => comp.toLowerCase().includes(skillValue)));

      return matchesSearch && matchesPromotion && matchesSkill;
    });

    displayApprenants(filteredApprenants);
  }

  // Initialisation
  fetchApprenants(); // Récupérer les données au chargement de la page

  // Écouter les événements de filtrage
  searchInput.addEventListener("input", filterApprenants);
  promotionFilter.addEventListener("change", filterApprenants);
  skillFilter.addEventListener("change", filterApprenants);
});