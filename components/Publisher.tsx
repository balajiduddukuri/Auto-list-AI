import React, { useState } from 'react';
import { CheckCircle2, Store, ShoppingCart, Loader2, ExternalLink } from 'lucide-react';

const Publisher: React.FC = () => {
    const [status, setStatus] = useState<'IDLE' | 'PUBLISHING' | 'SUCCESS'>('IDLE');

    const handlePublish = () => {
        setStatus('PUBLISHING');
        // Simulate API delay
        setTimeout(() => {
            setStatus('SUCCESS');
        }, 2000);
    };

    if (status === 'SUCCESS') {
        return (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-6 animate-fade-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Published Successfully!</h2>
                <p className="text-slate-500 text-lg">Your listing is now live on the selected marketplaces. The sync process usually takes about 15 minutes to reflect globally.</p>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                     <button className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Store size={20} className="text-slate-600"/>
                        <span className="font-semibold text-slate-700">View on Amazon</span>
                        <ExternalLink size={16} className="text-slate-400" />
                     </button>
                     <button className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                        <ShoppingCart size={20} className="text-slate-600"/>
                        <span className="font-semibold text-slate-700">View on Shopify</span>
                        <ExternalLink size={16} className="text-slate-400" />
                     </button>
                </div>

                <button 
                    onClick={() => setStatus('IDLE')}
                    className="mt-8 text-blue-600 font-medium hover:underline"
                >
                    Create another listing
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
             <div>
                <h1 className="text-3xl font-bold text-slate-900">Publish to Marketplaces</h1>
                <p className="text-slate-500 mt-1">Review your integrations and push content live.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Integration Card 1 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Store className="text-orange-600" size={24}/>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-slate-800">Amazon Seller Central</h3>
                            <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Connected</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">North America (US, CA, MX)</p>
                        <div className="text-xs text-slate-400">Last sync: 2 mins ago</div>
                    </div>
                </div>

                {/* Integration Card 2 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="text-green-600" size={24}/>
                    </div>
                    <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-slate-800">Shopify Store</h3>
                            <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Connected</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Main Storefront</p>
                        <div className="text-xs text-slate-400">Last sync: 2 hours ago</div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Ready to Launch?</h2>
                        <p className="text-slate-400 text-sm">This will push the latest generated content to all active integrations.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">1 Listing</div>
                        <div className="text-slate-400 text-xs uppercase">Pending Upload</div>
                    </div>
                </div>

                <div className="h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
                    {status === 'PUBLISHING' && (
                        <div className="h-full bg-blue-500 animate-progress w-full origin-left duration-2000 transition-all"></div>
                    )}
                </div>

                <button 
                    onClick={handlePublish}
                    disabled={status === 'PUBLISHING'}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    {status === 'PUBLISHING' ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Syncing Data...
                        </>
                    ) : (
                        'Confirm & Publish'
                    )}
                </button>
            </div>
            
            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .animate-progress {
                    animation: progress 2s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Publisher;
