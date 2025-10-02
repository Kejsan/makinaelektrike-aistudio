import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import { ArrowRight } from 'lucide-react';

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-cyan">
    <div className="overflow-hidden">
      <img className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" src={post.imageUrl} alt={post.title} />
    </div>
    <div className="p-6">
      <p className="text-sm text-gray-400">{post.date} &bull; by {post.author}</p>
      <h3 className="mt-2 text-xl font-bold text-white group-hover:text-gray-cyan transition-colors">{post.title}</h3>
      <p className="mt-3 text-gray-300 h-24 overflow-hidden">{post.excerpt}</p>
      <div className="mt-4">
        <Link to="/blog" className="text-gray-cyan font-semibold hover:underline group-hover:text-white transition-colors flex items-center">
          Read More <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform"/>
        </Link>
      </div>
    </div>
  </div>
);

export default BlogCard;
