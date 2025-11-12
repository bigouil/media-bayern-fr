// Script de test pour Football-Data.org API
// Usage : node scripts/test-football-data.js

const API_TOKEN = process.env.FOOTBALL_DATA_API_TOKEN || 'c372fa6b39c54ef992fb1e0cb66623a8';
const BAYERN_TEAM_ID = 5;

async function testAPI() {
  console.log('🔍 Test de connexion Football-Data.org...\n');

  try {
    // Test 1 : Récupération des matchs de la saison en cours
    const currentYear = new Date().getFullYear();
    console.log(`📊 Test 1 : Récupération des matchs saison ${currentYear}...`);

    const response = await fetch(
      `https://api.football-data.org/v4/teams/${BAYERN_TEAM_ID}/matches?season=${currentYear}`,
      {
        headers: {
          'X-Auth-Token': API_TOKEN,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    console.log(`✅ API connectée avec succès!`);
    console.log(`📈 Matchs récupérés: ${data.matches.length}`);
    console.log(`🔢 Limite: ${response.headers.get('x-requests-available-minute') || '10'} requêtes/minute\n`);

    if (data.matches.length > 0) {
      // Trouver le dernier match terminé
      const finishedMatches = data.matches
        .filter(m => m.status === 'FINISHED')
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

      if (finishedMatches.length > 0) {
        console.log('🎯 Dernier match terminé:');
        const lastMatch = finishedMatches[0];
        console.log(`   ${lastMatch.homeTeam.name} ${lastMatch.score.fullTime.home} - ${lastMatch.score.fullTime.away} ${lastMatch.awayTeam.name}`);
        console.log(`   ${lastMatch.competition.name}`);
        console.log(`   ${new Date(lastMatch.utcDate).toLocaleDateString('fr-FR')}\n`);
      }

      // Matchs à venir
      const upcomingMatches = data.matches
        .filter(m => m.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

      if (upcomingMatches.length > 0) {
        console.log('📅 Prochain match:');
        const nextMatch = upcomingMatches[0];
        console.log(`   ${nextMatch.homeTeam.name} vs ${nextMatch.awayTeam.name}`);
        console.log(`   ${nextMatch.competition.name}`);
        console.log(`   ${new Date(nextMatch.utcDate).toLocaleDateString('fr-FR')} à ${new Date(nextMatch.utcDate).toLocaleTimeString('fr-FR')}\n`);
      }

      // Matchs en cours
      const liveMatches = data.matches.filter(m => m.status === 'IN_PLAY');
      if (liveMatches.length > 0) {
        console.log('🔴 Match EN DIRECT:');
        liveMatches.forEach(match => {
          console.log(`   ${match.homeTeam.name} ${match.score.fullTime.home} - ${match.score.fullTime.away} ${match.awayTeam.name}`);
        });
      } else {
        console.log('📺 Aucun match en direct pour le moment\n');
      }
    }

    // Test 2 : Informations sur l'équipe
    console.log('📊 Test 2 : Récupération des infos équipe...');
    const teamResponse = await fetch(
      `https://api.football-data.org/v4/teams/${BAYERN_TEAM_ID}`,
      {
        headers: {
          'X-Auth-Token': API_TOKEN,
        },
      }
    );

    if (teamResponse.ok) {
      const teamData = await teamResponse.json();
      console.log(`✅ Équipe: ${teamData.name}`);
      console.log(`   Fondé: ${teamData.founded}`);
      console.log(`   Stade: ${teamData.venue}\n`);
    }

    console.log('✨ Tous les tests sont passés avec succès!');
    console.log('🚀 Football-Data.org fonctionne parfaitement.\n');

    console.log('✅ Avantages Football-Data.org:');
    console.log('   • 10 requêtes/minute (très généreux)');
    console.log('   • Saisons récentes disponibles');
    console.log('   • Données fiables et à jour');
    console.log('   • Gratuit pour usage personnel\n');

    console.log('⚠️  IMPORTANT : N\'oubliez pas de régénérer votre token !');
    console.log('   👉 https://www.football-data.org/client/account\n');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('   1. Vérifiez votre connexion internet');
    console.log('   2. Vérifiez que le token API est correct dans .env.local');
    console.log('   3. Redémarrez le serveur après modification de .env.local');
    console.log('   4. Consultez https://www.football-data.org/documentation/quickstart\n');
  }
}

testAPI();
