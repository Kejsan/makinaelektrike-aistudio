import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { BlogPost } from '../types';
import { getBlogPostBySlug } from '../services/api';

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const originalTitle = document.title;
    const metaElement = document.querySelector('meta[name="description"]');
    const originalMeta = metaElement?.getAttribute('content') ?? null;

    if (!slug) {
      setLoading(false);
      return () => {
        document.title = originalTitle;
        if (metaElement) {
          if (originalMeta === null) {
            metaElement.removeAttribute('content');
          } else {
            metaElement.setAttribute('content', originalMeta);
          }
        }
      };
    }

    setLoading(true);
    getBlogPostBySlug(slug).then(data => {
      setPost(data ?? null);
      setLoading(false);

      if (data) {
        document.title = `${data.title} | Makina Elektrike`;
        if (metaElement) {
          metaElement.setAttribute('content', data.metaDescription);
        }
      }
    });

    return () => {
      document.title = originalTitle;
      if (metaElement) {
        if (originalMeta === null) {
          metaElement.removeAttribute('content');
        } else {
          metaElement.setAttribute('content', originalMeta);
        }
      }
    };
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20 text-white">{t('blogPage.loading')}</div>;
  }

  if (!post) {
    return (
      <div className="py-20 text-center text-white">
        <p className="mb-6 text-xl">{t('blogPage.notFound')}</p>
        <Link to="/blog" className="inline-flex items-center px-5 py-2 border border-gray-cyan text-gray-cyan hover:bg-gray-cyan hover:text-navy-blue rounded-md transition-colors">
          <ArrowLeft size={18} className="mr-2" />
          {t('blogPage.backToList')}
        </Link>
      </div>
    );
  }

  return (
    <article className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center text-gray-cyan hover:text-white transition-colors mb-6">
          <ArrowLeft size={18} className="mr-2" />
          {t('blogPage.backToList')}
        </Link>

        <header className="space-y-4">
          <span className="inline-block px-4 py-1 text-sm uppercase tracking-wider bg-gray-cyan/10 text-gray-cyan rounded-full">
            {t('blogPage.categoryInsight')}
          </span>
          <h1 className="text-4xl font-extrabold text-white leading-tight">{post.title}</h1>
          <p className="text-lg text-gray-300 max-w-3xl">{post.metaDescription}</p>
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
            <span className="inline-flex items-center"><Calendar size={16} className="mr-2" />{post.date}</span>
            <span className="inline-flex items-center"><Clock size={16} className="mr-2" />{post.readTime}</span>
            <span className="inline-flex items-center"><Tag size={16} className="mr-2" />{post.author}</span>
          </div>
        </header>

        <div className="mt-10 rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <img src={post.imageUrl} alt={post.title} className="w-full h-[420px] object-cover" />
        </div>

        <div className="mt-12 space-y-10 text-gray-200">
          {post.sections.map((section, index) => (
            <section key={index}>
              {section.heading && (
                <h2 className="text-2xl font-semibold text-white mb-4 border-l-4 border-gray-cyan pl-4">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="mb-4 leading-relaxed text-lg text-gray-200">
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-4 space-y-2 list-disc list-inside text-gray-200">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-12">
          <div className="flex flex-wrap gap-2">
            {post.keywords.map(keyword => (
              <span key={keyword} className="px-3 py-1 text-sm rounded-full bg-white/5 border border-white/10 text-gray-300">
                #{keyword}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
};

export default BlogDetailPage;
