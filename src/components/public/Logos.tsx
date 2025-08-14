"use client";
import { useArticles } from "@/src/hooks/useArticles";

interface Props {
  showLogos?: boolean;
}
const Logos: React.FC<Props> = ({ showLogos }) => {
  const { articles } = useArticles();
  return (
    <section id="logos" className="py-20 px-5 bg-background">
      <p className="text-2xl font-medium text-center">
        Avec plus de <span className="text-blue-500">{articles.length || 0}</span> article-s à
        votre disposition
      </p>
    </section>
  );
};

export default Logos;
