export const metadata = {
  title: "À propos",
  description: "À propos de Media Bayern",
};

export default function AProposPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">À propos de Media Bayern</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Media Bayern est votre source d&apos;information francophone dédiée au FC Bayern Munich.
        </p>

        <h2>Notre mission</h2>
        <p>
          Nous couvrons toute l&apos;actualité du club le plus titré d&apos;Allemagne : articles, mercato,
          matchs et compétitions. Notre objectif est de fournir une information de qualité aux
          supporters francophones du Bayern Munich.
        </p>

        <h2>Notre équipe</h2>
        <p>
          Une équipe de journalistes passionnés suit quotidiennement l&apos;actualité du club bavarois
          pour vous apporter les dernières nouvelles, analyses tactiques et informations sur le
          mercato.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question ou suggestion, n&apos;hésitez pas à nous contacter via notre{" "}
          <a href="/contact" className="text-[#E21C2A] hover:underline">
            formulaire de contact
          </a>
          .
        </p>
      </div>
    </div>
  );
}
