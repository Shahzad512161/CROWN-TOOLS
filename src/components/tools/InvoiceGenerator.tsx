import React, { useState } from 'react';
import { Plus, Trash2, Printer, Copy, Check, FileSpreadsheet, Download } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export const InvoiceGenerator: React.FC = () => {
  const [currency, setCurrency] = useState('$');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0042');
  const [senderName, setSenderName] = useState('Apex Digital Solutions LLC');
  const [senderDetails, setSenderDetails] = useState('100 Main Street, Suite 400\nAustin, TX 78701\nbilling@apexdigital.com');
  const [clientName, setClientName] = useState('NorthStar Global Enterprises');
  const [clientDetails, setClientDetails] = useState('550 Bay Street, Floor 18\nToronto, ON M5J 2R8\naccounts@northstar.com');
  const [issueDate, setIssueDate] = useState('2026-10-15');
  const [dueDate, setDueDate] = useState('2026-11-15');
  const [taxRate, setTaxRate] = useState<number>(8.25);
  const [paymentNotes, setPaymentNotes] = useState('Payment via Bank Wire, Payoneer (najafdiyal@gmail.com), or PayPal. Thank you for your business!');

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Full-Stack Web Application Architecture & Deployment', quantity: 40, rate: 85 },
    { id: '2', description: 'API Integration & Performance Tuning', quantity: 15, rate: 95 },
    { id: '3', description: 'Cloud Infrastructure & Security Configuration', quantity: 10, rate: 110 }
  ]);

  const [copied, setCopied] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: 'New Service Item', quantity: 1, rate: 100 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.quantity * curr.rate || 0), 0);
  const taxAmount = (subtotal * (taxRate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `INVOICE ${invoiceNumber}
From: ${senderName}
To: ${clientName}
Due Date: ${dueDate}
---------------------------------
${items.map(i => `${i.description} (${i.quantity} x ${currency}${i.rate}) = ${currency}${(i.quantity * i.rate).toFixed(2)}`).join('\n')}
---------------------------------
Subtotal: ${currency}${subtotal.toFixed(2)}
Tax (${taxRate}%): ${currency}${taxAmount.toFixed(2)}
TOTAL DUE: ${currency}${grandTotal.toFixed(2)}
Payment Notes: ${paymentNotes}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🧾</span> Invoice Generator Pro
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            US, UK & Canadian standard freelance, contractor, and agency billing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#f97316] text-white hover:bg-orange-600 shadow-md cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Editor Column */}
        <div className="xl:col-span-6 space-y-4 max-h-[750px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Billing Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold"
              >
                <option value="$">USD ($) / CAD ($)</option>
                <option value="£">GBP (£)</option>
                <option value="€">EUR (€)</option>
                <option value="A$">AUD (A$)</option>
                <option value="Rs ">PKR (Rs)</option>
                <option value="₹">INR (₹)</option>
                <option value="AED ">AED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Business Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold"
              />
              <textarea
                rows={2}
                value={senderDetails}
                onChange={(e) => setSenderDetails(e.target.value)}
                placeholder="Address & Contact"
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[11px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Client Business Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold"
              />
              <textarea
                rows={2}
                value={clientDetails}
                onChange={(e) => setClientDetails(e.target.value)}
                placeholder="Client Address & Contact"
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[11px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Line Items</label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={item.description}
                    placeholder="Description"
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="flex-1 px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-center"
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-right"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tax / VAT Rate (%)</label>
              <input
                type="number"
                step="0.25"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes & Terms</label>
              <textarea
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Live Invoice Preview */}
        <div className="xl:col-span-6 bg-gray-100 dark:bg-gray-900 p-4 rounded-2xl flex justify-center items-start">
          <div
            id="printable-area"
            className="w-full max-w-[560px] bg-white text-gray-900 p-8 rounded-lg shadow-xl border border-gray-300 text-left text-xs"
            style={{ minHeight: '650px' }}
          >
            <div className="flex justify-between items-start border-b border-gray-200 pb-5 mb-5">
              <div>
                <div className="text-xl font-black text-gray-900 uppercase tracking-wider">{senderName}</div>
                <p className="text-[11px] text-gray-600 whitespace-pre-line mt-1">{senderDetails}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#f97316]">INVOICE</span>
                <p className="font-bold text-gray-800 mt-1">{invoiceNumber}</p>
                <p className="text-gray-500 text-[10px]">Date: {issueDate}</p>
                <p className="text-gray-500 text-[10px] font-semibold text-orange-600">Due: {dueDate}</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Billed To:</span>
              <h3 className="font-bold text-sm text-gray-900 mt-0.5">{clientName}</h3>
              <p className="text-[11px] text-gray-600 whitespace-pre-line">{clientDetails}</p>
            </div>

            <table className="w-full text-left mb-6 border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 text-[10px] uppercase text-gray-500">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center w-16">Qty</th>
                  <th className="py-2 text-right w-20">Rate</th>
                  <th className="py-2 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2 font-medium text-gray-900">{it.description}</td>
                    <td className="py-2 text-center text-gray-600">{it.quantity}</td>
                    <td className="py-2 text-right text-gray-600">{currency}{Number(it.rate).toFixed(2)}</td>
                    <td className="py-2 text-right font-bold text-gray-900">{currency}{(it.quantity * it.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end border-t border-gray-200 pt-3">
              <div className="w-56 space-y-1.5 text-right">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">{currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({taxRate}%):</span>
                  <span className="font-semibold text-gray-900">{currency}{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-gray-300 pt-2">
                  <span>Total Due:</span>
                  <span className="text-orange-600">{currency}{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 text-[10px] text-gray-500">
              <span className="font-bold text-gray-700 block mb-0.5">Payment Instructions:</span>
              <p className="whitespace-pre-line">{paymentNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
