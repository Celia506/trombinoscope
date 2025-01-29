document.addEventListener("DOMContentLoaded", () => {
  const apiUrlApprenants = "http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants?per_page=100";
  const apiUrlPromotions = "http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/promotions";
  
  const container = document.getElementById("apprenants-container");
  const searchInput = document.getElementById("search");
  const promotionFilter = document.getElementById("promotion-filter");
  const skillFilter = document.getElementById("skill-filter");

  let allApprenants = [];
  let allPromotions = [];

  // Fonction pour récupérer les promotions
  async function fetchPromotions() {
    try {
      const response = await fetch(apiUrlPromotions);
      if (!response.ok) throw new Error("Erreur lors de la récupération des promotions.");
      const data = await response.json();
      console.log("Promotions récupérées :", data);
      if (!Array.isArray(data)) throw new Error("Les données des promotions ne sont pas au format attendu.");
      allPromotions = data;
      populatePromotionFilter();
    } catch (error) {
      console.error("Erreur : ", error);
    }
  }

  // Fonction pour remplir le filtre des promotions
  function populatePromotionFilter() {
    promotionFilter.innerHTML = '<option value="">Toutes les promotions</option>';
    allPromotions.forEach((promo) => {
      const option = document.createElement("option");
      option.value = promo.name;
      option.textContent = promo.name;
      promotionFilter.appendChild(option);
    });
  }

  // Fonction pour récupérer le nom de la promotion depuis son ID
  function getPromotionName(promotionId) {
    if (!promotionId) {
      console.log("Aucun ID reçu dans getPromotionName");
      return "Non précisé";
    }
  
    console.log("Recherche de la promotion pour ID :", promotionId);
    const promo = allPromotions.find(p => p.id == promotionId);
    
    if (!promo) {
      console.log("Promotion introuvable pour ID :", promotionId);
      return "Non précisé";
    }
  
    console.log("Promotion trouvée :", promo.name);
    return promo.name;
  }

  // Fonction pour récupérer les apprenants
  async function fetchApprenants() {
    try {
      const response = await fetch(apiUrlApprenants);
      if (!response.ok) throw new Error("Erreur lors de la récupération des apprenants.");
      const data = await response.json();
       console.log("Apprenants récupérés :", data);
      if (!Array.isArray(data)) throw new Error("Les données des apprenants ne sont pas au format attendu.");
      allApprenants = data;
      displayApprenants(allApprenants);
    } catch (error) {
      console.error("Erreur : ", error);
      container.innerHTML = "<p>Erreur lors du chargement des données.</p>";
    }
  }

  // Fonction pour afficher les apprenants
  function displayApprenants(apprenants) {
    container.innerHTML = "";
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
    console.log("Données de l'apprenant :", apprenant);
console.log("ID de la promotion récupéré :", apprenant.acf?.promotion);

    const imageUrl = apprenant.image || "https://via.placeholder.com/100";
    const name = apprenant.title?.rendered || "Nom inconnu";
    const promotion = getPromotionName(apprenant.acf?.promotion);
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
      const matchesPromotion = promotionValue === "" || getPromotionName(apprenant.acf?.promotion) === promotionValue;
      const matchesSkill =
        skillValue === "" ||
        (apprenant.acf?.competences && apprenant.acf.competences.some((comp) => comp.toLowerCase().includes(skillValue)));

      return matchesSearch && matchesPromotion && matchesSkill;
    });

    displayApprenants(filteredApprenants);
  }

  // Initialisation : récupérer les promotions PUIS les apprenants
  async function init() {
    await fetchPromotions(); // On récupère d'abord les promotions
    await fetchApprenants(); // Puis on récupère les apprenants après
  }
  console.log("Promotions récupérées :", allPromotions);

  init(); // Lancer l'initialisation

  // Écouter les événements de filtrage
  searchInput.addEventListener("input", filterApprenants);
  promotionFilter.addEventListener("change", filterApprenants);
  skillFilter.addEventListener("change", filterApprenants);
});
