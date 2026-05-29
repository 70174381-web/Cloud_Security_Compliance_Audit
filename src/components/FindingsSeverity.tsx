import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BarChart3 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FindingsSeverity({ findings }: { findings: any[] }) {
  const severity = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };

  const total = severity.critical + severity.high + severity.medium + severity.low;

  const data = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [severity.critical, severity.high, severity.medium, severity.low],
      backgroundColor: ['#dc2626', '#f97316', '#3b82f6', '#94a3b8'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-600" />
          Findings by Severity
        </h3>
        <p className="text-xs text-slate-500 mt-1">{total} total findings</p>
      </div>
      <div className="p-5">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Doughnut
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: { legend: { display: false } },
              }}
              width={160}
              height={160}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-slate-900">{total}</p>
              <p className="text-xs text-slate-500">total</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Critical', value: severity.critical, color: 'bg-red-500', textColor: 'text-red-700' },
            { label: 'High', value: severity.high, color: 'bg-orange-500', textColor: 'text-orange-700' },
            { label: 'Medium', value: severity.medium, color: 'bg-blue-500', textColor: 'text-blue-700' },
            { label: 'Low', value: severity.low, color: 'bg-slate-400', textColor: 'text-slate-700' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg">
              <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
              <span className="text-xs text-slate-600">{s.label}</span>
              <span className={`text-xs font-semibold ml-auto ${s.textColor}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
