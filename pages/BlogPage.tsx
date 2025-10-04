
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import BlogCard from '../components/BlogCard';
import { DataContext } from '../contexts/DataContext';

const BlogPage: React.FC = () => {
  const { t } = useTranslation();
  const { blogPosts, loading } = useContext(DataContext);

  if (loading) {
    return <div className="text-center py-10 text-white">Loading posts...</div>;
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white">{t('blogPage.title')}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">{t('blogPage.subtitle')}</p>
        </div>
        <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none">
          {blogPosts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;