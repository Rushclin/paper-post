import { AuthService } from '@/src/libs/auth'
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer les catégories principales
  const categories = [
    // Informatique
    {
      name: 'Intelligence Artificielle',
      slug: 'intelligence-artificielle',
      description: 'Recherches en IA, machine learning, deep learning'
    },
    {
      name: 'Informatique Théorique',
      slug: 'informatique-theorique', 
      description: 'Algorithmes, complexité, théorie des graphes'
    },
    {
      name: 'Systèmes et Réseaux',
      slug: 'systemes-reseaux',
      description: 'Systèmes distribués, réseaux, sécurité'
    },
    {
      name: 'Interface Homme-Machine',
      slug: 'ihm',
      description: 'UX/UI, interaction, ergonomie'
    },
    {
      name: 'Bases de Données',
      slug: 'bases-donnees',
      description: 'SGBD, Big Data, Data Mining'
    },
    
    // Sciences exactes
    {
      name: 'Mathématiques',
      slug: 'mathematiques',
      description: 'Algèbre, analyse, géométrie, statistiques'
    },
    {
      name: 'Physique',
      slug: 'physique',
      description: 'Physique théorique et expérimentale'
    },
    {
      name: 'Chimie',
      slug: 'chimie',
      description: 'Chimie organique, inorganique, analytique'
    },
    {
      name: 'Biologie',
      slug: 'biologie',
      description: 'Biologie moléculaire, cellulaire, écologie'
    },
    
    // Sciences humaines
    {
      name: 'Psychologie',
      slug: 'psychologie',
      description: 'Psychologie cognitive, sociale, clinique'
    },
    {
      name: 'Sociologie',
      slug: 'sociologie',
      description: 'Sociologie urbaine, du travail, politique'
    },
    {
      name: 'Linguistique',
      slug: 'linguistique',
      description: 'Linguistique générale, appliquée, computationnelle'
    },
    {
      name: 'Histoire',
      slug: 'histoire',
      description: 'Histoire contemporaine, médiévale, moderne'
    },
    {
      name: 'Géographie',
      slug: 'geographie',
      description: 'Géographie humaine, physique, environnementale'
    },
    
    // Sciences économiques et sociales
    {
      name: 'Économie',
      slug: 'economie',
      description: 'Microéconomie, macroéconomie, économétrie'
    },
    {
      name: 'Gestion',
      slug: 'gestion',
      description: 'Management, finance, marketing, stratégie'
    },
    {
      name: 'Science Politique',
      slug: 'science-politique',
      description: 'Politique comparée, relations internationales'
    },
    
    // Sciences médicales
    {
      name: 'Médecine',
      slug: 'medecine',
      description: 'Médecine clinique, recherche biomédicale'
    },
    {
      name: 'Pharmacie',
      slug: 'pharmacie',
      description: 'Pharmacologie, toxicologie, développement de médicaments'
    },
    {
      name: 'Santé Publique',
      slug: 'sante-publique',
      description: 'Épidémiologie, prévention, politiques de santé'
    },
    
    // Sciences de l'ingénieur
    {
      name: 'Génie Civil',
      slug: 'genie-civil',
      description: 'Construction, structures, matériaux'
    },
    {
      name: 'Génie Électrique',
      slug: 'genie-electrique',
      description: 'Électronique, automatique, télécommunications'
    },
    {
      name: 'Génie Mécanique',
      slug: 'genie-mecanique',
      description: 'Mécanique des fluides, thermodynamique, matériaux'
    },
    
    // Sciences environnementales
    {
      name: 'Écologie',
      slug: 'ecologie',
      description: 'Écosystèmes, biodiversité, conservation'
    },
    {
      name: 'Sciences de l\'Environnement',
      slug: 'sciences-environnement',
      description: 'Changement climatique, pollution, durabilité'
    },
    
    // Autres disciplines
    {
      name: 'Philosophie',
      slug: 'philosophie',
      description: 'Philosophie analytique, continentale, éthique'
    },
    {
      name: 'Éducation',
      slug: 'education',
      description: 'Pédagogie, didactique, sciences de l\'éducation'
    },
    {
      name: 'Droit',
      slug: 'droit',
      description: 'Droit public, privé, international'
    },
    {
      name: 'Arts et Lettres',
      slug: 'arts-lettres',
      description: 'Littérature, arts visuels, études culturelles'
    },
    {
      name: 'Communication',
      slug: 'communication',
      description: 'Sciences de l\'information et de la communication'
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
  }

  // Créer un journal principal
  const journal = await prisma.journal.upsert({
    where: { name: 'Revue Française d\'Informatique' },
    update: {},
    create: {
      name: 'Revue Française d\'Informatique',
      description: 'Journal de recherche en informatique et sciences du numérique',
      issn: '1234-5678'
    }
  })

  // Créer une issue pour 2024
  await prisma.issue.upsert({
    where: {
      journalId_volume_number: {
        journalId: journal.id,
        volume: 2024,
        number: 1
      }
    },
    update: {},
    create: {
      journalId: journal.id,
      volume: 2024,
      number: 1,
      title: 'Numéro spécial Intelligence Artificielle',
      description: 'Premier numéro de 2024 consacré aux avancées en IA',
      year: 2025
    }
  })

  // Créer un utilisateur admin
  const adminPassword = await AuthService.hashPassword('Admin123!')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@revue.fr' },
    update: {},
    create: {
      email: 'admin@revue.fr',
      password: adminPassword,
      firstName: 'Administrateur',
      lastName: 'Système',
      title: 'Dr.',
      affiliation: 'Université de la Recherche',
      department: 'Direction',
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    //   researchInterests: ['Gestion de revue', 'Éditorial']
    }
  })

  // Créer un utilisateur auteur exemple
  const authorPassword = await AuthService.hashPassword('Author123!')
  const author = await prisma.user.upsert({
    where: { email: 'auteur@revue.fr' },
    update: {},
    create: {
      email: 'auteur@revue.fr',
      password: authorPassword,
      firstName: 'Marie',
      lastName: 'Dupont',
      title: 'Dr.',
      affiliation: 'Université Sorbonne',
      department: 'Informatique',
      bio: 'Chercheuse en intelligence artificielle et apprentissage automatique',
      orcid: '0000-0002-1825-0097',
      role: UserRole.AUTHOR,
      isVerified: true,
      isActive: true,
    //   researchInterests: ['Intelligence Artificielle', 'Machine Learning', 'Data Science']
    }
  })

  // Créer un reviewer exemple
  const reviewerPassword = await AuthService.hashPassword('Reviewer123!')
  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@revue.fr' },
    update: {},
    create: {
      email: 'reviewer@revue.fr',
      password: reviewerPassword,
      firstName: 'Pierre',
      lastName: 'Martin',
      title: 'Prof.',
      affiliation: 'CNRS',
      department: 'Laboratoire d\'Informatique',
      bio: 'Professeur et chercheur en algorithmique et complexité',
      role: UserRole.REVIEWER,
      isVerified: true,
      isActive: true,
    //   researchInterests: ['Algorithmes', 'Complexité', 'Optimisation']
    }
  })

  // Créer quelques templates d'email
  const emailTemplates = [
    {
      name: 'welcome',
      subject: 'Bienvenue sur la plateforme',
      body: 'Bonjour {{firstName}},\n\nBienvenue sur notre plateforme de publication scientifique...',
      variables: { firstName: 'string', lastName: 'string' }
    },
    {
      name: 'submission_received',
      subject: 'Réception de votre soumission',
      body: 'Votre article "{{title}}" a été reçu et sera évalué...',
      variables: { title: 'string', submissionId: 'string' }
    },
    {
      name: 'review_request',
      subject: 'Demande d\'évaluation',
      body: 'Vous avez été invité à évaluer l\'article "{{title}}"...',
      variables: { title: 'string', deadline: 'date' }
    }
  ]

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template
    })
  }

  // Créer quelques paramètres système
  const settings = [
    {
      key: 'site_name',
      value: 'Revue Française d\'Informatique',
      description: 'Nom du site'
    },
    {
      key: 'max_file_size',
      value: '10485760',
      description: 'Taille maximum des fichiers en bytes (10MB)'
    },
    {
      key: 'review_deadline_days',
      value: '30',
      description: 'Délai par défaut pour les reviews en jours'
    },
    {
      key: 'auto_assignment',
      value: 'false',
      description: 'Attribution automatique des reviewers'
    }
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`
📊 Created:
- ${categories.length} categories
- 1 journal with 1 issue
- 3 users (admin, author, reviewer)
- ${emailTemplates.length} email templates
- ${settings.length} system settings

🔐 Test accounts:
- Admin: admin@revue.fr / Admin123!
- Author: auteur@revue.fr / Author123!  
- Reviewer: reviewer@revue.fr / Reviewer123!
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
