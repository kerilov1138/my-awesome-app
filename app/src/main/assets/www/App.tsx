
import React, { useState, useEffect, useMemo } from 'react';
import { BankName, AccountType, CardCategory, BankCard, Transaction, MonthlyOverview } from './types';
import { ALL_CARDS, BANK_LOGOS } from './constants';
import { getNextStatementDate, formatTurkishDate, formatMonthYear, getMonthYearKey } from './utils/dateUtils';

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('finans_theme');
    return saved === 'dark';
  });

  // Navigation & Step State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); 
  const [reportTab, setReportTab] = useState<'calendar' | 'list'>('calendar');
  const [selectedBank, setSelectedBank] = useState<BankName | null>(null);
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [selectedCard, setSelectedCard] = useState<BankCard | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [showInstallments, setShowInstallments] = useState(false);
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Persistence State
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Verileri yükle
  useEffect(() => {
    const saved = localStorage.getItem('finans_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // Verileri otomatik kaydet
  useEffect(() => {
    localStorage.setItem('finans_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Tema ayarları
  useEffect(() => {
    localStorage.setItem('finans_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filteredCards = useMemo(() => {
    if (!selectedBank || !selectedType) return [];
    return ALL_CARDS.filter(c => c.bank === selectedBank && c.accountType === selectedType);
  }, [selectedBank, selectedType]);

  const resetFlow = () => {
    setSelectedBank(null);
    setSelectedType(null);
    setSelectedCard(null);
    setDescription('');
    setAmount('');
    setShowInstallments(false);
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
    setStep(1);
  };

  const handleBankSelect = (bank: BankName) => {
    setSelectedBank(bank);
    setStep(2);
  };

  const handleTypeSelect = (type: AccountType) => {
    if (type === AccountType.TICARI && selectedBank !== BankName.QNB && selectedBank !== BankName.ENPARA) {
      alert('Bu banka için ticari hesap seçeneği bulunmamaktadır.');
      return;
    }
    setSelectedType(type);
    setStep(3);
  };

  const handleCardSelect = (card: BankCard) => {
    setSelectedCard(card);
    setShowInstallments(false);
  };

  const saveTransaction = (newTx: Transaction) => {
    setTransactions(prev => {
      if (editingId) {
        return prev.map(t => t.id === editingId ? newTx : t);
      } else {
        return [...prev, newTx];
      }
    });
    resetFlow();
    setStep(4);
  };

  const handleContinueTransaction = () => {
    if (!selectedCard || !amount || parseFloat(amount.toString()) <= 0) return;
    
    const pickedDate = new Date(transactionDate);

    if (selectedCard.category === CardCategory.CREDIT) {
      setShowInstallments(true);
    } else {
      const newTx: Transaction = {
        id: editingId || crypto.randomUUID(),
        cardId: selectedCard.id,
        description: description || 'Harcama',
        totalAmount: parseFloat(amount.toString()),
        installments: 1,
        date: pickedDate.toISOString(),
        monthlyAmount: parseFloat(amount.toString()),
        firstPaymentDate: pickedDate.toISOString()
      };
      saveTransaction(newTx);
    }
  };

  const handleInstallmentSelect = (insCount: number) => {
    if (!selectedCard || !amount) return;

    const total = parseFloat(amount.toString());
    const monthly = total / insCount;
    const pickedDate = new Date(transactionDate);
    
    const firstDate = selectedCard.statementDay 
      ? getNextStatementDate(pickedDate, selectedCard.statementDay)
      : pickedDate;

    const newTx: Transaction = {
      id: editingId || crypto.randomUUID(),
      cardId: selectedCard.id,
      description: description || 'Taksitli Harcama',
      totalAmount: total,
      installments: insCount,
      date: pickedDate.toISOString(),
      monthlyAmount: monthly,
      firstPaymentDate: firstDate.toISOString()
    };

    saveTransaction(newTx);
  };

  const handleDeleteTransaction = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Bu harcamayı ve buna bağlı tüm aylık ödemeleri silmek istediğinizden emin misiniz?')) {
      setTransactions(prev => {
        const filtered = prev.filter(t => t.id !== id);
        // localStorage güncellenmesi useEffect tarafından otomatik yapılır
        return filtered;
      });
    }
  };

  const handleEditTransaction = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const card = ALL_CARDS.find(c => c.id === tx.cardId);
    if (!card) return;

    setEditingId(tx.id);
    setSelectedBank(card.bank);
    setSelectedType(card.accountType);
    setSelectedCard(card);
    setDescription(tx.description);
    setAmount(tx.totalAmount);
    setTransactionDate(new Date(tx.date).toISOString().split('T')[0]);
    setShowInstallments(tx.installments > 1);
    setStep(3);
  };

  const downloadPythonScript = () => {
    const pythonCode = `
import webview
import os

# Finans Takip Sistemi Masaüstü Versiyonu
# pip install pywebview

html_content = """
${document.documentElement.outerHTML}
"""

if __name__ == '__main__':
    window = webview.create_window(
        'Finans - Banka ve Taksit Takip',
        url='${window.location.href}',
        width=1200,
        height=900,
        resizable=True
    )
    webview.start()
`;
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Finans.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dashboardData = useMemo(() => {
    const summary: Record<string, MonthlyOverview> = {};
    const cardRemaining: Record<string, number> = {};

    transactions.forEach(tx => {
      const card = ALL_CARDS.find(c => c.id === tx.cardId);
      if (!card) return;

      const firstPaymentDate = new Date(tx.firstPaymentDate);
      const now = new Date();
      const startOfNow = new Date(now.getFullYear(), now.getMonth(), 1);
      
      for (let i = 0; i < tx.installments; i++) {
        const paymentDate = new Date(firstPaymentDate);
        paymentDate.setMonth(firstPaymentDate.getMonth() + i);
        
        if (paymentDate >= startOfNow) {
          const key = getMonthYearKey(paymentDate);
          if (!summary[key]) {
            summary[key] = {
              monthYear: formatMonthYear(paymentDate),
              totalAmount: 0,
              transactions: []
            };
          }

          summary[key].totalAmount += tx.monthlyAmount;
          summary[key].transactions.push({
            transactionId: tx.id,
            description: tx.description,
            cardName: card.name,
            amount: tx.monthlyAmount,
            installmentIndex: i + 1,
            totalInstallments: tx.installments
          });
        }
      }

      let remaining = 0;
      for (let i = 0; i < tx.installments; i++) {
        const pDate = new Date(firstPaymentDate);
        pDate.setMonth(firstPaymentDate.getMonth() + i);
        if (pDate >= new Date(now.getFullYear(), now.getMonth(), 1)) {
          remaining += tx.monthlyAmount;
        }
      }
      cardRemaining[card.id] = (cardRemaining[card.id] || 0) + remaining;
    });

    return { 
      monthly: Object.values(summary).sort((a, b) => a.monthYear.localeCompare(b.monthYear)),
      cardRemaining 
    };
  }, [transactions]);

  return (
    <div className={`min-h-screen transition-all duration-700 ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'} flex flex-col items-center py-8 px-4`}>
      <header className={`w-full max-w-4xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'} p-6 rounded-[2.5rem] shadow-2xl border`}>
        <div className="flex items-center gap-6">
          <div className="relative group overflow-visible">
            <img 
              src="https://i.imgur.com/k3NPbTV.png" 
              alt="Logo" 
              className={`w-20 h-20 md:w-24 md:h-24 object-contain transition-all duration-500 ${isDarkMode ? 'brightness-125' : ''}`}
              style={{ mixBlendMode: isDarkMode ? 'initial' : 'multiply' }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className={`text-3xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-blue-400' : 'text-slate-800'}`}>FİNANS</h1>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Takip Sistemi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-2xl border-2 transition-all duration-300 ${isDarkMode ? 'border-slate-700 bg-slate-700 text-yellow-400 hover:border-yellow-400/50' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-500'}`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => { resetFlow(); setStep(1); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              YENİ İŞLEM
            </button>
            <button 
              onClick={() => setStep(4)}
              className={`px-8 py-3 rounded-2xl font-black text-sm transition-all border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              RAPORLAR
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl">
        {step === 1 && (
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-10 rounded-[3rem] shadow-2xl border animate-in fade-in zoom-in duration-500`}>
            <h2 className="text-2xl font-black mb-12 text-center uppercase tracking-tighter">Banka Seçin</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {Object.entries(BANK_LOGOS).map(([name, logo]) => (
                <button
                  key={name}
                  onClick={() => handleBankSelect(name as BankName)}
                  className={`group flex flex-col items-center p-8 border-2 rounded-[2.5rem] transition-all duration-300 active:scale-95 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500 hover:bg-slate-700' : 'bg-white border-slate-50 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10'}`}
                >
                  <div className="h-24 w-full flex items-center justify-center mb-6">
                    <img 
                      src={logo} 
                      alt={name} 
                      className={`max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-110`} 
                      style={{ mixBlendMode: isDarkMode ? 'initial' : 'multiply' }}
                    />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-10 rounded-[3rem] shadow-2xl border animate-in slide-in-from-right duration-500`}>
            <button onClick={() => setStep(1)} className="text-xs font-black text-blue-500 mb-10 flex items-center gap-2 uppercase tracking-widest hover:text-blue-400">
              <span className="text-lg">←</span> Banka Değiştir
            </button>
            <h2 className="text-2xl font-black mb-12 uppercase tracking-tighter">Müşteri Tipi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button
                onClick={() => handleTypeSelect(AccountType.BIREYSEL)}
                className={`flex flex-col gap-6 p-10 border-2 rounded-[2.5rem] transition-all duration-300 group text-left ${isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500' : 'bg-white border-slate-50 hover:border-blue-500 hover:bg-blue-50/30'}`}
              >
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl ${isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>👤</div>
                <div>
                  <span className="block text-2xl font-black">BİREYSEL</span>
                  <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">Kişisel Hesap</span>
                </div>
              </button>
              {(selectedBank === BankName.QNB || selectedBank === BankName.ENPARA) && (
                <button
                  onClick={() => handleTypeSelect(AccountType.TICARI)}
                  className={`flex flex-col gap-6 p-10 border-2 rounded-[2.5rem] transition-all duration-300 group text-left ${isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500' : 'bg-white border-slate-50 hover:border-amber-500 hover:bg-amber-50/30'}`}
                >
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl ${isDarkMode ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>💼</div>
                  <div>
                    <span className="block text-2xl font-black">TİCARİ</span>
                    <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">Şirket Hesabı</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-10 rounded-[3rem] shadow-2xl border animate-in slide-in-from-right duration-500`}>
            <div className="flex justify-between items-center mb-12">
              <button onClick={() => setStep(2)} className="text-xs font-black text-blue-500 flex items-center gap-2 uppercase tracking-widest hover:text-blue-400 transition-colors">
                <span className="text-lg">←</span> Geri
              </button>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{selectedBank}</span>
                <span className="text-xs font-black text-blue-500 uppercase bg-blue-500/10 px-3 py-1 rounded-full">{selectedType}</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">
              {editingId ? 'Harcamayı Güncelle' : 'Kart Seçimi'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {filteredCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleCardSelect(card)}
                  className={`p-10 rounded-[2.5rem] border-2 text-left transition-all duration-300 ${
                    selectedCard?.id === card.id 
                      ? 'border-blue-600 bg-blue-500/10 shadow-2xl ring-4 ring-blue-500/20' 
                      : isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500' : 'border-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <span className="font-black text-xl leading-tight">{card.name}</span>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.1em] ${
                        card.category === CardCategory.CREDIT ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {card.category}
                      </span>
                      {card.statementDay && (
                        <span className={`text-[10px] px-4 py-1.5 rounded-full font-black border uppercase tracking-[0.1em] ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
                          Hesap Kesim: {card.statementDay}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedCard && (
              <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-100/50 border-slate-100'} p-12 rounded-[3rem] border animate-in fade-in zoom-in duration-700 shadow-inner`}>
                <div className="space-y-10 max-w-md mx-auto">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Harcama Adı / Açıklama</label>
                    <input 
                      type="text" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Örn: Market Alışverişi"
                      className={`w-full px-8 py-5 border-2 rounded-[1.5rem] focus:border-blue-500 outline-none font-bold transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">İşlem Tarihi</label>
                    <input 
                      type="date" 
                      value={transactionDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className={`w-full px-8 py-5 border-2 rounded-[1.5rem] focus:border-blue-500 outline-none font-bold transition-all cursor-pointer shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Toplam Tutar</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-16 py-5 border-2 rounded-[1.5rem] focus:border-blue-500 outline-none font-black text-3xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl">₺</span>
                    </div>
                  </div>
                  
                  {!showInstallments ? (
                    <button 
                      onClick={handleContinueTransaction}
                      disabled={!amount || parseFloat(amount.toString()) <= 0 || !description}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-blue-500/20 disabled:opacity-20 uppercase tracking-[0.2em] text-sm"
                    >
                      {selectedCard.category === CardCategory.CREDIT ? 'Taksitleri Ayarla' : (editingId ? 'Güncelle' : 'Harcamayı Kaydet')}
                    </button>
                  ) : (
                    <div className="animate-in slide-in-from-top duration-500">
                      <p className="text-[10px] font-black text-slate-500 mb-8 uppercase tracking-[0.3em] text-center">Taksit Seçenekleri (Otomatik Hesaplama)</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                          const monthly = parseFloat(amount.toString()) / num;
                          return (
                            <button
                              key={num}
                              onClick={() => handleInstallmentSelect(num)}
                              className={`p-5 border-2 rounded-2xl transition-all group flex flex-col items-center gap-1 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:bg-blue-600 shadow-md' : 'bg-white border-slate-100 hover:border-blue-600 hover:bg-blue-600 hover:text-white shadow-sm'}`}
                            >
                              <span className="block text-2xl font-black">{num}</span>
                              <span className="text-[9px] font-black opacity-40 group-hover:opacity-100 uppercase tracking-widest">Taksit</span>
                              <span className="text-[10px] font-black text-blue-500 group-hover:text-white">
                                {monthly.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {editingId && (
                    <button onClick={resetFlow} className="w-full mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-400">İptal</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12 animate-in fade-in duration-700 pb-24">
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setReportTab('calendar')}
                className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${reportTab === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
              >
                Aylık Takvim
              </button>
              <button 
                onClick={() => setReportTab('list')}
                className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${reportTab === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
              >
                Tüm Harcamalar
              </button>
            </div>

            {reportTab === 'calendar' ? (
              <div className="space-y-10">
                <h2 className="text-2xl font-black uppercase tracking-tighter ml-2">Gelecek Ayların Ödeme Planı</h2>
                {dashboardData.monthly.map((month) => (
                  <div key={month.monthYear} className={`rounded-[3.5rem] shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-800/80 border-slate-700 shadow-blue-900/10' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                    <div className={`${isDarkMode ? 'bg-slate-700/80' : 'bg-slate-900'} p-10 flex flex-col md:flex-row justify-between items-center gap-6 text-white`}>
                      <div className="flex flex-col gap-2 items-center md:items-start">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">EKSTRE AYI</span>
                        <span className="text-2xl font-black uppercase tracking-[0.1em]">{month.monthYear}</span>
                      </div>
                      <div className="text-center md:text-right">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">BU AY ÖDENECEK</span>
                        <span className="text-4xl font-black text-blue-400 tracking-tighter">
                          {month.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className={`text-[10px] uppercase font-black tracking-[0.3em] ${isDarkMode ? 'bg-slate-900/50 text-slate-600' : 'bg-slate-50 text-slate-400'}`}>
                          <tr>
                            <th className="px-12 py-6">HARCAMA</th>
                            <th className="px-12 py-6">KART</th>
                            <th className="px-12 py-6">TAKSİT</th>
                            <th className="px-12 py-6 text-right">TUTAR</th>
                            <th className="px-12 py-6 text-right">AKSİYON</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                          {month.transactions.map((tx, idx) => (
                            <tr key={`${tx.transactionId}-${idx}`} className="group transition-all duration-300">
                              <td className="px-12 py-8 text-sm font-black tracking-tight">{tx.description}</td>
                              <td className="px-12 py-8">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{tx.cardName}</span>
                              </td>
                              <td className="px-12 py-8">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                                  {tx.installmentIndex} / {tx.totalInstallments}
                                </span>
                              </td>
                              <td className="px-12 py-8 text-lg text-right font-black tracking-tighter text-blue-500">
                                {tx.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                              </td>
                              <td className="px-12 py-8 text-right">
                                <div className="flex justify-end gap-3 transition-opacity">
                                  <button onClick={(e) => handleEditTransaction(e, tx.transactionId)} className="text-blue-500 hover:scale-125 transition-transform p-2 bg-blue-500/10 rounded-lg" title="Düzenle">✏️</button>
                                  <button onClick={(e) => handleDeleteTransaction(e, tx.transactionId)} className="text-red-500 hover:scale-125 transition-transform p-2 bg-red-500/10 rounded-lg" title="Sil">🗑️</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-12 rounded-[3.5rem] shadow-2xl border`}>
                <h2 className="text-2xl font-black mb-10 uppercase tracking-tighter">Girilmiş Tüm Harcamalar</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={`text-[10px] uppercase font-black tracking-[0.3em] ${isDarkMode ? 'bg-slate-900/50 text-slate-600' : 'bg-slate-50 text-slate-400'}`}>
                      <tr>
                        <th className="px-8 py-6">TARİH</th>
                        <th className="px-8 py-6">HARCAMA</th>
                        <th className="px-8 py-6">TOPLAM TUTAR</th>
                        <th className="px-8 py-6 text-right">TAKSİT</th>
                        <th className="px-8 py-6 text-right">AKSİYON</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="group transition-all duration-300">
                          <td className="px-8 py-6 text-xs font-bold text-slate-400">{new Date(tx.date).toLocaleDateString('tr-TR')}</td>
                          <td className="px-8 py-6 text-sm font-black">{tx.description}</td>
                          <td className="px-8 py-6 text-sm font-black text-blue-500">{tx.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                          <td className="px-8 py-6 text-right font-black text-xs text-slate-400">{tx.installments} Taksit</td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3 transition-opacity">
                              <button onClick={(e) => handleEditTransaction(e, tx.id)} className="text-blue-500 hover:scale-125 transition-transform p-2 bg-blue-500/10 rounded-lg">✏️</button>
                              <button onClick={(e) => handleDeleteTransaction(e, tx.id)} className="text-red-500 hover:scale-125 transition-transform p-2 bg-red-500/10 rounded-lg">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center pt-16 gap-6">
              <button 
                onClick={downloadPythonScript}
                className={`px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all border shadow-sm ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}
              >
                MASAÜSTÜ UYGULAMASI (PYTHON) İNDİR
              </button>
              <button 
                onClick={() => {
                  if(confirm('TÜM VERİLER SİLİNECEKTİR. EMİN MİSİNİZ?')) {
                    setTransactions([]);
                    localStorage.removeItem('finans_transactions');
                    resetFlow();
                  }
                }}
                className={`px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all border shadow-sm ${isDarkMode ? 'bg-slate-900 border-red-900/30 text-red-500 hover:bg-red-900/20' : 'bg-white text-red-400 border-red-100 hover:bg-red-50'}`}
              >
                SİSTEMİ SIFIRLA
              </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className={`mt-auto py-12 text-[10px] font-black uppercase tracking-[0.5em] flex flex-col items-center gap-6 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`}>
        <div className={`w-24 h-1 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center opacity-60 text-center">
          <span>{formatTurkishDate(new Date())}</span>
          <span className="md:border-x px-12 border-slate-800">© {new Date().getFullYear()} FİNANS UYGULAMASI</span>
          <span>SİLME SORUNU GİDERİLDİ</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
