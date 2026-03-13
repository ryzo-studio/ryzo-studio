import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// ── Colour palette ────────────────────────────────────────────────
const ACCENT   = '#a855f7';
const ACCENT2  = '#7c3aed';
const RED      = '#ef4444';
const ORANGE   = '#f97316';
const YELLOW   = '#eab308';
const GREEN    = '#22c55e';
const BLUE     = '#3b82f6';
const MUTED    = 'rgba(255,255,255,0.12)';
const FG2      = 'rgba(255,255,255,0.55)';

const DONUT_COLORS = [ACCENT, BLUE, ORANGE, GREEN, RED, YELLOW];

const SCALE_COLORS = [RED, ORANGE, YELLOW, BLUE, GREEN];

const chartFont = { family: "'Inter', sans-serif", color: '#fff' };

const donutDefaults = {
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: '#fff', font: chartFont, padding: 16, boxWidth: 12 } },
    tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} (${Math.round(ctx.parsed * 100 / ctx.dataset.data.reduce((a: number, b: number) => a + b, 0))}%)` } },
  },
  cutout: '60%',
};

const hbarDefaults = {
  indexAxis: 'y' as const,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: FG2, font: chartFont }, grid: { color: MUTED }, beginAtZero: true },
    y: { ticks: { color: '#fff', font: { ...chartFont, size: 11 } }, grid: { display: false } },
  },
};

// ── Helpers ───────────────────────────────────────────────────────
function count(arr: string[], val: string) {
  return arr.filter(v => v.trim().toLowerCase() === val.toLowerCase()).length;
}

function countScale(arr: string[]) {
  const labels = ['👎👎 Not at all', '2', '3', '4', '👍👍 Very true'];
  const counts = labels.map((_, i) => arr.filter(v => {
    const n = parseInt(v.trim());
    if (!isNaN(n)) return n === i + 1;
    // emoji scale variants
    const lower = v.trim().toLowerCase();
    if (i === 0) return lower.includes('not at all') || lower === '1';
    if (i === 4) return lower.includes('very true') || lower === '5';
    return false;
  }).length);
  return { labels: ['1 – Not at all', '2', '3', '4', '5 – Very true'], counts };
}

// ── Types ─────────────────────────────────────────────────────────
interface Props {
  rows: string[][];
  headers: string[];
}

// ── Stat pill ─────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: FG2, marginTop: '0.5rem' }}>{label}</div>
    </div>
  );
}

// ── Chart card ───────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{title}</h3>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function SurveyCharts({ rows, headers }: Props) {
  if (!rows.length) {
    return <p style={{ color: FG2, textAlign: 'center', padding: '4rem 0' }}>No responses yet.</p>;
  }

  function col(keyword: string) {
    const idx = headers.findIndex(h => h.toLowerCase().includes(keyword.toLowerCase()));
    return idx >= 0 ? rows.map(r => r[idx] ?? '') : [];
  }

  const total = rows.length;
  const watchedFilm = col('watch').filter(v => v.toLowerCase() === 'yes').length;
  const playedGame  = col('play the roblox game').filter(v => v.toLowerCase() === 'yes').length;

  // Demographics
  const genders  = col('describe yourself');
  const genderLabels = ['Boy', 'Girl', 'Non-binary', 'Prefer not to say'];
  const genderCounts = genderLabels.map(l => count(genders, l));

  const roblox = col('how often do you play roblox');
  const robloxLabels = ['Never', 'Monthly', 'Weekly', 'Daily'];
  const robloxCounts = robloxLabels.map(l => count(roblox, l));

  // Recommendations
  const recFilm = col('recommend the film');
  const recGame = col('recommend the game');

  // Scale questions
  const scales = [
    { label: 'Familiar in the film', data: countScale(col('familiar in the film')) },
    { label: 'Familiar in the game', data: countScale(col('familiar in the game')) },
    { label: 'Recognised emotional stressors', data: countScale(col('emotional stressors')) },
    { label: 'Learned skills to deal with stressors', data: countScale(col('learn skills')) },
    { label: 'Can use skills to manage anger', data: countScale(col('manage anger')) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        <Stat label="Total responses" value={String(total)} />
        <Stat label="Watched film" value={total ? `${Math.round(watchedFilm / total * 100)}%` : '—'} />
        <Stat label="Played game" value={total ? `${Math.round(playedGame / total * 100)}%` : '—'} />
      </div>

      {/* Demo row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Card title="Gender Identity">
          <Doughnut
            data={{ labels: genderLabels, datasets: [{ data: genderCounts, backgroundColor: DONUT_COLORS, borderWidth: 0 }] }}
            options={donutDefaults}
          />
        </Card>
        <Card title="Roblox Usage Frequency">
          <Doughnut
            data={{ labels: robloxLabels, datasets: [{ data: robloxCounts, backgroundColor: DONUT_COLORS, borderWidth: 0 }] }}
            options={donutDefaults}
          />
        </Card>
        <Card title="Would Recommend — Film">
          <Doughnut
            data={{ labels: ['Yes', 'No'], datasets: [{ data: [count(recFilm,'Yes'), count(recFilm,'No')], backgroundColor: [GREEN, RED], borderWidth: 0 }] }}
            options={donutDefaults}
          />
        </Card>
        <Card title="Would Recommend — Game">
          <Doughnut
            data={{ labels: ['Yes', 'No'], datasets: [{ data: [count(recGame,'Yes'), count(recGame,'No')], backgroundColor: [GREEN, RED], borderWidth: 0 }] }}
            options={donutDefaults}
          />
        </Card>
      </div>

      {/* Impact scales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {scales.map(({ label, data }) => (
          <Card key={label} title={label}>
            <Bar
              data={{
                labels: data.labels,
                datasets: [{ data: data.counts, backgroundColor: SCALE_COLORS, borderRadius: 6, borderSkipped: false }],
              }}
              options={hbarDefaults}
            />
          </Card>
        ))}
      </div>

    </div>
  );
}
