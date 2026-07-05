"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMyProfile } from "@/hooks/api/user/use-my-profile";
import {
  useGetFaqsByUser,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
} from "@/hooks/api/faq/use-faq";
import { Faq } from "@/lib/api/types";
import { useTranslations } from "next-intl";

export default function FaqManagementPage() {
  const t = useTranslations("Faq");
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const userId = profile?.id ?? "";

  const { data: faqs = [], isLoading } = useGetFaqsByUser(userId);
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  const openCreate = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingFaq) {
        await updateFaq.mutateAsync({ id: editingFaq.id, question, answer });
      } else {
        await createFaq.mutateAsync({ question, answer, userId });
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSave"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFaq.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToDelete"));
      setDeleteTarget(null);
    }
  };

  const isSaving = createFaq.isPending || updateFaq.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1">
          {t("title")}
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg text-white hover:bg-primary/60 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {isLoading && <p className="text-gray-500 text-sm">{t("loading")}</p>}

        {!isLoading && faqs.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">
            {t("noQuestions")}
          </p>
        )}

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {faq.question}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(faq)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(faq)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? t("editQuestion") : t("addQuestion")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("question")}
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t("questionPlaceholder")}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("answer")}
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={3}
                placeholder={t("answerPlaceholder")}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving || !question || !answer}
              className="w-full px-4 py-3 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? t("saving") : t("save")}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">
              {t("deleteQuestionTitle")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 text-center">
            {t("deleteDescription")}
          </p>
          <div className="flex gap-3 mt-4 flex-col sm:flex-row">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteFaq.isPending}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 order-2 sm:order-1"
            >
              {deleteFaq.isPending ? t("deleting") : t("deleteButton")}
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors order-1 sm:order-2"
            >
              {t("cancel")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
