import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DocumentCard from '../components/DocumentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, FileText, Sparkles, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await getDocuments();
      setDocuments(data);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Documents',
      value: documents.length,
      icon: FileText,
      color: 'violet',
    },
    {
      label: 'AI Summaries',
      value: documents.filter((d) => d.summary).length,
      icon: Sparkles,
      color: 'emerald',
    },
    {
      label: 'Total Pages',
      value: documents.reduce((acc, d) => acc + (d.pageCount || 0), 0),
      icon: TrendingUp,
      color: 'indigo',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {documents.length === 0
              ? 'Upload your first PDF to get started'
              : `You have ${documents.length} document${documents.length !== 1 ? 's' : ''} ready to analyze`}
          </p>
        </div>
        <Link to="/upload" id="upload-new-btn" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:block">Upload PDF</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5 flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                stat.color === 'violet'
                  ? 'bg-violet-600/20 border border-violet-500/20'
                  : stat.color === 'emerald'
                  ? 'bg-emerald-600/20 border border-emerald-500/20'
                  : 'bg-indigo-600/20 border border-indigo-500/20'
              }`}
            >
              <stat.icon
                className={`w-6 h-6 ${
                  stat.color === 'violet'
                    ? 'text-violet-400'
                    : stat.color === 'emerald'
                    ? 'text-emerald-400'
                    : 'text-indigo-400'
                }`}
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" text="Loading your documents..." />
        </div>
      ) : documents.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center mb-5">
            <FileText className="w-10 h-10 text-violet-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">No documents yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Upload your first PDF document to start extracting insights with AI-powered analysis.
          </p>
          <Link to="/upload" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Your First PDF
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Recent Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
