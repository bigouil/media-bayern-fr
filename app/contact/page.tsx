export const metadata = {
  title: "Contact",
  description: "Contactez Media Bayern",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Contactez-nous</h1>

      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold mb-2">
            Nom
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E21C2A] dark:bg-gray-900 dark:border-gray-700"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E21C2A] dark:bg-gray-900 dark:border-gray-700"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold mb-2">
            Sujet
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E21C2A] dark:bg-gray-900 dark:border-gray-700"
            placeholder="Sujet de votre message"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E21C2A] dark:bg-gray-900 dark:border-gray-700"
            placeholder="Votre message..."
          />
        </div>

        <button
          type="submit"
          className="w-full px-8 py-4 rounded-lg font-semibold text-white transition-colors"
          style={{ backgroundColor: "#E21C2A" }}
        >
          Envoyer le message
        </button>
      </form>

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-4">Autres moyens de nous contacter</h2>
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p>Email : contact@media-bayern.fr</p>
          <p>Twitter : @MediaBayern</p>
        </div>
      </div>
    </div>
  );
}
