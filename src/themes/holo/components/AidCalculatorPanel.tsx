import React, { useState, useEffect } from "react";
import { College } from "../../../types";
import { DollarSign, ShieldAlert, Award, PiggyBank, BookOpen, Calculator, BarChart2, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface AidCalculatorPanelProps {
  preselectedCollege: College | null;
  totalScholarshipsWon: number;
}

export default function AidCalculatorPanel({
  preselectedCollege,
  totalScholarshipsWon
}: AidCalculatorPanelProps) {
  // Inputs
  const [collegeName, setCollegeName] = useState("Custom Institution");
  const [stickerPrice, setStickerPrice] = useState<number>(55000);
  const [scholarshipsVal, setScholarshipsVal] = useState<number>(totalScholarshipsWon);
  const [projectedGrants, setProjectedGrants] = useState<number>(18000);
  const [workStudyContribution, setWorkStudyContribution] = useState<number>(3000);
  const [familyContribution, setFamilyContribution] = useState<number>(5000);
  
  // Custom states
  const [academicYears, setAcademicYears] = useState<number>(4);
  const [loanInterestRate, setLoanInterestRate] = useState<number>(5.5); // Average federal loan rate

  // Prefill when preselectedCollege changes
  useEffect(() => {
    if (preselectedCollege) {
      setCollegeName(preselectedCollege.name);
      setStickerPrice(preselectedCollege.tuitionSticker);
      setProjectedGrants(preselectedCollege.avgAidPackage);
    }
  }, [preselectedCollege]);

  // Track scholarship changes in real-time
  useEffect(() => {
    setScholarshipsVal(totalScholarshipsWon);
  }, [totalScholarshipsWon]);

  // Calculations
  const totalFreeGiftAid = scholarshipsVal + projectedGrants;
  
  // Yearly cost left after scholarships and grants
  const yearlyNetCost = Math.max(0, stickerPrice - totalFreeGiftAid);
  
  // Minus work-study and self/family payments to find amount that requires loans
  const yearlyLoanRequired = Math.max(0, yearlyNetCost - workStudyContribution - familyContribution);

  // 4 Years (or custom duration) projections
  const fourYearNetOutOfPocket = yearlyNetCost * academicYears;
  
  // High-fidelity student loan interest calculation
  const totalLoanPrincipal = yearlyLoanRequired * academicYears;
  
  // Approximate standard 10-year monthly loan repayment calculation:
  // r = monthly interest, n = 120 payments
  const monthlyRate = (loanInterestRate / 100) / 12;
  const totalPayments = 120;
  const monthlyPaymentAmt = totalLoanPrincipal > 0 
    ? (totalLoanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) / (Math.pow(1 + monthlyRate, totalPayments) - 1)
    : 0;

  const totalRepaidOver10Yrs = monthlyPaymentAmt * totalPayments;
  const totalLoanInterestPaid = Math.max(0, totalRepaidOver10Yrs - totalLoanPrincipal);

  // Alert flags
  const debtAlertFlag = totalLoanPrincipal > 60000;
  const safeInvestmentFlag = yearlyNetCost < 10000;

  return (
    <div className="space-y-6">
      {/* Clean Header Divider */}
      <div className="border-b border-holo-gray-border pb-2 flex justify-between items-end">
        <h2 className="text-xl font-light tracking-tight text-white">
          Financial Aid Modeler
        </h2>
        <span className="text-xs text-holo-blue-light font-sans flex items-center gap-1">
          Loan projections updated
        </span>
      </div>

      <div className="bg-holo-gray-dark p-4 border border-holo-gray-border grid grid-cols-1 lg:grid-cols-12 gap-6 relative font-sans">
        <div className="lg:col-span-12 text-xs text-gray-400 flex justify-between items-center bg-black/40 p-2.5 border border-holo-gray-border font-sans">
          <span>College Focus: {collegeName}</span>
          <span>Out-of-Pocket Advisor</span>
        </div>

        {/* Inputs panel */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm text-holo-blue-light uppercase font-bold flex items-center gap-1.5 border-b border-holo-gray-border pb-1 font-sans">
            <Calculator className="w-4 h-4" />
            1. Configure Financial Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Institution name custom edit */}
            <div>
              <label className="text-xs text-gray-400 uppercase block mb-1">Target College</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full bg-black text-gray-100 border border-holo-gray-border px-3 py-1.5 text-xs font-sans focus:border-holo-blue-light outline-none"
              />
            </div>

            {/* Sticker Tuition value */}
            <div>
              <label className="text-xs text-gray-400 uppercase block mb-1">Yearly Tuition Sticker Price ($)</label>
              <div className="flex bg-black border border-holo-gray-border focus-within:border-holo-blue-light p-1">
                <span className="text-xs text-gray-500 px-1 select-none">$</span>
                <input
                  type="number"
                  value={stickerPrice}
                  onChange={(e) => setStickerPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent text-gray-100 text-xs font-sans outline-none border-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            {/* Scholarships total input */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-holo-blue-light uppercase block">Scholarships Won ($/yr)</label>
                {totalScholarshipsWon > 0 && (
                  <span className="text-xs text-emerald-400 font-sans">({totalScholarshipsWon} bookmarked)</span>
                )}
              </div>
              <div className="flex bg-black border border-holo-gray-border focus-within:border-holo-blue-light p-1">
                <span className="text-xs text-gray-500 px-1 select-none">$</span>
                <input
                  type="number"
                  value={scholarshipsVal}
                  onChange={(e) => setScholarshipsVal(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent text-gray-100 text-xs font-sans outline-none border-none"
                />
              </div>
            </div>

            {/* Federal or Institutional Grants */}
            <div>
              <label className="text-xs text-gray-400 uppercase block mb-1 font-sans">Projected Grants & Aid ($/yr)</label>
              <div className="flex bg-black border border-holo-gray-border focus-within:border-holo-blue-light p-1">
                <span className="text-xs text-gray-500 px-1 select-none">$</span>
                <input
                  type="number"
                  value={projectedGrants}
                  onChange={(e) => setProjectedGrants(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent text-gray-100 text-xs font-sans outline-none border-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Work Study program contribution */}
            <div>
              <label className="text-xs text-gray-400 uppercase block mb-1">Work-Study / Jobs ($/yr)</label>
              <div className="flex bg-black border border-holo-gray-border focus-within:border-holo-blue-light p-1">
                <span className="text-xs text-gray-500 px-0.5 select-none">$</span>
                <input
                  type="number"
                  value={workStudyContribution}
                  onChange={(e) => setWorkStudyContribution(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent text-gray-100 text-xs font-sans outline-none border-none"
                />
              </div>
            </div>

            {/* Family / Personal Out of Pocket Savings payments */}
            <div>
              <label className="text-xs text-gray-400 uppercase block mb-1">Family Contribution ($/yr)</label>
              <div className="flex bg-black border border-holo-gray-border focus-within:border-holo-blue-light p-1">
                <span className="text-xs text-gray-500 px-0.5 select-none">$</span>
                <input
                  type="number"
                  value={familyContribution}
                  onChange={(e) => setFamilyContribution(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent text-gray-100 text-xs font-sans outline-none border-none"
                />
              </div>
            </div>

            {/* Program duration */}
            <div>
              <label className="text-xs text-gray-400 uppercase block mb-1">Academic Duration</label>
              <select
                value={academicYears}
                onChange={(e) => setAcademicYears(Number(e.target.value))}
                className="w-full bg-black text-gray-200 border border-holo-gray-border p-1 text-xs font-sans focus:border-holo-blue-light outline-none"
              >
                <option value={4}>4 Years (Undergraduate)</option>
                <option value={2}>2 Years (Associate/Transfer)</option>
                <option value={1}>1 Year (Specialist)</option>
                <option value={5}>5 Years (Dual Degree)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-400 uppercase">Estimated Loan Interest Rate ({loanInterestRate}%)</label>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.1"
              value={loanInterestRate}
              onChange={(e) => setLoanInterestRate(Number(e.target.value))}
              className="w-full accent-holo-blue-light h-1 bg-black outline-none border border-holo-gray-border cursor-pointer animate-none"
            />
          </div>
        </div>

        {/* Results Projection card visual */}
        <div className="lg:col-span-5 bg-black border-l-2 border-holo-blue-light p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3 font-sans">
            <span className="text-xs font-bold text-holo-blue-light uppercase tracking-wider flex items-center gap-1 font-sans">
              <BarChart2 className="w-4 h-4" />
              2. Projections Summary
            </span>

            {/* Sticker vs Net free aid breakdown */}
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Sticker Cost:</span>
                <span className="text-white font-medium">${stickerPrice.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between">
                <span>Free Gift Aid (Scholarships + Grants):</span>
                <span className="text-emerald-400 font-medium">-${totalFreeGiftAid.toLocaleString()}/yr</span>
              </div>
              <div className="border-t border-dashed border-holo-gray-border my-1" />
              
              {/* Year out of pocket cost */}
              <div className="flex justify-between font-bold">
                <span className="text-holo-blue-light">Yearly Net Out-of-Pocket:</span>
                <span className="text-white">${yearlyNetCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Standard Cost bar graph rendering */}
            <div className="space-y-1.5 pt-2 font-sans">
              <span className="text-xs text-gray-500 uppercase tracking-widest block font-medium">COST BRACKET VISUALRATIO</span>
              <div className="h-4 w-full bg-holo-gray-light border border-holo-gray-border flex overflow-hidden">
                {stickerPrice > 0 && (
                  <>
                    <div 
                      title={`Gift Aid: $${totalFreeGiftAid.toLocaleString()}`}
                      className="bg-emerald-500 h-full" 
                      style={{ width: `${Math.min(100, (totalFreeGiftAid / stickerPrice) * 100)}%` }} 
                    />
                    <div 
                      title={`Self-Funded/Work-Study: $${(workStudyContribution + familyContribution).toLocaleString()}`}
                      className="bg-[#33b5e5] h-full" 
                      style={{ width: `${Math.min(100, (((workStudyContribution + familyContribution)) / stickerPrice) * 100)}%` }} 
                    />
                    <div 
                      title={`Requires Borrowing: $${yearlyLoanRequired.toLocaleString()}`}
                      className="bg-red-500 h-full flex-grow" 
                    />
                  </>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-400 font-sans">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 inline-block" />FREE AID (GIFT)</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#33b5e5] inline-block" />EARNED/OWN CASH</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 inline-block" />DEBT BARRIER</span>
              </div>
            </div>
          </div>

          <div className="bg-holo-gray-light p-3 border border-holo-gray-border space-y-2 font-sans">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-widest block leading-none font-medium">Estimated Borrowing on Graduation</span>
              <span className={`text-2xl font-bold tracking-tight block ${debtAlertFlag ? "text-red-500" : "text-white"}`}>
                ${totalLoanPrincipal.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 uppercase">({academicYears} academic years of student loans)</span>
            </div>

            {totalLoanPrincipal > 0 && (
              <div className="text-xs text-gray-300 space-y-1 pt-1.5 border-t border-dashed border-holo-gray-border font-sans">
                <div className="flex justify-between">
                  <span>Standard 10-Year Payment:</span>
                  <span className="text-white font-bold">${Math.round(monthlyPaymentAmt)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Interest Accrued:</span>
                  <span className="text-red-400 font-bold">${Math.round(totalLoanInterestPaid).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Alert flags based on cost and debt levels */}
          <div className="text-xs leading-normal font-sans">
            {debtAlertFlag && (
              <div className="bg-red-950/40 border border-red-700/60 text-red-300 p-2 font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                Notice: Projected loans exceed recommended thresholds. Try finding more sponsorships or comparing other lower-sticker institutions.
              </div>
            )}
            {safeInvestmentFlag && (
              <div className="bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 p-2 font-semibold flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                Great Strategy: Net annual payments are highly affordable. Excellent out-of-pocket setup!
              </div>
            )}
            {!debtAlertFlag && !safeInvestmentFlag && (
              <div className="bg-holo-blue-dim/20 border border-holo-blue-dark/50 text-holo-blue-light p-2 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                Standard Plan: Standard college cost configuration. Keep monitoring state and local grant deadlines.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
