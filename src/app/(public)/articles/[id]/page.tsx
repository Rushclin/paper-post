// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import {
//   formatDate,
//   generateCitation,
//   getAuthorInfo,
//   getAuthorName,
// } from "@/src/utils/articleHelpers";
// import { Avatar } from "@/src/components/common/Avatar";
// import { Article } from "@/src/types/articles";
// import { CloudDownload, Loader2Icon, Share2 } from "lucide-react";
// import { Metadata } from "next";

// export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
//   try {
//     const response = await fetch(`/api/public/articles/${params.id}`);
//     const data = await response.json();
    
//     if (data.success && data.article) {
//       return {
//         title: data.article.title,
//         description: data.article.abstract,
//       };
//     }
//   } catch (error) {
//     console.error('Error fetching article for metadata:', error);
//   }
  
//   return {
//     title: 'Article',
//     description: 'Article scientifique',
//   };
// }

// export default function PublicArticlePage() {
//   const params = useParams();
//   const articleId = params.id as string;

//   const [article, setArticle] = useState<Article | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [citationFormat, setCitationFormat] = useState<
//     "apa" | "mla" | "chicago"
//   >("apa");

//   useEffect(() => {
//     fetchArticle();
//   }, [articleId]);

//   const fetchArticle = async () => {
//     try {
//       const response = await fetch(`/api/public/articles/${articleId}`);
//       const data = await response.json();

//       if (data.success) {
//         setArticle(data.article);
//       } else {
//         setError(data.message);
//       }
//     } catch (error) {
//       setError("Erreur lors du chargement de l'article");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: article?.title,
//         text: article?.abstract,
//         url: window.location.href,
//       });
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert("Lien copié dans le presse-papiers!");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader2Icon className="animate-spin text-slate-500" />
//       </div>
//     );
//   }

//   if (error || !article) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <div className="text-6xl mb-4">📄</div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-4 recoleta">
//             Article non trouve
//           </h1>
//           <p className="text-gray-600 mb-8">
//             {error || "Cet article n'existe pas ou n'est pas encore publié."}
//           </p>
//           <Link
//             href="/articles"
//             className="inline-flex items-center px-6 py-3 text-base font-medium border rounded-full"
//           >
//             Voir tous les articles
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pt-32">
//       <div className="bg-white shadow-sm">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
//                 {article.category.name}
//               </span>
//               <span className="text-sm text-gray-500">
//                 Publié le {formatDate(article.createdAt)}
//               </span>
//             </div>

//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={handleShare}
//                 className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
//                 title="Partager"
//               >
//                 <Share2 className="w-5 h-5" />
//               </button>

//               <button
//                 onClick={() => window.print()}
//                 className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
//                 title="Imprimer"
//               >
//                 <CloudDownload className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <article className="bg-white rounded-lg shadow-sm p-8">
//           <header className="mb-8">
//             <h1 className="text-xl font-bold text-gray-900 leading-tight mb-6">
//               {article.title}
//             </h1>

//             {article.doi && (
//               <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <p className="text-sm text-green-700">
//                   <strong>DOI:</strong>{" "}
//                   <Link
//                     href={`https://doi.org/${article.doi}`}
//                     className="text-green-600 hover:text-green-800 underline"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     {article.doi}
//                   </Link>
//                 </p>
//               </div>
//             )}

//             {article.journal && (
//               <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                 <p className="text-sm text-blue-700">
//                   <strong>Publié dans:</strong> {article.journal.name}
//                   {article.issue && (
//                     <span>
//                       {" "}
//                       - Vol. {article.issue.volume}, No. {article.issue.number}{" "}
//                       ({article.issue.year})
//                     </span>
//                   )}
//                   {article.journal.issn && (
//                     <span> - ISSN: {article.journal.issn}</span>
//                   )}
//                 </p>
//               </div>
//             )}
//           </header>

//           <section className="mb-8">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Auteurs
//             </h2>

//             <div className="space-y-4">
//               <Avatar
//                 name={`${getAuthorName(article)} (Auteur principal)`}
//                 tagline={getAuthorInfo(article)}
//               />

//               {/* {article.coAuthors.map((coAuthor) => (
//                 <Avatar
//                   name={getAuthorName(coAuthor.author)}
//                   tagline={getAuthorInfo(coAuthor.author)}
//                 />
//               ))} */}
//             </div>
//           </section>

//           <section className="mb-8">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
//             <div className="prose max-w-none">
//               <p className="text-gray-700 leading-relaxed text-justify">
//                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                   {article.abstract}
//                 </ReactMarkdown>
//               </p>
//             </div>
//           </section>

//           <section className="mb-8">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Mots-clés
//             </h2>
//             <div className="flex flex-wrap gap-2">
//               {(article.keywords || []).map((keyword, index) => (
//                 <span
//                   key={index}
//                   className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
//                 >
//                   {keyword}
//                 </span>
//               ))}
//             </div>
//           </section>

//           <section className="mb-8">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Article complet
//             </h2>
//             <div className="prose max-w-none">
//               <div className="prose prose-lg max-w-none">
//                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                   {article.content}
//                 </ReactMarkdown>
//               </div>
//             </div>
//           </section>

//           <section className="mb-8 p-6 bg-gray-50 rounded-lg">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-semibold text-gray-900 recoleta">
//                 Citation
//               </h2>
//               <select
//                 value={citationFormat}
//                 onChange={(e) => setCitationFormat(e.target.value as any)}
//                 className="px-3 py-1 border border-gray-300 rounded text-sm"
//               >
//                 <option value="apa">APA</option>
//                 <option value="mla">MLA</option>
//                 <option value="chicago">Chicago</option>
//               </select>
//             </div>
//             <div className="bg-white p-4 rounded border">
//               <p className="text-sm text-gray-700 font-mono">
//                 {generateCitation(article, citationFormat)}
//               </p>
//               <button
//                 onClick={() => {
//                   navigator.clipboard.writeText(
//                     generateCitation(article, citationFormat)
//                   );
//                   alert("Citation copiée!");
//                 }}
//                 className="mt-2 text-xs text-blue-600 hover:text-blue-800"
//               >
//                 Copier la citation
//               </button>
//             </div>
//           </section>
//         </article>

//         <div className="mt-12">
//           <h2 className="text-xl font-bold text-gray-900 mb-6 recoleta">
//             Articles similaires
//           </h2>
//           <div className="text-center py-8 text-gray-500">
//             <p>Articles similaires bientôt disponibles...</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import PublicArticlePage from "@/src/components/articles/PublicArticlePage";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/articles/${params.id}`, { cache: "no-store" });
    const data = await response.json();

    if (data.success && data.article) {
      return {
        title: data.article.title,
        description: data.article.abstract,
      };
    }
  } catch (error) {
    console.error("Error fetching article for metadata:", error);
  }

  return {
    title: "Article",
    description: "Article scientifique",
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <PublicArticlePage articleId={params.id} />;
}
