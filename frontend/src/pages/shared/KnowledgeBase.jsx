import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, BookOpen, ThumbsUp, ThumbsDown, Tag, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { StaggerContainer, AnimatedListItem } from '../../components/motion/StaggerContainer';
import { CardSkeleton } from '../../components/motion/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';

const KnowledgeBase = ({ title = "Knowledge Base", hideActions = false }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get('/knowledge');
        setArticles(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load knowledge base');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.problemDescription.toLowerCase().includes(search.toLowerCase())
  );

  const canManage = ['admin', 'manager', 'technician'].includes(user?.role);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">Find answers to common questions and issues.</p>
        </div>
        {canManage && !hideActions && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Create Article
            </button>
          </motion.div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search for answers..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 pl-10 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-base" 
        />
      </div>

      <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-48" />
        </motion.div>
      ) : filteredArticles.length === 0 ? (
        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center text-muted-foreground bg-card rounded-xl border border-dashed">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>No articles found matching your search.</p>
        </motion.div>
      ) : (
        <StaggerContainer key="grid" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map(article => (
            <AnimatedListItem key={article._id} className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer group">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {article.problemDescription}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {article.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      <Tag className="h-3 w-3 mr-1" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
                <span>By {article.author?.name || 'Unknown'}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {article.helpfulCount || 0}</span>
                  <span className="flex items-center gap-1"><ThumbsDown className="h-3.5 w-3.5" /> {article.notHelpfulCount || 0}</span>
                </div>
              </div>
            </AnimatedListItem>
          ))}
        </StaggerContainer>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default KnowledgeBase;
