import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  ExternalLink,
  BookOpen,
  Calendar,
  Eye,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useBlogStore, CreateBlogPost, BlogPost } from "@/store/blogStore";
import { useAuthStore } from "@/store/auth";
import RichTextEditor from "@/components/RichTextEditor";

const categories = ["All Categories", "Blog", "News", "Tutorial", "Guide"];
import FileUpload from "@/components/FileUpload";
import { Switch } from "@/components/ui/switch";

export default function Blogs() {
  const role = useAuthStore((state) => state.user?.role);
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    deletePost,
    updatePost,
    updatePostStatus,
    getImageUrl,
  } = useBlogStore();

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState<CreateBlogPost>({
    title: "",
    excerpt: "",
    author: "",
    category: "Blog",
    sub_category: "Educational",
    date: new Date().toISOString().split("T")[0],
    image: null,
    link: "",
  });

  // fetching on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // stripping HTML tags
  const stripHtmlTags = (html: string) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // excerpt preview
  const getExcerptPreview = (excerpt: string, maxLength: number = 100) => {
    const text = stripHtmlTags(excerpt);
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // filter and sort posts
  const filteredPosts = posts
    .filter((post) => {
      const matchesCategory =
        selectedCategory === "All Categories" ||
        post.category === selectedCategory;

      const searchLower = searchTerm.toLowerCase();
      const postTitle = (post.title || "").toLowerCase();
      const postExcerpt = stripHtmlTags(post.excerpt || "").toLowerCase();

      const matchesSearch =
        postTitle.includes(searchLower) || postExcerpt.includes(searchLower);

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  const handleCreatePost = async () => {
    if (isSubmitting) return;

    // required fields
    if (!newPost.title.trim()) {
      alert("Please enter a title for the blog post.");
      return;
    }

    if (!newPost.excerpt.trim()) {
      alert("Please enter content for the blog post.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPost) {
        // existing post
        await updatePost(
          {
            id: editingPost.id,
            ...newPost,
          },
          accessToken
        );
      } else {
        // new post
        await createPost(newPost, accessToken);
      }

      // reset
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save post:", error);
      alert(
        `Failed to ${editingPost ? "update" : "create"} post: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (post) {
      setEditingPost(post);
      setNewPost({
        title: post.title || "",
        excerpt: post.excerpt || "",
        author: post.author || "",
        category: post.category || "Blog",
        sub_category: post.sub_category || "Educational",
        date: post.date || new Date().toISOString().split("T")[0],
        image: null,
        link: post.link || "",
      });
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setIsSubmitting(false);
    setNewPost({
      title: "",
      excerpt: "",
      author: "",
      category: "Blog",
      sub_category: "Educational",
      date: new Date().toISOString().split("T")[0],
      image: null,
      link: "",
    });
  };

  const handleDeletePost = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(id, accessToken);
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete post. Please try again.");
      }
    }
  };

  const handleViewPost = (id: number) => {
    // new tab with the blog detail
    window.open(`/blogs/${id}`, "_blank");
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"));
  };

  const handleCreateNewPost = () => {
    setEditingPost(null);
    setNewPost({
      title: "",
      excerpt: "",
      author: "",
      category: "Blog",
      sub_category: "Educational",
      date: new Date().toISOString().split("T")[0],
      image: null,
      link: "",
    });
    setIsDialogOpen(true);
  };

  const uniqueCategories = [
    ...new Set(posts.map((post) => post.category).filter(Boolean)),
  ];

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading blogs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-600">
          <p>Error loading blogs: {error}</p>
          <Button onClick={fetchPosts} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Blog Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage blog content about carbon emissions and
            sustainability
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCreateNewPost}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] bg-background border max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-center">
              <DialogTitle>
                {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
              </DialogTitle>
              <DialogDescription>
                {editingPost
                  ? "Update the blog post details"
                  : "Write a new blog post about carbon emissions and sustainability"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 px-4">
              <div className="grid grid-cols-1 gap-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <FileUpload
                    value={newPost.image}
                    onChange={(file) => setNewPost({ ...newPost, image: file })}
                    accept="image/*"
                    label="Featured Image (Optional)"
                    description={
                      editingPost
                        ? "Current image will be replaced if you upload a new one."
                        : ""
                    }
                  />
                  {editingPost && (
                    <div className="text-sm text-muted-foreground">
                      Current image will be replaced if you upload a new one.
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    placeholder="Enter post title..."
                    className="text-lg font-medium"
                    required
                  />
                </div>

                {/* Basic Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={newPost.author}
                      onChange={(e) =>
                        setNewPost({ ...newPost, author: e.target.value })
                      }
                      placeholder="Author name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newPost.date}
                      onChange={(e) =>
                        setNewPost({ ...newPost, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Category Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newPost.category}
                      onChange={(e) =>
                        setNewPost({ ...newPost, category: e.target.value })
                      }
                      placeholder="Category"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub_category">Sub Category</Label>
                    <Input
                      id="sub_category"
                      value={newPost.sub_category}
                      onChange={(e) =>
                        setNewPost({ ...newPost, sub_category: e.target.value })
                      }
                      placeholder="Sub category"
                      required
                    />
                  </div>
                </div>

                {/* Link Field */}
                <div className="space-y-2">
                  <Label htmlFor="link">External Link (Optional)</Label>
                  <Input
                    id="link"
                    type="url"
                    value={newPost.link}
                    onChange={(e) =>
                      setNewPost({ ...newPost, link: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>

                {/* Content with Rich Text Editor */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Blog Content</Label>
                  <RichTextEditor
                    value={newPost.excerpt}
                    onChange={(value) =>
                      setNewPost({ ...newPost, excerpt: value })
                    }
                    placeholder="Write your blog post content here. Use the toolbar to format text, add links, lists, and more..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-4 px-4 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePost}
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingPost ? "Updating..." : "Creating..."}
                  </>
                ) : editingPost ? (
                  "Update Post"
                ) : (
                  "Create Post"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {posts.length}
            </div>
            <p className="text-xs text-muted-foreground">All blog posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {uniqueCategories.length}
            </div>
            <p className="text-xs text-muted-foreground">Unique categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {
                posts.filter((post) => {
                  const postDate = new Date(post.date);
                  const currentDate = new Date();
                  return (
                    postDate.getMonth() === currentDate.getMonth() &&
                    postDate.getFullYear() === currentDate.getFullYear()
                  );
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Posts this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent</CardTitle>
            <Eye className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {
                posts.filter((post) => {
                  const postDate = new Date(post.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return postDate >= weekAgo;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>Manage your blog content and posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={toggleSortOrder}
              className="w-48"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOrder === "latest" ? "Latest First" : "Oldest First"}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub-Category</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {getImageUrl(post) ? (
                        <img
                          src={getImageUrl(post)!}
                          alt={post.title || "Blog post"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.parentElement!.innerHTML =
                              '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-lg">
                      <div className="font-medium line-clamp-2">
                        {stripHtmlTags(post.title || "")}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {getExcerptPreview(post.excerpt || "", 150)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">
                        {post.category || "Uncategorized"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{post.sub_category}</TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>
                    {role === "super_admin" ? (
                      <Switch
                        checked={post.is_active}
                        onCheckedChange={async (checked) => {
                          try {
                            await updatePostStatus(
                              post.id,
                              checked,
                              accessToken!
                            );
                          } catch (err) {
                            console.error("Failed to update status:", err);
                          }
                        }}
                      />
                    ) : (
                      <Badge
                        variant={post.is_active ? "default" : "secondary"}
                        className={
                          post.is_active ? "bg-green-500" : "bg-gray-400"
                        }
                      >
                        {post.is_active ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPost(post.id)}
                        title="View post in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPost(post.id)}
                        title="Edit post"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No blog posts found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}