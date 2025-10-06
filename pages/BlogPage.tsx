
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBlogPosts } from '../services/api';
import { BlogPost } from '../types';
import BlogCard from '../components/BlogCard';

const BlogPage: React.FC = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBlogPosts()
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-white">{t('blogPage.loading')}</div>;
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white">{t('blogPage.title')}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">{t('blogPage.subtitle')}</p>
        </div>
        <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;