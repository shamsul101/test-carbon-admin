/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Indent,
  Outdent
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isUpdatingFromProp, setIsUpdatingFromProp] = useState(false);

  // Save cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      return {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      };
    }
    return null;
  };

  // Restore cursor position
  const restoreCursorPosition = (savedPosition: any) => {
    if (savedPosition && editorRef.current) {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        
        if (editorRef.current.contains(savedPosition.startContainer) && 
            editorRef.current.contains(savedPosition.endContainer)) {
          range.setStart(savedPosition.startContainer, savedPosition.startOffset);
          range.setEnd(savedPosition.endContainer, savedPosition.endOffset);
          
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      } catch (error) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && !isUpdatingFromProp) {
      const currentContent = editorRef.current.innerHTML;
      if (currentContent !== value) {
        const savedPosition = saveCursorPosition();
        setIsUpdatingFromProp(true);
        editorRef.current.innerHTML = value || '';
        
        setTimeout(() => {
          restoreCursorPosition(savedPosition);
          setIsUpdatingFromProp(false);
        }, 0);
      }
    }
  }, [value, isUpdatingFromProp]);

  const formatText = (command: string, value?: string) => {
    if (editorRef.current && !isUpdatingFromProp) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      onChange(editorRef.current.innerHTML);
    }
  };

  // Enhanced list handling
  const insertList = (ordered: boolean) => {
    if (!editorRef.current || isUpdatingFromProp) return;
    
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const currentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
      ? range.commonAncestorContainer.parentElement 
      : range.commonAncestorContainer as Element;
    
    // Check if we're already in a list
    const existingList = currentElement?.closest('ul, ol');
    const listItem = currentElement?.closest('li');
    
    if (existingList && listItem) {
      // We're in a list, toggle the list type or remove list formatting
      const isCurrentlyOrdered = existingList.tagName === 'OL';
      
      if ((ordered && isCurrentlyOrdered) || (!ordered && !isCurrentlyOrdered)) {
        // Same type, remove list formatting
        formatText('insertHTML', listItem.innerHTML);
      } else {
        // Different type, change list type
        const newListType = ordered ? 'insertOrderedList' : 'insertUnorderedList';
        formatText(newListType);
      }
    } else {
      // Not in a list, create new list
      const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
      formatText(command);
    }
  };

  // Handle indentation for nested lists
  const handleIndent = () => {
    if (!editorRef.current || isUpdatingFromProp) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const listItem = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
      ? range.commonAncestorContainer.parentElement?.closest('li')
      : (range.commonAncestorContainer as Element)?.closest('li');
    
    if (listItem) {
      const parentList = listItem.parentElement;
      const prevItem = listItem.previousElementSibling as HTMLLIElement;
      
      if (prevItem && parentList) {
        // Create nested list
        const isOrdered = parentList.tagName === 'OL';
        const newList = document.createElement(isOrdered ? 'ol' : 'ul');
        
        // Move current item to nested list
        newList.appendChild(listItem);
        
        // Check if previous item already has a nested list
        let existingNestedList = prevItem.querySelector('ul, ol');
        if (existingNestedList) {
          existingNestedList.appendChild(listItem);
        } else {
          prevItem.appendChild(newList);
        }
        
        // Update content
        onChange(editorRef.current.innerHTML);
        
        // Restore focus to the moved item
        setTimeout(() => {
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(listItem);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }, 0);
      }
    } else {
      // Regular indent for non-list items
      formatText('indent');
    }
  };

  // Handle outdentation for nested lists
  const handleOutdent = () => {
    if (!editorRef.current || isUpdatingFromProp) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const listItem = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
      ? range.commonAncestorContainer.parentElement?.closest('li')
      : (range.commonAncestorContainer as Element)?.closest('li');
    
    if (listItem) {
      const parentList = listItem.parentElement;
      const grandparentItem = parentList?.parentElement?.closest('li');
      const grandparentList = grandparentItem?.parentElement;
      
      if (grandparentItem && grandparentList) {
        // Move item to parent level
        const nextSibling = grandparentItem.nextElementSibling;
        if (nextSibling) {
          grandparentList.insertBefore(listItem, nextSibling);
        } else {
          grandparentList.appendChild(listItem);
        }
        
        // Clean up empty nested list
        if (parentList && parentList.children.length === 0) {
          parentList.remove();
        }
        
        onChange(editorRef.current.innerHTML);
        
        // Restore focus
        setTimeout(() => {
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(listItem);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }, 0);
      }
    } else {
      // Regular outdent for non-list items
      formatText('outdent');
    }
  };

  const handleInput = () => {
    if (editorRef.current && !isUpdatingFromProp) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl && editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.toString()) {
          formatText('createLink', linkUrl);
        } else {
          const link = document.createElement('a');
          link.href = linkUrl;
          link.textContent = linkUrl;
          link.target = '_blank';
          range.insertNode(link);
          
          range.setStartAfter(link);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      
      onChange(editorRef.current.innerHTML);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const insertHeading = (level: number) => {
    formatText('formatBlock', `h${level}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 'k':
          e.preventDefault();
          setShowLinkDialog(true);
          break;
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        handleOutdent();
      } else {
        handleIndent();
      }
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
  ];

  const alignmentButtons = [
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  const headingButtons = [
    { icon: Heading1, level: 1, title: 'Heading 1' },
    { icon: Heading2, level: 2, title: 'Heading 2' },
    { icon: Heading3, level: 3, title: 'Heading 3' },
  ];

  return (
    <div className={`border border-gray-300 rounded-lg relative ${className || ''}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-wrap">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          {toolbarButtons.map(({ icon: Icon, command, title }) => (
            <Button
              key={command}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText(command)}
              title={title}
              className="h-8 w-8 p-0"
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          {headingButtons.map(({ icon: Icon, level, title }) => (
            <Button
              key={level}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertHeading(level)}
              title={title}
              className="h-8 w-8 p-0"
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertList(false)}
            title="Bullet List"
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertList(true)}
            title="Numbered List"
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleIndent}
            title="Indent (Tab)"
            className="h-8 w-8 p-0"
          >
            <Indent className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleOutdent}
            title="Outdent (Shift+Tab)"
            className="h-8 w-8 p-0"
          >
            <Outdent className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          {alignmentButtons.map(({ icon: Icon, command, title }) => (
            <Button
              key={command}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText(command)}
              title={title}
              className="h-8 w-8 p-0"
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Other Formatting */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('formatBlock', 'blockquote')}
            title="Quote"
            className="h-8 w-8 p-0"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            title="Insert Link (Ctrl+K)"
            className="h-8 w-8 p-0"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('formatBlock', 'pre')}
            title="Code Block"
            className="h-8 w-8 p-0"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="min-h-32 p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset overflow-auto"
        style={{ minHeight: '150px' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute z-50 top-full left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg min-w-80">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL (https://example.com)"
              className="px-3 py-1 border border-gray-300 rounded flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  insertLink();
                } else if (e.key === 'Escape') {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={insertLink}
              className="bg-green-600 hover:bg-green-700"
            >
              Insert
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setShowLinkDialog(false);
                setLinkUrl('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        div[contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          line-height: 1.2;
        }
        
        div[contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
          line-height: 1.3;
        }
        
        div[contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
          line-height: 1.4;
        }
        
        div[contenteditable] blockquote {
          margin: 1em 0;
          padding: 0.8em 1em;
          border-left: 4px solid #10b981;
          background-color: #f0fdf4;
          font-style: italic;
          color: #374151;
          border-radius: 0 4px 4px 0;
        }
        
        div[contenteditable] pre {
          background: #f8fafc;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          border: 1px solid #e2e8f0;
          margin: 1em 0;
          font-size: 0.9em;
          line-height: 1.4;
        }
        
        div[contenteditable] ul, div[contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        div[contenteditable] ul {
          list-style-type: disc;
        }
        
        div[contenteditable] ol {
          list-style-type: decimal;
        }
        
        /* Nested list styling */
        div[contenteditable] ul ul {
          list-style-type: circle;
          margin: 0.5em 0;
        }
        
        div[contenteditable] ul ul ul {
          list-style-type: square;
        }
        
        div[contenteditable] ol ol {
          list-style-type: lower-alpha;
          margin: 0.5em 0;
        }
        
        div[contenteditable] ol ol ol {
          list-style-type: lower-roman;
        }
        
        /* Mixed nested lists */
        div[contenteditable] ul ol {
          list-style-type: decimal;
          margin: 0.5em 0;
        }
        
        div[contenteditable] ol ul {
          list-style-type: disc;
          margin: 0.5em 0;
        }
        
        div[contenteditable] li {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        
        div[contenteditable] p {
          margin: 0.8em 0;
          line-height: 1.6;
        }
        
        div[contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
          text-decoration-color: #93c5fd;
          text-underline-offset: 2px;
        }
        
        div[contenteditable] a:hover {
          color: #1d4ed8;
          text-decoration-color: #2563eb;
        }
        
        div[contenteditable] strong, div[contenteditable] b {
          font-weight: 600;
        }
        
        div[contenteditable] em, div[contenteditable] i {
          font-style: italic;
        }
        
        div[contenteditable] u {
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        
        div[contenteditable]:focus {
          outline: none;
        }
        
        div[contenteditable] br {
          content: "";
          display: block;
          margin: 0.5em 0;
        }
        
        div[contenteditable]:empty {
          color: #9ca3af;
        }
        
        div[contenteditable] > *:first-child {
          margin-top: 0;
        }
        
        div[contenteditable] > *:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}