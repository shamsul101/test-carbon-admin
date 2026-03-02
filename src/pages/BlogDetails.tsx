import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBlogStore } from "../store/blogStore";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function BlogDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts, fetchPosts, getPostById } = useBlogStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        setError("No post ID provided");
        setLoading(false);
        return;
      }

      // Check if the post ID is valid
      const postId = parseInt(id);
      if (isNaN(postId)) {
        setError("Invalid post ID");
        setLoading(false);
        return;
      }

      try {
        // Always fetch posts if we don't have them or if we're looking for a specific post
        if (posts.length === 0 || !getPostById(postId)) {
          await fetchPosts();
        }
        
        // After fetching, check if we now have the post
        const post = getPostById(postId);
        if (!post) {
          setError("Post not found");
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    loadPost();
  }, [id, posts.length, fetchPosts, getPostById]);

  const post = id ? getPostById(parseInt(id)) : null;

  const handleGoBack = () => {
    navigate("/blogs");
  };

  const parseHTMLContent = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <span className="text-lg text-muted-foreground">Loading post...</span>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <span className="text-lg text-muted-foreground">
            {error || "Post not found."}
          </span>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-white min-h-[100vh] py-14 px-2">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          {/* Back link */}
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 mb-8 font-semibold text-green-600 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blogs
          </button>

          {/* Blog Card */}
          <article className="rounded-3xl overflow-hidden flex flex-col mb-8">
            {/* Image */}
            <div className="relative w-full">
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-[400px] sm:h-full object-cover object-center"
                  style={{
                    borderTopLeftRadius: "1.5rem",
                    borderTopRightRadius: "1.5rem",
                  }}
                />
              ) : post.image ? (
                <img
                  src={
                    post.image.startsWith("/media/")
                      ? `${import.meta.env.VITE_API_URL}${post.image}`
                      : post.image
                  }
                  alt={post.title}
                  className="w-full h-[400px] sm:h-full object-cover object-center"
                  style={{
                    borderTopLeftRadius: "1.5rem",
                    borderTopRightRadius: "1.5rem",
                  }}
                />
              ) : (
                <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              {/* Status badge */}
              {post.is_active && (
                <span className="absolute top-4 left-4 bg-green-600 text-white rounded-full px-4 py-2 text-xs font-bold uppercase shadow z-10">
                  Published
                </span>
              )}
            </div>

            {/* Main Content */}
            <div className="py-6 px-4 sm:p-10 flex flex-col">
              {/* Date & Category */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-[#767676] text-xs">{post.date}</span>
                <span className="text-[#179C3A] text-xs font-bold uppercase">
                  {post.category}
                </span>
              </div>

              {/* Title and Author */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#163820] mb-2">
                {post.title}
              </h1>

              {/* Blog Content */}
              <div
                className="prose-green max-w-none text-[#444] leading-relaxed"
                style={{
                  fontSize: "1.1rem",
                  lineHeight: "1.8",
                }}
                dangerouslySetInnerHTML={parseHTMLContent(post.excerpt)}
              />

              {/* External Link if exists */}
              {post.link && post.link.trim() && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-2 text-[#163820]">
                    External Source
                  </h3>
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#179C3A] hover:text-[#145c23] underline"
                  >
                    View Original Article
                  </a>
                </div>
              )}

              {/* Post Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#767676]">
                  <div>
                    <strong>Post ID:</strong> {post.id} |
                    <strong> Status:</strong>{" "}
                    {post.is_active ? " Published" : " Draft"}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGoBack}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Back to List
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-[#179C3A] text-white rounded-lg hover:bg-[#145c23] transition-colors"
                    >
                      Print Article
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Custom prose styles */}
      <style>{`
.prose-green ul li::marker,
.prose-green ol li::marker {
  color: #179c3a;
  font-size: 1.1em;
}

.prose-green ul li::marker {
  content: "• ";
}

.prose-green ol li::marker {
  font-weight: bold;
}

.prose-green h2,
.prose-green h3 {
  color: #179c3a;
  margin-top: 1.5rem;
  margin-bottom: 0.7em;
  font-weight: bold;
}

.prose-green h1 {
  color: #163820;
  margin-top: 1.5rem;
  margin-bottom: 0.7em;
  font-weight: bold;
}

.prose-green strong {
  color: #163820;
  font-weight: 700;
}

.prose-green a {
  color: #179c3a;
  text-decoration: underline;
}

.prose-green a:hover {
  color: #145c23;
}

.prose-green img {
  margin: 1.5rem 0 !important;
  border-radius: 1em;
  width: 100%;
  height: auto;
}

.prose-green p,
.prose-green ul,
.prose-green ol,
.prose-green pre,
.prose-green blockquote,
.prose-green h2,
.prose-green h3,
.prose-green h4 {
  margin-bottom: 1.4em;
}

.prose-green ul,
.prose-green ol {
  padding-left: 1.35em;
  margin-left: 0;
  list-style-position: outside;
}

.prose-green ul {
  list-style-type: disc;
}

.prose-green ol {
  list-style-type: decimal;
}

.prose-green li {
  margin-bottom: 0.5em;
  padding-left: 0.25em;
  display: list-item;
}

/* Handle nested lists */
.prose-green ul ul,
.prose-green ol ol,
.prose-green ul ol,
.prose-green ol ul {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding-left: 1.5em;
}

.prose-green ul ul {
  list-style-type: circle;
}

.prose-green ul ul ul {
  list-style-type: square;
}

.prose-green ol ol {
  list-style-type: lower-alpha;
}

.prose-green ol ol ol {
  list-style-type: lower-roman;
}

.prose-green ul ol {
  list-style-type: decimal;
}

.prose-green ol ul {
  list-style-type: disc;
}

.prose-green blockquote {
  border-left: 4px solid #179c3a;
  padding-left: 1em;
  margin-left: 0;
  font-style: italic;
  color: #555;
}

.prose-green code {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-size: 0.9em;
  color: #163820;
}

.prose-green pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.5em;
  padding: 1em;
  overflow-x: auto;
}

.prose-green table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
}

.prose-green th,
.prose-green td {
  border: 1px solid #e9ecef;
  padding: 0.5em;
  text-align: left;
}

.prose-green th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #163820;
}
      `}</style>
    </>
  );
}