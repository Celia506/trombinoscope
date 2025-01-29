document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('apprenants-container');
  const searchName = document.getElementById('search-name');
  const searchSkill = document.getElementById('search-skill');
  const searchPromo = document.getElementById('search-promo');

  let allApprenants = [];

  // Récupérer les données des promotions
  fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/promotions')
    .then(res => res.json())
    .then(promotions => {
      // Création d'un dictionnaire pour les promotions
      const promotionsDict = {};
      promotions.forEach(promo => {
        promotionsDict[promo.id] = promo.slug;
      });

      // Récupérer les données des compétences
      fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/competences')
        .then(res => res.json())
        .then(competences => {
          // Création d'un dictionnaire pour les compétences
          const competencesDict = {};
          competences.forEach(skill => {
            competencesDict[skill.id] = skill.name;
          });

          // Récupérer les données des apprenants
          fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants?per_page=100')
            .then(res => res.json())
            .then(apprenants => {
              allApprenants = apprenants;

              // Affichage initial des apprenants
              displayApprenants(apprenants, promotionsDict, competencesDict);

              // Filtrage en fonction des recherches
              searchName.addEventListener('input', () => filterApprenants(promotionsDict, competencesDict));
              searchSkill.addEventListener('input', () => filterApprenants(promotionsDict, competencesDict));
              searchPromo.addEventListener('input', () => filterApprenants(promotionsDict, competencesDict));
            })
            .catch(err => console.error('Erreur:', err)); // Gestion des erreurs pour les apprenants
        })
        .catch(err => console.error('Erreur:', err)); // Gestion des erreurs pour les compétences
    })
    .catch(err => console.error('Erreur:', err)); // Gestion des erreurs pour les promotions

  // Fonction pour afficher les apprenants
  function displayApprenants(apprenants, promotionsDict, competencesDict) {
    container.innerHTML = ''; // Vider le conteneur avant d'ajouter les nouveaux éléments

    apprenants.forEach(apprenant => {
      // Récupérer le nom de la promotion
      const promoId = apprenant.promotions[0]; 
      const promoName = promotionsDict[promoId] || 'Inconnu';

      // Récupérer les compétences
      const skillElements = apprenant.competences.map(skillId => {
        const skillName = competencesDict[skillId] || 'Inconnu';
        let colorClass = 'skill-default'; 
        
        return `<span class="skill ${colorClass}">${skillName}</span>`;
      });

      // Créer la carte de l'apprenant
      const card = document.createElement('div');
      card.className = 'card';

      // Remplir la carte avec les données de l'apprenant
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <h2 class="name">${apprenant.nom} ${apprenant.prenom}</h2>
            <img class="profile-pic" src="${apprenant.image}" alt="Image de ${apprenant.nom}" />
            <p class="promo">Promo: ${promoName}</p>
            <div class="skills">${skillElements.join('')}</div>
          </div>
        </div>
      `;

      // Ajouter la carte au conteneur
      container.appendChild(card);
    });
  }

  // Fonction de filtrage des apprenants
  function filterApprenants(promotionsDict, competencesDict) {
    const nameQuery = searchName.value.toLowerCase();
    const skillQuery = searchSkill.value.toLowerCase();
    const promoQuery = searchPromo.value.toLowerCase();

    const filteredApprenants = allApprenants.filter(apprenant => {
      const promoId = apprenant.promotions[0];
      const promoName = promotionsDict[promoId] || '';
      const skills = apprenant.competences.map(skillId => competencesDict[skillId] || '').join(' ').toLowerCase();
      const name = `${apprenant.nom} ${apprenant.prenom}`.toLowerCase();

      return (
        name.includes(nameQuery) &&
        skills.includes(skillQuery) &&
        promoName.toLowerCase().includes(promoQuery)
      );
    });

    // Afficher les apprenants filtrés
    displayApprenants(filteredApprenants, promotionsDict, competencesDict);
  }
});
