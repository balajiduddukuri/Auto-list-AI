import React, { useState, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Copy, Check, RefreshCw, Wand2, Loader2, Upload } from 'lucide-react';
import { generateListing, analyzeImage } from '../services/gemini';
import { ProductListing, GenerationState } from '../types';

interface GeneratorProps {
  initialProduct?: string;
}

const Generator: React.FC<GeneratorProps> = ({ initialProduct }) => {
  const [productName, setProductName] = useState(initialProduct || '');
  const [tone, setTone] = useState('Persuasive & Professional');
  const [context, setContext] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<string>('');
  
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        
        // Auto-analyze image upon upload
        setIsAnalyzingImage(true);
        try {
          // Extract base64 data only (remove prefix)
          const base64Data = base64.split(',')[1];
          const analysis = await analyzeImage(base64Data, file.type);
          setImageAnalysis(analysis);
          setContext((prev) => (prev ? `${prev}\n\nVisual Analysis: ${analysis}` : `Visual Analysis: ${analysis}`));
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!productName) return;

    setState({ isLoading: true, error: null, data: null });

    try {
      let imageBase64Data = undefined;
      let mimeType = undefined;

      if (imagePreview && imageFile) {
        imageBase64Data = imagePreview.split(',')[1];
        mimeType = imageFile.type;
      }

      const listing = await generateListing(productName, tone, context, imageBase64Data, mimeType);
      setState({ isLoading: false, error: null, data: listing });
    } catch (err) {
      setState({ isLoading: false, error: (err as Error).message, data: null });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
      {/* Input Column */}
      <div className="lg:col-span-5 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Wand2 className="text-purple-600" size={20} />
            Listing Configuration
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name / Title</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Ergonomic Office Chair"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tone of Voice</label>
            <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
                <option>Persuasive & Professional</option>
                <option>Fun & Energetic</option>
                <option>Luxury & Minimalist</option>
                <option>Technical & Informative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Image (Optional)</label>
            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    imagePreview ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }`}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                
                {imagePreview ? (
                    <div className="relative h-48 w-full">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); setImageAnalysis(''); }}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full translate-x-1/3 -translate-y-1/3 hover:bg-red-600"
                        >
                            <span className="sr-only">Remove</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        {isAnalyzingImage && (
                             <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-md">
                                <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                                    <Loader2 className="animate-spin" size={16} />
                                    Analyzing with Gemini Vision...
                                </div>
                             </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <UploadCloud size={24} />
                        </div>
                        <div className="text-sm text-slate-600">
                            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                    </div>
                )}
            </div>
            {imageAnalysis && !isAnalyzingImage && (
                <div className="mt-2 p-3 bg-purple-50 border border-purple-100 rounded-lg text-xs text-purple-800">
                    <span className="font-bold flex items-center gap-1 mb-1"><Sparkles size={12}/> AI Analysis:</span>
                    {imageAnalysis.substring(0, 150)}...
                </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Context / Keywords</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Include keywords: eco-friendly, durable. Emphasize fast shipping."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white">
          <button
            onClick={handleGenerate}
            disabled={state.isLoading || !productName}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all transform active:scale-[0.98] ${
                state.isLoading || !productName 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg shadow-blue-500/30'
            }`}
          >
            {state.isLoading ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating Listing...
                </>
            ) : (
                <>
                    <Sparkles size={20} />
                    Generate Listing
                </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-7 h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs font-mono text-slate-400">preview.amazon.com</div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-8">
            {!state.data && !state.isLoading && !state.error && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                        <ImageIcon size={32} />
                    </div>
                    <p className="text-lg font-medium">Ready to generate content</p>
                    <p className="text-sm max-w-xs text-center">Fill in the details on the left and hit Generate to see your AI-optimized listing here.</p>
                </div>
            )}

            {state.isLoading && (
                <div className="space-y-6 animate-pulse">
                    <div className="h-8 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    </div>
                    <div className="h-32 bg-slate-100 rounded w-full"></div>
                </div>
            )}
            
            {state.error && (
                <div className="h-full flex flex-col items-center justify-center text-red-500">
                    <p>Error: {state.error}</p>
                    <button onClick={handleGenerate} className="mt-4 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Try Again</button>
                </div>
            )}

            {state.data && (
                <div className="animate-fade-in space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{state.data.title}</h1>
                        <div className="text-xl text-red-700 font-medium mb-1">{state.data.suggestedPrice}</div>
                        <div className="text-sm text-green-600 font-medium">In Stock.</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">About this item</h3>
                        <ul className="space-y-2">
                            {state.data.bullets.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                    <span className="mt-1.5 min-w-[6px] min-h-[6px] rounded-full bg-slate-400"></span>
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                         <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Product Description</h3>
                         <div 
                            className="prose prose-sm prose-slate max-w-none text-slate-600"
                            dangerouslySetInnerHTML={{ __html: state.data.description }} 
                         />
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                         <h3 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wide">Backend Keywords (SEO)</h3>
                         <div className="flex flex-wrap gap-2">
                            {state.data.keywords.map((kw, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                    {kw}
                                </span>
                            ))}
                         </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>

  );
};

const UploadCloud = ({ size = 24 }: { size?: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
);

export default Generator;
