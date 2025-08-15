"use client";
import { useCategories } from "@/src/hooks/useCategories";

const Categories: React.FC = () => {
  const { categories } = useCategories();

  return (
    <section id="categories" className="py-12">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 recoleta">
          Toutes nos categories
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Rejoignez-nous et explorez un large choix de catégories d&apos;articles.
          Avec plus de{" "}
          <span className="font-semibold text-primary">
            {categories?.length || 0}
          </span>{" "}
          thèmes, nous avons tout pour nourrir votre apprentissage.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2 px-2">
        {(categories || []).map((categorie) => (
          <div
            key={categorie.id}
            className="border border-primary/20 bg-white shadow-sm hover:shadow-md transition rounded-full px-6 py-2 text-sm font-medium text-gray-700  hover:text-slate-500 cursor-pointer"
          >
            {categorie.name}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
