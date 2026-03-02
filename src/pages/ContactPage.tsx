import { Mail, Upload, X, FileText, Paperclip } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import Swal from "sweetalert2";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/auth";

interface ContactForm {
  subject: string;
  issue_type: string;
  message: string;
  attachment: File | null;
}

const issueTypes = [
  { value: "billing", label: "Billing" },
  { value: "api", label: "API" },
  { value: "technical", label: "Technical" },
  { value: "other", label: "Other" },
];

// Upload Component
const FileUpload = ({
  value,
  onChange,
  accept = "*/*",
  className = "",
}: {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  className?: string;
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-[#f4f7ec] border border-[#d8e3c7] rounded-md hover:bg-[#eaf3e5] transition-colors">
            <Upload className="w-4 h-4 text-[#1a3323]" />
            <span className="text-sm text-[#1a3323]">Choose File</span>
          </div>
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Remove</span>
          </button>
        )}
      </div>

      {value && (
        <div className="flex items-center gap-3 p-3 bg-[#f4f7ec] border border-[#d8e3c7] rounded-md">
          <FileText className="w-5 h-5 text-[#1a3323] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1a3323] truncate">
              {value.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(value.size)}
            </p>
          </div>
        </div>
      )}

      {!value && (
        <div className="text-xs text-gray-500">
          Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG
        </div>
      )}
    </div>
  );
};

const ContactPage = () => {
  const [form, setForm] = useState<ContactForm>({
    subject: "",
    issue_type: "",
    message: "",
    attachment: null,
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const { user, fetchUserProfile, loading, error } = useUserStore();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessToken && !user) {
      fetchUserProfile(accessToken);
    }
  }, [accessToken, fetchUserProfile, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // required fields
      if (!form.subject.trim()) {
        throw new Error("Subject is required");
      }
      if (!form.issue_type) {
        throw new Error("Issue type is required");
      }
      if (!form.message.trim()) {
        throw new Error("Message is required");
      }

      // FormData
      const formData = new FormData();
      formData.append("subject", form.subject.trim());
      formData.append("issue_type", form.issue_type);
      formData.append("message", form.message.trim());

      // attachment if provided
      if (form.attachment) {
        formData.append("attachment", form.attachment);
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/articles/contact-admin/?type=contact_admin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Network response was not ok");
      }

      Swal.fire({
        title: "Form Submitted!",
        text: "Thank you for contacting us. We will get back to you soon.",
        icon: "success",
        confirmButtonColor: "#0a2d23",
        confirmButtonText: "OK",
      });

      // successful submission
      setForm({
        subject: "",
        issue_type: "",
        message: "",
        attachment: null,
      });
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        title: "Submission Failed",
        text: `Sorry, there was a problem submitting your message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        icon: "error",
        confirmButtonColor: "#0a2d23",
        confirmButtonText: "OK",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement
    >
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileChange = (file: File | null) => {
    setForm((prev) => ({
      ...prev,
      attachment: file,
    }));
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error loading user data: {error}
      </div>
    );
  }

  return (
    <section className="w-full bg-white flex items-center justify-center min-h-screen">
      <div className="w-full mx-auto grid md:grid-cols-2 gap-8">
        {/* Left Side */}
        <div className="flex flex-col">
          {/* Top: Hero */}
          <div className="rounded-t-2xl rounded-b-lg bg-[#0a2d23] p-8 md:p-10 text-left mb-2">
            <h1
              className="text-white text-4xl font-semibold mb-5 leading-tight"
              style={{ lineHeight: 1.1, fontWeight: 600 }}
            >
              Get in Touch with <span className="text-primary">Our Admin</span>
            </h1>
            <p className="text-[#eaf6e5] text-lg leading-relaxed">
              We'd love to learn more about your inquiry and how we can assist
              you. Fill out the form with your subject, issue type, and message,
              and we'll get back to you.
            </p>
          </div>

          {/* Middle: Direct Contact Message */}
          <div className="rounded-lg bg-[#eaf3e5] text-[#1a3323] text-lg px-6 py-4 mb-2">
            If you prefer, feel free to contact us directly via the emails
            listed below.
          </div>

          {/* Contact grid */}
          <div className="grid grid-cols-1 gap-2 mb-2">
            <div className="rounded-lg bg-white px-6 pt-3 pb-3">
              <div className="font-semibold text-[#1a3323] mb-1">
                General Inquiries
              </div>
              <div className="text-[#1a3323] text-base">
                hello@aiemissionlab.com
              </div>
            </div>
            <div className="rounded-lg bg-white px-6 pb-3">
              <div className="font-semibold text-[#1a3323] mb-1">Sales</div>
              <div className="text-[#1a3323] text-base">
                sales@aiemissionlab.com
              </div>
            </div>
            <div className="mb-4 text-[#1a3323] text-sm leading-relaxed">
              By submitting this form, you are consenting to Emission Lab is
              contacting you. For information on how to unsubscribe, as well as
              our privacy practices, check out our{" "}
              <a href="/terms" className="text-[#2357b4] underline">
                Terms And Conditions
              </a>
              .
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div
          className="rounded-2xl bg-white border border-[#d8e3c7] px-10 py-8 flex flex-col justify-start"
          style={{ minHeight: 640 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject field */}
            <div>
              <label
                className="block text-[#1a3323] font-medium mb-2"
                htmlFor="subject"
              >
                Subject <span className="text-[#ef4444]">*</span>
              </label>
              <input
                required
                id="subject"
                type="text"
                className="block w-full rounded-md border border-[#d8e3c7] bg-[#f4f7ec] px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary transition"
                value={form.subject}
                onChange={handleInputChange}
                placeholder="e.g., Carbon footprint tracking integration inquiry"
              />
            </div>

            {/* Issue Type field */}
            <div>
              <label
                className="block text-[#1a3323] font-medium mb-2"
                htmlFor="issue_type"
              >
                Issue Type <span className="text-[#ef4444]">*</span>
              </label>
              <select
                required
                id="issue_type"
                className="block w-full rounded-md border border-[#d8e3c7] bg-[#f4f7ec] px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary transition"
                value={form.issue_type}
                onChange={handleInputChange}
              >
                <option value="">Select an issue type</option>
                {issueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message field */}
            <div>
              <label
                className="block text-[#1a3323] font-medium mb-2"
                htmlFor="message"
              >
                Message <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                required
                id="message"
                rows={6}
                className="block w-full rounded-md border border-[#d8e3c7] bg-[#f4f7ec] px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary transition resize-none"
                value={form.message}
                onChange={handleInputChange}
                placeholder="e.g., We would like to schedule a demo next week. Please contact us at your earliest convenience."
                style={{ minHeight: 140 }}
              />
            </div>

            {/* Attachment field */}
            <div>
              <label
                className="block text-[#1a3323] font-medium mb-2"
                htmlFor="attachment"
              >
                <Paperclip className="inline w-4 h-4 mr-1" />
                Attachment (Optional)
              </label>
              <FileUpload
                value={form.attachment}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-primary hover:bg-primary/90 text-white font-bold justify-center text-base flex items-center gap-2 shadow-lg px-8 py-3 transition disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              <Mail className="w-4 h-4" />
              {submitting ? "Submitting..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
