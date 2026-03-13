import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentById, generateSummary, askQuestion } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ChatMessage from '../components/ChatMessage';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Send,
  RefreshCw,
  FileText,
  BookOpen,
  HardDrive,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  // Summary state
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showMeta, setShowMeta] = useState(true);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDocument = async () => {
    try {
      const { data } = await getDocumentById(id);
      setDocument(data);
      setSummary(data.summary || '');
      setMessages(data.chatHistory || []);
    } catch (err) {
      toast.error('Document not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const { data } = await generateSummary(id);
      setSummary(data.summary);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: question, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setChatLoading(true);

    try {
      const { data } = await askQuestion(id, question);
      const aiMsg = { role: 'assistant', content: data.answer, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get answer');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
      inputRef.current?.focus();
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading document..." />;
  if (!document) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Document Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-100 truncate">{document.originalName}</h1>
            <button
              onClick={() => setShowMeta(!showMeta)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400 mt-1 transition-colors"
            >
              {showMeta ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showMeta ? 'Hide details' : 'Show details'}
            </button>
          </div>
        </div>

        {showMeta && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-800 animate-fade-in">
            {[
              { icon: HardDrive, label: 'File Size', value: formatFileSize(document.fileSize) },
              { icon: BookOpen, label: 'Pages', value: document.pageCount > 0 ? `${document.pageCount} pages` : 'Unknown' },
              { icon: Calendar, label: 'Uploaded', value: new Date(document.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 bg-gray-800/50 rounded-xl p-3">
                <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-300">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6">
        {[
          { id: 'summary', label: 'AI Summary', icon: Sparkles },
          { id: 'chat', label: 'Chat with Document', icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-gray-100">AI Document Summary</h2>
            </div>
            <button
              id="generate-summary-btn"
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all ${
                summary
                  ? 'btn-secondary'
                  : 'btn-primary'
              }`}
            >
              {summaryLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {summary ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {summary ? 'Regenerate' : 'Generate Summary'}
                </>
              )}
            </button>
          </div>

          {summaryLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-gray-300 font-medium">Analyzing document with AI...</p>
                <p className="text-gray-500 text-sm mt-1">This may take 10–30 seconds</p>
              </div>
            </div>
          ) : summary ? (
            <div className="prose prose-invert prose-sm max-w-none bg-gray-800/40 rounded-xl p-5 border border-gray-700">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium mb-1">No summary yet</p>
              <p className="text-gray-600 text-sm mb-5">
                Click "Generate Summary" to get an AI-powered analysis of this document
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="card flex flex-col animate-fade-in" style={{ height: '600px' }}>
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-5 border-b border-gray-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-100">Chat with Document</h2>
              <p className="text-xs text-gray-500">Ask any question about the document content</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1">Start a conversation</p>
                  <p className="text-gray-600 text-sm max-w-xs">
                    Ask anything about the document — key points, definitions, summaries of specific sections, etc.
                  </p>
                </div>
                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {[
                    'What is the main topic?',
                    'List the key findings',
                    'Summarize the conclusion',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuestion(q)}
                      className="text-xs bg-gray-800 text-gray-400 border border-gray-700 rounded-full px-3 py-1.5 hover:border-violet-500/50 hover:text-violet-400 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => <ChatMessage key={idx} message={msg} />)
            )}

            {/* AI Typing Indicator */}
            {chatLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <form onSubmit={handleAskQuestion} className="flex gap-3">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the document..."
                className="input-field flex-1"
                disabled={chatLoading}
              />
              <button
                id="send-btn"
                type="submit"
                disabled={!question.trim() || chatLoading}
                className="btn-primary px-4 py-2.5 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:block">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailPage;
