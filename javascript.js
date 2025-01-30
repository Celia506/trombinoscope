document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM chargé, début du script'); // Vérifie que le script est bien exécuté

  const container = document.getElementById('apprenants-container');
  const searchName = document.getElementById('search-name');
  const searchSkill = document.getElementById('search-skill');
  const searchPromo = document.getElementById('search-promo');

  let allApprenants = [];

  // Récupérer les données des promotions
  fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/promotions')
    .then(res => res.json())
    .then(promotions => {
      console.log('Données des promotions récupérées:', promotions);

      const promotionsDict = {};
      promotions.forEach(promo => {
        promotionsDict[promo.id] = promo.slug;
      });

      // Récupérer les données des compétences
      fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/competences')
        .then(res => res.json())
        .then(competences => {
          console.log('Données des compétences récupérées:', competences);

          const competencesDict = {};
          competences.forEach(skill => {
            competencesDict[skill.id] = skill.name;
          });

          // Récupérer les données des apprenants
          fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants?per_page=100')
            .then(res => res.json())
            .then(apprenants => {
              console.log('Données des apprenants récupérées:', apprenants);

              allApprenants = apprenants;

              // Affichage initial des apprenants
              displayApprenants(apprenants, promotionsDict, competencesDict);

              // Filtrage en fonction des recherches
              searchName.addEventListener('input', () => {
                console.log('Filtrage par nom:', searchName.value);
                filterApprenants(promotionsDict, competencesDict);
              });

              searchSkill.addEventListener('input', () => {
                console.log('Filtrage par compétence:', searchSkill.value);
                filterApprenants(promotionsDict, competencesDict);
              });

              searchPromo.addEventListener('input', () => {
                console.log('Filtrage par promotion:', searchPromo.value);
                filterApprenants(promotionsDict, competencesDict);
              });
            })
            .catch(err => console.error('Erreur lors de la récupération des apprenants:', err));
        })
        .catch(err => console.error('Erreur lors de la récupération des compétences:', err));
    })
    .catch(err => console.error('Erreur lors de la récupération des promotions:', err));

  function displayApprenants(apprenants, promotionsDict, competencesDict) {
    console.log('Affichage de', apprenants.length, 'apprenants');

    container.innerHTML = '';

    apprenants.forEach(apprenant => {
      const promoId = apprenant.promotions[0]; 
      const promoName = promotionsDict[promoId] || 'Inconnu';

      const skillElements = apprenant.competences.map(skillId => {
        const skillName = competencesDict[skillId] || 'Inconnu';
        return `<span class="skill skill-default">${skillName}</span>`;
      });

      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <h2 class="name">${apprenant.nom} ${apprenant.prenom}</h2>
            <img class="profile-pic" src="${apprenant.image}" alt="Image de ${apprenant.nom}" />
            <p class="promo">Promo: ${promoName}</p>
            <div class="skills">${skillElements.join('')}</div>
            <br>
            <div class="links">
              <a href="${apprenant.urlgit}" target="_blank"><img src="logo/Github.png"></a>
              <a href="${apprenant.linkedin}" target="_blank"><img src="logo/linkedin.png"></a>
              <a href="${apprenant.cv}" target="_blank"><img src="logo/cv.png"></a>
              <a href="${apprenant.portfolio}" target="_blank"><img src="logo/portfolio.png"></a>
            </div>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function filterApprenants(promotionsDict, competencesDict) {
    console.log('Filtrage des apprenants en cours...');

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

    console.log('Nombre d\'apprenants après filtrage:', filteredApprenants.length);
    
    displayApprenants(filteredApprenants, promotionsDict, competencesDict);
  }
});
