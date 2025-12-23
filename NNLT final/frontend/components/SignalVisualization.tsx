'use client';

import { useMemo, useState, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { SignalData } from '@/lib/api';

interface SignalVisualizationProps {
  data: SignalData;
}

interface ZoomState {
  xDomain: [number, number] | null;
  yDomain: [number, number] | null;
}

function ChartWithZoom({ 
  chartData, 
  channel 
}: { 
  chartData: Array<{ time: number; channel1: number; channel2: number; channel3: number }>;
  channel: { key: string; name: string; color: string; dataKey: string };
}) {
  const [zoom, setZoom] = useState<ZoomState>({ xDomain: null, yDomain: null });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const chartRef = useRef<any>(null);

  // Calculate full domain ranges
  const fullXDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 0];
    const times = chartData.map(d => d.time);
    return [Math.min(...times), Math.max(...times)] as [number, number];
  }, [chartData]);

  const fullYDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 0];
    const values = chartData.map(d => d[channel.dataKey as keyof typeof d] as number).filter(v => !isNaN(v));
    if (values.length === 0) return [0, 0];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range > 0 ? range * 0.1 : Math.abs(min) * 0.1 || 0.01; // 10% padding
    return [min - padding, max + padding] as [number, number];
  }, [chartData, channel.dataKey]);

  const currentXDomain = zoom.xDomain || fullXDomain;
  const currentYDomain = zoom.yDomain || fullYDomain;

  const handleReset = () => {
    setZoom({ xDomain: null, yDomain: null });
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleBrushChange = (brushData: any) => {
    if (!brushData || !brushData.startIndex && brushData.startIndex !== 0 || !brushData.endIndex && brushData.endIndex !== 0) {
      handleReset();
      return;
    }

    const startIndex = brushData.startIndex;
    const endIndex = brushData.endIndex;
    
    if (startIndex === 0 && endIndex === chartData.length - 1) {
      // Full range selected, reset zoom
      handleReset();
      return;
    }

    const xMin = chartData[startIndex]?.time;
    const xMax = chartData[endIndex]?.time;
    
    if (xMin !== undefined && xMax !== undefined && xMax > xMin) {
      const zoomedData = chartData.slice(startIndex, endIndex + 1);
      if (zoomedData.length > 0) {
        const values = zoomedData.map(d => d[channel.dataKey as keyof typeof d] as number).filter(v => !isNaN(v));
        if (values.length > 0) {
          const yMin = Math.min(...values);
          const yMax = Math.max(...values);
          const padding = (yMax - yMin) * 0.1 || 0.01;
          setZoom({
            xDomain: [xMin, xMax],
            yDomain: [yMin - padding, yMax + padding]
          });
        }
      }
    }
  };

  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      const timeValue = typeof e.activeLabel === 'string' ? parseFloat(e.activeLabel) : e.activeLabel;
      if (!isNaN(timeValue)) {
        setIsSelecting(true);
        setSelectionStart(timeValue);
        setSelectionEnd(timeValue);
      }
    }
  };

  const handleMouseMove = (e: any) => {
    if (isSelecting && e && e.activeLabel) {
      const timeValue = typeof e.activeLabel === 'string' ? parseFloat(e.activeLabel) : e.activeLabel;
      if (!isNaN(timeValue)) {
        setSelectionEnd(timeValue);
      }
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart !== null && selectionEnd !== null) {
      const xMin = Math.min(selectionStart, selectionEnd);
      const xMax = Math.max(selectionStart, selectionEnd);
      
      if (xMax - xMin > 0.01) { // Minimum selection size
        const zoomedData = chartData.filter(d => d.time >= xMin && d.time <= xMax);
        if (zoomedData.length > 0) {
          const values = zoomedData.map(d => d[channel.dataKey as keyof typeof d] as number).filter(v => !isNaN(v));
          if (values.length > 0) {
            const yMin = Math.min(...values);
            const yMax = Math.max(...values);
            const padding = (yMax - yMin) * 0.1 || 0.01;
            setZoom({
              xDomain: [xMin, xMax],
              yDomain: [yMin - padding, yMax + padding]
            });
          }
        }
      }
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const isZoomed = zoom.xDomain !== null || zoom.yDomain !== null;

  // Calculate grid spacing based on 1mV : 40ms ratio
  const gridSpacingX = 40; // 40ms per small square
  const gridSpacingY = 1; // 1mV per small square
  
  // Generate grid lines for X axis (vertical lines every 40ms)
  const xGridLines = useMemo(() => {
    const lines: number[] = [];
    const start = Math.floor(currentXDomain[0] / gridSpacingX) * gridSpacingX;
    const end = Math.ceil(currentXDomain[1] / gridSpacingX) * gridSpacingX;
    for (let x = start; x <= end; x += gridSpacingX) {
      lines.push(x);
    }
    return lines;
  }, [currentXDomain, gridSpacingX]);
  
  // Generate grid lines for Y axis (horizontal lines every 1mV)
  const yGridLines = useMemo(() => {
    const lines: number[] = [];
    const start = Math.floor(currentYDomain[0] / gridSpacingY) * gridSpacingY;
    const end = Math.ceil(currentYDomain[1] / gridSpacingY) * gridSpacingY;
    for (let y = start; y <= end; y += gridSpacingY) {
      lines.push(y);
    }
    return lines;
  }, [currentYDomain, gridSpacingY]);

  return (
    <div className="relative">
      {isZoomed && (
        <button
          onClick={handleReset}
          className="absolute top-2 right-2 z-10 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors shadow-lg"
          title="Reset to full view"
        >
          ↺ Reset View
        </button>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          ref={chartRef}
          data={chartData} 
          margin={{ top: 10, right: 50, bottom: 50, left: 30 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
        >
          {/* Custom grid with 1mV : 40ms ratio */}
          {xGridLines.map((x, idx) => (
            <ReferenceLine
              key={`x-grid-${idx}`}
              x={x}
              stroke="#e8e8e8"
              strokeWidth={0.5}
              strokeDasharray="1 1"
            />
          ))}
          {yGridLines.map((y, idx) => (
            <ReferenceLine
              key={`y-grid-${idx}`}
              y={y}
              stroke="#e8e8e8"
              strokeWidth={0.5}
              strokeDasharray="1 1"
            />
          ))}
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time (ms)', position: 'bottom', offset: 10 }}
            tickFormatter={(value) => value.toFixed(0)}
            domain={zoom.xDomain || undefined}
            allowDataOverflow={false}
            type="number"
            scale="linear"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Amplitude (mV)', angle: -90, position: 'left', offset: 10 }}
            domain={zoom.yDomain || fullYDomain}
            allowDataOverflow={false}
            type="number"
            scale="linear"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => typeof value === 'number' ? `${value.toFixed(2)} mV` : value}
            labelFormatter={(value) => `Time: ${value.toFixed(0)} ms`}
          />
          <Legend wrapperStyle={{ paddingTop: '40px' }} />
          {isSelecting && selectionStart !== null && selectionEnd !== null && (
            <ReferenceArea
              x1={Math.min(selectionStart, selectionEnd)}
              x2={Math.max(selectionStart, selectionEnd)}
              strokeOpacity={0.3}
              fill={channel.color}
              fillOpacity={0.1}
            />
          )}
          <Line 
            type="monotone" 
            dataKey={channel.dataKey} 
            stroke={channel.color} 
            name={channel.name}
            dot={false}
            activeDot={{ r: 6, fill: channel.color }}
            strokeWidth={2}
          />
          <Brush
            dataKey="time"
            height={40}
            className="brush-black-text"
            style={{marginRight: 30}}
            stroke={channel.color}
            fill={channel.color}
            fillOpacity={0.3}
            tickFormatter={(value) => value.toFixed(0)}
            onChange={handleBrushChange}
            alwaysShowText={true}
            startIndex={
              zoom.xDomain 
                ? Math.max(0, chartData.findIndex(d => d.time >= zoom.xDomain![0]) || 0)
                : 0
            }
            endIndex={
              zoom.xDomain 
                ? Math.min(chartData.length - 1, chartData.findIndex(d => d.time >= zoom.xDomain![1]) || chartData.length - 1)
                : chartData.length - 1
            }
          />
        </LineChart>
      </ResponsiveContainer>
      <div className=" text-xs text-gray-600 text-center">
        {!isZoomed ? (
          <p>💡 Drag the brush below to select and zoom into a time range</p>
        ) : (
          <p>Zoomed view • Drag brush to change range • Click &quot;Reset View&quot; to return to full view</p>
        )}
      </div>
    </div>
  );
}

export default function SignalVisualization({ data }: SignalVisualizationProps) {
  const chartData = useMemo(() => {
    if (!data.processed_data) return [];

    const { time, channel1, channel2, channel3 } = data.processed_data;
    
    // Sample data for performance (show every Nth point)
    const sampleRate = Math.max(1, Math.floor(time.length / 2000));
    
    // Convert: time from seconds to milliseconds, amplitude from Volt to millivolt
    return time
      .map((t, i) => ({
        time: t * 1000, // Convert seconds to milliseconds
        channel1: channel1[i] * 1000, // Convert Volt to millivolt
        channel2: channel2[i] * 1000, // Convert Volt to millivolt
        channel3: channel3[i] * 1000, // Convert Volt to millivolt
      }))
      .filter((_, i) => i % sampleRate === 0);
  }, [data.processed_data]);

  const channels = [
    { key: 'channel1', name: 'PCG (Phonocardiogram)', color: '#8884d8', dataKey: 'channel1' },
    { key: 'channel2', name: 'PPG (Photoplethysmgram)', color: '#82ca9d', dataKey: 'channel2' },
    { key: 'channel3', name: 'ECG (Electrocardiogram)', color: '#ffc658', dataKey: 'channel3' },
  ];

  const metrics = data.metrics;

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Waveforms</h3>
        <div className="space-y-6">
          {channels.map((channel) => (
            <div key={channel.key} className="border border-gray-200 rounded p-4">
              <h4 className="text-lg font-medium mb-3" style={{ color: channel.color }}>
                {channel.name}
              </h4>
              <ChartWithZoom chartData={chartData} channel={channel} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
