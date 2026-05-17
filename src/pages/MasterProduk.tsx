import React, { useState } from 'react';
import { Settings, Wifi, Smartphone, ArrowLeft, Search } from 'lucide-react';
import { ProductTable } from '../components/ProductTable';

const MasterProduk = ({ products, searchTerm, setSearchTerm, CATEGORIES, startEditing, navigateTo }: any) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigateTo('dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </button>
        <h1 className="text-xl font-bold">Master Produk Global</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari produk atau barcode..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Item Master</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Kategori & Spek</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Modal</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Jual</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
            </tr>
          </thead>
          <ProductTable 
             products={products} 
             searchTerm={searchTerm} 
             CATEGORIES={CATEGORIES} 
             startEditing={startEditing} 
          />
        </table>
      </div>
    </div>
  );
};

export default MasterProduk;
