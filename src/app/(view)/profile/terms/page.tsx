"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditionsPage() {
  const router = useRouter();

  const termsContent = `
    Lorem elit sem iborium, es ost isorbis. Domec ort aft Milis, lectus officus odin feuillum cursum elit et nt viniculs. Morbi Num. Maile vernersis sollicitudin tortor, du non quam tic nibh tortor, sit vierrra citudin.

    massa tincidunt massa nisl, Ut et iobortis, nulla, sit ons laeur massa veneratis sed condistum in condiseum vel urn a oi it tortor. Quisque niort sit sit tortor. Currus nunc qui utticis vel plaernt dui, dill nio.

    tabortis, vehicula. Tempor Dolaisue sed felis, viss Sed velue dator vulputat in sed niun, massa sit porta nisi os, porta nibh, toriss efficinir. Num doa dolor sit non ent, lectus, verus ipsum plaernt, elementum rhyrauum. Veltictulium

    quam efficinur gravida nion, lectus, vehicula, nec id considium tiorbis tince. Nam faucibs odin sollicitudin torrus sed soluturlis, niun consequat. Sed nulla ac feubus donn Cos Finiguhin Nam Lorem adipiscing vel in Veletudum
  `.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          Terms and conditions
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
              {termsContent}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
