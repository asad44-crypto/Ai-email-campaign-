
import React from 'react';
import type { Campaign } from '../types';

interface CampaignDisplayProps {
  campaign: Campaign | null;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
        <div className="h-48 bg-gray-700 rounded"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
    </div>
);

const CampaignDisplay: React.FC<CampaignDisplayProps> = ({ campaign, isLoading }) => {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!campaign) {
    return (
      <div className="text-center text-gray-500 py-16 border-2 border-dashed border-gray-700 rounded-lg">
        <p className="text-lg">Your generated campaign will appear here.</p>
        <p className="text-sm">Start by entering a prompt and clicking "Generate Campaign".</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-gray-900 rounded-lg">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Subject</h3>
        <p className="text-xl font-bold text-gray-100 bg-gray-800 p-3 rounded-md">{campaign.subject}</p>
      </div>
      
      {campaign.imageUrl ? (
        <img src={campaign.imageUrl} alt="Generated Campaign Visual" className="w-full h-auto rounded-lg shadow-lg object-cover" />
      ) : (
        <div className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
            <p className="text-gray-400">Generating image...</p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Body</h3>
        <div 
          className="prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 prose-a:text-cyan-400 whitespace-pre-wrap p-4 bg-gray-800 rounded-md"
        >
          {campaign.body}
        </div>
      </div>
    </div>
  );
};

export default CampaignDisplay;
