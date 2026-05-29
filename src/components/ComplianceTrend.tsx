import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ComplianceTrend() {
  const generateTrendData = (base: number, variance: number, seed: number) => {
    return Array.from({ length: 30 }, (_, i) => {
      const random = Math.sin(i * 9301 + seed * 49297) * 233280;
      const frac = random - Math.floor(random);
      return Math.min(100, Math.max(52, base + i * 0.4 + (frac - 0.5) * variance));
    });
  };

  const labels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2026-04-30');
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'AWS',
        data: generateTrendData(65, 6, 1),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'GCP',
        data: generateTrendData(57, 7, 2),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Azure',
        data: generateTrendData(71, 4, 3),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Compliance Score — Past 30 Days
        </h3>
        <p className="text-xs text-slate-500 mt-1">Trending upward across all providers</p>
      </div>
      <div className="p-5">
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                min: 50,
                max: 100,
                ticks: { callback: (v) => v + '%', font: { size: 11 } },
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
              },
              x: { grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { font: { size: 11 } } },
            },
          }}
          height={180}
        />
        <div className="flex gap-6 mt-4 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-0.5 rounded bg-blue-500"></span>
            AWS
          </span>
          <span className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-0.5 rounded bg-emerald-500"></span>
            GCP
          </span>
          <span className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-0.5 rounded bg-purple-500"></span>
            Azure
          </span>
        </div>
      </div>
    </div>
  );
}
