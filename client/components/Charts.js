import {
  ComposedChart, BarChart, Bar, Line, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts';

export const ComposedChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ComposedChart
      data={data}
      margin={{
        top: 20, right: 20, bottom: 20, left: 20,
      }}
    >
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="totalAccidents" barSize={20} fill="#8884d8" />
      <Line type="monotone" dataKey="totalAccidents" stroke="#ff7300" />
    </ComposedChart>
  </ResponsiveContainer>
);

export const MixBarChartComponent = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="totalAccidents" fill="#8884d8" />
      <Bar dataKey="falseAlarmAccidents" fill="#82ca9d" />
      <Bar dataKey="actualAccidents" fill="#ffc658" />
    </BarChart>
  </ResponsiveContainer>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const PieChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Tooltip />
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
);

export const AreaChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="colorAccidents" x1="0" y1="0" x2="0" y2="1">
          <stop offset="15%" stopColor="#1e3a8a" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis dataKey="location" interval={0} angle={-45} textAnchor="end"/>
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Area type="monotone" dataKey="count" stroke="#1e3a8a" fillOpacity={1} fill="url(#colorAccidents)" />
    </AreaChart>
  </ResponsiveContainer>
);
