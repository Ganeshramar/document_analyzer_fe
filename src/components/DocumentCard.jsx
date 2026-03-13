import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, HardDrive, BookOpen } from 'lucide-react';

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const DocumentCard = ({ document }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/documents/${document._id}`)}
      className="card p-5 cursor-pointer hover:border-violet-600/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-200 hover:-translate-y-1 group animate-fade-in"
    >
      {/* Icon + Name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-all">
          <FileText className="w-6 h-6 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-100 truncate group-hover:text-violet-300 transition-colors text-sm leading-5">
            {document.originalName}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">PDF Document</p>
        </div>
      </div>

      {/* Summary badge */}
      {document.summary && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 font-medium">
            ✓ AI Summary Ready
          </span>
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5" />
          <span>{formatFileSize(document.fileSize)}</span>
        </div>
        {document.pageCount > 0 && (
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 col-span-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(document.createdAt)}</span>
        </div>
      </div>

      {/* Click Hint */}
      <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-600 group-hover:text-violet-500 transition-colors flex items-center gap-1">
        <span>Click to analyze →</span>
      </div>
    </div>
  );
};

export default DocumentCard;
