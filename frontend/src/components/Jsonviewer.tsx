import { useState, useEffect } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';


type JsonViewerProps = {
  data: unknown[]; // can be any JSON-like data
};

function JsonViewer({ data } : JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlightedJson, setHighlightedJson] = useState('');

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (data) {
      setHighlightedJson(highlightJson(JSON.stringify(data, null, 2)));
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg">
        <span>No data available</span>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="relative bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-gray-800 px-4 py-2">
        <span className="text-xs font-mono text-gray-400">JSON Viewer</span>
        <div className="flex space-x-2">
          <button
            onClick={toggleExpand}
            className="text-xs px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center text-xs px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <CheckIcon className="h-3 w-3 mr-1 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* JSON Content */}
      <div
        className={`overflow-auto ${expanded ? 'max-h-[80vh]' : 'max-h-[60vh]'}`}
      >
        <pre className="p-4 text-sm font-mono">
          <code 
            className="language-json" 
            dangerouslySetInnerHTML={{ __html: highlightedJson }} 
          />
        </pre>
      </div>
    </div>
  );
}

function highlightJson(json : any) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  
  // Escape HTML tags to prevent XSS
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
    (match: any) => {
      let cls = 'text-gray-300';
      if (/:$/.test(match)) {
        cls = 'text-blue-400'; // keys
      } else if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-400'; // keys
        } else {
          cls = 'text-green-400'; // strings
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-400'; // booleans
      } else if (/null/.test(match)) {
        cls = 'text-gray-500'; // null
      } else if (/^-?\d+/.test(match)) {
        cls = 'text-yellow-400'; // numbers
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default JsonViewer;