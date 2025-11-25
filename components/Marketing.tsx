import React, { useState } from 'react';
import { Clapperboard, Sparkles, Film, Image as ImageIcon, Video, Loader2, Copy, Check, ChevronRight } from 'lucide-react';
import { generateMarketingConcepts, generateStoryboard, generateSceneImage } from '../services/gemini';
import { StoryboardScene } from '../types';

interface MarketingProps {
  initialProduct?: string;
}

const Marketing: React.FC<MarketingProps> = ({ initialProduct }) => {
  const [productName, setProductName] = useState(initialProduct || '');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string>('');
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Brainstorm
  const handleBrainstorm = async () => {
    if (!productName) return;
    setIsLoading(true);
    try {
      const results = await generateMarketingConcepts(productName);
      setConcepts(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Generate Storyboard
  const handleGenerateStoryboard = async (concept: string) => {
    setSelectedConcept(concept);
    setIsLoading(true);
    try {
      const results = await generateStoryboard(productName, concept);
      setScenes(results);
      setStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Render Assets
  const handleRenderSceneImages = async (index: number) => {
    const newScenes = [...scenes];
    newScenes[index].isGenerating = true;
    setScenes(newScenes);

    try {
      // Parallel generation for speed
      const [startImg, endImg] = await Promise.all([
        generateSceneImage(newScenes[index].startFramePrompt + " Aspect ratio 16:9. Photorealistic, cinematic 4k."),
        generateSceneImage(newScenes[index].endFramePrompt + " Aspect ratio 16:9. Photorealistic, cinematic 4k.")
      ]);

      newScenes[index].startImage = startImg;
      newScenes[index].endImage = endImg;
    } catch (e) {
      console.error(e);
    } finally {
      newScenes[index].isGenerating = false;
      setScenes([...newScenes]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Clapperboard className="text-purple-600" /> 
            Marketing Studio
          </h1>
          <p className="text-slate-500 mt-1">Create viral video campaigns with AI-generated storyboards and assets.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
           <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100'}`}>1. Strategy</span>
           <ChevronRight size={16}/>
           <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100'}`}>2. Storyboard</span>
           <ChevronRight size={16}/>
           <span className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100'}`}>3. Production</span>
        </div>
      </div>

      {step === 1 && (
        <div className="max-w-3xl mx-auto w-full space-y-8 mt-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <label className="block text-lg font-semibold text-slate-800 mb-2">What product are we promoting?</label>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. Self-Heating Coffee Mug"
                        className="flex-1 px-4 py-3 text-lg rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <button 
                        onClick={handleBrainstorm}
                        disabled={isLoading || !productName}
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin"/> : <Sparkles />}
                        Brainstorm
                    </button>
                </div>
            </div>

            {concepts.length > 0 && (
                <div className="grid gap-4">
                    <h3 className="font-bold text-slate-700 text-lg">Select a Campaign Concept:</h3>
                    {concepts.map((concept, i) => (
                        <button 
                            key={i}
                            onClick={() => handleGenerateStoryboard(concept)}
                            className="bg-white p-6 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all text-left group"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-slate-800 group-hover:text-purple-700">{concept}</span>
                                <ChevronRight className="text-slate-300 group-hover:text-purple-500" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedConcept}</h2>
                    <p className="text-sm text-slate-500">5-Scene Storyboard generated by Gemini</p>
                 </div>
                 <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-800 underline">Change Concept</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-12 pr-4 pb-12">
                {scenes.map((scene, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-700 flex items-center gap-2">
                                <span className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs">
                                    {scene.sceneNumber}
                                </span>
                                Scene {scene.sceneNumber}
                            </span>
                            {!scene.startImage && (
                                <button 
                                    onClick={() => handleRenderSceneImages(idx)}
                                    disabled={scene.isGenerating}
                                    className="text-sm px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                                >
                                    {scene.isGenerating ? <Loader2 className="animate-spin" size={14}/> : <ImageIcon size={14}/>}
                                    Generate Assets
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                            {/* Start Frame */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Start Frame</span>
                                    <button onClick={() => copyToClipboard(scene.startFramePrompt)} className="text-slate-400 hover:text-blue-600"><Copy size={14}/></button>
                                </div>
                                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative group">
                                    {scene.startImage ? (
                                        <img src={scene.startImage} alt="Start Frame" className="w-full h-full object-cover" />
                                    ) : (
                                        <p className="text-slate-400 text-xs px-4 text-center">{scene.startFramePrompt.substring(0, 100)}...</p>
                                    )}
                                </div>
                            </div>

                            {/* Motion / Transition */}
                            <div className="p-6 space-y-4 bg-purple-50/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1"><Video size={12}/> Motion Prompt</span>
                                    <button onClick={() => copyToClipboard(scene.videoMotionPrompt)} className="text-purple-400 hover:text-purple-600"><Copy size={14}/></button>
                                </div>
                                <p className="text-sm text-slate-700 italic leading-relaxed">
                                    "{scene.videoMotionPrompt}"
                                </p>
                                <div className="pt-4 border-t border-purple-100">
                                    <p className="text-xs text-slate-400 mb-2">Tools for Animation:</p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">Veo</span>
                                        <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">Kling AI</span>
                                        <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">Luma</span>
                                    </div>
                                </div>
                            </div>

                            {/* End Frame */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">End Frame</span>
                                    <button onClick={() => copyToClipboard(scene.endFramePrompt)} className="text-slate-400 hover:text-blue-600"><Copy size={14}/></button>
                                </div>
                                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                                    {scene.endImage ? (
                                        <img src={scene.endImage} alt="End Frame" className="w-full h-full object-cover" />
                                    ) : (
                                        <p className="text-slate-400 text-xs px-4 text-center">{scene.endFramePrompt.substring(0, 100)}...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;