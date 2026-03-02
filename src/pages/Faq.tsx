import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Faq, useFaqStore } from "@/store/faqStore";
import { useAuthStore } from "@/store/auth";

export default function Faqs() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { faqs, loading, error, fetchFaqs, createFaq, deleteFaq, updateFaq } =
    useFaqStore();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
  });

  const [editFaqId, setEditFaqId] = useState<number | null>(null);
  const [editFaq, setEditFaq] = useState({
    question: "",
    answer: "",
    is_active: true,
  });

  // fetching on mount
  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const totalFaqs = faqs.length;
  const publishedFaqs = faqs.filter((faq) => faq.is_active).length;
  const draftFaqs = faqs.filter((faq) => !faq.is_active).length;

  const handleCreateFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    setIsSubmitting(true);
    try {
      await createFaq(
        {
          question: newFaq.question.trim(),
          answer: newFaq.answer.trim(),
        },
        accessToken
      );
      setNewFaq({ question: "", answer: "" });
    } catch (error) {
      console.error("Failed to create FAQ:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditFaq = (faq: Faq) => {
    setEditFaqId(faq.id);
    setEditFaq({
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active,
    });
  };

  const handleSaveEditFaq = async () => {
    if (editFaqId === null) return;
    setIsSubmitting(true);
    try {
      await updateFaq(
        {
          id: editFaqId,
          question: editFaq.question.trim(),
          answer: editFaq.answer.trim(),
          is_active: editFaq.is_active,
        },
        accessToken
      );
      setEditFaqId(null);
    } catch (error) {
      console.error("Failed to update FAQ:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await deleteFaq(id, accessToken);
      } catch (error) {
        console.error("Failed to delete FAQ:", error);
      }
    }
  };

  const handleToggleFaq = async (id: number, currentStatus: boolean) => {
    try {
      await updateFaq(
        {
          id,
          is_active: !currentStatus,
        },
        accessToken
      );
    } catch (error) {
      console.error("Failed to toggle FAQ status:", error);
    }
  };

  // loading
  if (loading && faqs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading FAQs...</span>
      </div>
    );
  }

  // error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-600">
          <p>Error loading FAQs: {error}</p>
          <Button onClick={fetchFaqs} className="mt-4">
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
            Carbon Management FAQs
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and answer common questions for your knowledge base
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-carbon-gradient hover:bg-carbon-600">
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-background border">
            <DialogHeader className="text-center">
              <DialogTitle>Add New FAQ</DialogTitle>
              <DialogDescription>
                Provide a question and answer for your carbon management FAQ
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-4 max-h-96 overflow-y-auto px-4">
              <div className="space-y-2">
                <Label htmlFor="faq-q">Question</Label>
                <Input
                  id="faq-q"
                  value={newFaq.question}
                  onChange={(e) =>
                    setNewFaq({ ...newFaq, question: e.target.value })
                  }
                  placeholder="e.g., What is carbon offsetting?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faq-a">Answer</Label>
                <Textarea
                  id="faq-a"
                  value={newFaq.answer}
                  onChange={(e) =>
                    setNewFaq({ ...newFaq, answer: e.target.value })
                  }
                  placeholder="Provide a concise and informative answer."
                />
              </div>
            </div>
            <div className="flex justify-center px-4 pb-4">
              <Button
                onClick={handleCreateFaq}
                className="bg-carbon-gradient w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add FAQ"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
            <HelpCircle className="h-4 w-4 text-carbon-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-carbon-700">
              {totalFaqs}
            </div>
            <p className="text-xs text-muted-foreground">
              {publishedFaqs} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {publishedFaqs}
            </div>
            <p className="text-xs text-muted-foreground">
              {((publishedFaqs / totalFaqs) * 100 || 0).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {draftFaqs}
            </div>
            <p className="text-xs text-muted-foreground">
              {draftFaqs > 0 ? "Some content in draft" : "All published"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Accordion List */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ List</CardTitle>
          <CardDescription>
            Expand to view, edit, toggle publish, or delete FAQs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {faqs.map((faq) => (
              <li key={faq.id} className="py-3">
                <button
                  className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
                  onClick={() =>
                    setExpanded(expanded === faq.id ? null : faq.id)
                  }
                  aria-expanded={expanded === faq.id}
                >
                  <span className="font-medium text-base flex items-center gap-2">
                    {faq.question}
                    {!faq.is_active && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
                        Draft
                      </span>
                    )}
                  </span>
                  {expanded === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {/* Accordion body & CRUD actions */}
                {expanded === faq.id && (
                  <div className="mt-3 bg-muted/40 rounded p-4">
                    <div className="text-muted-foreground whitespace-pre-line mb-4">
                      {faq.answer}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={faq.is_active}
                          onCheckedChange={() =>
                            handleToggleFaq(faq.id, faq.is_active)
                          }
                          id={`faq-pub-${faq.id}`}
                        />
                        <Label htmlFor={`faq-pub-${faq.id}`}>
                          {faq.is_active ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-yellow-700">
                              <XCircle className="w-4 h-4" /> Draft
                            </span>
                          )}
                        </Label>
                      </div>
                      {/* Edit */}
                      <Dialog
                        open={editFaqId === faq.id}
                        onOpenChange={(open) => !open && setEditFaqId(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditFaq(faq)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] bg-background border">
                          <DialogHeader className="text-center">
                            <DialogTitle>Edit FAQ</DialogTitle>
                            <DialogDescription>
                              Update the question or answer
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 p-4 max-h-96 overflow-y-auto px-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-faq-q">Question</Label>
                              <Input
                                id="edit-faq-q"
                                value={editFaq.question}
                                onChange={(e) =>
                                  setEditFaq({
                                    ...editFaq,
                                    question: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-faq-a">Answer</Label>
                              <Textarea
                                id="edit-faq-a"
                                value={editFaq.answer}
                                onChange={(e) =>
                                  setEditFaq({
                                    ...editFaq,
                                    answer: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Switch
                                checked={editFaq.is_active}
                                onCheckedChange={() =>
                                  setEditFaq({
                                    ...editFaq,
                                    is_active: !editFaq.is_active,
                                  })
                                }
                                id="edit-faq-published"
                              />
                              <Label htmlFor="edit-faq-published">
                                {editFaq.is_active ? "Published" : "Draft"}
                              </Label>
                            </div>
                          </div>
                          <div className="flex justify-center px-4 pb-4 gap-2">
                            <Button
                              onClick={handleSaveEditFaq}
                              className="bg-carbon-gradient w-full"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                            <DialogClose asChild>
                              <Button variant="outline" className="w-full">
                                Cancel
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFaq(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
            {faqs.length === 0 && (
              <li className="py-6 text-center text-muted-foreground">
                No FAQs yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
