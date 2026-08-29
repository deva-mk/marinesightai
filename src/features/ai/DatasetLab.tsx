import React from 'react';
import { 
  Database, 
  Layers, 
  CheckCircle2, 
  Download, 
  FolderPlus, 
  UploadCloud, 
  Sparkles,
  PieChart
} from 'lucide-react';
import { DATASETS_DATA } from '../../data/sampleData';

export const DatasetLab: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20 uppercase">
              Training Corpora
            </span>
            <span className="text-xs text-[#736B5E]">Acoustic & Vision Dataset Warehouse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Marine Dataset Lab
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Standardized benchmark datasets for marine debris detection with COCO and Pascal-VOC annotations.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F6F52] text-white text-xs font-bold hover:bg-[#3E5841] transition-all shadow-xs">
          <FolderPlus className="w-4 h-4" />
          <span>Upload New Batch</span>
        </button>
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DATASETS_DATA.map((ds) => (
          <div key={ds.id} className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#736B5E]">{ds.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FF6F59]/15 text-[#FF6F59]">
                  {ds.format}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[#2A2A2A]">{ds.name}</h3>
              <p className="text-xs text-[#5C5449]">{ds.description}</p>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] text-xs">
                <div>
                  <span className="text-[10px] text-[#736B5E] uppercase font-bold">Total Samples</span>
                  <p className="text-base font-extrabold text-[#2A2A2A] mt-0.5">{ds.sampleCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#736B5E] uppercase font-bold">Train / Val / Test</span>
                  <p className="text-xs font-bold text-[#4F6F52] mt-1">{ds.splitRatio}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-[#736B5E] uppercase tracking-wider block mb-1">
                  Annotated Classes ({ds.classes.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {ds.classes.map((c, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-[#F2EDE4] text-[10px] font-medium text-[#2A2A2A]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2EDE4] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#8C8275]">Updated: {ds.lastUpdated}</span>
              <button className="font-bold text-[#FF6F59] hover:underline flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                <span>Export Dataset</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
