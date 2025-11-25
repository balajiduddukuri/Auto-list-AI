import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Zap, LayoutTemplate, Clapperboard, 
  Image as ImageIcon, CheckCircle2, Loader2, 
  ChevronRight, Play, Share2, Copy, Rocket, 
  MonitorPlay, Store, Plus, Trash2, Settings, Globe, X, ShoppingBag
} from 'lucide-react';
import { generateListing, generateMarketingConcepts, generateStoryboard, generateSceneImage } from '../services/gemini';
import { ProductListing, StoryboardScene, ProductProject, AutomationStatus } from '../types';

interface ProductStudioProps {
  initialProduct?: string;
}

interface Marketplace {
  id: string;
  name: string;
  platform: string;
  connected: boolean;
  lastSync?: string;
}

const ProductStudio: React.FC<ProductStudioProps> = ({ initialProduct }) => {
  // --- State Management ---
  const [project, setProject] = useState<ProductProject>({
    productName: initialProduct || '',
    listing: null,
    marketingConcepts: [],
    selectedConcept: null,
    storyboard: [],
    status: 'IDLE',
    progress: 0
  });

  const [activeTab, setActiveTab] = useState<'LISTING' | 'MARKETING' | 'PUBLISH'>('LISTING');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  // --- Marketplace State ---
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([
    { id: '1', name: 'Amazon North America', platform: 'Amazon', connected: true, lastSync: '2 mins ago' },
    { id: '2', name: 'Main Shopify Store', platform: 'Shopify', connected: true, lastSync: '1 hour ago' }
  ]);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannel, setNewChannel] = useState({ platform: 'eBay', name: '', apiKey: '' });

  // --- Automation Engine ---
  const runAutomation = async () => {
    if (!project.productName) return;

    // 1. Start Analysis & Listing
    setProject(p => ({ ...p, status: 'ANALYZING', progress: 10 }));
    setActiveTab('LISTING');

    try {
      // Parallel: Generate Listing & Brainstorm Concepts
      const [listingData, concepts] = await Promise.all([
        generateListing(project.productName, 'Persuasive', 'Focus on viral features'),
        generateMarketingConcepts(project.productName)
      ]);

      setProject(p => ({
        ...p,
        listing: listingData,
        marketingConcepts: concepts,
        status: 'BRAINSTORMING',
        progress: 40
      }));

      // 2. Select Concept (Auto-select "Guerrilla" or first one)
      const bestConcept = concepts.find(c => c.toLowerCase().includes('guerrilla')) || concepts[0];
      setProject(p => ({ ...p, selectedConcept: bestConcept, status: 'STORYBOARDING', progress: 50 }));

      // 3. Generate Storyboard
      const scenes = await generateStoryboard(project.productName, bestConcept);
      setProject(p => ({ ...p, storyboard: scenes, status: 'RENDERING', progress: 70 }));
      setActiveTab('MARKETING');

      // 4. Render Assets (Sequential for stability, or parallel for speed)
      // We'll render the first scene immediately to show progress
      let updatedScenes = [...scenes];
      
      // Render Scene 1 first
      if (updatedScenes.length > 0) {
        updatedScenes[0].isGenerating = true;
        setProject(p => ({ ...p, storyboard: updatedScenes }));
        
        try {
            const [s1, e1] = await Promise.all([
                generateSceneImage(updatedScenes[0].startFramePrompt + " cinematic lighting, photorealistic, 4k, aspect ratio 16:9"),
                generateSceneImage(updatedScenes[0].endFramePrompt + " cinematic lighting, photorealistic, 4k, aspect ratio 16:9")
            ]);
            updatedScenes[0].startImage = s1;
            updatedScenes[0].endImage = e1;
            updatedScenes[0].isGenerating = false;
            setProject(p => ({ ...p, storyboard: [...updatedScenes], progress: 80 }));
        } catch (e) {
            console.error("Failed to render scene 1", e);
        }
      }

      // Render remaining scenes in background
      for (let i = 1; i < updatedScenes.length; i++) {
         updatedScenes[i].isGenerating = true;
         setProject(p => ({ ...p, storyboard: [...updatedScenes] }));
         try {
            const [start, end] = await Promise.all([
                generateSceneImage(updatedScenes[i].startFramePrompt + " cinematic lighting, photorealistic, 4k, aspect ratio 16:9"),
                generateSceneImage(updatedScenes[i].endFramePrompt + " cinematic lighting, photorealistic, 4k, aspect ratio 16:9")
            ]);
            updatedScenes[i].startImage = start;
            updatedScenes[i].endImage = end;
         } catch(e) { console.error(`Scene ${i} failed`, e)}
         updatedScenes[i].isGenerating = false;
         setProject(p => ({ ...p, storyboard: [...updatedScenes], progress: 80 + (i * 4) }));
      }

      setProject(p => ({ ...p, status: 'COMPLETE', progress: 100 }));

    } catch (error) {
      console.error("Automation failed", error);
      setProject(p => ({ ...p, status: 'IDLE', progress: 0 })); // Reset on fail for now
      alert("Automation encountered an error. Please try again.");
    }
  };

  // Auto-start if product is provided
  useEffect(() => {
    if (initialProduct && project.status === 'IDLE') {
      runAutomation();
    }
  }, [initialProduct]);

  const handleCopyListing = () => {
    if (!project.listing) return;
    const { title, suggestedPrice, bullets, description, keywords } = project.listing;
    
    const text = `
TITLE: ${title}
PRICE: ${suggestedPrice}

FEATURES:
${bullets.map(b => `• ${b}`).join('\n')}

DESCRIPTION:
${description}

KEYWORDS:
${keywords.join(', ')}`.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAddChannel = () => {
    if (!newChannel.name) return;
    setMarketplaces([...marketplaces, {
        id: Date.now().toString(),
        name: newChannel.name,
        platform: newChannel.platform,
        connected: true,
        lastSync: 'Just now'
    }]);
    setIsAddingChannel(false);
    setNewChannel({ platform: 'eBay', name: '', apiKey: '' });
  };

  const removeChannel = (id: string) => {
    setMarketplaces(marketplaces.filter(m => m.id !== id));
  };

  // --- UI Components ---

  const StatusBadge = () => {
    const map = {
        'IDLE': { color: 'bg-slate-100 text-slate-500', icon: Zap, text: 'Ready' },
        'ANALYZING': { color: 'bg-blue-100 text-blue-600', icon: Loader2, text: 'Analyzing Market...' },
        'DRAFTING': { color: 'bg-indigo-100 text-indigo-600', icon: LayoutTemplate, text: 'Drafting Copy...' },
        'BRAINSTORMING': { color: 'bg-purple-100 text-purple-600', icon: Sparkles, text: 'Ideating Concepts...' },
        'STORYBOARDING': { color: 'bg-pink-100 text-pink-600', icon: Clapperboard, text: 'Scripting Video...' },
        'RENDERING': { color: 'bg-orange-100 text-orange-600', icon: ImageIcon, text: 'Rendering Assets...' },
        'COMPLETE': { color: 'bg-green-100 text-green-600', icon: CheckCircle2, text: 'Studio Ready' },
    };
    const current = map[project.status];
    const Icon = current.icon;
    
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border border-transparent ${current.color} ${project.status !== 'IDLE' && project.status !== 'COMPLETE' ? 'animate-pulse' : ''}`}>
            <Icon size={14} className={project.status !== 'IDLE' && project.status !== 'COMPLETE' ? 'animate-spin' : ''} />
            {current.text}
        </div>
    );
  };

  const ProgressBar = () => (
    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
            style={{ width: `${project.progress}%` }}
        />
    </div>
  );

  const getPlatformIcon = (platform: string) => {
      switch(platform.toLowerCase()) {
          case 'amazon': return <Store className="text-orange-500" />;
          case 'shopify': return <ShoppingBag className="text-green-500" />;
          case 'tiktok': return <MonitorPlay className="text-black" />;
          case 'ebay': return <Globe className="text-blue-500" />;
          case 'etsy': return <Sparkles className="text-orange-600" />;
          default: return <Store className="text-slate-500" />;
      }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header / Command Bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    {project.productName || "New Project"}
                    <span className="text-slate-300 font-light">/</span>
                    <span className="text-slate-500 font-medium">Automation Studio</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">Unified workflow for Listing Generation & Video Marketing</p>
            </div>
            <div className="flex items-center gap-3">
                <StatusBadge />
                {project.status === 'IDLE' && project.productName && (
                    <button 
                        onClick={runAutomation}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg font-semibold hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-500/20 transition-all active:scale-95"
                    >
                        <Zap size={16} fill="currentColor" />
                        Run Auto-Pilot
                    </button>
                )}
            </div>
        </div>
        <ProgressBar />
        
        {/* Navigation Tabs */}
        <div className="flex gap-6 text-sm font-medium border-b border-transparent">
            <button 
                onClick={() => setActiveTab('LISTING')}
                className={`pb-2 transition-colors flex items-center gap-2 ${activeTab === 'LISTING' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <LayoutTemplate size={16} /> Listing Intelligence
            </button>
            <button 
                onClick={() => setActiveTab('MARKETING')}
                className={`pb-2 transition-colors flex items-center gap-2 ${activeTab === 'MARKETING' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Clapperboard size={16} /> Marketing Studio
            </button>
            <button 
                onClick={() => setActiveTab('PUBLISH')}
                className={`pb-2 transition-colors flex items-center gap-2 ${activeTab === 'PUBLISH' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Store size={16} /> Marketplace Sync
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-slate-50/50 p-6 relative">
        <div ref={scrollRef} className="h-full overflow-y-auto pr-2 space-y-8 pb-20">
            
            {/* --- LISTING VIEW --- */}
            {activeTab === 'LISTING' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                    {!project.listing && project.status !== 'IDLE' && (
                         <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                            <p>Analyzing product features and drafting copy...</p>
                         </div>
                    )}
                    
                    {project.listing && (
                        <>
                            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-6 gap-4">
                                    <h3 className="text-xl font-bold text-slate-800 flex-1">{project.listing.title}</h3>
                                    <button 
                                        onClick={handleCopyListing}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all text-xs font-semibold whitespace-nowrap"
                                    >
                                        {isCopied ? <CheckCircle2 size={14} className="text-green-500"/> : <Copy size={14}/>}
                                        {isCopied ? 'Copied' : 'Copy All'}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.listing.keywords.map((kw, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100 font-medium">{kw}</span>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Key Features</h4>
                                    <ul className="space-y-3">
                                        {project.listing.bullets.map((bullet, idx) => (
                                            <li key={idx} className="flex gap-3 text-slate-700 text-sm leading-relaxed">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-4">Product Description (HTML)</h4>
                                <div 
                                    className="prose prose-sm prose-slate max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100"
                                    dangerouslySetInnerHTML={{ __html: project.listing.description }} 
                                />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* --- MARKETING VIEW --- */}
            {activeTab === 'MARKETING' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Concept Selector */}
                    {project.marketingConcepts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {project.marketingConcepts.map((concept, idx) => (
                                <div 
                                    key={idx} 
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${project.selectedConcept === concept ? 'bg-purple-50 border-purple-500 shadow-md ring-1 ring-purple-200' : 'bg-white border-slate-200 hover:border-purple-300'}`}
                                    onClick={() => setProject(p => ({ ...p, selectedConcept: concept }))}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Concept {idx + 1}</span>
                                        {project.selectedConcept === concept && <CheckCircle2 size={16} className="text-purple-600" />}
                                    </div>
                                    <p className="font-medium text-slate-800 text-sm line-clamp-2">{concept}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Storyboard Feed */}
                    {project.storyboard.length > 0 ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-lg">Visual Storyboard</h3>
                                <button className="text-xs bg-black text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-slate-800">
                                    <Share2 size={12} /> Export to Kling AI
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-6">
                                {project.storyboard.map((scene, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
                                        {/* Scene Info */}
                                        <div className="p-4 bg-slate-50 border-r border-slate-100 w-full md:w-48 flex-shrink-0 flex flex-col justify-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Scene {idx + 1}</span>
                                            <div className="text-sm font-semibold text-slate-700">Action Sequence</div>
                                            <p className="text-xs text-slate-500 mt-2 italic leading-relaxed">"{scene.videoMotionPrompt}"</p>
                                        </div>

                                        {/* Frames Container */}
                                        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Start Frame */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-slate-500">
                                                    <span>Start Frame (0s)</span>
                                                    <Copy size={12} className="cursor-pointer hover:text-blue-500" onClick={() => navigator.clipboard.writeText(scene.startFramePrompt)} />
                                                </div>
                                                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-100 relative group">
                                                    {scene.startImage ? (
                                                        <img src={scene.startImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                                            {scene.isGenerating ? <Loader2 className="animate-spin mb-2" /> : <ImageIcon className="mb-2 opacity-50"/>}
                                                            <span className="text-[10px] leading-tight opacity-70">{scene.startFramePrompt.slice(0, 80)}...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* End Frame */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-slate-500">
                                                    <span>End Frame (5s)</span>
                                                    <Copy size={12} className="cursor-pointer hover:text-blue-500" onClick={() => navigator.clipboard.writeText(scene.endFramePrompt)} />
                                                </div>
                                                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-100 relative group">
                                                    {scene.endImage ? (
                                                        <img src={scene.endImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                                            {scene.isGenerating ? <Loader2 className="animate-spin mb-2" /> : <ImageIcon className="mb-2 opacity-50"/>}
                                                            <span className="text-[10px] leading-tight opacity-70">{scene.endFramePrompt.slice(0, 80)}...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        project.status !== 'IDLE' && project.status !== 'ANALYZING' && project.status !== 'DRAFTING' && (
                             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Loader2 size={40} className="animate-spin mb-4 text-purple-500" />
                                <p>Storyboarding scenes and generating prompts...</p>
                             </div>
                        )
                    )}
                </div>
            )}

            {/* --- PUBLISH VIEW --- */}
            {activeTab === 'PUBLISH' && (
                <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fade-in">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Connected Channels</h2>
                            <p className="text-slate-500 text-sm">Manage where your listing and assets are syndicated.</p>
                        </div>
                        <button 
                            onClick={() => setIsAddingChannel(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                        >
                            <Plus size={16} /> Add Integration
                        </button>
                    </div>

                    {/* Channel Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {marketplaces.map((market) => (
                            <div key={market.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:border-blue-300 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                                        {getPlatformIcon(market.platform)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded">
                                            <Settings size={14} />
                                        </button>
                                        <button 
                                            onClick={() => removeChannel(market.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-800">{market.name}</h3>
                                <p className="text-xs text-slate-500 mb-4">{market.platform}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        Connected
                                    </span>
                                    <span className="text-[10px] text-slate-400">Sync: {market.lastSync || 'Never'}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Channel Modal / Form */}
                    {isAddingChannel && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-fade-in shadow-2xl">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 className="font-bold text-slate-900">Add New Integration</h3>
                                    <button onClick={() => setIsAddingChannel(false)} className="text-slate-400 hover:text-slate-600">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                                        <select 
                                            value={newChannel.platform}
                                            onChange={(e) => setNewChannel({...newChannel, platform: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="eBay">eBay</option>
                                            <option value="Etsy">Etsy</option>
                                            <option value="TikTok">TikTok Shop</option>
                                            <option value="Pinterest">Pinterest</option>
                                            <option value="WooCommerce">WooCommerce</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                                        <input 
                                            type="text"
                                            value={newChannel.name}
                                            onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                                            placeholder="e.g. My Etsy Craft Store"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">API Key (Optional)</label>
                                        <input 
                                            type="password"
                                            value={newChannel.apiKey}
                                            onChange={(e) => setNewChannel({...newChannel, apiKey: e.target.value})}
                                            placeholder="••••••••••••••••"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">We'll verify connectivity securely.</p>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                    <button 
                                        onClick={() => setIsAddingChannel(false)}
                                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleAddChannel}
                                        disabled={!newChannel.name}
                                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Connect Store
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sync Action */}
                    <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                         <div>
                            <h2 className="text-lg font-bold flex items-center gap-2"><Rocket size={20} className="text-yellow-400"/> Ready to Launch?</h2>
                            <p className="text-slate-400 text-sm mt-1">This will push the generated listing and assets to all {marketplaces.length} connected channels.</p>
                        </div>
                        <button className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-900/50">
                            Sync All Channels
                        </button>
                    </div>

                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductStudio;